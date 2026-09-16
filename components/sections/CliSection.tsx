"use client";

import React from "react";
import { Check, Lock, Rocket, SquareTerminal, Terminal, Wrench } from "lucide-react";
import { Reveal, SectionHeading, useCopy } from "@/components/ui/primitives";
import type { Copy } from "@/components/lib/copy";

const ICONS = [Lock, Rocket, Wrench];

export function CliSection({ c }: { c: Copy["cli"] }) {
  const { copy, isCopied } = useCopy();

  return (
    <section
      id="cli-section"
      className="relative scroll-mt-24 overflow-hidden border-y border-white/[0.06] bg-abyss/60 px-4 py-20 sm:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5] blueprint-fine fade-mask-b"
      />
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} sub={c.sub} />

        <Reveal delay={100} className="mt-10">
          <div className="panel rim rim-mint mx-auto max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-ember-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-mint-500/70" />
                </div>
                <span className="font-mono text-[11px] text-white/45">~/projects/my-saas — zsh</span>
              </div>
              <SquareTerminal size={14} className="text-white/30" />
            </div>

            <div className="space-y-1.5 bg-void/50 p-4 font-mono text-[11.5px] leading-relaxed sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-white">
                  <span className="text-mint-300">$</span> npx vibedebt audit ./src
                </span>
                <button
                  type="button"
                  onClick={() => copy("npx vibedebt audit ./src", "cli")}
                  className="btn btn-ghost shrink-0 !px-2.5 !py-1.5 !text-[10.5px]"
                >
                  {isCopied("cli") ? <Check size={11} className="text-mint-300" /> : <Terminal size={11} />}
                  {isCopied("cli") ? c.copied : c.copy}
                </button>
              </div>
              <div className="text-white/40">◐ сканирование 38 файлов · 0.5s</div>
              <div className="mt-2 space-y-0.5">
                <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-2">
                  <span className="text-white/55">app/page.tsx</span>
                  <span className="text-ember-300">2 420 строк · 8 модалок</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/55">lib/ai-handler.ts</span>
                  <span className="text-amber-300">28 × as any</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/55">src/hooks/useFilters.ts</span>
                  <span className="text-ember-300">цикл useEffect</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/55">автотесты</span>
                  <span className="text-white/35">не найдены</span>
                </div>
              </div>
              <div className="mt-2 space-y-0.5 border-t border-white/[0.06] pt-2">
                <div className="text-white/70">
                  Doomsday Score: <span className="font-semibold text-ember-300">89%</span> · TTD: 11 коммитов
                </div>
                <div className="text-mint-300">✓ план рефакторинга сохранён в ./vibedebt-report.md</div>
                <div className="text-white/35">exit code 1 — merge в CI остановлен</div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {c.features.map((feature, i) => {
            const Icon = ICONS[i] ?? Lock;
            return (
              <Reveal key={feature.n} delay={i * 90}>
                <div className="panel-flat h-full p-4 transition hover:border-mint-500/25">
                  <span className="mb-3 grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-mint-300">
                    <Icon size={15} />
                  </span>
                  <div className="font-display text-[0.9rem] font-medium text-white">{feature.title}</div>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/45">{feature.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
