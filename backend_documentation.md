# Backend ClinicBook — документация

## 1. Архитектура

- **FastAPI** — REST API, async.
- **PostgreSQL 16** — основная БД, контейнер Docker.
- **SQLAlchemy 2.0 async** + **asyncpg** — работа с БД.
- **Alembic** — миграции.
- **JWT** (python-jose) + **bcrypt** (passlib) — аутентификация.
- **Pydantic v2** — валидация запросов и ответов.
- **Logging** — структурированные JSON-логи в stdout, удобно смотреть через `docker logs`.

Слои: `routers → services (в роутерах) → models`. Для учебного проекта сервисы вынесены в роутеры, чтобы не раздувать код.

## 2. Схема БД

### `users`
| Поле | Тип | Описание |
|---|---|---|
| id | UUID PK | |
| email | text unique not null | логин |
| password_hash | text not null | bcrypt |
| full_name | text not null | |
| role | text not null | `patient` / `admin` / `doctor` |
| created_at | timestamptz default now() | |

### `doctors`
| Поле | Тип | Описание |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users.id | опционально |
| full_name | text not null | |
| speciality | text not null | |
| bio | text | |

### `slots`
| Поле | Тип | Описание |
|---|---|---|
| id | UUID PK | |
| doctor_id | UUID FK → doctors.id | |
| start_at | timestamptz not null | |
| is_booked | boolean default false | |

### `appointments`
| Поле | Тип | Описание |
|---|---|---|
| id | UUID PK | |
| patient_id | UUID FK → users.id | |
| doctor_id | UUID FK → doctors.id | |
| slot_id | UUID FK → slots.id unique | |
| status | text | `confirmed` / `cancelled` / `completed` |
| created_at | timestamptz default now() | |

## 3. API endpoints

Базовый URL: `http://localhost:8000/api/v1`.  
Документация Swagger: `http://localhost:8000/docs`.

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | /auth/register | все | регистрация |
| POST | /auth/login | все | вход, выдача JWT |
| GET | /auth/me | JWT | текущий пользователь |
| GET | /doctors | JWT | список врачей |
| GET | /doctors/{id}/slots | JWT | свободные слоты врача |
| POST | /appointments | patient | создать запись |
| GET | /appointments/my | patient | мои визиты |
| PATCH | /appointments/{id}/cancel | patient/admin | отменить |
| GET | /admin/schedule | admin | расписание всех врачей |

## 4. Развёртывание

### 4.1. Требования
- Docker Desktop (Windows/Mac) или Docker Engine + Compose (Linux).
- Node.js 18+ для фронта.

### 4.2. Запуск

```bash
git clone <repo>
cd clinikbook
cp .env.example .env       # отредактировать секреты
docker compose up -d --build
```

Backend: http://localhost:8000  
Swagger: http://localhost:8000/docs  
PostgreSQL: `localhost:5432`

Миграции применяются автоматически при старте контейнера `backend`.

### 4.3. Проверка

```bash
curl http://localhost:8000/health
# {"status":"ok"}

# Регистрация
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"p@example.com","password":"secret123","full_name":"Пётр","role":"patient"}'

# Логин
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"p@example.com","password":"secret123"}' | jq -r .access_token)

# Список врачей
curl http://localhost:8000/api/v1/doctors -H "Authorization: Bearer $TOKEN"
```

### 4.4. Логи

```bash
docker compose logs -f backend    # приложение
docker compose logs -f db         # Postgres
```

## 5. Безопасность

- **JWT** в `Authorization: Bearer <token>`, срок жизни 60 минут.
- **bcrypt** для паролей.
- **Роли**: `patient`, `admin`, `doctor`. Проверка через dependency `require_role(...)`.
- **CORS**: разрешён только `http://localhost:5173` (dev) и `FRONTEND_ORIGIN` из `.env`.
- **Секреты** — только в `.env`, в репозиторий попадает `.env.example`.
- **Валидация** — Pydantic v2, `extra="forbid"`.

## 6. Обработка ошибок

- `401 Unauthorized` — нет/просрочен токен → фронт редиректит на `/login`.
- `403 Forbidden` — недостаточно прав → тост «Нет доступа».
- `404 Not Found` — объект не найден.
- `409 Conflict` — слот уже занят.
- `422 Unprocessable Entity` — ошибки валидации, фронт подсвечивает поля.
- `500 Internal Server Error` — логируется со стектрейсом, клиенту отдаётся `{"detail":"internal error","request_id":"..."}`.

Все ошибки имеют одинаковый формат:

```json
{ "detail": "сообщение" }
```

## 7. Процесс разработки с AI

- Схема БД сгенерирована Cursor по промпту с описанием сущностей (см. `ai_design_log.md`).
- Миграция Alembic — сгенерирована AI, вручную поправлены типы UUID и индексы.
- Роутеры FastAPI — сгенерированы по RTCF-шаблону из ДЗ2, доработаны вручную (require_role).
- Docker-compose и Dockerfile — сгенерированы, добавлен healthcheck для Postgres.
- Отладка: при первом запуске `asyncpg` падал с `InvalidCatalogName` — AI по логу указал, что БД не создана; исправлено переменной `POSTGRES_DB`.