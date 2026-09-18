"use client";

import React from "react";
import { ShieldAlertIcon } from "@/components/icons";
import TiltCard from "@/components/ui/TiltCard";
import { i18n } from "@/lib/i18n";

interface FailureVectorsProps {
  lang: "ru" | "en";
}

export default function FailureVectors({ lang }: FailureVectorsProps) {
  const t = i18n[lang];

  return (
    <section id="vectors" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto z-10 relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-xs font-mono mb-4">
          <ShieldAlertIcon size={13} className="text-rose-400" />
          <span>{t.vectorsBadge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          {t.vectorsTitle}
        </h2>
        <p className="text-zinc-400 text-sm font-sans">
          {t.vectorsSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <TiltCard className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">
              {lang === "ru" ? "01 // МОНОЛИТЫ (>300 СТРОК)" : "01 // MONOLITHS (>300 LOC)"}
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {lang === "ru" ? "Потеря контекста" : "Context Loss"}
            </span>
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
            <span className="text-xs font-mono text-zinc-500">
              {lang === "ru" ? "Цепочка поставок" : "Supply Chain"}
            </span>
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
            <span className="text-xs font-mono text-zinc-500">
              {lang === "ru" ? "Регрессии" : "Zero Regression"}
            </span>
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
  );
}
