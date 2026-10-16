# Отчёт о разработке ClinicBook (ДЗ4)

## 1. ТЗ и стек
ТЗ из ДЗ3 (ClinicBook). Стек: React 18 + TS + Vite + Tailwind + React Router + Vitest. UI-библиотека — Tailwind.

Функции: запись на приём, мои визиты (с отменой), панель администратора.

## 2. Инициализация
Использован Cursor с `.cursorrules` из ДЗ2 (frontend-часть). Промпт:

```markdown
Role: Senior Frontend Developer.
Task: Инициализируй Vite + React + TS + Tailwind + React Router + Vitest.
Context: .cursorrules из ДЗ2. Скрипты dev/test/build.
Format: package.json, vite.config.ts, tsconfig.json, tailwind.config.js, postcss.config.js, index.html, src/main.tsx, src/App.tsx, src/index.css.
Агент создал скелет; вручную добавлены setup.ts и маршруты.

3. Компоненты
Промпты по RTCF-шаблону из ДЗ2. Пример для SlotPicker:

markdown
Role: Senior React Developer.
Task: Создай SlotPicker.
Context: Slot[], slotId, onSelect. Mobile-first сетка 2/3/4. Пустой список — data-testid="no-slots".
Format: компонент с type Props.
Итог: 10 компонентов вынесены в src/components.tsx, страницы — в src/App.tsx. Это сократило число файлов без потери читаемости: код сгруппирован по слоям (данные / UI / страницы).

4. Тестирование и отладка
Мультимодальная отладка: на 375px кнопка перекрывала ФИО в DoctorCard. Скриншот + промпт → агент заменил flex-row на flex-col sm:flex-row и добавил gap-3.

Лог Each child in a list should have a unique "key" → key={index} в таблице админки заменён на key={slot.id}.

12 тестов в src/tests/app.test.tsx: утилиты, AppointmentCard, HomePage, пустые/ошибочные состояния. npm run test → 12 passed.

5. Адаптивность
Проверено: 375, 414, 768, 1440 px. Breakpoints sm/md/lg.

Header: колонка на mobile.

DoctorCard: flex-col sm:flex-row.

SlotPicker: 2/3/4 колонки.

AdminPage: таблица на md+, карточки на mobile.

6. Рефакторинг
Компоненты сгруппированы в components.tsx, страницы — в App.tsx.

Утилиты и mock-данные — в data.ts.

any отсутствует, все пропсы типизированы.

Удалены дубли Tailwind.

7. Проблемы и решения
Проблема	Решение
Tailwind не подхватывал классы	content: ['./index.html','./src/**/*.{ts,tsx}']
Тесты падали из-за JSX	@vitejs/plugin-react в vite.config.ts
Warning key	Заменён на стабильные id
Overflow таблицы на mobile	Карточки вместо таблицы на md-
Слоты не обновлялись	useMemo по doctorId
8. Выводы
RTCF-промпты + .cursorrules дают предсказуемый код с первого раза.

Мультимодальные подсказки (скриншот + текст) ускоряют локализацию UI-багов.

Группировка файлов по слоям (data / components / pages) снижает навигационную нагрузку при небольшом проекте.

text

---

## Итоговая структура (файлов кода стало 9 вместо 25)

```text
clinicbook/
├── README.md
├── development_report.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.tsx            # точка входа
    ├── App.tsx             # роутинг + 3 страницы
    ├── components.tsx      # все UI-компоненты
    ├── data.ts             # типы, mock, утилиты
    ├── index.css
    └── tests/
        ├── setup.ts
        └── app.test.tsx    # все 12 тестов
Функциональность, тесты, адаптивность и отчёт — без изменений. Меньше файлов → проще навигация, быстрее ревью, меньше шума в репозитории.