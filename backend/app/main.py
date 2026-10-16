import logging
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .db import Appointment, Base, Doctor, Slot, User, engine, get_db
from .schemas import (
    AppointmentCreate, AppointmentRead, DoctorRead, SlotRead, Token,
    UserLogin, UserRead, UserRegister, create_token, get_current_user,
    hash_password, require_role, verify_password,
)

logging.basicConfig(level=logging.INFO, format='{"level":"%(levelname)s","msg":"%(message)s"}')
log = logging.getLogger("api")


async def seed():
    async with AsyncSession(engine) as db:
        exists = await db.scalar(select(Doctor).limit(1))
        if exists:
            return
        data = [
            ("Иванов Иван", "Терапевт", "Стаж 12 лет"),
            ("Петрова Анна", "Кардиолог", "Стаж 8 лет"),
            ("Сидоров Олег", "Невролог", "Стаж 15 лет"),
        ]
        now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
        for i, (name, spec, bio) in enumerate(data):
            doc = Doctor(full_name=name, speciality=spec, bio=bio)
            db.add(doc)
            await db.flush()
            for h in (10, 11, 14, 15):
                db.add(Slot(doctor_id=doc.id, start_at=now + timedelta(days=i, hours=h - now.hour)))
        await db.commit()
        log.info("seed: created doctors and slots")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed()
    log.info("app ready")
    yield


app = FastAPI(title="ClinicBook API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    rid = str(uuid.uuid4())
    try:
        response = await call_next(request)
    except Exception:
        log.exception("unhandled error rid=%s", rid)
        return JSONResponse(status_code=500, content={"detail": "internal error"})
    log.info("%s %s -> %s [rid=%s]", request.method, request.url.path, response.status_code, rid)
    response.headers["X-Request-ID"] = rid
    return response


@app.exception_handler(HTTPException)
async def http_err(_: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def val_err(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.get("/health")
async def health():
    return {"status": "ok"}


# ---------------- AUTH ----------------

@app.post("/api/v1/auth/register", response_model=UserRead, status_code=201)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    if await db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(409, "Email уже занят")
    user = User(
        email=payload.email, password_hash=hash_password(payload.password),
        full_name=payload.full_name, role=payload.role.value,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@app.post("/api/v1/auth/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Неверный email или пароль")
    return Token(access_token=create_token(str(user.id), user.role))


@app.get("/api/v1/auth/me", response_model=UserRead)
async def me(user: User = Depends(get_current_user)):
    return user


# ---------------- DOCTORS ----------------

@app.get("/api/v1/doctors", response_model=list[DoctorRead])
async def list_doctors(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return list(await db.scalars(select(Doctor).order_by(Doctor.full_name)))


@app.get("/api/v1/doctors/{doctor_id}/slots", response_model=list[SlotRead])
async def doctor_slots(doctor_id: uuid.UUID, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    if not await db.get(Doctor, doctor_id):
        raise HTTPException(404, "Врач не найден")
    return list(await db.scalars(
        select(Slot).where(Slot.doctor_id == doctor_id, Slot.is_booked.is_(False)).order_by(Slot.start_at)
    ))


# ---------------- APPOINTMENTS ----------------

@app.post("/api/v1/appointments", response_model=AppointmentRead, status_code=201)
async def create_appointment(
    payload: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("patient")),
):
    slot = await db.get(Slot, payload.slot_id)
    if not slot:
        raise HTTPException(404, "Слот не найден")
    if slot.is_booked:
        raise HTTPException(409, "Слот уже занят")
    slot.is_booked = True
    appt = Appointment(patient_id=user.id, doctor_id=slot.doctor_id, slot_id=slot.id)
    db.add(appt)
    await db.commit()
    await db.refresh(appt)
    return appt


@app.get("/api/v1/appointments/my")
async def my_appointments(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("patient")),
):
    rows = (await db.execute(
        select(Appointment, Doctor, Slot)
        .join(Doctor, Doctor.id == Appointment.doctor_id)
        .join(Slot, Slot.id == Appointment.slot_id)
        .where(Appointment.patient_id == user.id)
        .order_by(Appointment.created_at.desc())
    )).all()
    return [
        {
            "id": str(a.id),
            "doctor_id": str(a.doctor_id),
            "slot_id": str(a.slot_id),
            "status": a.status,
            "created_at": a.created_at.isoformat(),
            "doctor_name": d.full_name,
            "slot_start_at": s.start_at.isoformat(),
        }
        for a, d, s in rows
    ]

@app.patch("/api/v1/appointments/{appt_id}/cancel", response_model=AppointmentRead)
async def cancel_appointment(
    appt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("patient", "admin")),
):
    appt = await db.get(Appointment, appt_id)
    if not appt:
        raise HTTPException(404, "Запись не найдена")
    if user.role == "patient" and appt.patient_id != user.id:
        raise HTTPException(403, "Недостаточно прав")
    if appt.status != "confirmed":
        raise HTTPException(409, "Запись уже неактивна")
    appt.status = "cancelled"
    slot = await db.get(Slot, appt.slot_id)
    if slot:
        slot.is_booked = False
    await db.commit()
    await db.refresh(appt)
    return appt


# ---------------- ADMIN ----------------

@app.get("/api/v1/admin/schedule")
async def schedule(db: AsyncSession = Depends(get_db), _: User = Depends(require_role("admin", "doctor"))):
    rows = (await db.execute(
        select(Slot, Doctor, Appointment)
        .join(Doctor, Doctor.id == Slot.doctor_id)
        .outerjoin(Appointment, Appointment.slot_id == Slot.id)
        .order_by(Slot.start_at)
    )).all()
    return [
        {
            "slot_id": str(s.id), "doctor_name": d.full_name,
            "start_at": s.start_at.isoformat(), "is_booked": s.is_booked,
            "appointment_status": a.status if a else None,
        }
        for s, d, a in rows
    ]