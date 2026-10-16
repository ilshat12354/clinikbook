# Документация интеграций ClinicBook (ДЗ6)

## 1. CI/CD

Платформа: **GitHub Actions**.  
Файл: `.github/workflows/ci.yml`.

Этапы пайплайна:
1. **backend** — установка зависимостей, `ruff check`, `pytest`.
2. **frontend** — `npm ci`, `tsc --noEmit`, `npm run test`, `npm run build`.

Триггеры: push и PR в `main`.

AI использован для генерации базового `.yml` через промпт:
"Сгенерируй GitHub Actions workflow для проекта React+TS на корне и Python+FastAPI в ./backend. Нужны lint, test, build."

## 2. OAuth2 (Яндекс ID)

Провайдер: **Яндекс ID**.  
Flow: `authorization code`.

Регистрация: https://oauth.yandex.ru/, Redirect URI `http://localhost:8000/api/v1/auth/oauth/yandex/callback`.

Backend:
- `GET /api/v1/auth/oauth/yandex/login` — возвращает URL авторизации.
- `GET /api/v1/auth/oauth/yandex/callback` — обмен code на токен, создание/поиск пользователя, редирект на фронт с JWT.

Frontend: кнопка «Войти через Яндекс» в `LoginPage`, страница `/oauth` принимает токен.

Обработка ошибок:
- Нет `code` → 400 «Не удалось получить токен».
- Нет email в профиле → 400.

## 3. Аналитика (Яндекс.Метрика)

Счётчик: `VITE_YM_COUNTER_ID`.  
Пакет: `react-yandex-metrika`.  
Файл: `src/analytics.ts`.

События:
- `login_success` — успешный вход.
- `appointment_created` — создание записи.
- `appointment_cancelled` — отмена записи.

## 4. Мониторинг

- Endpoint `/health` возвращает `status`, `db`, `version`.
- Внешний мониторинг: **UptimeRobot**, проверка каждые 5 минут.
- Алерты: email при недоступности.

## 5. Логирование

Формат: JSON.  
Поля: `ts`, `level`, `logger`, `msg`, `exc`.  
Middleware добавляет `X-Request-ID` в каждый ответ, дублирует его в логах.

Промпты для анализа логов — в разделе 7 основного документа.

## 6. Использование AI

| Шаг | Что сделано с AI | Промпт |
|---|---|---|
| CI/CD | Сгенерирован `.github/workflows/ci.yml` | «GitHub Actions для React+FastAPI» |
| Аудит | OWASP Top 10 анализ | «Проверь код на уязвимости, таблица» |
| OAuth | Сгенерирован `oauth.py` | «FastAPI + Яндекс ID authorization code» |
| Аналитика | События Метрики | «Список событий для медицинского приложения» |
| Логи | Формат JSON, уровни | «Structured logging для FastAPI» |