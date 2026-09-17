"use client";

import React, { useState } from "react";
import { CopyIcon, CheckIcon, SparklesIcon, ShieldAlertIcon, FileCodeIcon } from "@/components/icons";

interface CodeShowcaseProps {
  lang?: "ru" | "en";
}

export default function CodeShowcase({ lang = "ru" }: CodeShowcaseProps) {
  const [activeTab, setActiveTab] = useState<"leak" | "loop" | "prompt">("leak");
  const [copied, setCopied] = useState(false);

  const samplePrompt = `Ты — Senior Refactoring Agent в Cursor / Claude 3.7.
Цель: безопасно декомпозировать God-компонент 'dashboard/page.tsx' (2420 строк) и изолировать приватный master-токен:

1. Вынеси обращение к SUPABASE_SERVICE_ROLE_KEY из клиентского компонента в изолированный Server Action 'app/actions/billing.ts' с директивой 'use server'.
2. Разбей монолит на 3 модульных компонента в '/components/dashboard/':
   - 'DashboardMetrics.tsx'
   - 'OrdersTable.tsx'
   - 'SettingsModal.tsx'
3. Вынеси общий стейт в кастомный хук 'useDashboardState.ts'.
4. Напиши Vitest-тесты на 4 граничных сценария. Верни полный рабочий код без сокращений.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(samplePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-zinc-800 bg-[#09090d] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden text-left font-mono">
      {/* Window Titlebar */}
      <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 text-zinc-400 font-sans font-medium text-[11px] sm:text-xs">
            VibeDebt Inspector — {activeTab === "prompt" ? "cursor-composer-prompt.md" : "src/dashboard/page.tsx"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-rose-400 font-bold hidden sm:inline">
            {lang === "ru" ? "DOOMSDAY 88% (КРИТИЧЕСКИЙ РИСК)" : "DOOMSDAY 88% (CRITICAL RISK)"}
          </span>
        </div>
      </div>

      {/* Editor Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/60 text-xs px-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("leak")}
          className={`px-3.5 py-2.5 flex items-center gap-2 border-b-2 font-medium transition cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
            activeTab === "leak"
              ? "border-rose-500 text-rose-300 bg-rose-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ShieldAlertIcon size={13} className="text-rose-400" />
          <span>dashboard/page.tsx</span>
          <span className="px-1.5 py-0.2 text-[9px] rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {lang === "ru" ? "Утечка ключа" : "Secret Leak"}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("loop")}
          className={`px-3.5 py-2.5 flex items-center gap-2 border-b-2 font-medium transition cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
            activeTab === "loop"
              ? "border-amber-500 text-amber-300 bg-amber-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileCodeIcon size={13} className="text-amber-400" />
          <span>CheckoutForm.tsx</span>
          <span className="px-1.5 py-0.2 text-[9px] rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {lang === "ru" ? "Петля useEffect" : "Loop"}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("prompt")}
          className={`px-3.5 py-2.5 flex items-center gap-2 border-b-2 font-medium transition cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ml-auto ${
            activeTab === "prompt"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-emerald-400/80 hover:text-emerald-300"
          }`}
        >
          <SparklesIcon size={13} className="text-emerald-400" />
          <span className="font-bold">{lang === "ru" ? "Хирургический промпт для Cursor" : "Surgical Prompt"}</span>
        </button>
      </div>

      {/* Code Editor Body */}
      <div className="p-4 sm:p-6 text-xs text-zinc-300 overflow-x-auto leading-relaxed bg-[#060609]">
        {activeTab === "leak" && (
          <div className="space-y-1">
            <div className="flex gap-4 opacity-50">
              <span className="w-6 text-right select-none text-zinc-600">1</span>
              <span><span className="text-cyan-400">&quot;use client&quot;</span>;</span>
            </div>
            <div className="flex gap-4 opacity-50">
              <span className="w-6 text-right select-none text-zinc-600">2</span>
              <span><span className="text-purple-400">import</span> React, &#123; useState, useEffect &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">&quot;react&quot;</span>;</span>
            </div>
            <div className="flex gap-4 opacity-50">
              <span className="w-6 text-right select-none text-zinc-600">3</span>
              <span><span className="text-purple-400">import</span> &#123; createClient &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">&quot;@supabase/supabase-js&quot;</span>;</span>
            </div>
            <div className="flex gap-4 opacity-50">
              <span className="w-6 text-right select-none text-zinc-600">4</span>
              <span></span>
            </div>
            {/* Vulnerability Alert Box */}
            <div className="my-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlertIcon size={14} className="text-rose-400 shrink-0" />
                <span>
                  <strong>CWE-798:</strong> {lang === "ru" ? "Секретный мастер-ключ экспортирован в клиентский бандл браузера!" : "Hardcoded master service role key in client bundle!"}
                </span>
              </div>
              <button
                onClick={() => setActiveTab("prompt")}
                className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-[10px] text-rose-200 transition cursor-pointer"
              >
                {lang === "ru" ? "Исправить →" : "Fix →"}
              </button>
            </div>
            <div className="flex gap-4 bg-rose-950/20 border-l-2 border-rose-500 pl-1 py-0.5">
              <span className="w-6 text-right select-none text-rose-400">5</span>
              <span><span className="text-purple-400">const</span> supabase = <span className="text-yellow-300">createClient</span>(</span>
            </div>
            <div className="flex gap-4 bg-rose-950/20 border-l-2 border-rose-500 pl-1 py-0.5">
              <span className="w-6 text-right select-none text-rose-400">6</span>
              <span>  process.env.<span className="text-emerald-300">NEXT_PUBLIC_SUPABASE_URL</span>!,</span>
            </div>
            <div className="flex gap-4 bg-rose-950/30 border-l-2 border-rose-500 pl-1 py-0.5 font-bold">
              <span className="w-6 text-right select-none text-rose-400">7</span>
              <span>  process.env.<span className="text-rose-400 underline decoration-rose-500">SUPABASE_SERVICE_ROLE_KEY</span>! <span className="text-rose-400 font-normal">{"// ❌ Утечка master-ключа!"}</span></span>
            </div>
            <div className="flex gap-4 bg-rose-950/20 border-l-2 border-rose-500 pl-1 py-0.5">
              <span className="w-6 text-right select-none text-rose-400">8</span>
              <span>);</span>
            </div>
            <div className="flex gap-4 opacity-50">
              <span className="w-6 text-right select-none text-zinc-600">9</span>
              <span></span>
            </div>
            <div className="flex gap-4 opacity-75">
              <span className="w-6 text-right select-none text-zinc-600">10</span>
              <span><span className="text-purple-400">export default function</span> <span className="text-blue-400">Dashboard</span>() &#123;</span>
            </div>
            <div className="flex gap-4 text-amber-400/80">
              <span className="w-6 text-right select-none text-zinc-600">11</span>
              <span>  <span className="text-zinc-500">{"// ⚠️ God-компонент: 2420 строк, 14 вызовов useState, биллинг и модалки"}</span></span>
            </div>
            <div className="flex gap-4 opacity-50">
              <span className="w-6 text-right select-none text-zinc-600">12</span>
              <span>  <span className="text-purple-400">const</span> [orders, setOrders] = <span className="text-yellow-300">useState</span>([]);</span>
            </div>
          </div>
        )}

        {activeTab === "loop" && (
          <div className="space-y-1">
            <div className="flex gap-4 opacity-50">
              <span className="w-6 text-right select-none text-zinc-600">1</span>
              <span><span className="text-purple-400">export default function</span> <span className="text-blue-400">CheckoutForm</span>(&#123; planId &#125;) &#123;</span>
            </div>
            <div className="flex gap-4 opacity-50">
              <span className="w-6 text-right select-none text-zinc-600">2</span>
              <span>  <span className="text-purple-400">const</span> [filters, setFilters] = <span className="text-yellow-300">useState</span>(&#123; tier: <span className="text-emerald-400">&quot;pro&quot;</span> &#125;);</span>
            </div>
            <div className="flex gap-4 opacity-50">
              <span className="w-6 text-right select-none text-zinc-600">3</span>
              <span></span>
            </div>
            <div className="my-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>
                  <strong>CWE-400:</strong> {lang === "ru" ? "Бесконечная петля: объект 'filters' пересоздается при каждом рендере!" : "Infinite loop: 'filters' object is recreated every render!"}
                </span>
              </div>
              <button
                onClick={() => setActiveTab("prompt")}
                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] text-amber-200 transition cursor-pointer"
              >
                {lang === "ru" ? "Исправить →" : "Fix →"}
              </button>
            </div>
            <div className="flex gap-4 bg-amber-950/20 border-l-2 border-amber-500 pl-1 py-0.5">
              <span className="w-6 text-right select-none text-amber-400">4</span>
              <span>  <span className="text-yellow-300">useEffect</span>(() =&gt; &#123;</span>
            </div>
            <div className="flex gap-4 bg-amber-950/20 border-l-2 border-amber-500 pl-1 py-0.5 font-bold">
              <span className="w-6 text-right select-none text-amber-400">5</span>
              <span>    <span className="text-blue-400">recalculatePricing</span>(filters); <span className="text-amber-400 font-normal">{"// ❌ Вызывает 20+ запросов в секунду"}</span></span>
            </div>
            <div className="flex gap-4 bg-amber-950/20 border-l-2 border-amber-500 pl-1 py-0.5">
              <span className="w-6 text-right select-none text-amber-400">6</span>
              <span>  &#125;, [filters]); <span className="text-zinc-500">{"// ссылка на объект меняется каждый такт"}</span></span>
            </div>
          </div>
        )}

        {activeTab === "prompt" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-400 text-xs">
                <SparklesIcon size={14} />
                <span>{lang === "ru" ? "Сгенерированный хирургический промпт (Cursor / Claude 3.7)" : "Surgical Prompt for Cursor / Claude 3.7"}</span>
              </div>
              <button
                onClick={handleCopyPrompt}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                <span>{copied ? (lang === "ru" ? "Скопировано!" : "Copied!") : (lang === "ru" ? "Скопировать в Cursor" : "Copy to Cursor")}</span>
              </button>
            </div>
            <pre className="text-zinc-300 font-mono text-[11px] sm:text-xs leading-relaxed whitespace-pre-wrap bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              {samplePrompt}
            </pre>
          </div>
        )}
      </div>

      {/* Showcase Bottom HUD Bar */}
      <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="text-rose-400">●</span>
            <span>{lang === "ru" ? "До краха: 11 коммитов" : "TTD: 11 commits"}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-purple-400">●</span>
            <span>{lang === "ru" ? "Хрупкость: 92%" : "Fragility: 92%"}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">●</span>
            <span>{lang === "ru" ? "Цена сеньора: $4,800" : "Contractor fix: $4,800"}</span>
          </span>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById("audit-tool");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-emerald-400 hover:text-emerald-300 text-[11px] underline underline-offset-4 cursor-pointer font-sans"
        >
          {lang === "ru" ? "Проверить свой репозиторий прямо сейчас →" : "Scan your repo right now →"}
        </button>
      </div>
    </div>
  );
}
