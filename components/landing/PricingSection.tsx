"use client";

import React, { useState } from "react";
import TiltCard from "@/components/ui/TiltCard";
import AuditOrderModal from "@/components/landing/AuditOrderModal";
import { i18n } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

interface PricingSectionProps {
  lang: "ru" | "en";
}

export default function PricingSection({ lang }: PricingSectionProps) {
  const t = i18n[lang];
  const isRu = lang === "ru";
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"concierge" | "due_diligence">("due_diligence");

  const handleOpenOrder = (tier: "concierge" | "due_diligence") => {
    setSelectedTier(tier);
    trackEvent("pricing_tier_clicked", { tier });
    setOrderModalOpen(true);
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-8 max-w-6xl mx-auto z-10 relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-mono mb-4">
          <span>{t.pricingBadge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          {t.pricingTitle}
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm font-sans">
          {t.pricingSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Tier 1: Free Express Scan */}
        <TiltCard className="p-6 sm:p-8 flex flex-col justify-between border-zinc-800 bg-zinc-950/60">
          <div>
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">
              {isRu ? "ЭКСПРЕСС-СКАНИРОВАНИЕ" : "EXPRESS SCAN"}
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-extrabold font-mono text-white">$0</span>
              <span className="text-xs font-mono text-zinc-500">
                {isRu ? "/ навсегда бесплатно" : "/ forever free"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mb-6">
              {isRu
                ? "Мгновенный эвристический аудит публичных репозиториев и сниппетов кода."
                : "Instant heuristic audit for public GitHub repositories and pasted snippets."}
            </p>
            <ul className="text-xs font-mono text-zinc-300 space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{isRu ? "Безлимитный скан публичных репо" : "Unlimited public repo scans"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{isRu ? "Расчет Doomsday Score за 1 сек" : "Instant Doomsday Score & horizon"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{isRu ? "Хирургические промпты для Cursor" : "Surgical prompts for Cursor"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{isRu ? "Шеринг карточки в X и README бейдж" : "X/Twitter share card & badge"}</span>
              </li>
            </ul>
          </div>
          <a
            href="#audit-tool"
            onClick={() => trackEvent("pricing_tier_clicked", { tier: "free" })}
            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono font-bold text-xs uppercase tracking-wider text-center transition cursor-pointer"
          >
            {isRu ? "Запустить бесплатно" : "Start Free Scan"}
          </a>
        </TiltCard>

        {/* Tier 2: Founder Concierge ($49) */}
        <TiltCard
          glowColor="rgba(56, 189, 248, 0.2)"
          className="p-6 sm:p-8 flex flex-col justify-between border-cyan-500/30 bg-cyan-950/10"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
                {isRu ? "КОНСЬЕРЖ-АУДИТ" : "FOUNDER CONCIERGE"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                24H SLA
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-extrabold font-mono text-white">$49</span>
              <span className="text-xs font-mono text-zinc-400">
                {isRu ? "/ разовый аудит" : "/ one-time audit"}
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans mb-6">
              {isRu
                ? "Ручной аудит приватного репозитория или zip-архива senior-архитектором."
                : "Manual private repository or zip audit by senior software architect."}
            </p>
            <ul className="text-xs font-mono text-zinc-200 space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                <span>{isRu ? "Глубокий разбор под взаимным NDA" : "Private codebase under mutual NDA"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                <span>{isRu ? "ТОП-3 скрытых точки отказа" : "TOP-3 critical failure points"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                <span>{isRu ? "Готовый пакет промптов под Claude 3.7" : "Custom prompt pack for Claude 3.7"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                <span>{isRu ? "Повторная проверка после фикса" : "Free re-audit after refactoring"}</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleOpenOrder("concierge")}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider text-center transition cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            {isRu ? "Заказать консьерж-аудит ($49) →" : "Order Concierge ($49) →"}
          </button>
        </TiltCard>

        {/* Tier 3: M&A Tech Due Diligence ($149) */}
        <TiltCard
          glowColor="rgba(16, 185, 129, 0.25)"
          className="p-6 sm:p-8 flex flex-col justify-between border-emerald-500/60 bg-emerald-950/15 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative"
        >
          <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-mono font-extrabold uppercase tracking-wider">
            {isRu ? "ДЛЯ ПОКУПАТЕЛЕЙ" : "FOR BUYERS"}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                {isRu ? "M&A DUE DILIGENCE" : "M&A DUE DILIGENCE"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                48H SLA
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-extrabold font-mono text-white">$149</span>
              <span className="text-xs font-mono text-zinc-400">
                {isRu ? "/ отчет по сделке" : "/ per acquisition"}
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-sans mb-6">
              {isRu
                ? "4-страничный технический отчет перед покупкой на Acquire.com / Microns."
                : "4-page comprehensive technical audit before acquiring on Acquire.com / Microns."}
            </p>
            <ul className="text-xs font-mono text-zinc-200 space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{isRu ? "Полный 4-страничный PDF + Loom видео" : "4-page PDF report + Loom walkthrough"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{isRu ? "Supabase RLS аудит (CVE-2025-48757)" : "Supabase RLS bypass verification"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{isRu ? "Расчет CAPEX на стабилизацию" : "Stabilization CAPEX estimate"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{isRu ? "12 вопросов продавцу для торга" : "12 seller questions & discount formula"}</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleOpenOrder("due_diligence")}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider text-center transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            {isRu ? "Заказать Due Diligence ($149) →" : "Order Due Diligence ($149) →"}
          </button>
        </TiltCard>
      </div>

      <AuditOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        lang={lang}
        initialTier={selectedTier}
      />
    </section>
  );
}
