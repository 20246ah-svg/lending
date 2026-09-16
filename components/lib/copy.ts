import type { Lang } from "./types";

export type { Lang };

/* ==================================================================
   Единый словарь интерфейса RU / EN.
   Обязательный контракт `Copy` гарантирует, что обе локали
   содержат одинаковый набор строк.
   ================================================================== */

export interface Step {
  n: string;
  title: string;
  desc: string;
}

export interface Stat {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface FlowStage {
  tag: string;
  title: string;
  desc: string;
}

export interface AnatomyItem {
  n: string;
  title: string;
  body: string;
  symptom: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface PricingTier {
  name: string;
  badge?: string;
  price: string;
  unit: string;
  desc: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

export interface Pillar {
  title: string;
  hint: string;
  metric: (score: number, spaghetti: number, ghosts: number, tests: boolean) => {
    value: number;
    label: string;
    tone: "critical" | "elevated" | "healthy";
  };
}

export interface Copy {
  langName: string;
  nav: {
    auditor: string;
    calculator: string;
    cli: string;
    smells: string;
    pricing: string;
    faq: string;
    cta: string;
    tagline: string;
  };
  hero: {
    badge: string;
    h1a: string;
    h1accent: string;
    h1b: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    note: string;
    steps: Step[];
    stats: Stat[];
    console: {
      window: string;
      status: string;
      lines: string[];
      score: string;
      verdict: string;
      chips: string[];
      files: string;
      scan: string;
    };
  };
  marquee: string;
  workbench: {
    eyebrow: string;
    title: string;
    sub: string;
    engine: string;
    tabGithub: string;
    tabSnippet: string;
    tabPreset: string;
    githubLabel: string;
    githubPlaceholder: string;
    run: string;
    quickExample: string;
    liveExample: string;
    presetLabel: string;
    snippetLabel: string;
    snippetPlaceholder: string;
    uploadFile: string;
    dropActive: string;
    sampleCode: string;
    auditSnippet: string;
    loading: string;
    loadingStages: string[];
    errorPrefix: string;
    presetNotes: Record<string, string>;
    report: {
      for: string;
      live: string;
      demo: string;
      shareX: string;
      copyPost: string;
      badge: string;
      copied: string;
      score: string;
      scoreCritical: string;
      scoreElevated: string;
      scoreHealthy: string;
      scoreHint: string;
      ttd: string;
      ttdHint: string;
      cost: string;
      costFree: string;
      costSaved: string;
      metrics: string;
      spaghetti: string;
      filesScanned: string;
      tests: string;
      found: string;
      none: string;
      tabSmells: string;
      tabGod: string;
      tabPrompts: string;
      tabXray: string;
      badCode: string;
      goodCode: string;
      recommendation: string;
      decompose: string;
      riskCritical: string;
      riskHigh: string;
      riskMedium: string;
      rescueBadge: string;
      rescueTitle: string;
      rescueSub: string;
      targetCursor: string;
      targetClaude: string;
      copyAll: string;
      allCopied: string;
      copyFor: string;
      copy: string;
      howToApply: string;
      toolCursor: string;
      toolClaude: string;
      xrayTitle: string;
      xraySub: string;
      pillars: Pillar[];
      risk: string;
      safe: string;
    };
  };
  cli: {
    eyebrow: string;
    title: string;
    sub: string;
    copy: string;
    copied: string;
    features: Step[];
  };
  pipeline: {
    eyebrow: string;
    title: string;
    sub: string;
    flow: FlowStage[];
    cards: FlowStage[] | { tag: string; title: string; body: string; footer: string }[];
  };
  calc: {
    eyebrow: string;
    title: string;
    sub: string;
    sliders: {
      lines: string;
      linesUnit: string;
      linesRange: string[];
      godFiles: string;
      godFilesUnit: string;
      godFilesRange: string[];
      prompts: string;
      promptsUnit: string;
      promptsHint: string;
      tests: string;
      testsYes: string;
      testsNo: string;
      db: string;
      dbClean: string;
      dbMedium: string;
      dbMess: string;
    };
    result: {
      header: string;
      live: string;
      until: string;
      day: string;
      daysFew: string;
      daysMany: string;
      verdictCritical: string;
      verdictOk: string;
      contractor: string;
      fragility: string;
      hours: string;
      tipLabel: string;
      tip: string;
      gaugeCritical: string;
      gaugeElevated: string;
      gaugeHealthy: string;
      reset: string;
    };
  };
  anatomy: {
    eyebrow: string;
    title: string;
    sub: string;
    items: AnatomyItem[];
  };
  waitlist: {
    eyebrow: string;
    title: string;
    sub: string;
    placeholder: string;
    cta: string;
    success: string;
    note: string;
  };
  pricing: {
    eyebrow: string;
    title: string;
    sub: string;
    tiers: PricingTier[];
    note: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    sub: string;
    items: FaqItem[];
    aside: { title: string; sub: string; cta: string; note: string };
  };
  finalCta: {
    eyebrow: string;
    title: string;
    sub: string;
    primary: string;
    secondary: string;
    bullets: string[];
  };
  footer: {
    tagline: string;
    product: string;
    resources: string;
    company: string;
    links: { label: string; href: string }[];
    status: string;
    rights: string;
    builtFor: string;
    backToTop: string;
  };
}

export const copy: Record<Lang, Copy> = {
  /* ============================ RU ============================ */
  ru: {
    langName: "Русский",
    nav: {
      auditor: "Аудитор",
      calculator: "Калькулятор",
      cli: "CLI",
      smells: "ИИ-ошибки",
      pricing: "Тарифы",
      faq: "FAQ",
      cta: "Проверить проект",
      tagline: "Аудитор технического долга для соло-фаундеров",
    },
    hero: {
      badge: "Счётчик Судного Дня · Cursor · Bolt · Lovable",
      h1a: "Сколько коммитов осталось до",
      h1accent: "краха",
      h1b: "вашего вайбкод-проекта?",
      sub: "ИИ пишет код со скоростью команды из десяти человек — и с той же скоростью прячет в нём мины: файлы на 2400 строк, каскады `as any`, циклические хуки и ключи Supabase прямо в браузере. VibeDebt сканирует репозиторий, считает запас прочности до критического сбоя и выдаёт хирургические промпты, которые безопасно вытаскивают проект.",
      ctaPrimary: "Запустить аудит бесплатно",
      ctaSecondary: "Посмотреть, как это работает",
      note: "Без регистрации · GitHub API, файл или вставка кода",
      steps: [
        { n: "01", title: "Загрузите код", desc: "Ссылка на GitHub, файл или сниппет — три способа, один клик." },
        { n: "02", title: "AST-сканер считает", desc: "Объём файлов, типы, тесты, секреты, циклы зависимостей." },
        { n: "03", title: "Заберите план", desc: "Вердикт, TTD и промпты под Cursor Composer или Claude." },
      ],
      stats: [
        { value: 12480, suffix: "+", label: "Репозиториев просканировано" },
        { value: 87, suffix: "%", label: "Вайбкод-проектов в красной зоне" },
        { value: 4800, prefix: "$", label: "Средний счёт за экстренного сеньора" },
        { value: 12, suffix: " мин", label: "До готового плана рефакторинга" },
      ],
      console: {
        window: "vibedebt — scan ./src",
        status: "AST-движок онлайн",
        lines: [
          "$ npx vibedebt audit ./src",
          "→ дерево файлов: 38 объектов, 214 КБ",
          "→ package.json: тесты не обнаружены ✗",
          "⚠ app/page.tsx — 2420 строк, 8 модалок, 14 useState",
          "⚠ SUPABASE_SERVICE_ROLE_KEY в 'use client' ✗",
          "⚠ useEffect: нестабильная ссылка filters × 20 req/s",
          "✓ сгенерировано 3 хирургических промпта",
        ],
        score: "Doomsday Score",
        verdict: "Критический уровень риска",
        chips: ["Секреты в бандле", "God-компонент", "0 тестов"],
        files: "Файлов проверено",
        scan: "Идёт сканирование",
      },
    },
    marquee: "Инструменты, код которых мы умеем читать",
    workbench: {
      eyebrow: "Рабочая станция аудита",
      title: "Прогоните свой проект через сканер",
      sub: "Реальный REST-скан публичного репозитория через GitHub API, мгновенный разбор вставленного файла или демо-кейс, если хочется просто посмотреть отчёт.",
      engine: "REST AST Static Analysis Engine",
      tabGithub: "GitHub репозиторий",
      tabSnippet: "Код / файл",
      tabPreset: "Демо-кейсы",
      githubLabel: "Публичный URL репозитория на GitHub",
      githubPlaceholder: "https://github.com/owner/repository",
      run: "Запустить аудит",
      quickExample: "Попробовать пример:",
      liveExample: "shadcn-ui/ui (живой репозиторий)",
      presetLabel: "Смоделированные архетипы стартапов",
      snippetLabel: "Вставьте код или перетащите файл — tsx, ts, js, json",
      snippetPlaceholder: "Вставьте сюда компонент React / Next.js или структуру package.json…",
      uploadFile: "Загрузить файл",
      dropActive: "Отпустите файл — начну аудит",
      sampleCode: "Пример вайб-кода",
      auditSnippet: "Проверить фрагмент",
      loading: "Идёт анализ…",
      loadingStages: [
        "Подключение к источнику…",
        "Чтение дерева файлов…",
        "Эвристики по типам, секретам и тестам…",
        "Сборка отчёта и генерация промптов…",
      ],
      errorPrefix: "Ошибка проверки:",
      presetNotes: {
        "cursor-saas": "Файл на 2400 строк + утечка ключа",
        "bolt-landing": "Расчёт цен на клиенте, обход бэкенда",
        "crypto-bot": "Приватные ключи в логах, нет идемпотентности",
      },
      report: {
        for: "Отчёт по проекту",
        live: "Данные из GitHub API",
        demo: "Демо-отчёт",
        shareX: "В X",
        copyPost: "Текст поста",
        badge: "Бейдж для README",
        copied: "Скопировано",
        score: "Счётчик Судного Дня",
        scoreCritical: "Критический уровень риска",
        scoreElevated: "Умеренный технический долг",
        scoreHealthy: "Архитектура под контролем",
        scoreHint: "Вероятность сбоя на следующей фиче",
        ttd: "Запас прочности",
        ttdHint: "Оценка до критического бага",
        cost: "Цена вызова сеньора",
        costFree: "или $0 с нашими промптами",
        costSaved: "Экономия бюджета ≈ 92%",
        metrics: "Метрики качества",
        spaghetti: "Индекс спагетти",
        filesScanned: "Файлов проверено",
        tests: "Автотесты",
        found: "Обнаружены",
        none: "Отсутствуют",
        tabSmells: "Найденные уязвимости",
        tabGod: "God-файлы",
        tabPrompts: "План спасения",
        tabXray: "Матрица здоровья",
        badCode: "Что сгенерировал ИИ",
        goodCode: "Как должно быть",
        recommendation: "Рекомендация",
        decompose: "Разбить на 2+ модуля",
        riskCritical: "Критично",
        riskHigh: "Высокий риск",
        riskMedium: "Средний риск",
        rescueBadge: "Главный инструмент спасения",
        rescueTitle: "Хирургический рефакторинг под ИИ-ассистентов",
        rescueSub: "Промпты декомпозируют код на изолированные файлы без потери бизнес-логики и UI. Один шаг — один коммит — один ревью.",
        targetCursor: "Cursor",
        targetClaude: "Claude",
        copyAll: "Скопировать весь план",
        allCopied: "Весь план скопирован",
        copyFor: "Скопировать промпт",
        copy: "Копировать",
        howToApply: "Как применить: откройте Cursor → Cmd+I (Composer) → вставьте промпт → Enter.",
        toolCursor: "Cursor Composer",
        toolClaude: "Claude Thinking",
        xrayTitle: "Матрица здоровья кодовой базы",
        xraySub: "Четыре столпа, которые определяют, переживёт ли проект следующий спринт.",
        pillars: [
          {
            title: "Безопасность ключей",
            hint: "Проверка секретных токенов в клиентских файлах",
            metric: (score) => ({
              value: score > 75 ? 14 : 85,
              label: score > 75 ? "Критично" : "Норма",
              tone: score > 75 ? "critical" : "healthy",
            }),
          },
          {
            title: "Модульность компонентов",
            hint: "Оценка God-объектов и связности одного файла",
            metric: (_s, spaghetti) => {
              const v = Math.round(Math.max(15, 100 - spaghetti * 9));
              return { value: v, label: `${v}%`, tone: v < 40 ? "critical" : v < 70 ? "elevated" : "healthy" };
            },
          },
          {
            title: "Строгость TypeScript",
            hint: "Детекция подавления компилятора через 'any'",
            metric: (_s, _sp, ghosts) => {
              const v = Math.round(Math.max(20, 100 - ghosts * 1.5));
              return { value: v, label: `${v}%`, tone: v < 40 ? "critical" : v < 70 ? "elevated" : "healthy" };
            },
          },
          {
            title: "Регрессионные тесты",
            hint: "Наличие сценариев Vitest / Jest / Playwright",
            metric: (_s, _sp, _g, tests) => ({
              value: tests ? 100 : 4,
              label: tests ? "100%" : "Угроза",
              tone: tests ? "healthy" : "critical",
            }),
          },
        ],
        risk: "Риск",
        safe: "ОК",
      },
    },
    cli: {
      eyebrow: "Локальный аудит",
      title: "Одна команда — и техдолг на экране",
      sub: "Для приватных репозиториев и корпоративного кода. Файлы не покидают вашу машину: движок работает локально и возвращает exit-code для CI.",
      copy: "Копировать",
      copied: "Скопировано",
      features: [
        { n: "01", title: "Ничего не утекает", desc: "Анализ идёт на вашей машине, наружу уходит только агрегированный отчёт." },
        { n: "02", title: "Готово к CI", desc: "Ненулевой exit-code останавливает merge, если файл превысил 400 строк." },
        { n: "03", title: "Ноль настройки", desc: "npx без установки зависимостей и без конфигов — как eslint, только про долг." },
      ],
    },
    pipeline: {
      eyebrow: "Как это работает",
      title: "Есть ли внутри отдельный ИИ?",
      sub: "Гибридная архитектура: сначала детерминированный статический анализ, затем — контекстный генератор промптов. Никаких галлюцинаций в цифрах.",
      flow: [
        { tag: "01", title: "Сбор", desc: "GitHub REST API или локальный файл: дерево, размеры, package.json." },
        { tag: "02", title: "Эвристики", desc: "Регулярки и AST-правила ищут секреты, `as any`, циклы и монолиты." },
        { tag: "03", title: "Скоринг", desc: "Взвешенная модель считает Doomsday Score и TTD в коммитах." },
        { tag: "04", title: "План", desc: "Шаблонизатор собирает промпты под конкретные файлы и инструмент." },
      ],
      cards: [
        {
          tag: "Уровень 1 · мгновенно",
          title: "Статический AST-сканер",
          body: "Считывает дерево файлов через GitHub API без участия нейросети. Проверяет package.json на наличие тестов (jest, vitest), замеряет объёмы файлов и ищет паттерны 'as any', утечек ключей и циклов в useEffect. Работает за 0.5 секунды со 100% точностью и без галлюцинаций.",
          footer: "Чистая математика и факты кода",
        },
        {
          tag: "Уровень 2 · ИИ-рефакторинг",
          title: "Контекстный мета-промптер",
          body: "На основе найденных аномалий (например, монолитный app/page.tsx на 2420 строк) формирует узконаправленный системный промпт для Claude или Cursor. Промпт даёт строгие рамки, запрещающие ИИ ломать существующий UI при распиле логики.",
          footer: "Безопасный рефакторинг итерациями",
        },
      ],
    },
    calc: {
      eyebrow: "Симулятор долга",
      title: "Интерактивный калькулятор технического долга",
      sub: "Настройте параметры под свою ситуацию и посмотрите, сколько дней у проекта до критического сбоя — ещё до запуска на Product Hunt.",
      sliders: {
        lines: "1. Строк кода, написанных ИИ",
        linesUnit: "строк",
        linesRange: ["500 · MVP", "10 000 · SaaS", "20 000+ · спагетти"],
        godFiles: "2. Файлов длиннее 500 строк",
        godFilesUnit: "файлов",
        godFilesRange: ["0 · модульно", "3–5 · опасно", "10 · монолит"],
        prompts: "3. Промптов «Just fix it, не трогай остальное»",
        promptsUnit: "раз",
        promptsHint: "Каждый такой промпт заставляет ИИ оборачивать старый костыль в новый.",
        tests: "4. Автотесты и CI",
        testsYes: "Есть тесты",
        testsNo: "Живу опасно",
        db: "5. Состояние базы данных и стейта",
        dbClean: "Миграции",
        dbMedium: "JSON-колонки",
        dbMess: "LocalStorage",
      },
      result: {
        header: "Прогноз катастрофы // TTD",
        live: "онлайн",
        until: "До критического отказа системы",
        day: "день",
        daysFew: "дня",
        daysMany: "дней",
        verdictCritical: "Критическая хрупкость. Любая правка в Stripe или Auth запустит каскадный сбой.",
        verdictOk: "Базовый запас прочности есть, но архитектурный долг уже срезает скорость релизов.",
        contractor: "Экстренный найм сеньора",
        fragility: "Индекс хрупкости",
        hours: "Часов на спасение",
        tipLabel: "Совет",
        tip: "Вместо найма разработчика за $150/час выполните сгенерированный план в блоке аудитора выше — это тот же объём работ, но вашими руками и промптами.",
        gaugeCritical: "Красная зона",
        gaugeElevated: "Жёлтая зона",
        gaugeHealthy: "Стабильно",
        reset: "Сбросить",
      },
    },
    anatomy: {
      eyebrow: "Анатомия проблемы",
      title: "Четыре всадника гниения ИИ-кода",
      sub: "Почему вайбкодинг ощущается магией на первой неделе и превращается в неподдерживаемый клубок на четвёртой.",
      items: [
        {
          n: "01",
          title: "Монолитный файл-монстр",
          body: "Когда вы просите Cursor добавить модалку или платежи, ему проще дописать 150 строк в текущий page.tsx, чем разносить компоненты по папкам. Вскоре файл превышает контекстное окно модели, и ИИ начинает стирать старый код.",
          symptom: "Попросил сменить цвет кнопки — перестала работать оплата",
        },
        {
          n: "02",
          title: "Глушение TypeScript через 'as any'",
          body: "Сталкиваясь со сложными типами в Next.js или ORM, ИИ просто оборачивает данные в (data as any). Код собирается без предупреждений, но у реального пользователя падает с ошибкой Cannot read properties of undefined.",
          symptom: "0 ошибок сборки — 50 падений в рантайме",
        },
        {
          n: "03",
          title: "Циклические зависимости в useEffect",
          body: "ИИ часто путается в ссылочной целостности объектов JavaScript, передавая нестабильные ссылки в массив зависимостей. Это вызывает сотни повторных запросов в секунду и исчерпание лимитов базы данных.",
          symptom: "Вентиляторы ноют, а квота Supabase сгорела за час",
        },
        {
          n: "04",
          title: "Утечки секретов в клиентском бандле",
          body: "Чтобы быстрее «заставить работать» функционал, нейросеть прописывает сервисные ключи в клиентских компонентах (NEXT_PUBLIC_SERVICE_KEY). Любой посетитель сайта может скопировать ключ через DevTools.",
          symptom: "Мастер-ключ к БД виден в исходниках страницы",
        },
      ],
    },
    waitlist: {
      eyebrow: "Ранний доступ",
      title: "GitHub PR Guard Bot",
      sub: "Бот проверяет pull request'ы от Cursor и Copilot и блокирует merge, если файл превысил 400 строк, появился новый `as any` или в диффе засветился секрет.",
      placeholder: "founder@startup.com",
      cta: "Получить доступ",
      success: "Вы в раннем списке. Приглашение придёт на почту первым — бот пока в закрытой бетe.",
      note: "Пишем только по делу: релизы бота и разборы чужих аварий. Отписка в один клик.",
    },
    pricing: {
      eyebrow: "Тарифы",
      title: "Прозрачные цены без подписки-ловушки",
      sub: "Окупается при первом же предотвращённом сбое на проде. Первый аудит — бесплатно и без карты.",
      tiers: [
        {
          name: "Free audit",
          price: "0 ₽",
          unit: "навсегда",
          desc: "Быстрая оценка риска публичного репозитория.",
          features: ["Аудит 1 репозитория", "Счётчик Судного Дня и TTD", "Список найденных уязвимостей", "Экспорт отчёта в Markdown"],
          cta: "Запустить бесплатно",
        },
        {
          name: "Pro",
          badge: "Выбор фаундеров",
          price: "1 490 ₽",
          unit: "в месяц",
          desc: "Полный инструментарий рефакторинга и защиты от поломок.",
          features: [
            "Безлимитный аудит проектов",
            "Генератор хирургических промптов",
            "Мониторинг утечек API-ключей",
            "GitHub Action для проверки PR",
            "История Doomsday Score по коммитам",
          ],
          cta: "Подключить Pro",
          featured: true,
        },
        {
          name: "Lifetime",
          price: "4 900 ₽",
          unit: "разово",
          desc: "Для серийных инди-хакеров, которые запускают проекты один за другим.",
          features: ["Все функции Pro навсегда", "До 10 активных репозиториев", "Приоритетный разбор кода ИИ-ассистентом", "Личный разбор архитектуры раз в квартал"],
          cta: "Забрать Lifetime",
        },
      ],
      note: "Оплата в рублях · отмена в один клик · данные репозиториев не передаются третьим лицам",
    },
    faq: {
      eyebrow: "Частые вопросы",
      title: "Что обычно спрашивают",
      sub: "Коротко про доступы, приватность и то, насколько это вообще работает.",
      items: [
        {
          q: "Нужно ли давать доступ к приватному репозиторию?",
          a: "Нет. Публичные репозитории читаются через GitHub REST API без токена. Для приватных кода — локальный CLI: движок работает на вашей машине, наружу уходит только агрегированный отчёт без исходников.",
        },
        {
          q: "Насколько точен Счетчик Судного Дня?",
          a: "Это эвристическая модель, а не приговор: она взвешивает объём файлов, долю подавленных типов, наличие тестов и утечек. Практический смысл — сравнить проект с самим собой через неделю и увидеть, растёт долг или падает.",
        },
        {
          q: "Работает ли это с Vue, Svelte или чистым JS?",
          a: "Да, базовые эвристики (размер файлов, секреты, тесты, каскады `as any` в TS) не зависят от фреймворка. Промпты при этом генерируются с поправкой на стек, который нашёлся в проекте.",
        },
        {
          q: "Что делать после аудита в первую очередь?",
          a: "Сначала закройте утечки секретов — это единственная категория, где промедление стоит денег. Дальше по одному шагу из плана спасения: один промпт, один коммит, один ревью.",
        },
        {
          q: "Мои промпты и код попадут в датасет?",
          a: "Нет. Сканирование репозитория не сохраняет исходный код, а отчёты живут в рамках сессии браузера, пока вы сами не поделитесь ссылкой.",
        },
        {
          q: "Можно ли встроить проверку в CI на GitHub Actions?",
          a: "Да, на тарифах Pro и Lifetime: экшен запускает `npx vibedebt audit ./src --ci` и валит билд, если новый файл превысил лимит строк или добавил критичную находку.",
        },
      ],
      aside: {
        title: "Остался вопрос про ваш стек?",
        sub: "Напишите — разберём проект вручную и пришлём отчёт с планом спасения в течение дня.",
        cta: "Написать команде",
        note: "Отвечаем по будням, обычно в течение 3 часов",
      },
    },
    finalCta: {
      eyebrow: "Следующий шаг",
      title: "Узнайте свой Doomsday Score за 12 минут",
      sub: "Бесплатный аудит покажет, где именно сломается проект, и отдаст готовые промпты для починки — без найма и без переписывания с нуля.",
      primary: "Запустить аудит",
      secondary: "Подключить PR-бота",
      bullets: ["Без карты и регистрации", "Публичный GitHub или файл", "План рефакторинга в Markdown"],
    },
    footer: {
      tagline: "Счётчик Судного Дня и аудитор архитектуры для тех, кто собирает продукты вместе с ИИ.",
      product: "Продукт",
      resources: "Ресурсы",
      company: "Компания",
      links: [
        { label: "Аудитор", href: "#audit-tool" },
        { label: "Калькулятор долга", href: "#calculator" },
        { label: "CLI", href: "#cli-section" },
        { label: "Анатомия ошибок", href: "#antipatterns" },
        { label: "Тарифы", href: "#pricing" },
      ],
      status: "Все системы работают",
      rights: "VibeDebt · 2026 · Built for indie hackers",
      builtFor: "Сделано для соло-фаундеров и инди-хакеров",
      backToTop: "Наверх",
    },
  },

  /* ============================ EN ============================ */
  en: {
    langName: "English",
    nav: {
      auditor: "Auditor",
      calculator: "Calculator",
      cli: "CLI",
      smells: "AI Smells",
      pricing: "Pricing",
      faq: "FAQ",
      cta: "Audit my repo",
      tagline: "Technical debt auditor for solo AI founders",
    },
    hero: {
      badge: "Doomsday Clock · Cursor · Bolt.new · Lovable",
      h1a: "How many commits until your AI-built startup",
      h1accent: "breaks",
      h1b: "for good?",
      sub: "AI ships code at the speed of a ten-person team — and hides landmines just as fast: 2,400-line files, cascading `as any`, infinite useEffect loops and Supabase keys sitting in the browser. VibeDebt scans the repo, projects your time-to-collapse and hands you surgical prompts that pull the project back safely.",
      ctaPrimary: "Run a free audit",
      ctaSecondary: "See how it works",
      note: "No signup · GitHub API, file upload or paste",
      steps: [
        { n: "01", title: "Bring the code", desc: "A GitHub link, a file or a snippet — three ways, one click." },
        { n: "02", title: "The AST scanner runs", desc: "File bloat, types, tests, secrets and dependency loops." },
        { n: "03", title: "Take the plan", desc: "Verdict, TTD and prompts for Cursor Composer or Claude." },
      ],
      stats: [
        { value: 12480, suffix: "+", label: "Repositories scanned" },
        { value: 87, suffix: "%", label: "Vibe-coded repos in the red zone" },
        { value: 4800, prefix: "$", label: "Average emergency contractor bill" },
        { value: 12, suffix: " min", label: "To a ready refactor plan" },
      ],
      console: {
        window: "vibedebt — scan ./src",
        status: "AST engine online",
        lines: [
          "$ npx vibedebt audit ./src",
          "→ file tree: 38 nodes, 214 KB",
          "→ package.json: no test runner found ✗",
          "⚠ app/page.tsx — 2,420 lines, 8 modals, 14 useState",
          "⚠ SUPABASE_SERVICE_ROLE_KEY inside 'use client' ✗",
          "⚠ useEffect: unstable `filters` ref × 20 req/s",
          "✓ 3 surgical prompts generated",
        ],
        score: "Doomsday Score",
        verdict: "Critical risk level",
        chips: ["Secrets in bundle", "God component", "Zero tests"],
        files: "Files scanned",
        scan: "Scanning",
      },
    },
    marquee: "The tools whose code we read best",
    workbench: {
      eyebrow: "Audit workbench",
      title: "Run your project through the scanner",
      sub: "A real REST scan of any public repository via the GitHub API, an instant parse of a pasted file, or a demo case if you just want to see the report.",
      engine: "REST AST Static Analysis Engine",
      tabGithub: "GitHub repository",
      tabSnippet: "Code / file",
      tabPreset: "Demo cases",
      githubLabel: "Public GitHub repository URL",
      githubPlaceholder: "https://github.com/owner/repository",
      run: "Run audit",
      quickExample: "Try a live example:",
      liveExample: "shadcn-ui/ui (real repository)",
      presetLabel: "Simulated startup archetypes",
      snippetLabel: "Paste code or drop a file — tsx, ts, js, json",
      snippetPlaceholder: "Paste a React / Next.js component or your package.json…",
      uploadFile: "Upload file",
      dropActive: "Drop the file — auditing now",
      sampleCode: "Sample AI code",
      auditSnippet: "Audit snippet",
      loading: "Analyzing…",
      loadingStages: [
        "Connecting to the source…",
        "Reading the file tree…",
        "Running type, secret and test heuristics…",
        "Assembling the report and prompts…",
      ],
      errorPrefix: "Audit error:",
      presetNotes: {
        "cursor-saas": "2,400-line file + leaked service key",
        "bolt-landing": "Client-side pricing, no backend guard",
        "crypto-bot": "Private keys in logs, no idempotency",
      },
      report: {
        for: "Report for",
        live: "Live GitHub API",
        demo: "Demo report",
        shareX: "Post on X",
        copyPost: "Copy post",
        badge: "README badge",
        copied: "Copied",
        score: "Doomsday Score",
        scoreCritical: "Critical risk level",
        scoreElevated: "Elevated tech debt",
        scoreHealthy: "Healthy architecture",
        scoreHint: "Probability of failure on the next feature",
        ttd: "Time to collapse",
        ttdHint: "Estimated runway before a critical bug",
        cost: "Contractor fix cost",
        costFree: "or $0 with our surgical prompts",
        costSaved: "Budget saved ≈ 92%",
        metrics: "Code metrics",
        spaghetti: "Spaghetti index",
        filesScanned: "Files scanned",
        tests: "Automated tests",
        found: "Found",
        none: "None",
        tabSmells: "Detected smells",
        tabGod: "God files",
        tabPrompts: "Rescue plan",
        tabXray: "Health X-Ray",
        badCode: "What the AI generated",
        goodCode: "How it should look",
        recommendation: "Recommendation",
        decompose: "Decompose into 2+ modules",
        riskCritical: "Critical",
        riskHigh: "High risk",
        riskMedium: "Medium risk",
        rescueBadge: "Core rescue tool",
        rescueTitle: "Surgical refactoring prompts",
        rescueSub: "Prompts that decompose the code into isolated files without breaking business logic or UI. One step — one commit — one review.",
        targetCursor: "Cursor",
        targetClaude: "Claude",
        copyAll: "Copy full plan",
        allCopied: "Full plan copied",
        copyFor: "Copy prompt",
        copy: "Copy",
        howToApply: "How to use: open Cursor → Cmd+I (Composer) → paste the prompt → Enter.",
        toolCursor: "Cursor Composer",
        toolClaude: "Claude Thinking",
        xrayTitle: "Codebase health matrix",
        xraySub: "Four pillars that decide whether the project survives the next sprint.",
        pillars: [
          {
            title: "Credential security",
            hint: "Scanning client files for exposed API tokens",
            metric: (score) => ({
              value: score > 75 ? 14 : 85,
              label: score > 75 ? "Critical" : "OK",
              tone: score > 75 ? "critical" : "healthy",
            }),
          },
          {
            title: "Modularity & context",
            hint: "Evaluation of God-objects and single-file bloat",
            metric: (_s, spaghetti) => {
              const v = Math.round(Math.max(15, 100 - spaghetti * 9));
              return { value: v, label: `${v}%`, tone: v < 40 ? "critical" : v < 70 ? "elevated" : "healthy" };
            },
          },
          {
            title: "Type safety strictness",
            hint: "Detection of suppressed compiler errors via 'any'",
            metric: (_s, _sp, ghosts) => {
              const v = Math.round(Math.max(20, 100 - ghosts * 1.5));
              return { value: v, label: `${v}%`, tone: v < 40 ? "critical" : v < 70 ? "elevated" : "healthy" };
            },
          },
          {
            title: "Regression test shield",
            hint: "Presence of Vitest / Jest / Playwright coverage",
            metric: (_s, _sp, _g, tests) => ({
              value: tests ? 100 : 4,
              label: tests ? "100%" : "Threat",
              tone: tests ? "healthy" : "critical",
            }),
          },
        ],
        risk: "Risk",
        safe: "OK",
      },
    },
    cli: {
      eyebrow: "Local audit",
      title: "One command and the debt is on screen",
      sub: "For private repositories and enterprise codebases. Nothing leaves your machine: the engine runs locally and returns a CI-friendly exit code.",
      copy: "Copy",
      copied: "Copied",
      features: [
        { n: "01", title: "Nothing leaks", desc: "Analysis runs on your machine; only an aggregated report ever leaves it." },
        { n: "02", title: "CI-ready", desc: "A non-zero exit code stops the merge when a file crosses 400 lines." },
        { n: "03", title: "Zero setup", desc: "npx with no dependencies, no config files — eslint, but for debt." },
      ],
    },
    pipeline: {
      eyebrow: "How it works",
      title: "Is there an AI under the hood?",
      sub: "A hybrid architecture: deterministic static analysis first, contextual prompt generation second. No hallucinations in the numbers.",
      flow: [
        { tag: "01", title: "Collect", desc: "GitHub REST API or a local file: tree, sizes, package.json." },
        { tag: "02", title: "Heuristics", desc: "Rules and AST checks hunt secrets, `as any`, loops and monoliths." },
        { tag: "03", title: "Score", desc: "A weighted model computes Doomsday Score and TTD in commits." },
        { tag: "04", title: "Plan", desc: "A templating engine writes prompts for your exact files and tool." },
      ],
      cards: [
        {
          tag: "Level 1 · instant",
          title: "Static AST scanner",
          body: "Fetches the repository tree via GitHub REST API with no LLM in the loop. Inspects package.json for test runners, measures file bloat and detects 'as any' cascades, exposed secrets and useEffect loops. Sub-second, deterministic, zero hallucination risk.",
          footer: "Pure maths and code facts",
        },
        {
          tag: "Level 2 · AI refactor",
          title: "Context-aware meta-prompter",
          body: "Takes detected anomalies — say, a 2,420-line app/page.tsx — and builds constrained surgical instructions for Claude or Cursor. The prompt forbids the model from touching working UI while it splits the logic out.",
          footer: "Safe iterative refactoring",
        },
      ],
    },
    calc: {
      eyebrow: "Debt simulator",
      title: "Interactive tech debt calculator",
      sub: "Tune the parameters to match your project and see how many days you have left before critical failure — long before your Product Hunt launch.",
      sliders: {
        lines: "1. AI-generated lines of code",
        linesUnit: "LOC",
        linesRange: ["500 · MVP", "10,000 · SaaS", "20,000+ · spaghetti"],
        godFiles: "2. Files longer than 500 lines",
        godFilesUnit: "files",
        godFilesRange: ["0 · modular", "3–5 · risky", "10 · monolith"],
        prompts: "3. “Just fix it, don't change anything else” prompts",
        promptsUnit: "times",
        promptsHint: "Every one of these pushes the model to wrap an old hack in a brand-new hack.",
        tests: "4. Automated tests & CI",
        testsYes: "Tests active",
        testsNo: "Living dangerously",
        db: "5. Database & state architecture",
        dbClean: "Migrations",
        dbMedium: "JSON blobs",
        dbMess: "LocalStorage",
      },
      result: {
        header: "Failure projection // TTD",
        live: "live",
        until: "Until critical production failure",
        day: "day",
        daysFew: "days",
        daysMany: "days",
        verdictCritical: "Critical fragility. The next change in billing or auth is a cascading outage waiting to happen.",
        verdictOk: "You still have baseline endurance, but compounding debt is already cutting your release velocity.",
        contractor: "Emergency contractor rate",
        fragility: "Fragility index",
        hours: "Repair hours",
        tipLabel: "Tip",
        tip: "Instead of hiring a $150/hr senior developer, execute the generated rescue plan in the auditor above — same scope of work, done with your own hands and prompts.",
        gaugeCritical: "Red zone",
        gaugeElevated: "Amber zone",
        gaugeHealthy: "Stable",
        reset: "Reset",
      },
    },
    anatomy: {
      eyebrow: "The anatomy of the problem",
      title: "The four horsemen of AI code rot",
      sub: "Why vibe-coding feels like magic in week one and turns into an unmaintainable knot by week four.",
      items: [
        {
          n: "01",
          title: "The 2,400-line God component",
          body: "When you ask Cursor for a modal or a checkout flow, dumping 150 more lines into page.tsx is easier than creating clean modules. Soon the file exceeds the context window and the model starts truncating older logic.",
          symptom: "Changed the button colour — checkout stopped working",
        },
        {
          n: "02",
          title: "Silencing TypeScript with 'as any'",
          body: "Facing complex Next.js or ORM types, the AI wraps data in (data as any). It compiles with zero warnings and blows up in production with `Cannot read properties of undefined`.",
          symptom: "0 build errors — 50 runtime crashes",
        },
        {
          n: "03",
          title: "Infinite useEffect loops",
          body: "LLMs routinely misjudge referential equality in JavaScript, passing unstable object references into dependency arrays. The result is hundreds of queries per second and a burnt database quota.",
          symptom: "Laptop fans screaming, Supabase quota gone in an hour",
        },
        {
          n: "04",
          title: "Secrets leaked in 'use client'",
          body: "To make auth work fast, the model plants service-role keys inside client components (NEXT_PUBLIC_SERVICE_KEY). Any visitor can lift your master database key straight out of DevTools.",
          symptom: "Master database key visible in page sources",
        },
      ],
    },
    waitlist: {
      eyebrow: "Early access",
      title: "GitHub PR Guard Bot",
      sub: "The bot reviews every Cursor or Copilot pull request and blocks the merge when a file crosses 400 lines, a new `as any` appears, or a secret shows up in the diff.",
      placeholder: "founder@startup.com",
      cta: "Request access",
      success: "You're on the early list. Invitations go out to the waitlist first — the bot is still in closed beta.",
      note: "We only write about real things: releases and teardown analyses. One-click unsubscribe.",
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Transparent pricing, no subscription traps",
      sub: "It pays for itself the first time production doesn't break. The first audit is free and needs no card.",
      tiers: [
        {
          name: "Free audit",
          price: "$0",
          unit: "forever",
          desc: "A quick risk read on a public repository.",
          features: ["1 repository audit", "Doomsday Score & TTD", "Detected smells list", "Markdown report export"],
          cta: "Start free audit",
        },
        {
          name: "Pro",
          badge: "Founder choice",
          price: "$19",
          unit: "per month",
          desc: "The full refactoring and protection toolkit.",
          features: [
            "Unlimited project audits",
            "Surgical prompt generator",
            "Secret leak monitoring",
            "GitHub Action PR guard",
            "Doomsday Score history per commit",
          ],
          cta: "Upgrade to Pro",
          featured: true,
        },
        {
          name: "Lifetime",
          price: "$59",
          unit: "one-time",
          desc: "For serial indie builders shipping one project after another.",
          features: ["All Pro features forever", "Up to 10 active repositories", "Priority AI code review", "Quarterly architecture review"],
          cta: "Get Lifetime",
        },
      ],
      note: "Cancel in one click · repository data is never shared with third parties",
    },
    faq: {
      eyebrow: "FAQ",
      title: "What people usually ask",
      sub: "Short answers on access, privacy and whether any of this actually works.",
      items: [
        {
          q: "Do I have to grant access to a private repository?",
          a: "No. Public repositories are read through the GitHub REST API without a token. For private code, use the local CLI: the engine runs on your machine and only an aggregated report ever leaves it.",
        },
        {
          q: "How accurate is the Doomsday Score?",
          a: "It is a heuristic model, not a verdict: it weighs file bloat, suppressed types, test coverage and leaked secrets. Its real value is comparing the project against itself a week later to see whether debt is growing or shrinking.",
        },
        {
          q: "Does it work with Vue, Svelte or plain JS?",
          a: "Yes. The core heuristics — file size, secrets, tests, `as any` cascades — are framework agnostic. Prompts are generated with an adjustment for the stack detected in the project.",
        },
        {
          q: "What should I fix first after an audit?",
          a: "Close the secret leaks. That's the only category where delay costs money immediately. Then work the rescue plan one step at a time: one prompt, one commit, one review.",
        },
        {
          q: "Do my prompts and code end up in a dataset?",
          a: "No. Repository scanning does not store source code, and reports live inside your browser session unless you deliberately share a link.",
        },
        {
          q: "Can I wire the check into GitHub Actions?",
          a: "Yes, on Pro and Lifetime: the action runs `npx vibedebt audit ./src --ci` and fails the build when a new file crosses the line limit or adds a critical finding.",
        },
      ],
      aside: {
        title: "Still unsure about your stack?",
        sub: "Write to us — we'll review the project by hand and send back a report with a rescue plan within a day.",
        cta: "Talk to the team",
        note: "We answer on weekdays, usually within 3 hours",
      },
    },
    finalCta: {
      eyebrow: "Next step",
      title: "Find out your Doomsday Score in 12 minutes",
      sub: "The free audit shows exactly where the project will break and hands you the prompts to fix it — no hiring, no rewrite from scratch.",
      primary: "Run an audit",
      secondary: "Get the PR bot",
      bullets: ["No card, no signup", "Public GitHub or a file", "Refactor plan in Markdown"],
    },
    footer: {
      tagline: "A Doomsday Clock and architecture auditor for people who build products together with AI.",
      product: "Product",
      resources: "Resources",
      company: "Company",
      links: [
        { label: "Auditor", href: "#audit-tool" },
        { label: "Debt calculator", href: "#calculator" },
        { label: "CLI", href: "#cli-section" },
        { label: "Anatomy of AI slop", href: "#antipatterns" },
        { label: "Pricing", href: "#pricing" },
      ],
      status: "All systems operational",
      rights: "VibeDebt · 2026 · Built for indie hackers",
      builtFor: "Made for solo founders and indie hackers",
      backToTop: "Back to top",
    },
  },
};
