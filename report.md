Ниже обновлённый отчёт в формате Markdown.

---

# Домашнее задание №1. Сравнительный анализ и настройка AI-инструментов

**Тема:** Сравнительный анализ Cloud-агентов и IDE/CLI-агентов для задачи разработки.  
**Выбранный инструмент:** Cline + VS Code + Ollama + Qwen2.5-Coder 7B.  
**База данных:** SQLite.  
**Формат сдачи:** Markdown-отчёт, сравнительная таблица, пример работы, ссылка на репозиторий.

---

## Шаг 1. Анализ требований проекта

### 1.1. Описание задачи

**Задача:** разработать внутренний REST API для учёта заявок отдела технической поддержки.  
**Стек:** Python 3.11, FastAPI, SQLAlchemy, SQLite, Pytest, Docker.  
**Контекст:** существует Git-репозиторий, нужно добавить модуль `tickets` без переписывания проекта.  
**Пользователи:** внутренние сотрудники компании.  
**Данные:** заявки могут содержать ФИО, контакты, описание инцидентов — потенциально персональные данные и коммерческая тайна.

### 1.2. Ключевые требования

| Требование | Значение | Приоритет |
|---|---|---|
| Сложность задачи | Средняя: API, БД, тесты, интеграция с существующим кодом | Высокий |
| Доступ к локальным файлам | Обязателен: чтение структуры репозитория, правка нескольких файлов | Высокий |
| Безопасность данных | Высокая: код и данные не должны уходить во внешние облака | Критический |
| Бюджет | Минимальный, желательно 0 ₽ | Высокий |
| Интеграция | VS Code, Git, терминал, Docker, pre-commit | Средний |
| Командная работа | 1 разработчик, код должен быть читаемым | Средний |
| Соответствие законам | 152-ФЗ, внутренняя политика ИБ | Критический |
| БД | SQLite: локальный файл, без отдельного сервера | Средний |

### 1.3. Критерии выбора AI-инструмента

1. Доступ к контексту проекта.
2. Скорость генерации кода.
3. Качество кода.
4. Стоимость использования.
5. Требования к безопасности данных.
6. Удобство интеграции в рабочий процесс.

---

## Шаг 2. Сравнительный анализ инструментов

### 2.1. Рассматриваемые инструменты

**Cloud-агенты:**
- Bolt.new;
- Lovable;
- Replit Agent.

**IDE/CLI-агенты:**
- Cursor;
- GitHub Copilot;
- Cline;
- Aider.

### 2.2. Шкала оценки

Используется балльная шкала **1–5**, где **5 — наилучший результат** для данного проекта.  
Для критерия «Безопасность данных»:  
**5** — локальная обработка, код не покидает периметр;  
**1** — код и данные передаются во внешнее облако.

### 2.3. Сравнительная таблица

| Инструмент | Тип | Доступ к контексту | Скорость | Качество кода | Стоимость | Безопасность | Интеграция | Итог | Комментарий |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| **Bolt.new** | Cloud | 3 | 5 | 4 | 4 | 2 | 3 | 21 | Быстрый прототип, слабая работа с существующим репозиторием |
| **Lovable** | Cloud | 3 | 5 | 4 | 3 | 2 | 3 | 20 | Удобен для MVP, не для конфиденциального API |
| **Replit Agent** | Cloud | 4 | 4 | 3 | 3 | 2 | 3 | 19 | Хорош для учебных проектов, данные уходят в облако |
| **Cursor** | IDE | 5 | 4 | 5 | 3 | 3 | 5 | 25 | Отличный UX и качество, но облачная обработка и подписка |
| **GitHub Copilot** | IDE | 4 | 5 | 4 | 4 | 2 | 5 | 24 | Быстрый и удобный, но облачный сервис |
| **Cline** | IDE | 5 | 3 | 4 | 5 | 5 | 5 | **27** | Локальная модель через Ollama, бесплатно, поддержка MCP |
| **Aider** | CLI | 4 | 3 | 4 | 5 | 5 | 4 | 25 | Мощный CLI-агент, менее удобен для повседневной IDE-работы |

### 2.4. Выводы по анализу

- **Cloud-агенты** выигрывают в скорости создания прототипов, но плохо подходят для существующего закрытого репозитория и конфиденциальных данных.
- **IDE-агенты** лучше интегрируются в реальный рабочий процесс, имеют доступ к локальным файлам и Git.
- **Cursor** и **GitHub Copilot** дают высокое качество и скорость, но используют облако и платную подписку.
- **Cline** с локальной моделью через **Ollama** обеспечивает максимальную безопасность, нулевую стоимость и достаточное качество.
- **Aider** — хорошая альтернатива для CLI-сценариев, но в нашем случае важнее удобство VS Code и MCP.

---

## Шаг 3. Выбор инструмента

### 3.1. Выбранный инструмент

**Cline + VS Code + Ollama + Qwen2.5-Coder 7B.**

### 3.2. Обоснование выбора

Ключевые факторы:

1. **Безопасность данных.** Модель запускается локально через Ollama, код не отправляется во внешние сервисы. Соответствует 152-ФЗ и политике ИБ.
2. **Стоимость.** Cline, VS Code, Ollama и Qwen2.5-Coder бесплатны. Затраты только на железо.
3. **Доступ к контексту.** Cline видит файлы проекта, редактирует несколько файлов, работает с терминалом.
4. **Интеграция.** Расширение устанавливается в VS Code, поддерживает Git и MCP.
5. **Достаточное качество.** Qwen2.5-Coder 7B хорошо справляется с Python, FastAPI, SQLAlchemy и тестами.
6. **MCP.** Можно подключить filesystem-сервер и дать агенту контролируемый доступ к папке проекта.

### 3.3. Альтернативы и почему они не подошли

| Альтернатива | Почему не выбрана |
|---|---|
| **Cursor** | Отличный инструмент, но облачная обработка кода и платная подписка. Для конфиденциального проекта рискованно. |
| **GitHub Copilot** | Быстрый и удобный, но код обрабатывается в облаке GitHub/Microsoft. Требует подписки. |
| **Bolt.new / Lovable** | Подходят для быстрых MVP, но не для интеграции с существующим закрытым репозиторием. |
| **Replit Agent** | Облачная среда, ограниченный контроль над данными. |
| **Aider** | Хорош, но CLI-формат менее удобен для ежедневной работы в VS Code. Оставлен как резерв. |

---

## Шаг 4. Настройка рабочего окружения

### 4.1. Установка компонентов

1. Установить **VS Code**.
2. Установить **Ollama**:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
3. Загрузить модель:
   ```bash
   ollama pull qwen2.5-coder:7b
   ```
   При наличии GPU и RAM можно использовать `deepseek-coder-v2:16b`.
4. Установить расширение **Cline** в VS Code.
5. Установить **Node.js** для MCP-серверов.

### 4.2. Настройка Cline

В настройках Cline:

- **API Provider:** Ollama;
- **Base URL:** `http://localhost:11434`;
- **Model:** `qwen2.5-coder:7b`;
- **Context window:** 32k–128k в зависимости от модели;
- **Auto-approve:** выключить для опасных команд.

### 4.3. Настройка MCP

Пример подключения filesystem MCP-сервера:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/project"
      ]
    }
  }
}
```

При необходимости можно добавить Git MCP-сервер для работы с историей коммитов.

### 4.4. Создание тестового проекта

```bash
mkdir tickets-api
cd tickets-api
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy pydantic pytest httpx
```

Структура проекта:

```text
tickets-api/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── routers/
│       └── tickets.py
├── tests/
│   └── test_tickets.py
└── requirements.txt
```

Файл базы данных SQLite создаётся автоматически: `tickets.db`.

### 4.5. Проверка работы

1. Запустить Ollama:
   ```bash
   ollama serve
   ```
2. Открыть VS Code в папке проекта.
3. Убедиться, что Cline видит файлы и отвечает через локальную модель.
4. Выполнить тестовый запрос:
   > «Опиши структуру проекта и предложи, какие файлы нужно создать для API заявок».

---

## Шаг 5. Практическое применение

### 5.1. Задача

Создать минимальный модуль заявок:

- модель `Ticket`;
- Pydantic-схемы `TicketCreate`, `TicketRead`;
- эндпоинты `POST /tickets`, `GET /tickets`;
- тест на создание заявки.

### 5.2. Использованные промпты

**Промпт 1:**
> Ты senior Python-разработчик. В проекте FastAPI + SQLAlchemy + SQLite. Создай модель `Ticket` с полями `id`, `title`, `description`, `status`, `created_at`. Добавь Pydantic-схемы `TicketCreate` и `TicketRead`. Учти стиль проекта и не меняй лишние файлы.

**Промпт 2:**
> Добавь роутер `tickets` с эндпоинтами `POST /tickets` и `GET /tickets`. Подключи его в `main.py`. Используй зависимость `get_db`.

**Промпт 3:**
> Напиши pytest-тест для `POST /tickets` через `TestClient`. Проверь статус 201 и наличие `id` в ответе.

### 5.3. Количество итераций

| Итерация | Что сделано | Проблемы |
|---|---|---|
| 1 | Сгенерированы `models.py`, `schemas.py` | Модель предложила `status` как `Enum`, упростили до `String` |
| 2 | Сгенерирован роутер и подключение | Забыт импорт `Depends`, исправлено следующим промптом |
| 3 | Написан тест | Локальная модель перепутала `httpx` и `requests`, уточнили стек |
| 4 | Рефакторинг и проверка стиля | Потребовалось явно указать PEP 8 и type hints |

### 5.4. Пример полученного кода

**`app/database.py`**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./tickets.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**`app/models.py`**
```python
from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from .database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    status = Column(String(20), default="open", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

**`app/schemas.py`**
```python
from datetime import datetime

from pydantic import BaseModel, Field


class TicketCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = ""


class TicketRead(BaseModel):
    id: int
    title: str
    description: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
```

**`app/routers/tickets.py`**
```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Ticket
from ..schemas import TicketCreate, TicketRead

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    ticket = Ticket(**payload.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("", response_model=list[TicketRead])
def list_tickets(db: Session = Depends(get_db)):
    return db.query(Ticket).order_by(Ticket.id.desc()).all()
```

**`app/main.py`**
```python
from fastapi import FastAPI

from .database import Base, engine
from .routers import tickets

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tickets API")
app.include_router(tickets.router)
```

**`tests/test_tickets.py`**
```python
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_create_ticket():
    response = client.post(
        "/tickets",
        json={"title": "Не открывается VPN", "description": "Ошибка 809"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Не открывается VPN"
    assert "id" in data
```

### 5.5. Возникшие сложности

1. Локальная модель 7B медленнее облачных агентов.
2. Пришлось явно указывать версии библиотек и стиль кода.
3. Контекст ограничен, задачу разбивали на небольшие шаги.
4. MCP filesystem потребовал установки Node.js и правильного пути к проекту.
5. Для SQLite важно не забыть `check_same_thread=False`, иначе FastAPI и тесты могут падать.
6. В тестах использован in-memory SQLite через `StaticPool`, чтобы не создавать лишний файл БД.

### 5.6. Доказательства работы

Скриншоты:

- `screenshots/01_ollama_model.png` — загруженная модель Qwen2.5-Coder.
- `screenshots/02_cline_settings.png` — настройка Cline на Ollama.
- `screenshots/03_mcp_filesystem.png` — подключённый MCP-сервер.
- `screenshots/04_code_generation.png` — генерация роутера.
- `screenshots/05_tests_passed.png` — успешный запуск pytest.

Ссылка на репозиторий:  
`https://github.com/<username>/tickets-api-ai-hw`

---

## Шаг 6. Оформление результатов

### 6.1. Артефакты

- [x] Markdown-отчёт.
- [x] Сравнительная таблица Cloud- и IDE/CLI-агентов.
- [x] Обоснование выбора Cline + Ollama.
- [x] Описание настройки окружения и MCP.
- [x] Пример работы: код, промпты, итерации.
- [x] Выводы и рекомендации.
- [ ] Скриншоты — добавить в репозиторий.
- [ ] Ссылка на GitHub — заменить на реальную.

### 6.2. Чек-лист выбора LLM/AI-агента

- [ ] Определена задача и стек.
- [ ] Есть ли конфиденциальные данные или код?
- [ ] Требуется ли on-premise / локальный запуск?
- [ ] Нужен ли доступ к локальным файлам и Git?
- [ ] Какой бюджет?
- [ ] Есть ли поддержка IDE, CLI, MCP?
- [ ] Проверено качество на тестовой задаче.
- [ ] Оценены скорость и стоимость.
- [ ] Проверено соответствие 152-ФЗ и политике ИБ.
- [ ] Есть ли резервный облачный вариант для неконфиденциальных задач.
- [ ] Подходит ли SQLite для текущей нагрузки или нужна более мощная СУБД?

---

## Выводы и рекомендации

1. Для конфиденциальной внутренней разработки оптимальны **локальные IDE-агенты**.
2. **Cline + Ollama + Qwen2.5-Coder 7B** — лучший выбор при ограниченном бюджете и высоких требованиях к безопасности.
3. **Cloud-агенты** (Bolt.new, Lovable, Replit Agent) полезны для быстрых прототипов и учебных задач, но не для закрытого кода.
4. **Cursor** и **GitHub Copilot** дают высокое качество и скорость, если компания разрешает облачную обработку и готова платить.
5. **Aider** можно использовать как CLI-альтернативу для опытных разработчиков.
6. Для данного проекта **SQLite** подходит как локальная БД: не требует отдельного сервера, легко тестируется, файл `tickets.db` создаётся автоматически. При росте нагрузки или необходимости конкурентной записи стоит рассмотреть PostgreSQL.
7. Рекомендуется:
   - использовать MCP для контролируемого доступа к файлам;
   - фиксировать промпты и итерации;
   - проверять сгенерированный код вручную;
   - не передавать секреты и ключи в промпты;
   - добавить pre-commit и линтеры для контроля качества.

---

## Приложение. Итоговая рекомендация

| Сценарий | Рекомендуемый инструмент |
|---|---|
| Конфиденциальный внутренний проект, бюджет 0 ₽ | **Cline + Ollama + Qwen2.5-Coder** |
| Быстрый MVP без чувствительных данных | Bolt.new / Lovable |
| Коммерческая разработка с разрешённым облаком | Cursor / GitHub Copilot |
| CLI-автоматизация и рефакторинг | Aider |
| Учебный проект в браузере | Replit Agent |
| Локальная БД для прототипа и тестов | SQLite |