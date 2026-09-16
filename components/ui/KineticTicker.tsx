"use client";

import React from "react";

interface KineticTickerProps {
  lang?: "ru" | "en";
  items?: string[];
}

const ITEMS_RU = [
  "РАДАР КАТАСТРОФЫ",
  "ДЕТЕКТОР ВАЙБ-СПАГЕТТИ",
  "РАСПИЛ GOD-ФАЙЛОВ",
  "ХИРУРГИЧЕСКИЕ ПРОМПТЫ ДЛЯ CURSOR",
  "ПРИВАТНЫЙ АУДИТ БЕЗ УТЕЧЕК ДАННЫХ",
  "ПРОВЕРКА ФАНТОМНЫХ NPM-ПАКЕТОВ",
  "SAST-КОНТРОЛЬ CWE УЯЗВИМОСТЕЙ",
  "АВТОТЕСТЫ VITEST ДЛЯ РЕГРЕССИЙ",
];

const ITEMS_EN = [
  "DOOMSDAY RADAR",
  "AST CODE GRAPH",
  "GOD-FILE SPLITTER",
  "SURGICAL CURSOR PROMPTS",
  "ZERO DATA EXFILTRATION",
  "SUPPLY CHAIN PHANTOM SCAN",
  "CWE SECURITY COMPLIANCE",
  "VITEST HARNESS GENERATOR",
];

export default function KineticTicker({ lang = "ru", items }: KineticTickerProps) {
  const chosenItems = items || (lang === "ru" ? ITEMS_RU : ITEMS_EN);
  const repeated = [...chosenItems, ...chosenItems, ...chosenItems];

  return (
    <div className="relative w-full overflow-hidden border-y border-zinc-800/80 bg-zinc-950/70 py-3.5 backdrop-blur-md select-none">
      <div className="flex w-max animate-ticker whitespace-nowrap">
        {repeated.map((text, idx) => (
          <div key={idx} className="flex items-center mx-5 text-xs font-mono tracking-widest uppercase">
            <span className="text-zinc-500 mr-3">●</span>
            <span className="text-zinc-300 hover:text-emerald-400 transition-colors">{text}</span>
            <span className="text-emerald-500/40 ml-4 font-bold">//</span>
          </div>
        ))}
      </div>
    </div>
  );
}

