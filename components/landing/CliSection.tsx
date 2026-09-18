"use client";

import React, { useState } from "react";
import { TerminalIcon, CheckIcon, CopyIcon } from "@/components/icons";
import { i18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";

interface CliSectionProps {
  lang: "ru" | "en";
}

export default function CliSection({ lang }: CliSectionProps) {
  const t = i18n[lang];
  const [copiedCli, setCopiedCli] = useState(false);

  const handleCopyCli = () => {
    navigator.clipboard.writeText("npx vibedebt audit ./src");
    track("cli_copy_clicked");
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <section id="cli" className="py-20 px-4 sm:px-8 border-t border-zinc-800/80 bg-zinc-950/80 z-10 relative">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-3">
          <TerminalIcon size={13} />
          <span>{t.cliBadge}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400 text-[10px] font-bold">PREVIEW</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          {t.cliTitle}
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm font-sans max-w-xl mx-auto">
          {t.cliSub}
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-zinc-500">zsh — npx vibedebt-cli (Preview)</span>
          </div>
          <button
            onClick={handleCopyCli}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            {copiedCli ? <CheckIcon size={12} className="text-emerald-400" /> : <CopyIcon size={12} />}
            <span>{copiedCli ? (lang === "ru" ? "Скопировано!" : "Copied!") : (lang === "ru" ? "Копировать" : "Copy")}</span>
          </button>
        </div>
          <div className="p-5 font-mono text-xs text-zinc-300 space-y-2 bg-zinc-950 leading-relaxed overflow-x-auto">
            <div className="text-zinc-500 text-[11px]">
              {lang === "ru"
                ? "# CLI в закрытом превью. Публикация в npm запланирована на Q4 2026."
                : "# CLI in private preview. npm registry publication scheduled for Q4 2026."}
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span>$</span>
              <span className="text-white">npx vibedebt-cli@preview audit ./src</span>
            </div>
            <div className="text-zinc-500 text-[11px]">
              {lang === "ru" ? "→ Запуск локального статического анализатора кода..." : "→ Running local static code analyzer..."}
            </div>
            <div className="text-emerald-400 text-[11px]">
              {lang === "ru" ? "✔ 48 файлов проверено за 290мс • 0 байт передано по сети" : "✔ 48 files scanned in 290ms • 0 bytes sent over network"}
            </div>
            <div className="text-amber-400 text-[11px]">
              {lang === "ru" ? "⚠ Обнаружен God-файл: src/pages/Dashboard.tsx (620 LOC)" : "⚠ God-file detected: src/pages/Dashboard.tsx (620 LOC)"}
            </div>
            <div className="text-rose-400 text-[11px]">
              {lang === "ru" ? "✖ 1 утечка токена обнаружена в src/lib/supabase.ts" : "✖ 1 secret leak found in src/lib/supabase.ts"}
            </div>
            <div className="text-emerald-300 text-[11px] pt-1 border-t border-zinc-800/60">
              ✨ {lang === "ru" ? "Хирургические промпты сохранены в" : "Surgical Cursor prompts saved to"} <span className="underline">.vibedebt/prompts.md</span>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-xs font-mono text-zinc-400">
        <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          <span>{lang === "ru" ? "100% Локальный анализ" : "100% Local Analysis"}</span>
        </div>
        <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          <span>{lang === "ru" ? "Без API-токенов и ключей" : "Zero API Tokens Needed"}</span>
        </div>
        <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          <span>{lang === "ru" ? "Выгрузка Markdown для Cursor" : "Outputs Cursor Markdown"}</span>
        </div>
      </div>
    </section>
  );
}
