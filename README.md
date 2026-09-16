# VibeDebt // Technical Debt Auditor & Doomsday Clock for AI-Built Startups

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![VibeDebt Doomsday](https://img.shields.io/badge/VibeDebt_Doomsday-89%25_CRITICAL-f43f5e?style=flat-square&logo=github)](https://vibedebt.dev)

> **Аудитор технического долга для соло-фаундеров и инди-хакеров.**
> Узнай, когда твой проект на Cursor, Bolt.new или Lovable рухнет от очередного коммита — и получи хирургические промпты для безопасного рефакторинга.

---

## 🎯 Проблема и решение

- **Проблема:** Тысячи инди-фаундеров «вайбкодят» свои стартапы в Cursor, Bolt и Lovable. ИИ генерирует код на огромной скорости, но плодит скрытых архитектурных монстров: монолитные файлы по 2500+ строк, каскады `(data as any)`, циклические `useEffect` и утечки секретных ключей прямо в клиентский бандл (`'use client'`). Через месяц проект становится «спагетти-миной», ломающейся от любого чиха.
- **Решение:** **VibeDebt** анализирует кодовую базу через REST GitHub API или прямую вставку кода/файлов, рассчитывает **Счетчик Судного Дня (Doomsday Score)**, оценивает запас прочности до краха (MTBF) и выдает пошаговые хирургические мета-промпты, которые можно скопировать обратно в нейросеть для поэтапного безопасного рефакторинга.

---

## ⚡ Ключевые возможности

1. **Реальный GitHub API Сканер:**
   - Анализ любого публичного репозитория (`owner/repo` или полная ссылка).
   - Сканирование дерева файлов, проверка `package.json` на наличие тестовых фреймворков (`jest`, `vitest`, `playwright`).
   - Определение God-компонентов по объему байт и строк.
   - Детекция утечек сервисных ключей (`SERVICE_ROLE_KEY`, `API_KEY`).
2. **Анализ вставок кода и загрузка файлов (Drag & Drop):**
   - Возможность перетащить файл (`.tsx`, `.ts`, `.js`, `package.json`) или вставить проблемный сниппет.
   - Быстрый эвристический AST-анализ на стороне сервера.
3. **Счетчик Судного Дня (Doomsday Score & TTD):**
   - Прогноз времени до фатального отказа кодовой базы в коммитах.
   - Оценка финансового долга в долларах (стоимость найма senior-разработчика).
4. **Хирургические промпты для рефакторинга:**
   - Готовые узкоспециализированные промпты для Cursor и Claude 3.7 с кнопкой копирования в один клик.
5. **Матрица здоровья (Health X-Ray):**
   - Четыре шкалы надежности: Безопасность ключей, Модульность компонентов, Строгость типизации, Автоматические тесты.
6. **Интерактивный симулятор технического долга:**
   - Ползунки параметров: объем строк ИИ-кода, God-файлы, частота промптов «Just fix it», автотесты, состояние базы данных.
7. **Виральные инструменты:**
   - Кнопка «Поделиться в X (Twitter)» с готовым шаблоном твита.
   - Генератор бейджей для `README.md`.
8. **Двуязычный интерфейс (RU / EN):**
   - Моментальное переключение языка без перезагрузки страницы.

---

## 🛠 Стек технологий

- **Фреймворк:** [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Библиотека:** [React 19](https://react.dev)
- **Стилизация:** [Tailwind CSS v4](https://tailwindcss.com) (минималистичный developer-first дизайн)
- **Иконки:** Векторные SVG-компоненты React
- **API:** Встроенный REST Route Handler `/api/audit` с интеграцией GitHub API

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

3. Запустите dev-сервер:
```bash
npm run dev
```

4. Откройте в браузере [http://localhost:3000](http://localhost:3000).

---

## 📦 Сборка для продакшена

```bash
npm run build
npm run start
```

---

## 📄 Лицензия

MIT License (c) 2026 VibeDebt. Built with ❤️ for indie hackers.
