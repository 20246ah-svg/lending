"use client";

import React, { useState } from "react";
import { ClockIcon, ZapIcon } from "@/components/icons";
import TiltCard from "@/components/ui/TiltCard";
import RadarGauge from "@/components/ui/RadarGauge";
import { i18n } from "@/lib/i18n";
import { AuditRequestBody } from "@/lib/types";

interface DoomsdayCalculatorProps {
  lang: "ru" | "en";
  onRunAudit: (payload: AuditRequestBody) => void;
}

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function DoomsdayCalculator({ lang, onRunAudit }: DoomsdayCalculatorProps) {
  const t = i18n[lang];
  const [calcAiLines, setCalcAiLines] = useState(5500);
  const [calcGodFiles, setCalcGodFiles] = useState(3);
  const [calcHasTests, setCalcHasTests] = useState(false);
  const [calcDbState, setCalcDbState] = useState<"clean" | "medium" | "mess">("medium");
  const [bridgeUrl, setBridgeUrl] = useState("https://github.com/shadcn-ui/ui");

  const calculateDoomsday = () => {
    let score = 20;
    score += (calcAiLines / 20000) * 35;
    score += calcGodFiles * 6;
    if (!calcHasTests) score += 20;
    if (calcDbState === "mess") score += 15;
    else if (calcDbState === "medium") score += 8;

    score = Math.min(Math.round(score), 99);
    let days = Math.round(90 - (score / 100) * 85);
    days = Math.max(days, 2);

    const emergencyCost = Math.round((score / 100) * 6500 + calcGodFiles * 450);

    return {
      score,
      days,
      emergencyCost,
      fragilityPercent: Math.min(score + 4, 99),
    };
  };

  const calcResult = calculateDoomsday();

  return (
    <section id="calculator" className="py-24 px-4 sm:px-8 max-w-6xl mx-auto z-10 relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-xs font-mono mb-4">
          <ClockIcon size={13} className="text-amber-400" />
          <span>{t.calcBadge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          {t.calcTitle}
        </h2>
        <p className="text-zinc-400 text-sm font-sans">
          {t.calcSub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Interactive Controls */}
        <TiltCard className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            {/* SLIDER 1 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-zinc-300">
                  {t.calcLinesLabel}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {formatNumber(calcAiLines)} LOC
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="20000"
                step="500"
                value={calcAiLines}
                onChange={(e) => setCalcAiLines(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-zinc-800 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 pt-2">
                <span className="text-[10px] font-mono text-zinc-500 mr-1">
                  {lang === "ru" ? "Быстрый выбор:" : "Quick select:"}
                </span>
                {[1000, 3000, 5500, 10000, 20000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setCalcAiLines(v)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                      calcAiLines === v
                        ? "bg-emerald-500 text-black font-bold"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                    }`}
                  >
                    {v >= 1000 ? `${v / 1000}k` : v}
                  </button>
                ))}
              </div>
            </div>

            {/* SLIDER 2 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-zinc-300">
                  {t.calcGodFilesLabel}
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  {calcGodFiles} {lang === "ru" ? "файлов" : "files"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={calcGodFiles}
                onChange={(e) => setCalcGodFiles(Number(e.target.value))}
                className="w-full accent-rose-400 bg-zinc-800 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 pt-2">
                <span className="text-[10px] font-mono text-zinc-500 mr-1">
                  {lang === "ru" ? "Файлов:" : "Files:"}
                </span>
                {[0, 1, 3, 5, 8].map((v) => (
                  <button
                    key={v}
                    onClick={() => setCalcGodFiles(v)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                      calcGodFiles === v
                        ? "bg-rose-500 text-white font-bold"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* TOGGLES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
                <div className="text-xs font-mono text-zinc-300 mb-2">
                  {t.calcTestsLabel}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCalcHasTests(false)}
                    className={`flex-1 py-1.5 rounded text-xs font-mono transition cursor-pointer ${
                      !calcHasTests
                        ? "bg-rose-500 text-white font-bold"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {t.calcTestsNone}
                  </button>
                  <button
                    onClick={() => setCalcHasTests(true)}
                    className={`flex-1 py-1.5 rounded text-xs font-mono transition cursor-pointer ${
                      calcHasTests
                        ? "bg-emerald-500 text-black font-bold"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {t.calcTestsYes}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
                <div className="text-xs font-mono text-zinc-300 mb-2">
                  {t.calcDbLabel}
                </div>
                <div className="flex gap-1.5">
                  {[
                    { id: "clean" as const, label: t.calcDbClean },
                    { id: "medium" as const, label: t.calcDbMedium },
                    { id: "mess" as const, label: t.calcDbMess },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setCalcDbState(st.id)}
                      className={`flex-1 py-1.5 rounded text-[11px] font-mono transition cursor-pointer ${
                        calcDbState === st.id
                          ? "bg-zinc-200 text-black font-bold"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Inline direct conversion bridge */}
          <div className="mt-6 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={bridgeUrl}
              onChange={(e) => setBridgeUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => onRunAudit({ url: bridgeUrl, lang })}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-md"
            >
              <ZapIcon size={14} className="fill-zinc-950 text-zinc-950" />
              <span>{t.calcBridgeBtn}</span>
            </button>
          </div>
        </TiltCard>

        {/* Right: SVG Radar HUD */}
        <TiltCard
          glowColor="rgba(244, 63, 94, 0.2)"
          className="lg:col-span-5 p-6 flex flex-col justify-center items-center"
        >
          <RadarGauge
            fragilityPercent={calcResult.fragilityPercent}
            daysToDisaster={calcResult.days}
            emergencyCost={calcResult.emergencyCost}
            lang={lang}
          />
        </TiltCard>
      </div>
    </section>
  );
}
