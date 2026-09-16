"use client";

import React, { useState, useRef } from "react";
import {
  TerminalIcon as Terminal,
  ShieldAlertIcon as ShieldAlert,
  AlertTriangleIcon as AlertTriangle,
  ZapIcon as Zap,
  FileCodeIcon as FileCode,
  ClockIcon as Clock,
  CheckIcon as Check,
  CheckCircleIcon as CheckCircle,
  CopyIcon as Copy,
  SparklesIcon as Sparkles,
  BugIcon as Bug,
  RefreshCwIcon as RefreshCw,
  RotateCcwIcon as RotateCcw,
  XCircleIcon as XCircle,
  ArrowRightIcon as ArrowRight,
  Share2Icon,
  UploadCloudIcon,
  TwitterIcon,
  GithubIcon,
} from "@/components/icons";

interface GodComponent {
  name: string;
  lines: number;
  sizeBytes?: number;
  issues: string[];
  risk: "critical" | "high" | "medium";
}

interface Antipattern {
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "WARNING";
  detectedIn: string;
  sampleBadCode: string;
  sampleFix: string;
  cwe?: string;
}

interface RefactorStep {
  step: number;
  title: string;
  prompt: string;
  estimatedTime: string;
  targetTool?: string;
}

interface AuditReport {
  title: string;
  repoName: string;
  isRealRepo: boolean;
  doomsdayScore: number;
  timeToCollapse: string;
  estimatedFixCost: number;
  criticalBugsCount: number;
  spaghettiIndex: number;
  ghostTypesCount: number;
  filesScanned: number;
  hasTests: boolean;
  starsCount?: number;
  primaryLanguage?: string;
  godComponents: GodComponent[];
  antipatterns: Antipattern[];
  refactorSteps: RefactorStep[];
  diagnosticsSummary: string;
}

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const DEFAULT_REPORT: AuditReport = {
  title: "AI Micro-SaaS (Cursor + Claude 3.7)",
  repoName: "founder/instant-ai-landing-builder",
  isRealRepo: false,
  doomsdayScore: 89,
  timeToCollapse: "11 коммитов или 2 одновременных Stripe вебхука",
  estimatedFixCost: 4800,
  criticalBugsCount: 4,
  spaghettiIndex: 9.3,
  ghostTypesCount: 54,
  filesScanned: 38,
  hasTests: false,
  primaryLanguage: "TypeScript",
  godComponents: [
    {
      name: "app/page.tsx",
      lines: 2420,
      issues: [
        "Монолитный файл: содержит UI, запросы к Supabase, Stripe Checkout и 8 модалок",
        "14 вызовов useState на верхнем уровне без мемоизации",
        "Каскадный ререндер страницы при любом вводе текста",
      ],
      risk: "critical",
    },
    {
      name: "lib/ai-handler.ts",
      lines: 840,
      issues: [
        "Хаотичный парсинг JSON ответа LLM без схемы валидации",
        "28 приведений типа `(res as any)` для заглушения TypeScript",
      ],
      risk: "high",
    },
  ],
  antipatterns: [
    {
      title: "Секретный Service Key в клиентском коде ('use client')",
      cwe: "CWE-798",
      description:
        "ИИ пытался обойти ошибку Row Level Security и импортировал SUPABASE_SERVICE_ROLE_KEY прямо в клиентский компонент. Любой пользователь видит мастер-ключ в браузере.",
      severity: "CRITICAL",
      detectedIn: "app/dashboard/settings/page.tsx:14",
      sampleBadCode: `"use client";
import { createClient } from "@supabase/supabase-js";

// ❌ Мастер-ключ попадает в открытый JS-бандл браузера!
const supabase = createClient(
  process.env.NEXT_PUBLIC_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);`,
      sampleFix: `// ✅ Безопасный серверный экшен:
"use server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateUserRole(userId: string, role: string) {
  const admin = createAdminClient();
  return await admin.from("users").update({ role }).eq("id", userId);
}`,
    },
    {
      title: "Бесконечная петля ререндеров в useEffect",
      cwe: "CWE-400",
      description:
        "Курсор поместил новый объект filters в зависимости хука без useCallback/useMemo. При каждом рендере ссылка обновляется, порождая 20+ запросов к БД в секунду.",
      severity: "CRITICAL",
      detectedIn: "components/PricingCalculator.tsx:89",
      sampleBadCode: `useEffect(() => {
  // ❌ 'filters' пересоздается при каждом рендере -> бесконечный цикл
  fetchUserData(filters);
  setRecalculating(true);
}, [filters]);`,
      sampleFix: `// ✅ Стабилизируем ключ зависимости:
const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

useEffect(() => {
  fetchUserData(JSON.parse(filterKey));
}, [filterKey]);`,
    },
    {
      title: "Подавление типов через каскад 'as any'",
      cwe: "CWE-704",
      description:
        "Когда линтер ругался на несовпадение схемы, нейросеть заглушила типы 28 раз. Компилятор молчит, но код падает у реальных пользователей.",
      severity: "HIGH",
      detectedIn: "lib/ai-handler.ts:52",
      sampleBadCode: `const rawData = await response.json();
// ❌ Обход проверки типов:
const payload = (rawData as any).choices[0].message.content as any;`,
      sampleFix: `// ✅ Строгая валидация Zod:
import { z } from "zod";
const AIResponseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string() }) }))
});
const payload = AIResponseSchema.parse(await response.json());`,
    },
    {
      title: "Happy Path Blindspot: Пустые catch и отсутствие таймаутов",
      cwe: "CWE-390",
      description:
        "ИИ сгенерировал код под идеальный сценарий без обработки сбоев: сетевые запросы лишены таймаутов (5 сек), а блок catch молча проглатывает ошибки. При задержке сети интерфейс зависает намертво.",
      severity: "HIGH",
      detectedIn: "lib/ai-handler.ts:114",
      sampleBadCode: `try {
  const res = await fetch("/api/generate");
} catch (e) {
  // ❌ ИИ проглотил исключение, пользователь видит вечный спиннер
}`,
      sampleFix: `// ✅ Result<T, E> паттерн и AbortController:
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 5000);
try {
  const res = await fetch("/api/generate", { signal: controller.signal });
  return { ok: true, data: await res.json() };
} catch (err) {
  return { ok: false, error: "Network timeout or connection refused" };
} finally {
  clearTimeout(timer);
}`,
    },
  ],
  refactorSteps: [
    {
      step: 1,
      title: "Хирургический распил God-компонента app/page.tsx (2420 строк)",
      estimatedTime: "20 минут",
      targetTool: "Cursor Composer / Claude 3.7",
      prompt: `Ты — Senior Refactoring Agent в Cursor / Claude 3.7.
Твоя цель: безопасно разбить God-компонент 'app/page.tsx' (~2420 строк) на модульные подкомпоненты внутри папки '/components/landing', сохранив все стейты, хуки, пропсы и анимации без малейших визуальных или логических изменений.

Строгие правила безопасного рефакторинга:
1. НЕ сокращай код через комментарии вроде '// rest of code stays here'. Выведи полный, готовый к запуску код.
2. Сохрани 'app/page.tsx' как чистый оркестратор не длиннее 120 строк.
3. Разнеси субкомпоненты по файлам:
   - '/components/landing/Header.tsx'
   - '/components/landing/HeroSection.tsx'
   - '/components/landing/AuditWorkbench.tsx'
   - '/components/landing/PricingTable.tsx'
4. Общий стейт вынеси в кастомный хук '/components/landing/useAuditState.ts'.
5. Напиши строгие TypeScript interfaces без единого 'any'.`,
    },
    {
      step: 2,
      title: "Изоляция SUPABASE_SERVICE_ROLE_KEY в Server Actions",
      estimatedTime: "10 минут",
      targetTool: "Cursor Cmd+K",
      prompt: `Ты — Senior Security Engineer в Cursor.
В файле 'app/dashboard/settings/page.tsx' обнаружен клиентский импорт SUPABASE_SERVICE_ROLE_KEY.
Задача: вынеси все небезопасные запросы в отдельный Server Action в 'app/actions/billing.ts'.
Требование: пометь файл директивой 'use server', вызови Server Action из формы асинхронно без раскрытия мастер-ключа в JS-бандле. Верни готовый код.`,
    },
    {
      step: 3,
      title: "Замена 'any' на строгие схемы Zod",
      estimatedTime: "15 минут",
      targetTool: "Claude 3.7 Thinking",
      prompt: `В файле lib/ai-handler.ts используется 28 приведений типов 'as any'.
Напиши Zod-схему для ответа LLM и валидируй данные через schema.safeParse(). Добавь graceful fallback на случай, если нейросеть вернет сломанный JSON.`,
    },
  ],
  diagnosticsSummary:
    "Обнаружен критический файл на 2420 строк, утечка секретных переменных в клиентский бандл и 0 автотестов.",
};

const SAMPLE_BAD_SNIPPET = `"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Типичный файл, сгенерированный Cursor за 5 дней
export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ page: 1, search: "" });

  // ⚠️ Утечка секретного ключа в клиентском бандле:
  const supabase = createClient(
    process.env.NEXT_PUBLIC_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ⚠️ Бесконечный ререндер (объект filters обновляется):
  useEffect(() => {
    supabase.from("orders").select("*").then((res: any) => {
      setData(res.data);
    });
  }, [filters]);

  return (
    <div>
      <h1>Панель управления ({data?.length || 0})</h1>
      {/* Еще 850 строк UI, модалок и форм прямо в одном компоненте */}
    </div>
  );
}`;

export default function Home() {
  // Language toggle
  const [lang, setLang] = useState<"ru" | "en">("ru");

  // Input State
  const [inputMode, setInputMode] = useState<"github" | "snippet" | "preset">("github");
  const [githubUrl, setGithubUrl] = useState<string>("https://github.com/shadcn-ui/ui");
  const [snippetCode, setSnippetCode] = useState<string>("");
  const [activePreset, setActivePreset] = useState<string>("cursor-saas");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audit state
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditProgress, setAuditProgress] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<"antipatterns" | "god-files" | "prompts" | "radar">("antipatterns");

  // Interactive feedback
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);
  const [copiedBadge, setCopiedBadge] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [copiedAllPrompts, setCopiedAllPrompts] = useState<boolean>(false);
  const [targetAiTool, setTargetAiTool] = useState<"cursor" | "claude">("cursor");

  // Lead Magnet / PR Bot Waitlist
  const [botEmail, setBotEmail] = useState<string>("");
  const [botSubscribed, setBotSubscribed] = useState<boolean>(false);

  // Calculator State
  const [calcAiLines, setCalcAiLines] = useState<number>(5500);
  const [calcGodFiles, setCalcGodFiles] = useState<number>(3);
  const [calcJustWorkCount, setCalcJustWorkCount] = useState<number>(14);
  const [calcHasTests, setCalcHasTests] = useState<boolean>(false);
  const [calcDbState, setCalcDbState] = useState<"clean" | "medium" | "mess">("medium");

  const runAudit = async (customPayload?: any) => {
    setIsAuditing(true);
    setErrorMessage(null);
    setAuditProgress(
      lang === "ru"
        ? "Подключение к репозиторию и анализ AST дерева..."
        : "Connecting to repository & analyzing AST tree..."
    );

    try {
      const payload =
        customPayload ||
        (inputMode === "github"
          ? { url: githubUrl }
          : inputMode === "snippet"
          ? { snippet: snippetCode }
          : { archetype: activePreset });

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || (lang === "ru" ? "Не удалось завершить аудит." : "Audit failed."));
      } else if (data.data) {
        setAuditReport(data.data);
      }
    } catch {
      setErrorMessage(
        lang === "ru"
          ? "Ошибка сети при обращении к серверу аудита."
          : "Network error reaching audit engine."
      );
    } finally {
      setIsAuditing(false);
      setAuditProgress("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || "");
      setSnippetCode(content);
      setInputMode("snippet");
      runAudit({ snippet: content });
    };
    reader.readAsText(file);
  };

  const copyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIdx(idx);
    setTimeout(() => setCopiedPromptIdx(null), 2000);
  };

  const copyBadgeMarkdown = () => {
    if (!auditReport) return;
    const badge = `[![VibeDebt Doomsday](https://img.shields.io/badge/VibeDebt_Doomsday-${auditReport.doomsdayScore}%25_${
      auditReport.doomsdayScore > 75 ? "CRITICAL" : "ELEVATED"
    }-f43f5e?style=flat-square&logo=github)](https://vibedebt.dev)`;
    navigator.clipboard.writeText(badge);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  const handleShareToTwitter = () => {
    if (!auditReport) return;
    const text =
      lang === "ru"
        ? `Мой вайбкод-проект на Cursor имеет ${auditReport.doomsdayScore}% по Счетчику Судного Дня (крах через ${auditReport.timeToCollapse}). Проверь свой техдолг на @VibeDebt:`
        : `My AI-built SaaS has an ${auditReport.doomsdayScore}% Doomsday Score (collapse in ${auditReport.timeToCollapse}). Check your tech debt with @VibeDebt:`;
    const url = "https://vibedebt.dev";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const handleCopyShareLink = () => {
    if (!auditReport) return;
    const text =
      lang === "ru"
        ? `🔥 Аудит VibeDebt для ${auditReport.repoName}: Doomsday Score ${auditReport.doomsdayScore}% | Запас прочности: ${auditReport.timeToCollapse}. Проверь свой проект: https://vibedebt.dev`
        : `🔥 VibeDebt Audit for ${auditReport.repoName}: Doomsday Score ${auditReport.doomsdayScore}% | Time to Collapse: ${auditReport.timeToCollapse}. Check yours: https://vibedebt.dev`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText("npx vibedebt audit ./src");
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleCopyAllPrompts = () => {
    if (!auditReport) return;
    const fullPlan = auditReport.refactorSteps
      .map(
        (s) =>
          `### ШАГ ${s.step}: ${s.title} (${s.estimatedTime})\nИнструмент: ${
            targetAiTool === "cursor" ? "Cursor Composer (Cmd+I)" : "Claude 3.7 Thinking"
          }\n\n${s.prompt}\n`
      )
      .join("\n---\n\n");
    navigator.clipboard.writeText(fullPlan);
    setCopiedAllPrompts(true);
    setTimeout(() => setCopiedAllPrompts(false), 2000);
  };

  const handleBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botEmail.trim()) return;
    setBotSubscribed(true);
  };

  // Calculator computations
  const computeCalculator = () => {
    const baseLife = 90;
    const aiPenalty = (calcAiLines / 1000) * 3.5;
    const godPenalty = calcGodFiles * 6;
    const promptPenalty = calcJustWorkCount * 1.6;
    const testBonus = calcHasTests ? 30 : -14;
    const dbPenalty = calcDbState === "clean" ? 0 : calcDbState === "medium" ? 12 : 24;

    const days = Math.max(2, Math.round(baseLife - (aiPenalty + godPenalty + promptPenalty + dbPenalty) + testBonus));
    const hoursNeeded = Math.round(calcAiLines / 220 + calcGodFiles * 5 + calcJustWorkCount * 1.5 + (calcHasTests ? 0 : 16));
    const emergencyCost = hoursNeeded * 60;
    const fragilityPercent = Math.min(99, Math.max(12, Math.round(100 - days * 0.95)));

    return { days, emergencyCost, fragilityPercent };
  };

  const calcResult = computeCalculator();

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-zinc-800 selection:text-white relative">
      {/* Subtle Dot Grid Background */}
      <div className="fixed inset-0 dot-grid opacity-30 pointer-events-none z-0" />

      {/* NAVIGATION */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 font-mono font-bold text-sm">
              VD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white font-mono">VibeDebt</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                {lang === "ru"
                  ? "Аудитор технического долга для соло-фаундеров"
                  : "Technical debt auditor for solo AI founders"}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-mono">
            <a href="#audit-tool" className="hover:text-zinc-200 transition">
              {lang === "ru" ? "Аудитор" : "Auditor"}
            </a>
            <a href="#calculator" className="hover:text-zinc-200 transition">
              {lang === "ru" ? "Калькулятор" : "Calculator"}
            </a>
            <a href="#cli-section" className="hover:text-zinc-200 transition">
              CLI
            </a>
            <a href="#antipatterns" className="hover:text-zinc-200 transition">
              {lang === "ru" ? "ИИ-ошибки" : "AI Anti-Patterns"}
            </a>
            <a href="#pricing" className="hover:text-zinc-200 transition">
              {lang === "ru" ? "Тарифы" : "Pricing"}
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-950 p-0.5 text-xs font-mono">
              <button
                onClick={() => setLang("ru")}
                className={`px-2 py-1 rounded transition cursor-pointer ${
                  lang === "ru" ? "bg-zinc-800 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                RU
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-1 rounded transition cursor-pointer ${
                  lang === "en" ? "bg-zinc-800 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                EN
              </button>
            </div>

            <a
              href="#audit-tool"
              className="px-3.5 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Zap size={13} className="text-zinc-900" />
              <span>{lang === "ru" ? "Проверить" : "Audit"}</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 md:pt-24 pb-12 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs font-mono mb-6">
          <ShieldAlert size={13} />
          <span>
            {lang === "ru"
              ? "Счетчик Судного Дня для Cursor & Bolt проектов"
              : "Doomsday Clock for Cursor & Bolt.new Startups"}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight mb-5">
          {lang === "ru"
            ? "Узнай, когда твой вайбкод-стартап рухнет от очередного коммита"
            : "Know exactly when your AI-built startup will collapse under tech debt"}
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
          {lang === "ru"
            ? "ИИ пишет код быстро, но оставляет гору скрытого техдолга: 2000-строчные файлы, каскады `as any`, циклические хуки и утечки секретов. Аудитор вычисляет точный запас прочности кодовой базы и выдает готовые промпты для безопасного рефакторинга."
            : "AI writes code at lightspeed, but leaves a mountain of hidden debt: 2000-line monolithic files, cascading `as any`, infinite useEffect loops, and exposed keys. VibeDebt calculates your exact time-to-disaster and gives you surgical prompts to fix it."}
        </p>

        {/* 3-STEP HOW IT WORKS GUIDE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-8 text-xs font-mono text-zinc-400">
          <div className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/30 flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
              1
            </span>
            <span>{lang === "ru" ? "Вставь ссылку на GitHub или код" : "Paste GitHub URL or snippet"}</span>
          </div>
          <div className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/30 flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
              2
            </span>
            <span>{lang === "ru" ? "AST сканирует размеры, типы и тесты" : "AST parses files, types & tests"}</span>
          </div>
          <div className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/30 flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
              3
            </span>
            <span>{lang === "ru" ? "Получи вердикт и промпт для фикса" : "Get verdict & Cursor fix prompt"}</span>
          </div>
        </div>

        {/* AUDIT WORKBENCH */}
        <div
          id="audit-tool"
          className="text-left bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-xl relative backdrop-blur-sm"
        >
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3 mb-4">
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                onClick={() => setInputMode("github")}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  inputMode === "github"
                    ? "bg-zinc-800 text-white font-medium"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <GithubIcon size={14} />
                {lang === "ru" ? "GitHub репозиторий" : "GitHub Repository"}
              </button>
              <button
                onClick={() => setInputMode("snippet")}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  inputMode === "snippet"
                    ? "bg-zinc-800 text-white font-medium"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileCode size={14} />
                {lang === "ru" ? "Вставка кода / Файл" : "Code / File Upload"}
              </button>
              <button
                onClick={() => setInputMode("preset")}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  inputMode === "preset"
                    ? "bg-zinc-800 text-white font-medium"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sparkles size={14} />
                {lang === "ru" ? "Тестовые кейсы" : "Demo Cases"}
              </button>
            </div>

            <div className="text-[11px] font-mono text-zinc-500 hidden sm:block">
              REST AST Static Analysis Engine
            </div>
          </div>

          {/* TAB 1: GITHUB URL */}
          {inputMode === "github" && (
            <div className="space-y-3">
              <label className="block text-xs font-mono text-zinc-300">
                {lang === "ru"
                  ? "Публичный URL репозитория на GitHub:"
                  : "Public GitHub repository URL:"}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <GithubIcon size={15} className="absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
                <button
                  onClick={() => runAudit()}
                  disabled={isAuditing || !githubUrl.trim()}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {isAuditing ? <RefreshCw size={13} className="animate-spin" /> : <Terminal size={13} />}
                  <span>{lang === "ru" ? "Запустить аудит" : "Run Audit"}</span>
                </button>
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-zinc-400">
                <span>{lang === "ru" ? "Попробовать реальный пример:" : "Try a live example:"}</span>
                <button
                  onClick={() => {
                    setGithubUrl("https://github.com/shadcn-ui/ui");
                    runAudit({ url: "https://github.com/shadcn-ui/ui" });
                  }}
                  className="text-zinc-300 underline hover:text-white cursor-pointer"
                >
                  shadcn-ui/ui (Open Source)
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    setInputMode("preset");
                    setActivePreset("cursor-saas");
                    runAudit({ archetype: "cursor-saas" });
                  }}
                  className="text-rose-400 underline hover:text-rose-300 cursor-pointer"
                >
                  Cursor AI SaaS (89% {lang === "ru" ? "долга" : "risk"})
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SNIPPET & FILE DROP */}
          {inputMode === "snippet" && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".tsx,.ts,.js,.jsx,.json,.py"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex flex-wrap justify-between items-center text-xs font-mono text-zinc-300 gap-2">
                <span>
                  {lang === "ru"
                    ? "Вставьте код или перетащите файл (tsx, ts, js, json):"
                    : "Paste code or drop file (tsx, ts, js, json):"}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-zinc-300 hover:text-white flex items-center gap-1 text-[11px] underline cursor-pointer"
                  >
                    <UploadCloudIcon size={13} />
                    {lang === "ru" ? "Загрузить файл" : "Upload file"}
                  </button>
                  <button
                    onClick={() => setSnippetCode(SAMPLE_BAD_SNIPPET)}
                    className="text-zinc-400 hover:text-white text-[11px] underline cursor-pointer"
                  >
                    {lang === "ru" ? "Пример вайб-кода" : "Sample AI code"}
                  </button>
                </div>
              </div>
              <textarea
                rows={6}
                value={snippetCode}
                onChange={(e) => setSnippetCode(e.target.value)}
                placeholder={
                  lang === "ru"
                    ? "Вставьте сюда код компонента React / Next.js или структуру package.json..."
                    : "Paste React / Next.js component or package.json here..."
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
              />
              <button
                onClick={() => runAudit()}
                disabled={isAuditing || !snippetCode.trim()}
                className="px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono rounded-lg transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isAuditing ? <RefreshCw size={13} className="animate-spin" /> : <Terminal size={13} />}
                <span>{lang === "ru" ? "Проверить фрагмент" : "Audit Snippet"}</span>
              </button>
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {inputMode === "preset" && (
            <div className="space-y-3">
              <label className="block text-xs font-mono text-zinc-300">
                {lang === "ru" ? "Выберите смоделированный архетип стартапа:" : "Select a simulated startup archetype:"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => {
                    setActivePreset("cursor-saas");
                    runAudit({ archetype: "cursor-saas" });
                  }}
                  className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                    activePreset === "cursor-saas"
                      ? "border-rose-500/50 bg-rose-500/10 text-white"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="font-semibold text-xs text-white mb-1">AI SaaS (Cursor)</div>
                  <div className="text-[11px] font-mono text-rose-400">
                    {lang === "ru" ? "Судный день: 89%" : "Doomsday: 89%"}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    {lang === "ru" ? "Файл на 2400 строк + утечка ключа" : "2400-line file + leaked secret"}
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActivePreset("bolt-landing");
                    runAudit({ archetype: "bolt-landing" });
                  }}
                  className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                    activePreset === "bolt-landing"
                      ? "border-amber-500/50 bg-amber-500/10 text-white"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="font-semibold text-xs text-white mb-1">E-Commerce (Bolt.new)</div>
                  <div className="text-[11px] font-mono text-amber-400">
                    {lang === "ru" ? "Судный день: 64%" : "Doomsday: 64%"}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    {lang === "ru" ? "Клиентский расчет цен" : "Client-side price calculation"}
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActivePreset("crypto-bot");
                    runAudit({ archetype: "crypto-bot" });
                  }}
                  className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                    activePreset === "crypto-bot"
                      ? "border-rose-500/50 bg-rose-500/10 text-white"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="font-semibold text-xs text-white mb-1">TG Bot (ChatGPT o3)</div>
                  <div className="text-[11px] font-mono text-rose-400">
                    {lang === "ru" ? "Судный день: 96%" : "Doomsday: 96%"}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    {lang === "ru" ? "Логирование приватных ключей" : "Logging private wallet keys"}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2">
              <XCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>{lang === "ru" ? "Ошибка проверки:" : "Audit error:"}</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {isAuditing && (
            <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-3">
              <RefreshCw size={15} className="animate-spin text-emerald-400" />
              <span>{auditProgress}</span>
            </div>
          )}

          {/* EMPTY / READY TO SCAN STATE (WHEN NO AUDIT REPORT YET) */}
          {!isAuditing && !auditReport && (
            <div className="mt-6 pt-6 border-t border-zinc-800/80">
              <div className="p-6 sm:p-8 rounded-xl border border-zinc-800/80 bg-zinc-950/40 text-center relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3.5 shadow-sm">
                  <Terminal size={22} className="text-emerald-400" />
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-white font-mono">
                  {lang === "ru"
                    ? "Анализатор технического долга готов к запуску"
                    : "Technical Debt Analyzer Ready"}
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-1.5 max-w-lg mx-auto leading-relaxed">
                  {lang === "ru"
                    ? "Введите URL репозитория выше или вставьте фрагмент кода, чтобы рассчитать персональный Doomsday Score и сформировать хирургические промпты для безопасного рефакторинга."
                    : "Enter a repository URL above or paste a code snippet to calculate your Doomsday Score and generate surgical refactoring prompts for Cursor & Claude."}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => runAudit()}
                    className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <Zap size={14} className="text-amber-600 fill-amber-500" />
                    <span>{lang === "ru" ? "Запустить экспресс-аудит" : "Run Instant Audit"}</span>
                  </button>

                  <button
                    onClick={() => setAuditReport(DEFAULT_REPORT)}
                    className="px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{lang === "ru" ? "👁️ Посмотреть демо-отчет (Cursor SaaS)" : "👁️ View Demo Report (Cursor SaaS)"}</span>
                  </button>
                </div>

                {/* TRUST PILLARS */}
                <div className="mt-6 pt-5 border-t border-zinc-900 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-emerald-400" />
                    {lang === "ru" ? "Детерминированный AST-анализ (0 галлюцинаций)" : "Deterministic AST parsing"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-emerald-400" />
                    {lang === "ru" ? "Безопасно: код в память, 0 логов секретов" : "In-memory scan, no stored keys"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-emerald-400" />
                    {lang === "ru" ? "Промпты оптимизированы под Cursor Composer" : "Optimized for Cursor Composer"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AUDIT REPORT VIEW */}
          {!isAuditing && auditReport && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              {/* TOP HEADER */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">
                      {lang === "ru" ? "Отчет по проекту:" : "Audit Report for:"}
                    </span>
                    <span className="text-xs font-mono font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">
                      {auditReport.repoName}
                    </span>
                    {auditReport.isRealRepo && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        {lang === "ru" ? "Данные из GitHub API" : "Live GitHub API"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-sans mt-1">
                    {auditReport.diagnosticsSummary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setAuditReport(null);
                      setErrorMessage(null);
                    }}
                    className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                    title={lang === "ru" ? "Сбросить отчет и провести новый аудит" : "Reset and start new audit"}
                  >
                    <RotateCcw size={12} />
                    <span>{lang === "ru" ? "Новый аудит" : "New Audit"}</span>
                  </button>
                  <button
                    onClick={handleShareToTwitter}
                    className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <TwitterIcon size={12} />
                    <span>{lang === "ru" ? "Поделиться в X" : "Share on X"}</span>
                  </button>
                  <button
                    onClick={handleCopyShareLink}
                    className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedShare ? <Check size={12} className="text-emerald-400" /> : <Share2Icon size={12} />}
                    <span>{copiedShare ? (lang === "ru" ? "Скопировано!" : "Copied!") : (lang === "ru" ? "Текст для поста" : "Copy Post")}</span>
                  </button>
                  <button
                    onClick={copyBadgeMarkdown}
                    className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedBadge ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedBadge ? (lang === "ru" ? "Скопировано!" : "Copied!") : (lang === "ru" ? "Бейдж для README" : "README Badge")}</span>
                  </button>
                </div>
              </div>

              {/* 4 SUMMARY METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {/* 1. DOOMSDAY SCORE */}
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    auditReport.doomsdayScore > 75
                      ? "border-rose-500/30 bg-rose-500/5 text-rose-300"
                      : auditReport.doomsdayScore > 40
                      ? "border-amber-500/30 bg-amber-500/5 text-amber-300"
                      : "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[11px] uppercase tracking-wider font-semibold">
                      {lang === "ru" ? "Счетчик Судного Дня" : "Doomsday Score"}
                    </span>
                    <AlertTriangle size={14} />
                  </div>
                  <div className="my-2">
                    <span className="text-4xl font-extrabold font-mono tracking-tight">
                      {auditReport.doomsdayScore}%
                    </span>
                    <span className="text-xs block mt-0.5 font-medium">
                      {auditReport.doomsdayScore > 75
                        ? (lang === "ru" ? "Критический уровень риска" : "Critical Risk Level")
                        : auditReport.doomsdayScore > 40
                        ? (lang === "ru" ? "Умеренный технический долг" : "Elevated Tech Debt")
                        : (lang === "ru" ? "Архитектура под контролем" : "Healthy Architecture")}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-zinc-800/80">
                    {lang === "ru" ? "Вероятность сбоя при новой фиче" : "Probability of failure on next feature"}
                  </div>
                </div>

                {/* 2. TIME TO DISASTER */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                    <span className="text-[11px] uppercase tracking-wider">
                      {lang === "ru" ? "Запас прочности" : "Time to Collapse"}
                    </span>
                    <Clock size={14} />
                  </div>
                  <div className="my-2">
                    <div className="text-base font-bold font-mono text-zinc-100 leading-snug">
                      ~ {auditReport.timeToCollapse}
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/80">
                    {lang === "ru" ? "Оценка до критического бага" : "Estimated commits before break"}
                  </div>
                </div>

                {/* 3. REFACTOR COST */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                    <span className="text-[11px] uppercase tracking-wider">
                      {lang === "ru" ? "Цена вызова сеньора" : "Contractor Fix Cost"}
                    </span>
                    <Zap size={14} className="text-zinc-400" />
                  </div>
                  <div className="my-2">
                    <span className="text-2xl font-bold font-mono text-zinc-100">
                      ${formatNumber(auditReport.estimatedFixCost)}
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      {lang === "ru" ? "или бесплатно с нашими промптами" : "or 0$ with our surgical prompts"}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-zinc-800/80">
                    {lang === "ru" ? "Экономия бюджета: ~92%" : "Founder budget saved: ~92%"}
                  </div>
                </div>

                {/* 4. HEALTH CHECK */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between text-xs font-mono">
                  <div className="text-[11px] text-zinc-400 uppercase tracking-wider mb-2">
                    {lang === "ru" ? "Метрики качества" : "Code Metrics"}
                  </div>
                  <div className="space-y-1.5 text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{lang === "ru" ? "Индекс спагетти:" : "Spaghetti Index:"}</span>
                      <span className="font-bold">{auditReport.spaghettiIndex} / 10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{lang === "ru" ? "Файлов проверено:" : "Files scanned:"}</span>
                      <span className="font-bold">{auditReport.filesScanned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{lang === "ru" ? "Автотесты:" : "Automated tests:"}</span>
                      <span className={auditReport.hasTests ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {auditReport.hasTests ? (lang === "ru" ? "Обнаружены" : "Found") : (lang === "ru" ? "Отсутствуют" : "None")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* REPORT TABS */}
              <div className="flex flex-wrap border-b border-zinc-800 mb-4 font-mono text-xs gap-1">
                <button
                  onClick={() => setActiveReportTab("antipatterns")}
                  className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeReportTab === "antipatterns"
                      ? "border-zinc-200 text-white font-semibold"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Bug size={13} />
                  {lang === "ru" ? `Найденные уязвимости (${auditReport.antipatterns.length})` : `Detected Smells (${auditReport.antipatterns.length})`}
                </button>
                <button
                  onClick={() => setActiveReportTab("god-files")}
                  className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeReportTab === "god-files"
                      ? "border-zinc-200 text-white font-semibold"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <FileCode size={13} />
                  {lang === "ru" ? `Крупнейшие файлы (${auditReport.godComponents.length})` : `God Components (${auditReport.godComponents.length})`}
                </button>
                <button
                  onClick={() => setActiveReportTab("prompts")}
                  className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeReportTab === "prompts"
                      ? "border-emerald-400 text-emerald-300 font-semibold"
                      : "border-transparent text-emerald-500/80 hover:text-emerald-400"
                  }`}
                >
                  <Sparkles size={13} className="text-emerald-400" />
                  <span>{lang === "ru" ? `🔥 План спасения / Промпты (${auditReport.refactorSteps.length})` : `🔥 Surgical Prompts (${auditReport.refactorSteps.length})`}</span>
                </button>
                <button
                  onClick={() => setActiveReportTab("radar")}
                  className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeReportTab === "radar"
                      ? "border-zinc-200 text-white font-semibold"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Zap size={13} />
                  {lang === "ru" ? "Матрица здоровья (X-Ray)" : "Health X-Ray"}
                </button>
              </div>

              {/* SUB-TAB 1: ANTIPATTERNS */}
              {activeReportTab === "antipatterns" && (
                <div className="space-y-4">
                  {auditReport.antipatterns.length === 0 ? (
                    <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-950/70 text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2 text-emerald-400">
                        <CheckCircle size={20} />
                      </div>
                      <h4 className="text-sm font-semibold text-white font-mono">
                        {lang === "ru" ? "Критических антипаттернов не найдено" : "No Critical Antipatterns Found"}
                      </h4>
                      <p className="text-xs text-zinc-400 font-sans mt-1 max-w-md mx-auto">
                        {lang === "ru"
                          ? "В проверенном коде отсутствуют открытые приватные ключи, бесконечные циклы хуков и опасные приведения типов 'any'."
                          : "Clean code: no exposed secrets in client bundle, no infinite hook loops, and no unvalidated 'any' casts."}
                      </p>
                    </div>
                  ) : (
                    auditReport.antipatterns.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                                item.severity === "CRITICAL"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {item.severity}
                            </span>
                            {item.cwe && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-750 text-zinc-300 font-medium">
                                {item.cwe}
                              </span>
                            )}
                            <span className="font-semibold text-sm text-zinc-100">{item.title}</span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">{item.detectedIn}</span>
                        </div>
                        <p className="text-xs text-zinc-400 font-sans mb-3">{item.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3 rounded-lg bg-zinc-950 border border-rose-500/20 text-rose-200 overflow-x-auto">
                            <div className="text-[10px] text-rose-400 font-semibold mb-1">
                              {lang === "ru" ? "❌ Ошибка в коде:" : "❌ AI Hallucination / Bad Code:"}
                            </div>
                            <pre className="whitespace-pre">{item.sampleBadCode}</pre>
                          </div>
                          <div className="p-3 rounded-lg bg-zinc-950 border border-emerald-500/20 text-emerald-200 overflow-x-auto">
                            <div className="text-[10px] text-emerald-400 font-semibold mb-1">
                              {lang === "ru" ? "✅ Безопасное решение:" : "✅ Clean Refactor:"}
                            </div>
                            <pre className="whitespace-pre">{item.sampleFix}</pre>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SUB-TAB 2: GOD FILES */}
              {activeReportTab === "god-files" && (
                <div className="space-y-3">
                  {auditReport.godComponents.length === 0 ? (
                    <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-950/70 text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2 text-emerald-400">
                        <CheckCircle size={20} />
                      </div>
                      <h4 className="text-sm font-semibold text-white font-mono">
                        {lang === "ru" ? "Гигантские файлы (God-компоненты) не обнаружены" : "No God Components Found"}
                      </h4>
                      <p className="text-xs text-zinc-400 font-sans mt-1 max-w-md mx-auto">
                        {lang === "ru"
                          ? "Все проанализированные файлы укладываются в рекомендуемый лимит (<250 строк). Кодовая база разбита на модули, удобные для Cursor и Claude."
                          : "All scanned files are within the recommended threshold (<250 lines). Codebase is modular and context-friendly."}
                      </p>
                    </div>
                  ) : (
                    auditReport.godComponents.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <FileCode size={15} className="text-zinc-400" />
                            <span className="font-mono text-xs font-semibold text-white">{file.name}</span>
                            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                              ~{file.lines} {lang === "ru" ? "строк" : "lines"}
                            </span>
                          </div>
                          <ul className="mt-2 space-y-1 text-xs text-zinc-400 list-disc list-inside font-sans">
                            {file.issues.map((iss, i) => (
                              <li key={i}>{iss}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-right shrink-0 font-mono text-xs">
                          <span className="text-[10px] text-zinc-500 block">
                            {lang === "ru" ? "Рекомендация:" : "Recommendation:"}
                          </span>
                          <span className="text-zinc-300 font-medium">
                            {lang === "ru" ? "Разбить на 2+ модуля" : "Decompose into modules"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SUB-TAB 3: PROMPTS */}
              {activeReportTab === "prompts" && (
                <div className="space-y-4">
                  {/* LEAD MAGNET HEADER */}
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                          🔥 {lang === "ru" ? "Главный инструмент спасения" : "Core Rescue Tool"}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {lang === "ru" ? "Хирургический рефакторинг под ИИ-ассистентов" : "Surgical Refactoring Prompts"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-sans mt-1">
                        {lang === "ru"
                          ? "Промпты декомпозируют ваш код на изолированные файлы без потери бизнес-логики и UI."
                          : "Custom-tailored prompts that safely decompose your code without breaking UI or state."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-xs font-mono">
                        <button
                          onClick={() => setTargetAiTool("cursor")}
                          className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
                            targetAiTool === "cursor"
                              ? "bg-zinc-800 text-white font-medium"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <Zap size={11} className="text-emerald-400" />
                          <span>Cursor (Cmd+I)</span>
                        </button>
                        <button
                          onClick={() => setTargetAiTool("claude")}
                          className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
                            targetAiTool === "claude"
                              ? "bg-zinc-800 text-white font-medium"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <Sparkles size={11} className="text-purple-400" />
                          <span>Claude 3.7</span>
                        </button>
                      </div>

                      <button
                        onClick={handleCopyAllPrompts}
                        className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {copiedAllPrompts ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedAllPrompts ? (lang === "ru" ? "Все скопировано!" : "All Copied!") : (lang === "ru" ? "Скопировать весь план" : "Copy Full Plan")}</span>
                      </button>
                    </div>
                  </div>

                  {/* PROMPT CARDS */}
                  {auditReport.refactorSteps.map((step, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-center font-bold">
                            {step.step}
                          </span>
                          <span className="font-semibold text-xs text-white">{step.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                            {targetAiTool === "cursor" ? "⚡ Cursor Composer" : "🧠 Claude 3.7 Thinking"}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500">⏱️ {step.estimatedTime}</span>
                      </div>

                      <div className="relative mt-2">
                        <pre className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                          {step.prompt}
                        </pre>
                        <button
                          onClick={() => copyPrompt(step.prompt, idx)}
                          className="absolute right-2.5 top-2.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-100 flex items-center gap-1.5 transition cursor-pointer shadow-sm border border-zinc-700/60"
                        >
                          {copiedPromptIdx === idx ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400 font-bold">{lang === "ru" ? "Скопировано!" : "Copied!"}</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>{lang === "ru" ? "Скопировать для Cursor" : "Copy for Cursor"}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="mt-2.5 text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                        <span className="text-emerald-400">●</span>
                        <span>
                          {lang === "ru"
                            ? "Как применить: откройте Cursor, нажмите Cmd+I (Composer), вставьте промпт и нажмите Enter."
                            : "How to use: open Cursor, press Cmd+I (Composer), paste prompt and hit Enter."}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SUB-TAB 4: HEALTH MATRIX (X-RAY) */}
              {activeReportTab === "radar" && (
                <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/70">
                  <h3 className="text-sm font-semibold text-white mb-4 font-mono">
                    {lang === "ru" ? "Матрица здоровья кодовой базы (4 столпа)" : "Codebase Health Matrix (4 Pillars)"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    {/* Security */}
                    <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-300 font-semibold">{lang === "ru" ? "1. Безопасность ключей" : "1. Credential Security"}</span>
                        <span className="text-rose-400 font-bold">{auditReport.doomsdayScore > 75 ? "14% (Критично)" : "85% (ОК)"}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${auditReport.doomsdayScore > 75 ? "bg-rose-500 w-[14%]" : "bg-emerald-500 w-[85%]"}`} />
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-2 font-sans">
                        {lang === "ru" ? "Проверка наличия секретных токенов в клиентских файлах" : "Scanning client bundle for exposed API tokens"}
                      </p>
                    </div>

                    {/* Modularity */}
                    <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-300 font-semibold">{lang === "ru" ? "2. Модульность компонентов" : "2. Modularity & Context"}</span>
                        <span className="text-amber-400 font-bold">{Math.max(15, 100 - auditReport.spaghettiIndex * 9)}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${Math.max(15, 100 - auditReport.spaghettiIndex * 9)}%` }} />
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-2 font-sans">
                        {lang === "ru" ? "Оценка размера компонентов и глубины связности" : "Evaluation of God-objects and single-file bloat"}
                      </p>
                    </div>

                    {/* Type Safety */}
                    <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-300 font-semibold">{lang === "ru" ? "3. Строгость TypeScript" : "3. Type Safety Strictness"}</span>
                        <span className="text-zinc-300 font-bold">{Math.max(20, 100 - auditReport.ghostTypesCount * 1.5)}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-400" style={{ width: `${Math.max(20, 100 - auditReport.ghostTypesCount * 1.5)}%` }} />
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-2 font-sans">
                        {lang === "ru" ? "Детекция подавления компилятора через 'any'" : "Detection of suppressed compiler errors via 'any'"}
                      </p>
                    </div>

                    {/* Tests */}
                    <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-300 font-semibold">{lang === "ru" ? "4. Автоматические тесты" : "4. Regression Test Shield"}</span>
                        <span className={auditReport.hasTests ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {auditReport.hasTests ? "100%" : "0% (Угроза)"}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${auditReport.hasTests ? "bg-emerald-500 w-[100%]" : "bg-rose-500 w-[4%]"}`} />
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-2 font-sans">
                        {lang === "ru" ? "Наличие Vitest / Jest / Playwright сценариев" : "Presence of unit and integration test coverage"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CLI ONE-LINER SECTION */}
      <section id="cli-section" className="py-14 px-4 sm:px-8 border-t border-zinc-800/80 bg-zinc-950/70 z-10 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900 mb-3">
            <Terminal size={13} />
            <span>LOCAL TERMINAL AUDIT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {lang === "ru" ? "Запусти аудит локально через одну команду" : "Run local audit with a single CLI command"}
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans max-w-xl mx-auto mb-6">
            {lang === "ru"
              ? "Для приватных репозиториев и корпоративного кода. Никакие файлы не передаются наружу."
              : "For private repositories and enterprise codebases. Zero files ever leave your machine."}
          </p>

          <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-4 text-left font-mono text-xs text-zinc-300 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-emerald-400 font-bold">$</span>
              <span>npx vibedebt audit ./src</span>
            </div>
            <button
              onClick={handleCopyCli}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedCli ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedCli ? (lang === "ru" ? "Скопировано!" : "Copied!") : (lang === "ru" ? "Копировать" : "Copy")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / IS THERE AI SECTION */}
      <section className="py-16 px-4 sm:px-8 border-t border-zinc-800/80 bg-zinc-900/30 z-10 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {lang === "ru" ? "Как происходит анализ репозитория: есть ли здесь отдельный ИИ?" : "How Repository Analysis Works: Is There an AI Under the Hood?"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans">
              {lang === "ru"
                ? "Мы используем гибридную архитектуру: детерминированный статический анализ плюс контекстные генераторы промптов."
                : "We utilize a hybrid architecture: deterministic static AST analysis paired with contextual prompt engines."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/70">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold uppercase">
                  Уровень 1 // Мгновенно
                </span>
                <span className="text-xs font-mono font-bold text-white">Статический AST-сканер</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-3">
                {lang === "ru"
                  ? "Считывает дерево файлов через GitHub API без участия нейросети. Проверяет package.json на наличие тестов (jest, vitest), замеряет объемы файлов и ищет паттерны 'as any', утечек ключей и циклов в useEffect. Работает за 0.5 секунды со 100% точностью и без галлюцинаций."
                  : "Fetches repository file tree via GitHub REST API without LLM hallucination risk. Inspects package.json for test runners, checks file line lengths, detects 'as any' cascades and exposed secrets in sub-second time."}
              </p>
              <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-zinc-800/80">
                ✓ {lang === "ru" ? "Чистая математика и факты кода" : "Pure code heuristics & facts"}
              </div>
            </div>

            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/70">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono font-bold uppercase">
                  Уровень 2 // ИИ-рефакторинг
                </span>
                <span className="text-xs font-mono font-bold text-white">Контекстный мета-промптер</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-3">
                {lang === "ru"
                  ? "На основе найденных аномалий (например, обнаружен монолитный app/page.tsx на 1100 строк) формирует узконаправленный системный промпт для Claude 3.7 или Cursor. Промпт дает строгие рамки, запрещающие ИИ ломать существующий UI при распиле логики."
                  : "Takes detected anomalies (such as a 1,100-line monolithic file) and generates constrained surgical instructions for Claude 3.7 or Cursor, preventing the AI from breaking existing business logic during refactors."}
              </p>
              <div className="text-[11px] font-mono text-purple-400 pt-2 border-t border-zinc-800/80">
                ✓ {lang === "ru" ? "Безопасное исправление через Cursor" : "Safe iterative Cursor refactoring"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DOOMSDAY CALCULATOR */}
      <section id="calculator" className="py-20 px-4 sm:px-8 border-t border-zinc-800/80 bg-zinc-950/40 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              {lang === "ru" ? "Интерактивный калькулятор технического долга" : "Interactive Tech Debt Simulator"}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-sans">
              {lang === "ru"
                ? "Настройте параметры проекта под свою ситуацию и оцените реальные риски до запуска на Product Hunt."
                : "Tweak your project parameters to project exact risks before your Product Hunt launch."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* CONTROLS (7 COLS) */}
            <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-6">
              {/* Slider 1 */}
              <div>
                <div className="flex justify-between items-center mb-2 font-mono text-xs">
                  <span className="text-zinc-300 font-medium">
                    {lang === "ru" ? "1. Строк кода, написанных ИИ:" : "1. AI-generated lines of code:"}
                  </span>
                  <span className="text-white font-bold">{formatNumber(calcAiLines)} {lang === "ru" ? "строк" : "LOC"}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={calcAiLines}
                  onChange={(e) => setCalcAiLines(Number(e.target.value))}
                  className="w-full accent-zinc-100 bg-zinc-800 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                  <span>500 (MVP)</span>
                  <span>10 000 (SaaS)</span>
                  <span>20 000+ (Spaghetti)</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div>
                <div className="flex justify-between items-center mb-2 font-mono text-xs">
                  <span className="text-zinc-300 font-medium">
                    {lang === "ru" ? "2. Файлов длиннее 500 строк (God-компоненты):" : "2. Files over 500 lines (God Objects):"}
                  </span>
                  <span className="text-white font-bold">{calcGodFiles} {lang === "ru" ? "файлов" : "files"}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={calcGodFiles}
                  onChange={(e) => setCalcGodFiles(Number(e.target.value))}
                  className="w-full accent-zinc-100 bg-zinc-800 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                  <span>0 ({lang === "ru" ? "модульно" : "modular"})</span>
                  <span>3-5 ({lang === "ru" ? "опасно" : "risky"})</span>
                  <span>10 ({lang === "ru" ? "монолит" : "monolith"})</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div>
                <div className="flex justify-between items-center mb-2 font-mono text-xs">
                  <span className="text-zinc-300 font-medium">
                    {lang === "ru"
                      ? "3. Промптов вида «Just fix it, don't change anything else»:"
                      : "3. 'Just fix it, don't change anything' prompts:"}
                  </span>
                  <span className="text-rose-400 font-bold">{calcJustWorkCount} {lang === "ru" ? "раз" : "times"}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={calcJustWorkCount}
                  onChange={(e) => setCalcJustWorkCount(Number(e.target.value))}
                  className="w-full accent-rose-500 bg-zinc-800 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-500 mt-1 font-sans">
                  {lang === "ru"
                    ? "Такие промпты заставляют ИИ оборачивать старый костыль в новый костыль."
                    : "Each such prompt forces the LLM to wrap hacks in new hacks."}
                </p>
              </div>

              {/* Toggle 4 */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-medium text-zinc-200 block">
                      {lang === "ru" ? "4. Есть хотя бы один работающий автотест?" : "4. Any automated tests present?"}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-sans">
                      {lang === "ru" ? "Ручное кликанье мышкой в браузере не считается." : "Manual browser clicking doesn't count."}
                    </span>
                  </div>
                  <button
                    onClick={() => setCalcHasTests(!calcHasTests)}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition cursor-pointer ${
                      calcHasTests
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {calcHasTests
                      ? (lang === "ru" ? "ДА (Есть тесты)" : "YES (Tests active)")
                      : (lang === "ru" ? "НЕТ (Живу опасно)" : "NO (Living dangerously)")}
                  </button>
                </div>
              </div>

              {/* DB Status */}
              <div className="pt-2 border-t border-zinc-800">
                <label className="text-xs font-mono font-medium text-zinc-200 block mb-2">
                  {lang === "ru" ? "5. Состояние базы данных и стейта:" : "5. Database & State Architecture:"}
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <button
                    onClick={() => setCalcDbState("clean")}
                    className={`p-2 rounded border text-center transition cursor-pointer ${
                      calcDbState === "clean"
                        ? "border-zinc-300 bg-zinc-800 text-white font-medium"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500"
                    }`}
                  >
                    {lang === "ru" ? "Миграции" : "Clean Migrations"}
                  </button>
                  <button
                    onClick={() => setCalcDbState("medium")}
                    className={`p-2 rounded border text-center transition cursor-pointer ${
                      calcDbState === "medium"
                        ? "border-zinc-300 bg-zinc-800 text-white font-medium"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500"
                    }`}
                  >
                    {lang === "ru" ? "JSON-колонки" : "JSON blobs"}
                  </button>
                  <button
                    onClick={() => setCalcDbState("mess")}
                    className={`p-2 rounded border text-center transition cursor-pointer ${
                      calcDbState === "mess"
                        ? "border-rose-500/50 bg-rose-500/10 text-rose-300 font-medium"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500"
                    }`}
                  >
                    {lang === "ru" ? "LocalStorage" : "LocalStorage State"}
                  </button>
                </div>
              </div>
            </div>

            {/* PREDICTION SUMMARY (5 COLS) */}
            <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-xl p-6">
              <div className="text-xs font-mono text-zinc-400 flex items-center justify-between pb-3 border-b border-zinc-800 mb-6">
                <span>{lang === "ru" ? "ПРОГНОЗ КАТАСТРОФЫ // TTD" : "FAILURE PROJECTION // TTD"}</span>
                <span className="text-rose-400 font-mono text-[11px]">● ACTIVE CALC</span>
              </div>

              <div className="text-center my-6">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  {lang === "ru" ? "До критического отказа системы:" : "Until critical production failure:"}
                </span>
                <div className="text-5xl font-black font-mono text-white my-2">
                  {calcResult.days} {lang === "ru" ? (calcResult.days === 1 ? "день" : calcResult.days < 5 ? "дня" : "дней") : "days"}
                </div>
                <p className="text-xs text-zinc-400 font-sans max-w-xs mx-auto">
                  {calcResult.days < 14
                    ? (lang === "ru"
                      ? "Критический уровень хрупкости. Любая правка в Stripe или Auth вызовет каскадный сбой."
                      : "Critical fragility. Next modification in billing or auth risks cascading downtime.")
                    : (lang === "ru"
                      ? "Базовый запас прочности есть, но архитектурный долг снижает скорость новых релизов."
                      : "Baseline endurance exists, but compounding debt will halve your iteration velocity.")}
                </p>
              </div>

              <div className="space-y-2.5 font-mono text-xs bg-zinc-950 p-4 rounded-lg border border-zinc-800 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">{lang === "ru" ? "Экстренный наем сеньора:" : "Contractor emergency rate:"}</span>
                  <span className="text-zinc-200 font-bold">${formatNumber(calcResult.emergencyCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">{lang === "ru" ? "Уровень хрупкости (Fragility):" : "Fragility Index:"}</span>
                  <span className="text-rose-400 font-bold">{calcResult.fragilityPercent}%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-800/40 border border-zinc-700/60 text-xs text-zinc-300 font-sans">
                💡 <strong>{lang === "ru" ? "Совет:" : "Tip:"}</strong>{" "}
                {lang === "ru"
                  ? "Вместо найма дорогого разработчика воспользуйтесь сгенерированным планом рефакторинга в блоке аудитора выше."
                  : "Instead of hiring a $150/hr senior developer, execute the surgical prompts generated in the audit tab above."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANATOMY OF AI DEFECTS & 5 PILLARS */}
      <section id="antipatterns" className="py-20 px-4 sm:px-8 max-w-5xl mx-auto z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-mono mb-4">
            <span>🔬 Научные исследования &amp; SAST-анализ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
            {lang === "ru" ? "Анатомия проблемы: почему ИИ-код терпит крах?" : "The Anatomy of AI Code Failures"}
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
            {lang === "ru"
              ? "Проблема не в том, что ИИ «плохо пишет код». Проблема в том, что он пишет код, который выглядит идеальным, но содержит системный машинный след дефектов. До 45% генераций содержат уязвимости, а до 19.7% рекомендаций библиотек указывают на несуществующие пакеты."
              : "AI is optimized for probability and appearance, not resilience. Up to 45% of AI code has security flaws, and 19.7% of suggested packages are hallucinated."}
          </p>
        </div>

        {/* 5 ROOT CAUSES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-center font-bold">1</span>
              <span className="text-xs font-mono text-rose-400 font-semibold">CWE Security Risk</span>
            </div>
            <h3 className="font-semibold text-sm text-white mb-1.5">
              {lang === "ru" ? "Оптимизация под «вид», а не безопасность" : "Optimized for Look, Not Security"}
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-3">
              {lang === "ru"
                ? "Модель генерирует статистически вероятный код. Безопасность не входит в ее целевую функцию. В итоге код компилируется, но открывает SQL-инъекции, XSS и выставляет приватные токены в браузер."
                : "LLMs output high-probability tokens satisfying prompts without inherent security guarantees, leaving SQLi and exposed tokens."}
            </p>
            <div className="text-[11px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-2">
              {lang === "ru" ? "Вайб-решение: SAST-правила и мета-промпты с фиксацией CWE." : "VibeDebt Fix: SAST CWE remediation prompts."}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-center font-bold">2</span>
              <span className="text-xs font-mono text-amber-400 font-semibold">Supply Chain Slop</span>
            </div>
            <h3 className="font-semibold text-sm text-white mb-1.5">
              {lang === "ru" ? "Галлюцинации пакетов и API (19.7%)" : "Package & API Hallucinations (19.7%)"}
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-3">
              {lang === "ru"
                ? "Исследования показали: 19.7% рекомендаций библиотек от ИИ указывают на несуществующие пакеты. Злоумышленники массово регистрируют эти имена в npm для атак на цепочки поставок."
                : "Studies prove 19.7% of AI package recommendations don't exist. Attackers register phantom packages on npm to breach startups."}
            </p>
            <div className="text-[11px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-2">
              {lang === "ru" ? "Вайб-решение: Валидация зависимостей и запрет фантомных библиотек." : "VibeDebt Fix: Lock-file audit & phantom package scan."}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-center font-bold">3</span>
              <span className="text-xs font-mono text-purple-400 font-semibold">Inverse Law</span>
            </div>
            <h3 className="font-semibold text-sm text-white mb-1.5">
              {lang === "ru" ? "Закон обратной связи объема и качества" : "Volume-Quality Inverse Law"}
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-3">
              {lang === "ru"
                ? "Чем больше объем файла, тем сильнее структурная деградация. Начиная с 300 строк, Cursor теряет контекст и порождает сильно связанный 'vibe slop', затирая соседний функционал."
                : "As file size grows, structural debt escalates exponentially. Over 300 lines, AI deletes existing features when adding new ones."}
            </p>
            <div className="text-[11px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-2">
              {lang === "ru" ? "Вайб-решение: Распил на 3 слабосвязанных сервиса." : "VibeDebt Fix: 3-service decoupling prompts."}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-center font-bold">4</span>
              <span className="text-xs font-mono text-blue-400 font-semibold">Happy Path Blindspot</span>
            </div>
            <h3 className="font-semibold text-sm text-white mb-1.5">
              {lang === "ru" ? "Отсутствие обработки сбоев и крайних случаев" : "Happy Path & Null Blindspot"}
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-3">
              {lang === "ru"
                ? "ИИ пишет код под «идеальный мир»: пустые блоки catch, сетевые запросы без таймаутов и отсутствие проверок на null. Малейший сбой сети подвешивает браузер пользователя намертво."
                : "LLMs ignore timeouts, null checks, and error boundaries, leaving empty catch blocks that freeze production."}
            </p>
            <div className="text-[11px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-2">
              {lang === "ru" ? "Вайб-решение: Result<T, E> паттерн и таймауты 5 сек." : "VibeDebt Fix: Result<T, E> & AbortController."}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-center font-bold">5</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">Testing Gap</span>
            </div>
            <h3 className="font-semibold text-sm text-white mb-1.5">
              {lang === "ru" ? "Опасный разрыв в тестировании (Zero-Test Blindspot)" : "The Critical AI Testing Gap"}
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-3">
              {lang === "ru"
                ? "Нейросеть генерирует разметку за секунды, но почти никогда не пишет тесты на граничные случаи. Без регрессионной страховки любой последующий промпт в Cursor может незаметно сломать авторизацию или биллинг."
                : "AI creates code easily but fails to generate contextual regression tests. Without test harness, every new prompt risks breaking revenue."}
            </p>
            <div className="text-[11px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-2">
              {lang === "ru" ? "Вайб-решение: Автогенерация Vitest-сьютов на 4 сценария (валидный, пустой, неверный тип, границы)." : "VibeDebt Fix: Vitest 4-scenario edge-case suites."}
            </div>
          </div>
        </div>

        {/* REAL INCIDENTS KNOWLEDGE BASE */}
        <div className="border border-zinc-800 rounded-2xl p-6 sm:p-8 bg-zinc-950/60">
          <div className="flex items-center gap-2.5 mb-6">
            <ShieldAlert size={18} className="text-rose-400" />
            <h3 className="text-base sm:text-lg font-bold text-white font-mono">
              {lang === "ru" ? "База реальных инцидентов: крах ИИ-кода в Production" : "Real Incident Reports: When AI Code Blew Up"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
              <div className="text-rose-400 font-bold mb-1.5">КЕЙС 1: Инцидент Replit</div>
              <p className="text-zinc-300 font-sans leading-relaxed mb-2">
                {lang === "ru"
                  ? "ИИ-агент при попытке выполнить миграцию схемы запустил DROP DATABASE в боевом окружении из-за отсутствия жестких ограничений прав доступа."
                  : "AI agent dropped production database while attempting migration due to lack of environment guardrails."}
              </p>
              <div className="text-[10px] text-zinc-400 pt-1 border-t border-rose-500/10">
                🛡️ {lang === "ru" ? "Урок: Human-in-the-loop и строгий лимит опасных команд." : "Lesson: Human-in-the-loop controls."}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="text-amber-400 font-bold mb-1.5">КЕЙС 2: Supply Chain Slop</div>
              <p className="text-zinc-300 font-sans leading-relaxed mb-2">
                {lang === "ru"
                  ? "Хакеры зарегистрировали свыше 200 пакетов в npm, имена которых регулярно выдумывали ChatGPT и Cursor, внедрив стилеры в десятки стартапов."
                  : "Attackers claimed 200+ hallucinated npm names frequently hallucinated by models, injecting stealers."}
              </p>
              <div className="text-[10px] text-zinc-400 pt-1 border-t border-amber-500/10">
                🛡️ {lang === "ru" ? "Урок: Автоматический аудит package.json на несуществующие библиотеки." : "Lesson: Automated registry validation."}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-emerald-400 font-bold mb-1.5">КЕЙС 3: Supabase Service Role</div>
              <p className="text-zinc-300 font-sans leading-relaxed mb-2">
                {lang === "ru"
                  ? "Cursor прописал SUPABASE_SERVICE_ROLE_KEY в клиентский компонент формы настроек, открыв административный доступ к БД всем пользователям в DevTools."
                  : "Cursor put master key in 'use client' settings page, leaking admin DB privileges to all browsers."}
              </p>
              <div className="text-[10px] text-zinc-400 pt-1 border-t border-emerald-500/10">
                🛡️ {lang === "ru" ? "Урок: Автоматическая изоляция приватных ключей в Server Actions." : "Lesson: Server Actions key isolation."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GITHUB PR BOT WAITLIST */}
      <section className="py-16 px-4 sm:px-8 border-t border-zinc-800/80 bg-zinc-900/40 z-10 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <ShieldAlert size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {lang === "ru" ? "Подключи GitHub PR Guard Bot" : "Automate Protection: GitHub PR Guard Bot"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-6 font-sans">
            {lang === "ru"
              ? "Бот автоматически проверяет pull request'ы от Cursor или Copilot и блокирует слияние, если файл превышает 400 строк или содержит неизолированные секреты."
              : "GitHub bot that automatically audits Cursor PRs and blocks merges if components exceed 400 lines or expose secrets."}
          </p>

          {botSubscribed ? (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono max-w-md mx-auto">
              ✓ {lang === "ru" ? "Вы добавлены в ранний список доступа! Бот скоро появится в вашем GitHub." : "You're on the early access waitlist! Invitations dispatching soon."}
            </div>
          ) : (
            <form onSubmit={handleBotSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={botEmail}
                onChange={(e) => setBotEmail(e.target.value)}
                placeholder="founder@startup.com"
                required
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono rounded-lg transition cursor-pointer shrink-0"
              >
                {lang === "ru" ? "Получить доступ" : "Request Access"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-4 sm:px-8 border-t border-zinc-800/80 bg-zinc-950/40 z-10 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              {lang === "ru" ? "Прозрачные тарифы" : "Transparent Pricing"}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-sans">
              {lang === "ru" ? "Окупается при первом же предотвращенном сбое на проде." : "Pays for itself the first time your database doesn't crash."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {/* Free */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  {lang === "ru" ? "Бесплатный скан" : "Free Audit"}
                </div>
                <div className="text-3xl font-bold text-white font-mono mb-2">0 ₽</div>
                <p className="text-xs text-zinc-400 font-sans mb-4">
                  {lang === "ru" ? "Для быстрой оценки текущего уровня риска вашего репозитория." : "Instant health check for your public repository."}
                </p>
                <ul className="space-y-2.5 text-xs font-mono text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" /> {lang === "ru" ? "Аудит 1 репозитория" : "1 repository audit"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" /> {lang === "ru" ? "Счетчик Судного Дня" : "Doomsday Score"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" /> {lang === "ru" ? "Базовый список уязвимостей" : "Top code smells list"}
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById("audit-tool");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-6 w-full py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white transition cursor-pointer"
              >
                {lang === "ru" ? "Попробовать бесплатно" : "Start Free Audit"}
              </button>
            </div>

            {/* Pro */}
            <div className="p-5 rounded-xl border border-zinc-600 bg-zinc-900 flex flex-col justify-between relative shadow-lg">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-950 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                {lang === "ru" ? "Выбор фаундеров" : "Founder Choice"}
              </div>
              <div>
                <div className="text-xs font-mono text-zinc-300 uppercase tracking-wider mb-2">PRO</div>
                <div className="text-3xl font-bold text-white font-mono mb-2">
                  1 490 ₽ <span className="text-xs font-normal text-zinc-400">/ {lang === "ru" ? "месяц" : "mo"}</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans mb-4">
                  {lang === "ru" ? "Полный инструментарий рефакторинга и защиты от поломок." : "Surgical refactoring prompts & CI/CD protection."}
                </p>
                <ul className="space-y-2.5 text-xs font-mono text-zinc-200">
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" /> {lang === "ru" ? "Безлимитный аудит проектов" : "Unlimited audits"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" /> <strong>{lang === "ru" ? "Генератор хирургических промптов" : "Surgical Prompt Generator"}</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" /> {lang === "ru" ? "Мониторинг утечек API ключей" : "Secret Leak Guardian"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" /> {lang === "ru" ? "GitHub Action для проверки PR" : "GitHub PR Action Guard"}
                  </li>
                </ul>
              </div>
              <button className="mt-6 w-full py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono transition cursor-pointer">
                {lang === "ru" ? "Подключить PRO" : "Upgrade to PRO"}
              </button>
            </div>

            {/* Lifetime */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">LIFETIME</div>
                <div className="text-3xl font-bold text-white font-mono mb-2">
                  4 900 ₽ <span className="text-xs font-normal text-zinc-400">{lang === "ru" ? "разово" : "one-time"}</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans mb-4">
                  {lang === "ru" ? "Для серийных инди-хакеров, которые запускают несколько проектов." : "For serial indie builders shipping every week."}
                </p>
                <ul className="space-y-2.5 text-xs font-mono text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" /> {lang === "ru" ? "Все функции тарифа PRO навсегда" : "All PRO features forever"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" /> {lang === "ru" ? "До 10 активных репозиториев" : "Up to 10 active repos"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-400" /> {lang === "ru" ? "Приоритетный Claude 3.7 разбор кода" : "Priority Claude 3.7 reasoning"}
                  </li>
                </ul>
              </div>
              <button className="mt-6 w-full py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white transition cursor-pointer">
                {lang === "ru" ? "Купить Lifetime" : "Get Lifetime"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-10 px-4 sm:px-8 text-xs font-mono text-zinc-500 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-zinc-300 font-bold">VibeDebt // 2026</span>
            <span>— Doomsday Clock & Code Auditor for AI Builders</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Built for indie hackers</span>
            <span>•</span>
            <span className="text-emerald-400">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
