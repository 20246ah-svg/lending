"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Cpu, FileSearch, ShieldAlert, Sparkles } from "lucide-react";
import { Counter, Reveal, ScoreGauge } from "@/components/ui/primitives";
import { BUILD_TOOLS } from "@/components/lib/data";
import type { Copy } from "@/components/lib/copy";

/* ---------------- animated terminal ---------------- */
function lineTone(line: string) {
  if (line.startsWith("$")) return "text-white";
  if (line.startsWith("⚠")) return "text-ember-300";
  if (line.startsWith("✓")) return "text-mint-300";
  return "text-white/45";
}

function HeroConsole({ c }: { c: Copy["hero"] }) {
  const lines = c.console.lines;
  const [visible, setVisible] = useState(1);
  const [elapsed, setElapsed] = useState(0.12);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible((v) => (v < lines.length ? v + 1 : v));
    }, 620);
    return () => clearInterval(id);
  }, [lines.length]);

  useEffect(() => {
    if (visible < lines.length) return;
    const id = setTimeout(() => setVisible(1), 4200);
    return () => clearTimeout(id);
  }, [visible, lines.length]);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => (e >= 9.9 ? 0.11 : Number((e + 0.07).toFixed(2))));
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="panel rim relative overflow-hidden">
      {/* window chrome */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ember-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-mint-500/70" />
          </div>
          <span className="font-mono text-[11px] text-white/45">{c.console.window}</span>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-mint-300">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mint-400" />
          {c.console.status}
        </span>
      </div>

      <div className="grid gap-5 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
        {/* terminal body */}
        <div className="min-w-0">
          <div className="h-[190px] overflow-hidden font-mono text-[11.5px] leading-[1.9]">
            {lines.slice(0, visible).map((line, i) => (
              <div
                key={`${line}-${i}`}
                className={`animate-rise truncate ${lineTone(line)} ${i === visible - 1 ? "opacity-100" : "opacity-90"}`}
                style={{ animationDuration: "0.45s" }}
              >
                {line}
                {i === visible - 1 && visible < lines.length && (
                  <span className="ml-1 inline-block h-3 w-1.5 animate-caret bg-iris-400 align-middle" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.07] pt-4">
            {c.console.chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-ember-500/25 bg-ember-500/10 px-2.5 py-1 font-mono text-[10px] text-ember-300"
              >
                {chip}
              </span>
            ))}
            <span className="ml-auto font-mono text-[10px] text-white/30 tabular">{elapsed.toFixed(2)} s</span>
          </div>
        </div>

        {/* score side */}
        <div className="flex flex-col items-center justify-center gap-2 sm:border-l sm:border-white/[0.07] sm:pl-5">
          <ScoreGauge value={89} tone="critical" size={124} thickness={8}>
            <div className="w-full max-w-[100px] px-1 text-center">
              <div className="font-display text-[1.7rem] leading-none font-semibold text-white tabular">
                89<span className="text-sm text-white/40">%</span>
              </div>
              <div className="mt-1.5 font-mono text-[8.5px] tracking-[0.08em] whitespace-nowrap text-white/45 uppercase">
                {c.console.score}
              </div>
            </div>
          </ScoreGauge>
          <span className="font-mono text-[10.5px] text-ember-300">{c.console.verdict}</span>
          <span className="font-mono text-[10px] text-white/30">
            {c.console.files}: 38 · 214 KB
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- tool marquee ---------------- */
function ToolMarquee({ label }: { label: string }) {
  const row = [...BUILD_TOOLS, ...BUILD_TOOLS];
  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/15" />
        <span className="mono-label !text-[10px]">{label}</span>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/15" />
      </div>
      <div className="fade-mask-x overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-10 pr-10">
          {row.map((tool, i) => (
            <span
              key={`${tool}-${i}`}
              className="flex shrink-0 items-center gap-2.5 font-mono text-[13px] whitespace-nowrap text-white/35 transition hover:text-white/70"
            >
              <Cpu size={12} className="text-iris-400/60" />
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero({ c, marquee }: { c: Copy["hero"]; marquee: string }) {
  return (
    <section id="top" className="relative overflow-hidden px-4 pt-10 pb-20 sm:px-8 sm:pt-16">
      {/* ---------- backdrop ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/hero-atmosphere.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.5] [mask-image:radial-gradient(120%_100%_at_78%_28%,#000_0%,transparent_72%)]"
        />
        <div className="blueprint absolute inset-0 opacity-[0.35] fade-mask-b" />
        <div className="glow-orb -top-32 -left-24 h-[26rem] w-[26rem] animate-drift bg-iris-600/35" />
        <div className="glow-orb top-24 right-[-8rem] h-[24rem] w-[24rem] animate-drift-slow bg-ember-600/25" />
        <div className="noise absolute inset-0 opacity-[0.035]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          {/* ---------- copy ---------- */}
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-ember-500/25 bg-ember-500/[0.08] px-3.5 py-1.5">
                <ShieldAlert size={13} className="text-ember-300" />
                <span className="font-mono text-[11px] tracking-wide text-ember-200">{c.badge}</span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 font-display text-[2.05rem] leading-[1.08] font-semibold text-white sm:text-[3.15rem] sm:leading-[1.05]">
                {c.h1a} <span className="accent-serif grad-text text-shadow-glow">{c.h1accent}</span> {c.h1b}
              </h1>
            </Reveal>

            <Reveal delay={150}>
              <p className="mt-6 max-w-xl text-[0.94rem] leading-relaxed text-white/55">{c.sub}</p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#audit-tool" className="btn btn-primary !px-5 !py-3.5 !text-[13px]">
                  <Sparkles size={14} />
                  {c.ctaPrimary}
                  <ArrowRight size={14} />
                </a>
                <a href="#how-it-works" className="btn btn-ghost !px-4.5 !py-3.5 !text-[13px]">
                  <FileSearch size={14} />
                  {c.ctaSecondary}
                </a>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <p className="mt-4 font-mono text-[11px] text-white/35">{c.note}</p>
            </Reveal>
          </div>

          {/* ---------- console ---------- */}
          <Reveal delay={200} className="lg:pl-2">
            <div className="animate-float">
              <HeroConsole c={c} />
            </div>
          </Reveal>
        </div>

        {/* ---------- stats ---------- */}
        <Reveal delay={120} className="mt-14">
          <div className="panel-flat grid grid-cols-2 gap-px overflow-hidden bg-white/[0.06] lg:grid-cols-4">
            {c.stats.map((stat) => (
              <div key={stat.label} className="bg-abyss/80 px-5 py-6 text-center">
                <div className="font-display text-2xl font-semibold text-white tabular sm:text-[1.75rem]">
                  <Counter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </div>
                <div className="mx-auto mt-2 max-w-[12rem] text-[11.5px] leading-snug text-white/45">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ---------- 3 steps ---------- */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {c.steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <div className="panel-flat group flex h-full items-start gap-3.5 p-4 transition hover:border-iris-400/30">
                <span className="font-mono text-[11px] text-iris-300/80">{step.n}</span>
                <div>
                  <div className="font-display text-[0.9rem] font-medium text-white">{step.title}</div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-white/45">{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ---------- marquee ---------- */}
        <Reveal delay={140} className="mt-14">
          <ToolMarquee label={marquee} />
        </Reveal>
      </div>
    </section>
  );
}
