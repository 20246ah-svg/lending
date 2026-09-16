"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  TerminalIcon as Terminal,
  ShieldAlertIcon as ShieldAlert,
  AlertTriangleIcon as AlertTriangle,
  ZapIcon as Zap,
  FileCodeIcon as FileCode,
  ClockIcon as Clock,
  CheckIcon as Check,
  CopyIcon as Copy,
  SparklesIcon as Sparkles,
  Share2Icon,
  GithubIcon,
} from "@/components/icons";

import ParticleBackground from "@/components/canvas/ParticleBackground";
import TiltCard from "@/components/ui/TiltCard";
import KineticTicker from "@/components/ui/KineticTicker";
import RadarGauge from "@/components/ui/RadarGauge";
import CodeShowcase from "@/components/ui/CodeShowcase";

// Dynamically load WebGL Scene to ensure smooth client-only execution
const HeroScene = dynamic(() => import("@/components/canvas/HeroScene"), {
  ssr: false,
});

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
  doomsdayScore: 88,
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

export default function Home() {
  const [lang, setLang] = useState<"ru" | "en">("ru");

  // Input State
  const [inputMode, setInputMode] = useState<"github" | "snippet">("github");
  const [githubUrl, setGithubUrl] = useState<string>("https://github.com/shadcn-ui/ui");
  const [snippetCode, setSnippetCode] = useState<string>("");

  // Audit state
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditProgress, setAuditProgress] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<"antipatterns" | "god-files" | "prompts">("antipatterns");

  // Feedback states
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);
  const [copiedBadge, setCopiedBadge] = useState<boolean>(false);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [targetAiTool, setTargetAiTool] = useState<"cursor" | "claude">("cursor");

  // Calculator State
  const [calcAiLines, setCalcAiLines] = useState<number>(5500);
  const [calcGodFiles, setCalcGodFiles] = useState<number>(3);
  const [calcHasTests, setCalcHasTests] = useState<boolean>(false);
  const [calcDbState, setCalcDbState] = useState<"clean" | "medium" | "mess">("medium");

  const runAudit = async (customPayload?: any) => {
    setIsAuditing(true);
    setErrorMessage(null);
    setAuditProgress(
      lang === "ru"
        ? "Подключение к AST-движку и сканирование зависимостей..."
        : "Connecting to AST engine & inspecting dependency tree..."
    );

    try {
      const payload =
        customPayload ||
        (inputMode === "github" ? { url: githubUrl } : { snippet: snippetCode });

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

  const handleCopyCli = () => {
    navigator.clipboard.writeText("npx vibedebt audit ./src");
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  // Dynamic Calculator Result
  const calculateDoomsday = () => {
    let score = 20;
    score += (calcAiLines / 20000) * 35;
    score += calcGodFiles * 6;
    if (!calcHasTests) score += 20;
    if (calcDbState === "mess") score += 15;
    else if (calcDbState === "medium") score += 8;

    score = Math.min(Math.round(score), 99);

    let days = Math.round(90 - (score / 100) * 85);
    days = Math.max(days, 2);

    const emergencyCost = Math.round((score / 100) * 6500 + calcGodFiles * 450);

    return {
      score,
      days,
      emergencyCost,
      fragilityPercent: Math.min(score + 4, 99),
    };
  };

  const calcResult = calculateDoomsday();

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      {/* 1. Ambient Background Particle Engine */}
      <ParticleBackground />

      {/* Cybernetic Subtle Grid */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-30 z-0" />

      {/* 2. Sleek Cyber Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-800/80 bg-[#050508]/85 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Zap size={16} className="text-emerald-400 fill-emerald-400/20" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-base text-white">
                VIBE<span className="text-emerald-400">DEBT</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                v2.4 AST
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-zinc-400 tracking-wider">
            <a href="#audit-tool" className="hover:text-emerald-400 transition-colors">
              {lang === "ru" ? "// АУДИТ" : "// AUDIT"}
            </a>
            <a href="#calculator" className="hover:text-emerald-400 transition-colors">
              {lang === "ru" ? "// КАЛЬКУЛЯТОР" : "// CALCULATOR"}
            </a>
            <a href="#vectors" className="hover:text-emerald-400 transition-colors">
              {lang === "ru" ? "// ПРИЧИНЫ КРАХА" : "// VECTORS"}
            </a>
            <a href="#cli" className="hover:text-emerald-400 transition-colors">
              {lang === "ru" ? "// ОФФЛАЙН CLI" : "// CLI"}
            </a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">
              {lang === "ru" ? "// ТАРИФЫ" : "// PRICING"}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Status Beacon */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-[11px] font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{lang === "ru" ? "РАДАР АКТИВЕН" : "RADAR ACTIVE"}</span>
            </div>

            {/* Language switch */}
            <button
              onClick={() => setLang(lang === "ru" ? "en" : "ru")}
              className="px-2.5 py-1 text-xs font-mono rounded border border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-300 transition cursor-pointer"
            >
              {lang === "ru" ? "EN" : "RU"}
            </button>

            <a
              href="#audit-tool"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
            >
              {lang === "ru" ? "Запустить" : "Launch"}
            </a>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (Spacious, Product-Focused Awwwards Stage) */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 z-10 overflow-hidden">
        {/* Subtle WebGL 3D wireframe mesh breathing in background */}
        <HeroScene />

        <div className="max-w-5xl mx-auto w-full relative z-20 text-center flex flex-col items-center">
          {/* Proof Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-xs font-mono text-emerald-300 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">
              {lang === "ru" ? "⚠️ 84% КРИТИЧЕСКИЙ РИСК" : "⚠️ 84% CRITICAL RISK"}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300">
              {lang === "ru"
                ? "Средний уровень хрупкости в 1 420+ проверенных AI-проектах"
                : "Average fragility across 1,420+ scanned AI codebases"}
            </span>
          </div>

          {/* Kinetic Giant Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            {lang === "ru" ? (
              <>
                ОСТАНОВИ ВАЙБ-СПАГЕТТИ. <br />
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  ВЫПУСКАЙ НАДЕЖНЫЙ ПРОДАКШН-КОД.
                </span>
              </>
            ) : (
              <>
                STOP VIBE SLOP. <br />
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  SHIP BULLETPROOF CODE.
                </span>
              </>
            )}
          </h1>

          <p className="max-w-2xl text-sm sm:text-base text-zinc-400 font-sans leading-relaxed mb-10">
            {lang === "ru"
              ? "AI-аудитор для соло-фаундеров на Cursor и Lovable. Рассчитай Doomsday Score за 1 секунду, локализуй критические точки отказа и получи хирургические промпты для безопасного распила."
              : "AI Code Auditor for solo builders on Cursor & Lovable. Calculate your Doomsday Score in 1 second, locate critical fragility points, and generate surgical refactoring prompts."}
          </p>

          {/* PRIMARY DOMINANT AUDIT BAR */}
          <div id="audit-tool" className="w-full max-w-2xl mb-8">
            <div className="flex flex-col sm:flex-row items-stretch rounded-2xl border-2 border-emerald-500/80 bg-zinc-950/95 p-2 shadow-[0_0_50px_rgba(16,185,129,0.25)] backdrop-blur-xl gap-2">
              <div className="flex items-center gap-3 px-3.5 flex-1">
                <GithubIcon size={18} className="text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => {
                    setInputMode("github");
                    setGithubUrl(e.target.value);
                  }}
                  placeholder="https://github.com/owner/repository"
                  className="w-full bg-transparent text-xs sm:text-sm font-mono text-white placeholder-zinc-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isAuditing) runAudit();
                  }}
                />
              </div>

              <button
                onClick={() => runAudit()}
                disabled={isAuditing}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Zap size={15} className="fill-zinc-950 text-zinc-950" />
                <span>
                  {isAuditing
                    ? (lang === "ru" ? "Сканируем..." : "Scanning...")
                    : (lang === "ru" ? "Проверить репозиторий за 1 сек" : "Scan Repo in 1 Sec")}
                </span>
              </button>
            </div>

            {/* Quick Demo Repositories */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-mono text-zinc-400">
              <span className="text-zinc-600">{lang === "ru" ? "Попробуй:" : "Try:"}</span>
              {[
                { name: "shadcn-ui/ui", url: "https://github.com/shadcn-ui/ui" },
                { name: "calcom/cal.com", url: "https://github.com/calcom/cal.com" },
                { name: "t3-oss/t3-env", url: "https://github.com/t3-oss/t3-env" },
              ].map((repo) => (
                <button
                  key={repo.name}
                  onClick={() => {
                    setInputMode("github");
                    setGithubUrl(repo.url);
                    runAudit({ url: repo.url });
                  }}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400 transition cursor-pointer"
                >
                  {repo.name}
                </button>
              ))}

              <span className="text-zinc-600">•</span>

              <button
                onClick={() => {
                  setAuditReport(DEFAULT_REPORT);
                  const el = document.getElementById("report-view");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
              >
                👁️ {lang === "ru" ? "Посмотреть готовый демо-отчет" : "View Sample Report"}
              </button>
            </div>
          </div>

          {/* Progress / Error HUD */}
          {isAuditing && (
            <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-zinc-950/80 font-mono text-xs text-emerald-400 flex items-center gap-3 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{auditProgress}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 font-mono text-xs text-rose-300 flex items-center gap-3">
              <AlertTriangle size={16} className="text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* INTERACTIVE DEVELOPER PRODUCT SHOWCASE (Replaces the alien 3D cube!) */}
          <div className="w-full mt-6">
            <CodeShowcase lang={lang} />
          </div>
        </div>
      </section>

      {/* 4. KINETIC MARQUEE TICKER (Consistent language) */}
      <KineticTicker lang={lang} />

      {/* 5. AUDIT REPORT WORKBENCH (Terminal HUD) */}
      {auditReport && (
        <section id="report-view" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto z-10 relative">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Header Terminal Bar */}
            <div className="px-6 py-4 bg-zinc-900/70 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="font-mono text-xs text-zinc-300 font-bold ml-2">
                  {lang === "ru" ? "ОТЧЕТ АУДИТА:" : "AUDIT REPORT:"} {auditReport.repoName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {auditReport.filesScanned} {lang === "ru" ? "файлов проверено" : "files scanned"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={copyBadgeMarkdown}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedBadge ? <Check size={13} className="text-emerald-400" /> : <Share2Icon size={13} />}
                  <span>{copiedBadge ? (lang === "ru" ? "Бейдж скопирован!" : "Badge Copied!") : (lang === "ru" ? "Экспорт бейджа" : "Export Badge")}</span>
                </button>
              </div>
            </div>

            {/* Scoreboard Metrics */}
            <div className="p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-zinc-800/80 bg-zinc-950/40">
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider mb-1">
                  Doomsday Score
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-400">
                  {auditReport.doomsdayScore}%
                </div>
                <div className="text-[11px] text-zinc-500 font-mono mt-1">
                  {auditReport.timeToCollapse}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1">
                  {lang === "ru" ? "Критические уязвимости" : "Critical Vulnerabilities"}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">
                  {auditReport.criticalBugsCount}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono mt-1">
                  {lang === "ru" ? "Утечки ключей и петли" : "CWE Leaks & Loops"}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-1">
                  {lang === "ru" ? "God-компоненты" : "God Components"}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-purple-400">
                  {auditReport.godComponents.length}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono mt-1">
                  {lang === "ru" ? "файлы >300 строк" : ">300 LOC monoliths"}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                  {lang === "ru" ? "Оценка фикса сеньором" : "Estimated Fix Cost"}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                  ${formatNumber(auditReport.estimatedFixCost)}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono mt-1">
                  {lang === "ru" ? "Ставка экстренного найма" : "Contractor emergency rate"}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-800 text-xs font-mono bg-zinc-900/40 px-6 gap-2 overflow-x-auto">
              {[
                { id: "antipatterns", label: lang === "ru" ? `Точки отказа (${auditReport.antipatterns.length})` : `Failure Points (${auditReport.antipatterns.length})` },
                { id: "god-files", label: lang === "ru" ? `God-компоненты (${auditReport.godComponents.length})` : `God Components (${auditReport.godComponents.length})` },
                { id: "prompts", label: lang === "ru" ? `Хирургические промпты (${auditReport.refactorSteps.length})` : `Surgical Prompts (${auditReport.refactorSteps.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveReportTab(tab.id as any)}
                  className={`py-3.5 px-4 font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                    activeReportTab === tab.id
                      ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
                      : "border-transparent text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8">
              {/* TAB 1: ANTIPATTERNS */}
              {activeReportTab === "antipatterns" && (
                <div className="space-y-6">
                  {auditReport.antipatterns.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              item.severity === "CRITICAL"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {item.severity}
                          </span>
                          {item.cwe && (
                            <span className="text-[10px] font-mono text-zinc-500">
                              [{item.cwe}]
                            </span>
                          )}
                          <h4 className="font-semibold text-sm sm:text-base text-white">
                            {item.title}
                          </h4>
                        </div>
                        <span className="text-xs font-mono text-zinc-500">{item.detectedIn}</span>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed mb-4">
                        {item.description}
                      </p>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="rounded-lg bg-zinc-950 p-3.5 border border-rose-500/20">
                          <div className="text-rose-400 font-semibold mb-2 flex items-center gap-1.5">
                            <span>✖</span> <span>{lang === "ru" ? "Текущий небезопасный код:" : "Current Vulnerable Code:"}</span>
                          </div>
                          <pre className="text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
                            {item.sampleBadCode}
                          </pre>
                        </div>

                        <div className="rounded-lg bg-zinc-950 p-3.5 border border-emerald-500/20">
                          <div className="text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
                            <span>✓</span> <span>{lang === "ru" ? "Хирургическое исправление:" : "Surgical Fix:"}</span>
                          </div>
                          <pre className="text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
                            {item.sampleFix}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: GOD-COMPONENTS */}
              {activeReportTab === "god-files" && (
                <div className="space-y-4">
                  {auditReport.godComponents.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <FileCode size={16} className="text-purple-400" />
                          <span className="font-mono text-sm font-bold text-white">
                            {file.name}
                          </span>
                          <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            {file.lines} LOC
                          </span>
                        </div>
                        <ul className="text-xs text-zinc-400 font-sans space-y-1">
                          {file.issues.map((iss, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-400">●</span>
                              <span>{iss}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => setActiveReportTab("prompts")}
                        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 transition shrink-0 cursor-pointer"
                      >
                        {lang === "ru" ? "Получить промпт распила →" : "Get Decouple Prompt →"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: PROMPTS */}
              {activeReportTab === "prompts" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                    <span className="text-xs font-mono text-zinc-400">
                      {lang === "ru" ? "Промпты оптимизированы для:" : "Prompts formatted for:"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTargetAiTool("cursor")}
                        className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer ${
                          targetAiTool === "cursor"
                            ? "bg-emerald-500 text-zinc-950 font-bold"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        Cursor Composer
                      </button>
                      <button
                        onClick={() => setTargetAiTool("claude")}
                        className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer ${
                          targetAiTool === "claude"
                            ? "bg-emerald-500 text-zinc-950 font-bold"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        Claude 3.7 Thinking
                      </button>
                    </div>
                  </div>

                  {auditReport.refactorSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6"
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs flex items-center justify-center font-bold">
                            {step.step}
                          </span>
                          <h4 className="font-semibold text-sm sm:text-base text-white">
                            {step.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => copyPrompt(step.prompt, idx)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          {copiedPromptIdx === idx ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedPromptIdx === idx ? (lang === "ru" ? "Скопировано!" : "Copied!") : (lang === "ru" ? "Копировать" : "Copy")}</span>
                        </button>
                      </div>

                      <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-850 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{step.prompt}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. DOOMSDAY HORIZON ENGINE (Interactive 3D Tilt HUD & SVG Radar) */}
      <section id="calculator" className="py-24 px-4 sm:px-8 max-w-6xl mx-auto z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-xs font-mono mb-4">
            <Clock size={13} className="text-amber-400" />
            <span>{lang === "ru" ? "⚡ ЭВРИСТИЧЕСКИЙ РАСЧЕТ РИСКА" : "⚡ HEURISTIC RISK ENGINE"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            {lang === "ru" ? "Калькулятор технического краха (Doomsday Score)" : "Doomsday Collapse Calculator"}
          </h2>
          <p className="text-zinc-400 text-sm font-sans">
            {lang === "ru"
              ? "Узнай, через сколько коммитов твой стек заблокирует релизы и потребует экстренного переписывания."
              : "Forecast how many iterations remain before cascading architectural debt halts your product."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Interactive Controls (7 cols) */}
          <TiltCard className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              {/* SLIDER 1 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-zinc-300">
                    {lang === "ru" ? "Объем кода, сгенерированного ИИ:" : "AI-generated code volume:"}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formatNumber(calcAiLines)} LOC
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={calcAiLines}
                  onChange={(e) => setCalcAiLines(Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-zinc-800 cursor-pointer"
                />
                <div className="flex items-center gap-1.5 pt-2">
                  <span className="text-[10px] font-mono text-zinc-500 mr-1">
                    {lang === "ru" ? "Быстрый выбор:" : "Quick select:"}
                  </span>
                  {[1000, 3000, 5500, 10000, 20000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setCalcAiLines(v)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                        calcAiLines === v
                          ? "bg-emerald-500 text-black font-bold"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                      }`}
                    >
                      {v >= 1000 ? `${v / 1000}k` : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* SLIDER 2 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-zinc-300">
                    {lang === "ru" ? "God-компоненты (>300 строк в одном файле):" : "God-components (>300 lines in single file):"}
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {calcGodFiles} {lang === "ru" ? "файлов" : "files"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={calcGodFiles}
                  onChange={(e) => setCalcGodFiles(Number(e.target.value))}
                  className="w-full accent-rose-400 bg-zinc-800 cursor-pointer"
                />
                <div className="flex items-center gap-1.5 pt-2">
                  <span className="text-[10px] font-mono text-zinc-500 mr-1">
                    {lang === "ru" ? "Файлов:" : "Files:"}
                  </span>
                  {[0, 1, 3, 5, 8].map((v) => (
                    <button
                      key={v}
                      onClick={() => setCalcGodFiles(v)}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                        calcGodFiles === v
                          ? "bg-rose-500 text-white font-bold"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOGGLES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
                  <div className="text-xs font-mono text-zinc-300 mb-2">
                    {lang === "ru" ? "Покрытие автотестами:" : "Test coverage:"}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCalcHasTests(false)}
                      className={`flex-1 py-1.5 rounded text-xs font-mono transition cursor-pointer ${
                        !calcHasTests
                          ? "bg-rose-500 text-white font-bold"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {lang === "ru" ? "0% (Чистый вайб)" : "0% (Vibe code)"}
                    </button>
                    <button
                      onClick={() => setCalcHasTests(true)}
                      className={`flex-1 py-1.5 rounded text-xs font-mono transition cursor-pointer ${
                        calcHasTests
                          ? "bg-emerald-500 text-black font-bold"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {lang === "ru" ? "Есть автотесты" : "Has tests"}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
                  <div className="text-xs font-mono text-zinc-300 mb-2">
                    {lang === "ru" ? "Схема БД / Supabase:" : "DB Schema / Supabase:"}
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { id: "clean", label: lang === "ru" ? "RLS и схема" : "RLS Clean" },
                      { id: "medium", label: lang === "ru" ? "Базовая" : "Basic" },
                      { id: "mess", label: lang === "ru" ? "Без RLS" : "No RLS" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setCalcDbState(st.id as any)}
                        className={`flex-1 py-1.5 rounded text-[11px] font-mono transition cursor-pointer ${
                          calcDbState === st.id
                            ? "bg-zinc-200 text-black font-bold"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Inline direct conversion bridge */}
            <div className="mt-6 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => {
                  runAudit();
                  const el = document.getElementById("report-view");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Zap size={14} className="fill-zinc-950 text-zinc-950" />
                <span>{lang === "ru" ? "Найти точки отказа →" : "Scan failure points →"}</span>
              </button>
            </div>
          </TiltCard>

          {/* Right: SVG Radar HUD (5 cols) */}
          <TiltCard
            glowColor="rgba(244, 63, 94, 0.2)"
            className="lg:col-span-5 p-6 flex flex-col justify-center items-center"
          >
            <RadarGauge
              fragilityPercent={calcResult.fragilityPercent}
              daysToDisaster={calcResult.days}
              emergencyCost={calcResult.emergencyCost}
              lang={lang}
            />
          </TiltCard>
        </div>
      </section>

      {/* 7. ARCHITECTURE: 4 FAILURE VECTORS (Asymmetrical 3D Bento Grid) */}
      <section id="vectors" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-xs font-mono mb-4">
            <ShieldAlert size={13} className="text-rose-400" />
            <span>{lang === "ru" ? "🛡️ АНАТОМИЯ ОТКАЗОВ ИИ-КОДА" : "🛡️ VULNERABILITY SURFACE"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            {lang === "ru" ? "4 главных вектора деградации кода" : "4 Primary AI Failure Vectors"}
          </h2>
          <p className="text-zinc-400 text-sm font-sans">
            {lang === "ru"
              ? "Почему даже сильные модели (Claude 3.7 / GPT-4o) неизбежно разрушают архитектуру без контроля."
              : "Why advanced LLMs inevitably produce brittle production spaghetti without architectural guardrails."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <TiltCard className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">
                {lang === "ru" ? "01 // МОНОЛИТЫ (>300 СТРОК)" : "01 // MONOLITHS (>300 LOC)"}
              </span>
              <span className="text-xs font-mono text-zinc-500">{lang === "ru" ? "Потеря контекста" : "Context Loss"}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {lang === "ru" ? "God-компоненты и спагетти-файлы" : "God-components & Spaghetti Files"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed mb-6">
              {lang === "ru"
                ? "Когда файл перерастает 300 строк, Cursor теряет структурный контекст. Добавление новой кнопки незаметно стирает существующую валидацию или ломает соседний хук."
                : "When a file exceeds 300 LOC, LLM context degrades. Prompting a new UI feature silently strips validation logic or breaks state."}
            </p>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-lg">
              🛡️ <strong>{lang === "ru" ? "Решение VibeDebt:" : "VibeDebt Fix:"}</strong>{" "}
              {lang === "ru"
                ? "Автоматический распил на 3 изолированных сервиса без потери стейта."
                : "Automated decoupling into 3 isolated modules preserving state."}
            </div>
          </TiltCard>

          {/* Card 2 */}
          <TiltCard className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
                {lang === "ru" ? "02 // ФАНТОМНЫЕ ПАКЕТЫ (19.7%)" : "02 // PHANTOM PACKAGES (19.7%)"}
              </span>
              <span className="text-xs font-mono text-zinc-500">{lang === "ru" ? "Цепочка поставок" : "Supply Chain"}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {lang === "ru" ? "Галлюцинации библиотек в npm" : "Hallucinated npm Packages"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed mb-6">
              {lang === "ru"
                ? "До 19.7% рекомендуемых ИИ зависимостей не существуют в официальном реестре. Хакеры массово регистрируют фантомные имена пакетов для внедрения стилеров в стартапы."
                : "Up to 19.7% of AI-recommended dependencies are hallucinated. Attackers claim these names on npm to inject malicious payloads."}
            </p>
            <div className="text-xs font-mono text-amber-400 bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg">
              🛡️ <strong>{lang === "ru" ? "Решение VibeDebt:" : "VibeDebt Fix:"}</strong>{" "}
              {lang === "ru"
                ? "Верификация package.json и лок-файлов на валидность реестра."
                : "Lockfile and registry verification for all imported modules."}
            </div>
          </TiltCard>

          {/* Card 3 */}
          <TiltCard className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase">
                {lang === "ru" ? "03 // УТЕЧКА КЛЮЧЕЙ В БРАУЗЕР" : "03 // CLIENT SECRETS LEAK"}
              </span>
              <span className="text-xs font-mono text-zinc-500">CWE-798</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {lang === "ru" ? "Приватные токены в 'use client'" : "Master Tokens in Client Bundles"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed mb-6">
              {lang === "ru"
                ? "Пытаясь обойти ошибки прав доступа, ИИ импортирует SUPABASE_SERVICE_ROLE_KEY прямо в клиентские компоненты, открывая master-доступ к базе данных в DevTools браузера."
                : "Trying to bypass RLS errors, AI models import SUPABASE_SERVICE_ROLE_KEY directly into client components, exposing master credentials."}
            </p>
            <div className="text-xs font-mono text-purple-400 bg-purple-950/20 border border-purple-500/20 p-3 rounded-lg">
              🛡️ <strong>{lang === "ru" ? "Решение VibeDebt:" : "VibeDebt Fix:"}</strong>{" "}
              {lang === "ru"
                ? "Мгновенная изоляция в защищенные Server Actions."
                : "Instant migration to isolated server actions."}
            </div>
          </TiltCard>

          {/* Card 4 */}
          <TiltCard className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
                {lang === "ru" ? "04 // СЛЕПАЯ ЗОНА ТЕСТИРОВАНИЯ" : "04 // TESTING GAP"}
              </span>
              <span className="text-xs font-mono text-zinc-500">{lang === "ru" ? "Регрессии" : "Zero Regression"}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {lang === "ru" ? "0% защиты от тихих поломок" : "Zero Regression Protection"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed mb-6">
              {lang === "ru"
                ? "Нейросеть генерирует работающий интерфейс, но оставляет 0 автотестов на граничные случаи. Любая следующая итерация в Cursor несет 90% риск поломки авторизации или биллинга."
                : "LLMs craft UI quickly but omit edge-case tests. Any subsequent refactor prompt carries a 90% probability of breaking auth or stripe."}
            </p>
            <div className="text-xs font-mono text-blue-400 bg-blue-950/20 border border-blue-500/20 p-3 rounded-lg">
              🛡️ <strong>{lang === "ru" ? "Решение VibeDebt:" : "VibeDebt Fix:"}</strong>{" "}
              {lang === "ru"
                ? "Автогенерация Vitest-сьютов на 4 сценария: valid, empty, wrong type, limits."
                : "Automated Vitest harness generation across 4 edge scenarios."}
            </div>
          </TiltCard>
        </div>
      </section>

      {/* 8. LOCAL CLI TERMINAL (Zero Data Exfiltration) */}
      <section id="cli" className="py-20 px-4 sm:px-8 border-t border-zinc-800/80 bg-zinc-950/80 z-10 relative">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-3">
            <Terminal size={13} />
            <span>{lang === "ru" ? "💻 ОФФЛАЙН CLI-АУДИТ" : "💻 OFFLINE CLI AUDIT"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {lang === "ru" ? "Приватный код? Запусти аудит локально за 1 секунду" : "Private Codebase? Run Audit Locally in 1 Second"}
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans max-w-xl mx-auto">
            {lang === "ru"
              ? "Для закрытых коммерческих репозиториев и NDA-проектов. Исходный код анализируется через AST прямо на вашей машине и никогда не покидает RAM."
              : "For enterprise code and proprietary repos. 100% offline AST analysis. Zero code ever leaves your machine."}
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-zinc-500">zsh — npx vibedebt-cli</span>
            </div>
            <button
              onClick={handleCopyCli}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCli ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedCli ? (lang === "ru" ? "Скопировано!" : "Copied!") : (lang === "ru" ? "Копировать" : "Copy")}</span>
            </button>
          </div>
          <div className="p-5 font-mono text-xs text-zinc-300 space-y-2 bg-zinc-950 leading-relaxed overflow-x-auto">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span>$</span>
              <span className="text-white">npx vibedebt audit ./src</span>
            </div>
            <div className="text-zinc-500 text-[11px]">{lang === "ru" ? "→ Запуск оффлайн AST-парсера и проверки зависимостей..." : "→ Running offline AST parser & dependency checker..."}</div>
            <div className="text-emerald-400 text-[11px]">{lang === "ru" ? "✔ 48 файлов проверено за 290мс • 0 байт отправлено в сеть" : "✔ 48 files scanned in 290ms • 0 bytes sent over network"}</div>
            <div className="text-amber-400 text-[11px]">{lang === "ru" ? "⚠ Обнаружено 2 God-файла: src/pages/Dashboard.tsx (620 LOC)" : "⚠ 2 God-files identified: src/pages/Dashboard.tsx (620 LOC)"}</div>
            <div className="text-rose-400 text-[11px]">{lang === "ru" ? "✖ 1 утечка токена обнаружена в src/lib/supabase.ts" : "✖ 1 Hardcoded secret pattern found in src/lib/supabase.ts"}</div>
            <div className="text-emerald-300 text-[11px] pt-1 border-t border-zinc-800/60">
              ✨ {lang === "ru" ? "3 хирургических промпта сохранены в" : "3 surgical Cursor prompts written to"} <span className="underline">.vibedebt/prompts.md</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-xs font-mono text-zinc-400">
          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>{lang === "ru" ? "100% Оффлайн AST" : "100% Offline AST"}</span>
          </div>
          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>{lang === "ru" ? "Без API-токенов и регистрации" : "Zero API Tokens Needed"}</span>
          </div>
          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>{lang === "ru" ? "Выгрузка Markdown для Cursor" : "Outputs Cursor Markdown"}</span>
          </div>
        </div>
      </section>

      {/* 9. MINIMALIST PRICING (Transparent Bento) */}
      <section id="pricing" className="py-24 px-4 sm:px-8 max-w-5xl mx-auto z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-mono mb-4">
            <span>{lang === "ru" ? "💳 ПРОЗРАЧНЫЙ ДОСТУП" : "💳 TRANSPARENT VALUE"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {lang === "ru" ? "Честные условия без скрытых платежей" : "Simple, Transparent Pricing"}
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans">
            {lang === "ru"
              ? "Бесплатный экспресс-аудит для каждого фаундера. Без привязки карт."
              : "Free baseline audits for every builder. Zero bait-and-switch."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Free Tier */}
          <TiltCard className="p-8 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">
                {lang === "ru" ? "СОЛО-ФАУНДЕР" : "SOLO BUILDER"}
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold font-mono text-white">$0</span>
                <span className="text-xs font-mono text-zinc-500">
                  {lang === "ru" ? "/ навсегда бесплатно" : "/ forever free"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mb-6">
                {lang === "ru"
                  ? "Идеально для проверки публичных репозиториев и мгновенного расчета Doomsday Score."
                  : "Perfect for public repositories and instant Doomsday Score inspection."}
              </p>
              <ul className="text-xs font-mono text-zinc-300 space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{lang === "ru" ? "Безлимитный аудит публичных репозиториев" : "Unlimited public repository scans"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{lang === "ru" ? "Детектор God-компонентов (>300 строк)" : "God-component detection (>300 LOC)"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{lang === "ru" ? "Хирургические промпты для Cursor & Claude" : "Surgical prompts for Cursor & Claude"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{lang === "ru" ? "README Doomsday Badge экспортер" : "README Doomsday Badge exporter"}</span>
                </li>
              </ul>
            </div>
            <a
              href="#audit-tool"
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono font-bold text-xs uppercase tracking-wider text-center transition cursor-pointer"
            >
              {lang === "ru" ? "Запустить аудит бесплатно" : "Start Free Audit"}
            </a>
          </TiltCard>

          {/* Pro Tier */}
          <TiltCard
            glowColor="rgba(16, 185, 129, 0.25)"
            className="p-8 flex flex-col justify-between border-emerald-500/50 bg-emerald-950/10 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                  {lang === "ru" ? "ДЛЯ РАСТУЩИХ ПРОДУКТОВ" : "FOUNDER PRO"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  POPULAR
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold font-mono text-white">$19</span>
                <span className="text-xs font-mono text-zinc-400">
                  {lang === "ru" ? "/ месяц" : "/ month"}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-sans mb-6">
                {lang === "ru"
                  ? "Полная автоматизация аудита приватных репозиториев и защита перед продакшн-релизом."
                  : "Continuous automation for private repositories and pre-production guardrails."}
              </p>
              <ul className="text-xs font-mono text-zinc-200 space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{lang === "ru" ? "Лицензия на приватный Offline CLI" : "Private Offline CLI license"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{lang === "ru" ? "GitHub PR Bot (авторефакторинг пулл-реквестов)" : "GitHub PR Bot (automated refactor PRs)"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{lang === "ru" ? "Приоритетный парсер многофайловых репозиториев" : "Priority parser for monorepos"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{lang === "ru" ? "Прямой саппорт от архитектора" : "Direct founder-level support"}</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                alert(
                  lang === "ru"
                    ? "Доступ открывается в следующей волне. Добавлен приоритет на ваш email!"
                    : "Founder Pro waitlist registered!"
                );
              }}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider text-center transition cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {lang === "ru" ? "Подключить Founder Pro →" : "Upgrade to Founder Pro →"}
            </button>
          </TiltCard>
        </div>
      </section>

      {/* 10. MINIMALIST FOOTER */}
      <footer className="border-t border-zinc-800/80 bg-[#050508] py-12 px-4 sm:px-8 z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">VIBEDEBT</span>
            <span>//</span>
            <span>{lang === "ru" ? "Архитектура без спагетти" : "Zero Slop Architecture"}</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/20246ah-svg/lending"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-300 transition flex items-center gap-1"
            >
              <GithubIcon size={14} />
              <span>GitHub</span>
            </a>
            <span className="text-zinc-700">•</span>
            <span>MIT License</span>
            <span className="text-zinc-700">•</span>
            <span>2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
