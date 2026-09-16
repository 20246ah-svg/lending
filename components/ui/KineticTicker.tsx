"use client";

import React from "react";

interface KineticTickerProps {
  items?: string[];
  speed?: number;
}

const DEFAULT_ITEMS = [
  "DOOMSDAY RADAR",
  "AST CODE GRAPH",
  "GOD-FILE SPLITTER",
  "SURGICAL CURSOR PROMPTS",
  "ZERO DATA EXFILTRATION",
  "SUPPLY CHAIN PHANTOM SCAN",
  "CWE SECURITY COMPLIANCE",
  "VITEST HARNESS GENERATOR",
];

export default function KineticTicker({ items = DEFAULT_ITEMS }: KineticTickerProps) {
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden border-y border-zinc-800/80 bg-zinc-950/60 py-3 backdrop-blur-sm select-none">
      <div className="flex w-max animate-ticker whitespace-nowrap">
        {repeated.map((text, idx) => (
          <div key={idx} className="flex items-center mx-4 text-xs font-mono tracking-widest uppercase">
            <span className="text-zinc-500 mr-3">●</span>
            <span className="text-zinc-400 hover:text-emerald-400 transition-colors">{text}</span>
            <span className="text-emerald-500/40 ml-4 font-bold">//</span>
          </div>
        ))}
      </div>
    </div>
  );
}
