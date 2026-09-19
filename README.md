# VibeDebt // Technical Debt Auditor & Doomsday Clock for AI-Built Startups

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-17%20passing-10b981?style=flat-square)](https://github.com/20246ah-svg/lending)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Аудитор технического долга для соло-фаундеров и инди-хакеров.**
> Узнай, когда твой проект на Cursor, Bolt.new или Lovable рухнет от очередного коммита — и получи хирургические промпты для безопасного рефакторинга.

---

## 🎯 Проблема и решение

- **Проблема:** Тысячи инди-фаундеров создают стартапы с помощью AI (Cursor, Bolt, Lovable). Нейросети генерируют код с огромной скоростью, но плодят скрытые архитектурные дефекты: монолитные файлы по 2000+ строк, каскады `(data as any)`, циклические `useEffect` и утечки секретных ключей прямо в клиентский код (`'use client'`). Со временем проект упирается в «регрессионный тупик».
- **Решение:** **VibeDebt** анализирует кодовую базу через GitHub API или прямую вставку кода/сниппета, рассчитывает **Счетчик Судного Дня (Doomsday Score)**, оценивает запас прочности до краха (MTBF) и генерирует хирургические промпты, адаптированные для Cursor Composer и Claude 3.7.

---

## ⚡ Ключевые возможности

1. **Реальный GitHub API Сканер:**
   - Анализ любого публичного репозитория (`owner/repo` или полная ссылка).
   - Сканирование дерева файлов с фильтрацией тестовых артефактов и зависимостей.
   - Проверка наличия тестовых фреймворков (`vitest`, `jest`, `playwright`).
   - Поддержка lock-файлов: `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`.
   - Детекция утечек сервисных ключей (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`) в клиентских компонентах.
2. **Анализ вставок кода (Сниппеты):**
   - Возможность вставить проблемный компонент или код из Cursor в форму и мгновенно получить отчет с до/после рекомендациями.
3. **Типовые проекты (Пресеты):**
   - Мгновенный аудит характерных архетипов: `Cursor SaaS MVP`, `Bolt.new Landing`, `Crypto Trading Bot`.
4. **Счетчик Судного Дня (Doomsday Score & TTD):**
   - Динамический прогноз времени до фатального отказа кодовой базы в коммитах.
   - Оценка финансового долга (эквивалент затрат на экстренное переписывание сеньором).
5. **Хирургические промпты для рефакторинга:**
   - Готовые узкоспециализированные промпты с переключателем под **Cursor Composer** и **Claude 3.7 Thinking**.
6. **Интерактивный симулятор технического долга:**
   - Ползунки параметров: объем строк ИИ-кода, God-файлы, автотесты, состояние базы данных, визуализированные через SVG-радар.
7. **Локальный CLI (Early Preview):**
   - Утилита для запуска анализа приватных репозиториев без передачи кода во внешние сети.
8. **Двуязычный интерфейс (RU / EN):**
   - Моментальное переключение языка интерфейса и отчетов.

---

## 🛠 Стек технологий

- **Фреймворк:** [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Библиотека:** [React 19](https://react.dev)
- **Стилизация:** [Tailwind CSS v4](https://tailwindcss.com) + `@theme` системный стек шрифтов
- **3D & Графика:** [Three.js](https://threejs.org) (интерактивное 3D-ядро) + HTML5 Canvas
- **Тестирование:** Native Node.js Test Runner (17 unit-тестов, ~100 мс)
- **API:** REST Route Handler `/api/audit` с in-memory LRU кэшем и защитой от исчерпания rate limit

---

## 🚀 Быстрый старт

1. Клонируйте репозиторий:
```bash
git clone https://github.com/20246ah-svg/lending.git
cd lending
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите тесты:
```bash
npm test
```

4. Запустите dev-сервер:
```bash
npm run dev
```

5. Откройте в браузере [http://localhost:3000](http://localhost:3000).

---

## 📦 Сборка для продакшена

```bash
npm run build
npm run start
```

---

## 📄 Лицензия

MIT License (c) 2026 VibeDebt Authors.
