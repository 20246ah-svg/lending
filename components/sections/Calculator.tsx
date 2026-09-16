"use client";

import React, { type CSSProperties, useState } from "react";
import { Activity, Gauge, Lightbulb, TestTube2, Timer, Wallet } from "lucide-react";
import { Counter, Reveal, SectionHeading } from "@/components/ui/primitives";
import { formatNumber, type DbState } from "@/components/lib/types";
import type { Copy } from "@/components/lib/copy";

/* ---------------- slider row ---------------- */
function Slider({
  label,
  value,
  display,
  min,
  max,
  step = 1,
  accent,
  marks,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step?: number;
  accent: string;
  marks: string[];
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12.5px] text-white/70">{label}</span>
        <span className="font-mono text-[12px] font-semibold text-white tabular">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range mt-2"
        style={{ "--range-pct": `${pct}%`, "--range-accent": accent } as CSSProperties}
        aria-label={label}
      />
      <div className="flex justify-between font-mono text-[10px] text-white/30">
        {marks.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

export function Calculator({ c }: { c: Copy["calc"] }) {
  const [aiLines, setAiLines] = useState(5500);
  const [godFiles, setGodFiles] = useState(3);
  const [justFix, setJustFix] = useState(14);
  const [hasTests, setHasTests] = useState(false);
  const [dbState, setDbState] = useState<DbState>("medium");

  const baseLife = 90;
  const aiPenalty = (aiLines / 1000) * 3.5;
  const godPenalty = godFiles * 6;
  const promptPenalty = justFix * 1.6;
  const testBonus = hasTests ? 30 : -14;
  const dbPenalty = dbState === "clean" ? 0 : dbState === "medium" ? 12 : 24;

  const days = Math.max(2, Math.round(baseLife - (aiPenalty + godPenalty + promptPenalty + dbPenalty) + testBonus));
  const hours = Math.round(aiLines / 220 + godFiles * 5 + justFix * 1.5 + (hasTests ? 0 : 16));
  const emergencyCost = hours * 60;
  const fragility = Math.min(99, Math.max(12, Math.round(100 - days * 0.95)));

  const zone: "critical" | "elevated" | "healthy" = days < 14 ? "critical" : days < 30 ? "elevated" : "healthy";
  const zoneText = zone === "critical" ? c.result.gaugeCritical : zone === "elevated" ? c.result.gaugeElevated : c.result.gaugeHealthy;
  const zoneColor = zone === "critical" ? "#ff5c80" : zone === "elevated" ? "#ffb545" : "#4fe0a8";
  const markerPct = Math.min(100, (days / 90) * 100);

  const dayLabel =
    days === 1 ? c.result.day : days < 5 ? c.result.daysFew : c.result.daysMany;

  const dbButtons: { id: DbState; label: string; danger?: boolean }[] = [
    { id: "clean", label: c.sliders.dbClean },
    { id: "medium", label: c.sliders.dbMedium },
    { id: "mess", label: c.sliders.dbMess, danger: true },
  ];

  return (
    <section
      id="calculator"
      className="relative scroll-mt-24 border-y border-white/[0.06] bg-abyss/50 px-4 py-20 sm:px-8"
    >
      <div aria-hidden className="blueprint pointer-events-none absolute inset-0 -z-10 opacity-25 fade-mask-b" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} sub={c.sub} />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ---------- controls ---------- */}
          <Reveal className="lg:col-span-7">
            <div className="panel space-y-7 p-5 sm:p-6">
              <Slider
                label={c.sliders.lines}
                value={aiLines}
                display={`${formatNumber(aiLines)} ${c.sliders.linesUnit}`}
                min={500}
                max={20000}
                step={500}
                accent="#9b8cff"
                marks={c.sliders.linesRange}
                onChange={setAiLines}
              />

              <Slider
                label={c.sliders.godFiles}
                value={godFiles}
                display={`${godFiles} ${c.sliders.godFilesUnit}`}
                min={0}
                max={10}
                accent="#ffb545"
                marks={c.sliders.godFilesRange}
                onChange={setGodFiles}
              />

              <div>
                <Slider
                  label={c.sliders.prompts}
                  value={justFix}
                  display={`${justFix} ${c.sliders.promptsUnit}`}
                  min={0}
                  max={40}
                  accent="#ff5c80"
                  marks={["0", "20", "40"]}
                  onChange={setJustFix}
                />
                <p className="mt-2 text-[11.5px] leading-relaxed text-white/40">{c.sliders.promptsHint}</p>
              </div>

              <div className="border-t border-white/[0.07] pt-5">
                <span className="text-[12.5px] text-white/70">{c.sliders.tests}</span>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHasTests(true)}
                    className={`cursor-pointer rounded-xl border px-3 py-2.5 font-mono text-[11.5px] transition ${
                      hasTests
                        ? "border-mint-500/40 bg-mint-500/12 text-mint-300"
                        : "border-white/[0.08] bg-white/[0.02] text-white/45 hover:border-white/20"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <TestTube2 size={13} />
                      {c.sliders.testsYes}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasTests(false)}
                    className={`cursor-pointer rounded-xl border px-3 py-2.5 font-mono text-[11.5px] transition ${
                      !hasTests
                        ? "border-ember-500/40 bg-ember-500/12 text-ember-300"
                        : "border-white/[0.08] bg-white/[0.02] text-white/45 hover:border-white/20"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Activity size={13} />
                      {c.sliders.testsNo}
                    </span>
                  </button>
                </div>
              </div>

              <div className="border-t border-white/[0.07] pt-5">
                <span className="text-[12.5px] text-white/70">{c.sliders.db}</span>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {dbButtons.map((btn) => {
                    const active = dbState === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setDbState(btn.id)}
                        className={`cursor-pointer rounded-xl border px-2 py-2.5 font-mono text-[11px] transition ${
                          active
                            ? btn.danger
                              ? "border-ember-500/45 bg-ember-500/12 text-ember-300"
                              : "border-iris-400/45 bg-iris-500/12 text-iris-100"
                            : "border-white/[0.08] bg-white/[0.02] text-white/45 hover:border-white/20"
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ---------- projection ---------- */}
          <Reveal delay={120} className="lg:col-span-5">
            <div
              className="panel rim sticky top-24 overflow-hidden p-5 sm:p-6"
              aria-live="polite"
              aria-atomic="false"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full blur-[80px]"
                style={{ background: `${zoneColor}33` }}
              />

              <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.07] pb-3">
                <span className="mono-label whitespace-nowrap">{c.result.header}</span>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/40">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full" style={{ background: zoneColor }} />
                    {c.result.live}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAiLines(5500);
                      setGodFiles(3);
                      setJustFix(14);
                      setHasTests(false);
                      setDbState("medium");
                    }}
                    className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-white/45 transition hover:border-iris-400/40 hover:text-white"
                  >
                    {c.result.reset}
                  </button>
                </div>
              </div>

              <div className="relative mt-6 text-center">
                <span className="mono-label !text-[10px]">{c.result.until}</span>
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span className="font-display text-[4.25rem] leading-none font-semibold text-white tabular">
                    <Counter key={days} value={days} duration={700} />
                  </span>
                  <span className="font-display text-lg font-medium" style={{ color: zoneColor }}>
                    {dayLabel}
                  </span>
                </div>
                <div
                  className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10.5px]"
                  style={{ borderColor: `${zoneColor}55`, background: `${zoneColor}14`, color: zoneColor }}
                >
                  <Gauge size={11} />
                  {zoneText}
                </div>
              </div>

              {/* day scale */}
              <div className="relative mt-8">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-ember-500 via-amber-400 to-mint-500 opacity-70" />
                <div
                  className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-void bg-white transition-all duration-500"
                  style={{ left: `${markerPct}%`, boxShadow: `0 0 16px 2px ${zoneColor}` }}
                />
                <div className="mt-2 flex justify-between font-mono text-[10px] text-white/30">
                  <span>0</span>
                  <span>45</span>
                  <span>90</span>
                </div>
              </div>

              <p className="relative mt-5 text-[12.5px] leading-relaxed text-white/55">
                {days < 14 ? c.result.verdictCritical : c.result.verdictOk}
              </p>

              <dl className="relative mt-5 space-y-3 border-t border-white/[0.07] pt-5 font-mono text-[11.5px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-white/45">
                    <Wallet size={12} />
                    {c.result.contractor}
                  </dt>
                  <dd className="font-semibold text-white tabular">${formatNumber(emergencyCost)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-white/45">
                    <Timer size={12} />
                    {c.result.hours}
                  </dt>
                  <dd className="font-semibold text-white tabular">{hours} h</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-white/45">
                    <Activity size={12} />
                    {c.result.fragility}
                  </dt>
                  <dd className="font-semibold tabular" style={{ color: zoneColor }}>
                    {fragility}%
                  </dd>
                </div>
              </dl>

              <div className="relative mt-5 flex gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
                <Lightbulb size={15} className="mt-0.5 shrink-0 text-amber-300" />
                <p className="text-[11.5px] leading-relaxed text-white/55">
                  <strong className="font-semibold text-white/80">{c.result.tipLabel}:</strong> {c.result.tip}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
