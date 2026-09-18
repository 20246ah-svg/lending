"use client";

import React from "react";
import TiltCard from "@/components/ui/TiltCard";
import { ShieldAlertIcon, CheckIcon, XCircleIcon, SparklesIcon, ZapIcon } from "@/components/icons";
import { trackEvent } from "@/lib/analytics";

interface DueDiligenceSectionProps {
  lang: "ru" | "en";
  onOpenOrder: (tier: "concierge" | "due_diligence") => void;
  onViewSample: () => void;
}

export default function DueDiligenceSection({
  lang,
  onOpenOrder,
  onViewSample,
}: DueDiligenceSectionProps) {
  const isRu = lang === "ru";

  return (
    <section id="due-diligence" className="py-24 px-4 sm:px-8 max-w-6xl mx-auto z-10 relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs font-mono mb-4 backdrop-blur-md">
          <ShieldAlertIcon size={14} className="text-rose-400" />
          <span>{isRu ? "M&A ТЕХНИЧЕСКИЙ АУДИТ ДЛЯ ПОКУПАТЕЛЕЙ" : "PRE-ACQUISITION DUE DILIGENCE"}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-rose-400 font-bold">48H SLA</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          {isRu ? (
            <>
              Покупаете проект на Acquire.com? <br />
              <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-rose-300 bg-clip-text text-transparent">
                Не покупайте вайб-спагетти в мешке.
              </span>
            </>
          ) : (
            <>
              Buying an AI SaaS on Acquire.com? <br />
              <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-rose-300 bg-clip-text text-transparent">
                Don&apos;t acquire a vibe-coded lemon.
              </span>
            </>
          )}
        </h2>

        <p className="text-zinc-400 text-sm sm:text-base font-sans leading-relaxed">
          {isRu
            ? "Платформы генерации сами себе ставят оценки за домашнее задание. Lovable и Bolt проверяют наличие галочек, а не защиту данных. Мы проводим независимую проверку перед закрытием эскроу и даем железобетонные аргументы для торга."
            : "AI platforms grade their own homework. Lovable checks whether a checkbox exists, not if your data is secure. We provide independent technical inspection before escrow release, armed with negotiation leverage."}
        </p>
      </div>

      {/* Side-by-side comparison: Seller Claim vs Reality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Left: What the Seller shows */}
        <TiltCard glowColor="rgba(244, 63, 94, 0.15)" className="p-6 sm:p-8 border-rose-500/20 bg-zinc-950/60">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                {isRu ? "ЧТО ПОКАЗЫВАЕТ ПРОДАВЕЦ" : "WHAT THE SELLER CLAIMS"}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              SMOKE TEST
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
              <CheckIcon size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white mb-0.5">
                  {isRu ? "«Lovable Security Scan: 100% Passed»" : "“Lovable Security Scan: 100% Passed”"}
                </div>
                <div className="text-zinc-400 text-[11px] font-sans">
                  {isRu
                    ? "Политика RLS формально включена, деплой прошел без предупреждений."
                    : "RLS is technically enabled, build passes with zero blocker warnings."}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
              <CheckIcon size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white mb-0.5">
                  {isRu ? "«MVP готов к масштабированию»" : "“MVP ready for scale”"}
                </div>
                <div className="text-zinc-400 text-[11px] font-sans">
                  {isRu
                    ? "12 000 строк кода, красивый UI на Tailwind и интеграция со Stripe."
                    : "12k LOC, sleek modern UI, responsive layout and Stripe connected."}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
              <CheckIcon size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white mb-0.5">
                  {isRu ? "«Все работает в браузере прямо сейчас»" : "“Everything works in browser today”"}
                </div>
                <div className="text-zinc-400 text-[11px] font-sans">
                  {isRu
                    ? "Покупатель видит работающее демо и переводит деньги в эскроу."
                    : "Buyer watches demo video and commits capital to escrow."}
                </div>
              </div>
            </div>
          </div>
        </TiltCard>

        {/* Right: What VibeDebt Uncovers */}
        <TiltCard glowColor="rgba(16, 185, 129, 0.2)" className="p-6 sm:p-8 border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                {isRu ? "ЧТО НАХОДИТ ТЕХНИЧЕСКИЙ АУДИТ VIBEDEBT" : "WHAT VIBEDEBT AUDIT REVEALS"}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              INDEPENDENT DD
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <XCircleIcon size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-300 mb-0.5">
                  {isRu ? "Утечка RLS: USING (true) в базе данных" : "RLS Hole: USING (true) expression"}
                </div>
                <div className="text-zinc-300 text-[11px] font-sans">
                  {isRu
                    ? "Политика формально есть, но тело `USING (true)` отдает всю таблицу чужим анонимным ключом (CVE-2025-48757)."
                    : "Policy exists on paper, but expression `USING (true)` lets anyone scrape customer tables using the public anon key."}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <ShieldAlertIcon size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-300 mb-0.5">
                  {isRu ? "God-файл на 2400 строк + 0 тестов в CI" : "2,400 LOC God-File & 0 CI tests"}
                </div>
                <div className="text-zinc-300 text-[11px] font-sans">
                  {isRu
                    ? "Любое добавление новой фичи покупателем приведет к каскадному разрушению стейта. 0 тестов для защиты от регрессий."
                    : "Adding any new feature breaks existing payment flows. Zero regression test suites configured in CI."}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <SparklesIcon size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-emerald-300 mb-0.5">
                  {isRu ? "Оценка CAPEX: $4 800 на стабилизацию" : "Calculated CAPEX: $4,800 to fix"}
                </div>
                <div className="text-zinc-300 text-[11px] font-sans">
                  {isRu
                    ? "Готовая формула для торга: покупатель аргументированно снижает цену покупки на $5 000–$7 000."
                    : "Documented negotiation ammunition: buyer discounts offer price by $5,000–$7,000 based on verified tech debt."}
                </div>
              </div>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Action Banner */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1 font-bold">
            {isRu ? "48 ЧАСОВ ДО ВЫПЛАТЫ ЭСКРОУ" : "48 HOURS BEFORE ESCROW CLOSE"}
          </div>
          <h4 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
            {isRu ? "Закажите M&A Tech Due Diligence перед покупкой" : "Order Independent M&A Tech Due Diligence"}
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-sans">
            {isRu
              ? "Получите 4-страничный PDF-отчет, карту критических точек отказа в Supabase и точные вопросы продавцу за $149."
              : "Get a 4-page PDF audit report, Supabase vulnerability map, and negotiation ammunition for $149."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => {
              trackEvent("pricing_tier_clicked", { tier: "due_diligence" });
              onOpenOrder("due_diligence");
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <ZapIcon size={15} className="fill-zinc-950 text-zinc-950" />
            <span>{isRu ? "Заказать аудит ($149) →" : "Order Audit ($149) →"}</span>
          </button>

          <button
            onClick={() => {
              trackEvent("sample_report_loaded", { source: "due_diligence_banner" });
              onViewSample();
            }}
            className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs transition cursor-pointer text-center"
          >
            {isRu ? "Посмотреть пример" : "View Sample"}
          </button>
        </div>
      </div>
    </section>
  );
}
