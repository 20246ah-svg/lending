"use client";

import React from "react";
import { ZapIcon } from "@/components/icons";

interface HeaderProps {
  lang: "ru" | "en";
  setLang: (lang: "ru" | "en") => void;
}

export default function Header({ lang, setLang }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-800/80 bg-[#050508]/85 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ZapIcon size={16} className="text-emerald-400 fill-emerald-400/20" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold tracking-wider text-base text-white">
              VIBE<span className="text-emerald-400">DEBT</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
              v0.4.0
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-7 text-xs font-mono text-zinc-400 tracking-wider">
          <a href="#audit-tool" className="hover:text-emerald-400 transition-colors">
            {lang === "ru" ? "// АУДИТ" : "// AUDIT"}
          </a>
          <a href="#due-diligence" className="hover:text-emerald-400 transition-colors text-amber-400/90 font-bold">
            {lang === "ru" ? "// M&A АУДИТ" : "// DUE DILIGENCE"}
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
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-[11px] font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{lang === "ru" ? "РАДАР АКТИВЕН" : "RADAR ACTIVE"}</span>
          </div>

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
  );
}
