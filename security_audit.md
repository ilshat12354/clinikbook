# Отчёт по безопасности ClinicBook

Дата: 2026-10-16
Инструменты: pip-audit, npm audit, AI-аудит (Cursor, OWASP Top 10).

## Найденные проблемы

| # | Уязвимость | Категория | Риск | Статус | Исправление |
|---|---|---|---|---|---|
| 1 | Дефолтный секрет JWT | A02:2021 Cryptographic Failures | High | Исправлено | `BACKEND_SECRET_KEY` задаётся через `.env`, `openssl rand -hex 32` |
| 2 | Широкий CORS | A05:2021 Security Misconfiguration | High | Исправлено | Ограничен список origin из `BACKEND_CORS_ORIGINS` |
| 3 | Нет rate-limit на login | A07:2021 Auth Failures | Medium | Исправлено | slowapi, 5 req/min на IP |
| 4 | JWT не отзывается | A07:2021 Auth Failures | Medium | Принято | Известное ограничение, документация |
| 5 | Нет HTTPS | A02:2021 | Medium | Отложено | Настраивается на продовом хостинге |
| 6 | SQL-инъекции | A03:2021 Injection | — | Не применимо | SQLAlchemy ORM, параметризованные запросы |
| 7 | XSS | A03:2021 Injection | — | Не применимо | React экранирует вывод, нет dangerouslySetInnerHTML |

## Проверка зависимостей

- `pip-audit`: уязвимостей не найдено (fastapi 0.115, sqlalchemy 2.0.35, bcrypt 4.1.3).
- `npm audit`: 0 vulnerabilities после `npm audit fix`.

## Рекомендации

1. Сменить `BACKEND_SECRET_KEY` перед продовым деплоем.
2. Настроить HTTPS через reverse-proxy (nginx, Caddy).
3. Ввести blacklist JWT или сократить срок до 15 минут.
4. Добавить 2FA для админских аккаунтов.
5. Настроить логирование всех событий авторизации.