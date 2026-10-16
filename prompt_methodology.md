
---

# Файл 4: `prompt_methodology.md`

```markdown
# prompt_methodology.md — Применение Chain-of-Thought

## 1. Выбранная сложная задача

**Задача:** добавить в Tickets API JWT-аутентификацию и роли (`user`, `admin`).

## 2. Декомпозиция на логические шаги

| Шаг | Цель | Промпт | Ожидаемый результат |
|---|---|---|---|
| 1 | Проектирование | «Ты — Tech Lead. Разбей задачу JWT-аутентификации на подзадачи. Укажи файлы и критерии готовности.» | План из 4 шагов |
| 2 | Security core | «Ты — Senior Python Developer. Реализуй модуль `security.py`: хеширование паролей, создание и проверка JWT.» | Код `security.py` |
| 3 | Защита эндпоинтов | «Ты — FastAPI Developer. Добавь зависимости `get_current_user` и `require_role`. Защити `POST /tickets` и `GET /tickets`.» | Обновлённые роутеры |
| 4 | Тесты | «Ты — QA Engineer. Напиши тесты для регистрации, логина и доступа по ролям.» | `tests/test_auth.py` |

## 3. Последовательное выполнение

### Шаг 1. Проектирование

**Промпт:**
> Ты — Tech Lead. Разбей задачу «Добавить JWT-аутентификацию и роли в Tickets API» на подзадачи.  
> Контекст: FastAPI, SQLAlchemy 2.0, SQLite, Pydantic v2, Pytest.  
> Формат: нумерованный список шагов с целями, файлами и критериями готовности.

**Результат:**
1. Создать модель `User` и схемы `UserCreate`, `UserRead`, `Token`.
2. Реализовать `security.py`: `hash_password`, `verify_password`, `create_access_token`, `decode_token`.
3. Добавить зависимости `get_current_user`, `require_role`.
4. Защитить эндпоинты и добавить проверку ролей.
5. Написать тесты.

### Шаг 2. Security core

**Промпт:**
> Ты — Senior Python Developer. Реализуй `app/security.py` для JWT.  
> Контекст: FastAPI, SQLAlchemy 2.0, SQLite.  
> Требования: `passlib[bcrypt]`, `python-jose`, type hints, docstring, PEP 8.  
> Формат: полный код файла, пояснение, пример использования.

**Результат (сокращённо):**

```python
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Возвращает хеш пароля."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Проверяет пароль против хеша."""
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, role: str) -> str:
    """Создаёт JWT с subject и ролью."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> dict[str, Any]:
    """Декодирует JWT и возвращает payload."""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError as exc:
        raise ValueError("Invalid token") from exc

Шаг 3. Защита эндпоинтов
Промпт:

Ты — FastAPI Developer. Добавь зависимости get_current_user и require_role.
Защити POST /tickets (только user и admin) и GET /tickets (только admin).
Контекст: security.py, models.py, schemas.py, database.py.
Формат: обновлённые файлы, пояснение, пример заголовка Authorization.

Результат: добавлены зависимости get_current_user и require_role.
Эндпоинты возвращают 401 при отсутствии токена и 403 при недостатке прав.

python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Возвращает текущего пользователя по JWT."""
    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc

    user = db.get(User, int(payload["sub"]))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_role(*roles: str):
    """Фабрика зависимостей для проверки ролей."""
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user
    return checker
Шаг 4. Тесты
Промпт:

Ты — QA Engineer. Напиши tests/test_auth.py.
Проверь: регистрацию, логин, доступ с ролью user, доступ с ролью admin, отказ без токена.
Контекст: pytest, TestClient, in-memory SQLite, StaticPool.
Формат: полный файл тестов, команда запуска.

Результат: все тесты проходят, покрытие ключевых сценариев — 100%.