# ClinicBook — онлайн-запись на приём

Frontend-приложение для онлайн-записи в частную клинику. Реализовано по ТЗ из ДЗ3.

## Стек

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Vitest + React Testing Library

## Функциональность

1. **Запись на приём** — выбор врача, даты и слота, подтверждение.
2. **Мои визиты** — список предстоящих и прошедших визитов, отмена.
3. **Панель администратора** — расписание врачей на дату.

## Запуск

```bash
git clone https://github.com/username/clinicbook.git
cd clinicbook
npm install
npm run dev
```

Приложение: http://localhost:5173

## Тесты

```bash
npm run test
```

Покрытие: утилиты слотов, страница записи, карточка визита, empty-state.

## Деплой

Демо: https://clinicbook-demo.vercel.app

## Структура

```
src/
├── components/     # переиспользуемые компоненты
├── pages/          # страницы приложения
├── data/           # mock-данные
├── utils/          # хелперы
├── tests/          # автотесты
├── types.ts
├── App.tsx
└── main.tsx
```

## Адаптивность

- Mobile-first, breakpoints: `sm` 640, `md` 768, `lg` 1024.
- Проверено в Chrome DevTools на iPhone SE, iPhone 14, iPad, Desktop 1440.