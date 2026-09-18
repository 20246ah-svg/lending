"use client";

import React from "react";

interface RadarGaugeProps {
  fragilityPercent: number;
  daysToDisaster: number;
  emergencyCost: number;
  lang?: "ru" | "en";
  className?: string;
}

export default function RadarGauge({
  fragilityPercent,
  daysToDisaster,
  emergencyCost,
  lang = "ru",
  className = "",
}: RadarGaugeProps) {
  // SVG circular arc calculation
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(fragilityPercent, 100)) / 100;

  const isCritical = fragilityPercent >= 70;
  const isWarning = fragilityPercent >= 40 && fragilityPercent < 70;

  const statusColor = isCritical
    ? "#f43f5e" // rose-500
    : isWarning
    ? "#f59e0b" // amber-500
    : "#10b981"; // emerald-500

  const statusText =
    lang === "ru"
      ? isCritical
        ? "КРИТИЧЕСКИЙ РИСК"
        : isWarning
        ? "ПОВЫШЕННЫЙ ДОЛГ"
        : "СТАБИЛЬНЫЙ КОД"
      : isCritical
      ? "CRITICAL RISK"
      : isWarning
      ? "ELEVATED DEBT"
      : "STABLE VELOCITY";

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 ${className}`}>
      {/* Background radial glow */}
      <div
        className="absolute w-48 h-48 rounded-full blur-2xl opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: statusColor }}
      />

      <div className="relative w-52 h-52 flex items-center justify-center">
        <svg className="w-full h-full -rotate-135 transform" viewBox="0 0 180 180">
          {/* Outer dashed radar ring */}
          <circle
            cx="90"
            cy="90"
            r="82"
            fill="none"
            stroke="#27272a"
            strokeWidth="1"
            strokeDasharray="4 6"
            className="opacity-60"
          />

          {/* Background track arc */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#18181b"
            strokeWidth="8"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Value active arc */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={statusColor}
            strokeWidth="8"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Decorative inner ticks */}
          <circle
            cx="90"
            cy="90"
            r="56"
            fill="none"
            stroke="#27272a"
            strokeWidth="1"
            strokeDasharray="2 8"
          />
        </svg>

        {/* Central HUD Data */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-zinc-400 mb-1">
            <span
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{ backgroundColor: statusColor }}
            />
            <span>{statusText}</span>
          </div>

          <div className="text-4xl font-extrabold font-mono tracking-tighter text-white">
            {fragilityPercent}
            <span className="text-xl font-normal text-zinc-500">/100</span>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 mt-1">
            {lang === "ru" ? "Отказ: " : "TTD: "}
            <span
              className="font-bold underline decoration-zinc-700 underline-offset-2"
              style={{ color: statusColor }}
            >
              {daysToDisaster} {lang === "ru" ? "дней" : "DAYS"}
            </span>
          </div>
        </div>
      </div>

      {/* Metric pills under radar */}
      <div className="grid grid-cols-2 gap-3 w-full mt-4 text-xs font-mono">
        <div className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-center">
          <div className="text-[10px] text-zinc-500 uppercase">
            {lang === "ru" ? "Срок до сбоя" : "Horizon"}
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {daysToDisaster} {lang === "ru" ? "дн." : "days"}
          </div>
        </div>
        <div className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-center">
          <div className="text-[10px] text-zinc-500 uppercase">
            {lang === "ru" ? "Эвристика фикса" : "Heuristic estimate"}
          </div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">
            ${emergencyCost.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
