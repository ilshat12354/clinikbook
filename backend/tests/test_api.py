import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db import Base, get_db
from app.main import app


@pytest_asyncio.fixture
async def client():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    async def override():
        async with Session() as s:
            yield s

    app.dependency_overrides[get_db] = override
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio
async def test_health(client):
    assert (await client.get("/health")).json()["status"] == "ok"


@pytest.mark.asyncio
async def test_register_login_me(client):
    r = await client.post("/api/v1/auth/register", json={
        "email": "p@example.com", "password": "secret123",
        "full_name": "Пётр", "role": "patient",
    })
    assert r.status_code == 201, r.text
    r = await client.post("/api/v1/auth/login", json={"email": "p@example.com", "password": "secret123"})
    assert r.status_code == 200
    token = r.json()["access_token"]
    r = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.json()["email"] == "p@example.com"


@pytest.mark.asyncio
async def test_unauthorized(client):
    assert (await client.get("/api/v1/doctors")).status_code == 401


@pytest.mark.asyncio
async def test_forbidden_admin(client):
    await client.post("/api/v1/auth/register", json={
        "email": "p2@example.com", "password": "secret123",
        "full_name": "Пётр", "role": "patient",
    })
    token = (await client.post("/api/v1/auth/login", json={
        "email": "p2@example.com", "password": "secret123",
    })).json()["access_token"]
    r = await client.get("/api/v1/admin/schedule", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403