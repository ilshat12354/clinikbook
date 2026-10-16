markdown
# prompt_templates.md — Библиотека промпт-шаблонов

Все шаблоны используют структуру **RTCF**: Role → Task → Context → Format.

---

## Шаблон 1. Генерация компонента/функции по описанию

```markdown
**Role:**  
Ты — Senior Python/FastAPI Developer. Ты пишешь чистый код в стиле проекта Tickets API.

**Task:**  
Создай эндпоинт `{METHOD} {PATH}` для {НАЗНАЧЕНИЕ}.

**Context:**  
- Стек: Python 3.11, FastAPI, SQLAlchemy 2.0, SQLite, Pydantic v2.
- Модель: `{MODEL}` с полями: `{FIELDS}`.
- Схемы: `{SCHEMAS}`.
- Зависимость БД: `get_db` из `app.database`.
- Роутер находится в `app/routers/{ROUTER}.py`.
- Стиль: type hints, docstring, PEP 8, response_model.

**Format:**  
- Полный код файла `app/routers/{ROUTER}.py`.
- Импорты.
- Краткое пояснение.
- Пример запроса и ответа.
Пример использования
markdown
**Role:** Ты — Senior Python/FastAPI Developer.  
**Task:** Создай эндпоинт `POST /tickets` для создания новой заявки.  
**Context:**  
- Модель `Ticket`: id, title, description, status, created_at.  
- Схемы: `TicketCreate`, `TicketRead`.  
- БД: SQLite, `get_db`.  
- Роутер: `app/routers/tickets.py`.  
**Format:** Полный код роутера, пояснение, пример JSON.
Шаблон 2. Рефакторинг кода с улучшением
markdown
**Role:**  
Ты — Senior Python Refactoring Expert. Ты улучшаешь код без изменения поведения.

**Task:**  
Отрефактори `{ФАЙЛ}`: улучши читаемость, типизацию и соответствие PEP 8.

**Context:**  
- Текущий код:
```python
{КОД}
Стек: Python 3.11, FastAPI, SQLAlchemy 2.0, SQLite.

Требования: type hints, docstring, ruff, black, mypy.

Запрещено менять публичный API и поведение.

Format:

Обновлённый код.

Список изменений.

Объяснение, почему стало лучше.

text

### Пример использования

```markdown
**Role:** Ты — Senior Python Refactoring Expert.  
**Task:** Отрефактори функцию `get_ticket`.  
**Context:**  
```python
def get_ticket(id):
    return db.query(Ticket).get(id)
Format: Обновлённый код, список изменений.

text

---

## Шаблон 3. Написание тестов для существующего кода

```markdown
**Role:**  
Ты — QA Automation Engineer. Ты пишешь pytest-тесты для FastAPI.

**Task:**  
Напиши тесты для `{ФУНКЦИЯ/ЭНДПОИНТ}`.

**Context:**  
- Код:
```python
{КОД}
Стек: pytest, httpx, FastAPI TestClient, SQLite in-memory.

Нужно проверить: успешный сценарий, 404, 422, граничные случаи.

Фикстуры: client, db_session.

Format:

Файл tests/{TEST_FILE}.py.

Импорты, фикстуры, тесты.

Команда запуска: pytest -q.

text

### Пример использования

```markdown
**Role:** Ты — QA Automation Engineer.  
**Task:** Напиши тесты для `POST /tickets`.  
**Context:**  
- Эндпоинт создаёт заявку и возвращает 201.  
- Нужно проверить: успех, пустой title, слишком длинный title.  
**Format:** `tests/test_tickets.py`, команда запуска.
Шаблон 4. Исправление ошибок и багов
markdown
**Role:**  
Ты — Senior Debugging Expert. Ты находишь и исправляешь баги.

**Task:**  
Исправь ошибку: `{ОПИСАНИЕ ОШИБКИ}`.

**Context:**  
- Код:
```python
{КОД}
Текст ошибки:

text
{TRACEBACK}
Стек: Python 3.11, FastAPI, SQLAlchemy 2.0, SQLite.

Нельзя менять архитектуру без необходимости.

Format:

Причина ошибки.

Исправленный код.

Как проверить, что баг устранён.

text

### Пример использования

```markdown
**Role:** Ты — Senior Debugging Expert.  
**Task:** Исправь `AttributeError: 'Session' object has no attribute 'query'`.  
**Context:**  
- Код использует `db.query(Ticket).get(id)`.  
- SQLAlchemy 2.0.  
**Format:** Причина, исправленный код, проверка.
Шаблон 5. Декомпозиция сложной задачи на подзадачи
markdown
**Role:**  
Ты — Tech Lead. Ты разбиваешь сложные задачи на понятные шаги.

**Task:**  
Декомпозируй задачу: `{СЛОЖНАЯ ЗАДАЧА}`.

**Context:**  
- Проект: Tickets API.  
- Стек: FastAPI, SQLAlchemy 2.0, SQLite, Pytest.  
- Ограничения: локальная разработка, без внешних сервисов.  
- Нужно минимум 3 логических шага.

**Format:**  
- Нумерованный список шагов.  
- Для каждого шага: цель, вход, выход, критерий готовности.  
- Предложение, какие файлы будут затронуты.
Пример использования
markdown
**Role:** Ты — Tech Lead.  
**Task:** Декомпозируй задачу «Добавить JWT-аутентификацию и роли».  
**Context:** Tickets API, FastAPI, SQLite.  
**Format:** Шаги с целями, файлами и критериями готовности.
Сводная таблица шаблонов
№	Шаблон	Сценарий	RTCF
1	Генерация эндпоинта	Новая функциональность	✅
2	Рефакторинг	Улучшение существующего кода	✅
3	Тесты	Покрытие pytest	✅
4	Баг-фикс	Диагностика и исправление	✅
5	Декомпозиция	Планирование сложной задачи	✅