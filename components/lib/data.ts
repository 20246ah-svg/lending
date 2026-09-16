import type { AuditReport } from "./types";

/* ------------------------------------------------------------------
   Demo report — used until the visitor runs their own audit.
   Mirrors the exact payload produced by /api/audit (archetype: cursor-saas).
   ------------------------------------------------------------------ */
export const DEFAULT_REPORT: AuditReport = {
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

/* ------------------------------------------------------------------
   One-click sample snippet for the "paste code" tab.
   ------------------------------------------------------------------ */
export const SAMPLE_BAD_SNIPPET = `"use client";
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

  if (loading) return <div className="p-8 animate-pulse">Загрузка дашборда...</div>;

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-3xl font-bold text-white">Панель заказов</h1>
      {data?.map((order: any) => (
        <div key={order.id} className="p-4 border-b border-zinc-800">
          {order.customer_name} — {order.total_price} ₽
        </div>
      ))}
    </div>
  );
}`;

/* Shape of a one-click demo archetype (label/badge text lives in copy.ts). */
export interface PresetMeta {
  id: string;
  name: string;
  score: number;
  tone: "critical" | "elevated" | "healthy";
}

export const PRESETS: PresetMeta[] = [
  { id: "cursor-saas", name: "AI SaaS (Cursor)", score: 89, tone: "critical" },
  { id: "bolt-landing", name: "E-Commerce (Bolt.new)", score: 64, tone: "elevated" },
  { id: "crypto-bot", name: "TG Bot (ChatGPT o3)", score: 96, tone: "critical" },
];

/* Tools that founders actually build with — hero marquee. */
export const BUILD_TOOLS = [
  "Cursor",
  "Claude Code",
  "Bolt.new",
  "Lovable",
  "v0",
  "Windsurf",
  "Replit Agent",
  "GitHub Copilot",
  "Devin",
  "Same.new",
];
