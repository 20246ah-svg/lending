"use client";

import React, { useState } from "react";
import TiltCard from "@/components/ui/TiltCard";
import WaitlistModal from "@/components/landing/WaitlistModal";
import { i18n } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

interface PricingSectionProps {
  lang: "ru" | "en";
}

export default function PricingSection({ lang }: PricingSectionProps) {
  const t = i18n[lang];
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="pricing" className="py-24 px-4 sm:px-8 max-w-5xl mx-auto z-10 relative">
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
            onClick={() => trackEvent("pricing_tier_clicked", { tier: "free" })}
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                EARLY ACCESS
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
                ? "Автоматизация аудита приватных репозиториев и защита перед продакшн-релизом."
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
              trackEvent("pricing_tier_clicked", { tier: "pro" });
              setModalOpen(true);
            }}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider text-center transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            {lang === "ru" ? "Получить доступ к Founder Pro →" : "Get Founder Pro Access →"}
          </button>
        </TiltCard>
      </div>

      <WaitlistModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lang={lang}
      />
    </section>
  );
}
