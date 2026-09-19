"use client";

import React, { useState } from "react";
import ParticleBackground from "@/components/canvas/ParticleBackground";
import KineticTicker from "@/components/ui/KineticTicker";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import AuditWorkbench from "@/components/landing/AuditWorkbench";
import FailureVectors from "@/components/landing/FailureVectors";
import DueDiligenceSection from "@/components/landing/DueDiligenceSection";
import CliSection from "@/components/landing/CliSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";
import AuditOrderModal from "@/components/landing/AuditOrderModal";
import DueDiligenceSampleModal from "@/components/landing/DueDiligenceSampleModal";
import { AuditReport, AuditRequestBody } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

const SAMPLE_DEMO_REPORT: AuditReport = {
  title: "AI Micro-SaaS (Cursor + Claude 3.7)",
  repoName: "founder/instant-ai-landing-builder",
  isRealRepo: false,
  doomsdayScore: 88,
  timeToCollapse: "11 коммитов или 2 одновременных Stripe вебхука",
  estimatedFixCost: 4800,
  criticalBugsCount: 3,
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
      sampleBadCode: `"use client";\nconst supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);`,
      sampleFix: `"use server";\nimport { createAdminClient } from "@/lib/supabase/admin";\nexport async function updateRole() { ... }`,
    },
    {
      title: "Бесконечная петля ререндеров в useEffect",
      cwe: "CWE-400",
      description:
        "Курсор поместил новый объект filters в зависимости хука без useCallback/useMemo. При каждом рендере ссылка обновляется, порождая 20+ запросов к БД в секунду.",
      severity: "HIGH",
      detectedIn: "components/PricingCalculator.tsx:89",
      sampleBadCode: `useEffect(() => { fetchUserData(filters); }, [filters]);`,
      sampleFix: `const key = useMemo(() => JSON.stringify(filters), [filters]);\nuseEffect(() => { fetchUserData(filters); }, [key]);`,
    },
  ],
  refactorSteps: [
    {
      step: 1,
      title: "Хирургический распил God-компонента app/page.tsx (2420 строк)",
      estimatedTime: "20 минут",
      targetTool: "Cursor Composer",
      prompt: `Ты — Senior Refactoring Agent в Cursor. Безопасно разбей God-компонент 'app/page.tsx' на модули в '/components/landing/'. Сохрани стейт и интерфейсы без 'any'.`,
    },
  ],
  diagnosticsSummary: "Обнаружен критический файл на 2420 строк, утечка ключей и 0 автотестов.",
};

export default function Home() {
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderTier, setOrderTier] = useState<"concierge" | "due_diligence">("due_diligence");
  const [sampleModalOpen, setSampleModalOpen] = useState(false);

  const handleOpenOrder = (tier: "concierge" | "due_diligence") => {
    setOrderTier(tier);
    setOrderModalOpen(true);
  };

  const runAudit = async (payload: AuditRequestBody) => {
    setIsAuditing(true);
    setErrorMessage(null);
    const startTime = Date.now();
    const mode = payload.url ? "github" : payload.liveUrl ? "live" : payload.snippet ? "snippet" : "archetype";

    setAuditProgress(
      lang === "ru"
        ? payload.liveUrl
          ? "Сканирование клиентских JS-бандлов, заголовков и конфигурации Supabase..."
          : "Подключение к анализатору кода и инспекция зависимостей..."
        : payload.liveUrl
          ? "Inspecting client-side JS bundles, headers & Supabase configuration..."
          : "Connecting to code analyzer & inspecting dependencies..."
    );

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, lang }),
      });

      const json = await res.json();
      const elapsed = Date.now() - startTime;

      if (!res.ok || json.error) {
        const err = json.error || (lang === "ru" ? "Не удалось завершить аудит." : "Audit failed.");
        setErrorMessage(err);
        trackEvent("scan_failed", {
          mode,
          error: String(err).slice(0, 80),
          duration_ms: elapsed,
        });
      } else if (json.data) {
        setAuditReport(json.data);
        trackEvent("scan_completed", {
          mode,
          score: json.data.doomsdayScore,
          critical: json.data.criticalBugsCount,
          is_real: Boolean(json.data.isRealRepo),
          duration_ms: elapsed,
        });
        setTimeout(() => {
          const el = document.getElementById("report-view");
          el?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    } catch {
      const elapsed = Date.now() - startTime;
      const err = lang === "ru"
        ? "Ошибка соединения при обращении к серверу аудита."
        : "Network connection error reaching audit engine.";
      setErrorMessage(err);
      trackEvent("scan_failed", {
        mode,
        error: "network_error",
        duration_ms: elapsed,
      });
    } finally {
      setIsAuditing(false);
      setAuditProgress("");
    }
  };

  const handleLoadSample = () => {
    setAuditReport(SAMPLE_DEMO_REPORT);
    setTimeout(() => {
      const el = document.getElementById("report-view");
      el?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      <ParticleBackground />
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-30 z-0" />

      <Header lang={lang} setLang={setLang} />

      <HeroSection
        lang={lang}
        isAuditing={isAuditing}
        auditProgress={auditProgress}
        errorMessage={errorMessage}
        onRunAudit={runAudit}
        onLoadSample={handleLoadSample}
      />

      <KineticTicker lang={lang} />

      {auditReport && <AuditWorkbench report={auditReport} lang={lang} />}

      <FailureVectors lang={lang} />

      <DueDiligenceSection
        lang={lang}
        onOpenOrder={handleOpenOrder}
        onViewSample={() => setSampleModalOpen(true)}
      />

      <CliSection lang={lang} />

      <PricingSection lang={lang} />

      <Footer lang={lang} />

      <AuditOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        lang={lang}
        initialTier={orderTier}
      />

      <DueDiligenceSampleModal
        isOpen={sampleModalOpen}
        onClose={() => setSampleModalOpen(false)}
        lang={lang}
        onOrderNow={() => handleOpenOrder("due_diligence")}
      />
    </div>
  );
}
