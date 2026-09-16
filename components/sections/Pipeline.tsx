"use client";

import React from "react";
import { BrainCircuit, Check, Radar } from "lucide-react";
import { Reveal, SectionHeading, Spotlight } from "@/components/ui/primitives";
import type { Copy } from "@/components/lib/copy";

type FlowStage = { tag: string; title: string; desc: string };
type CardStage = { tag: string; title: string; body: string; footer: string };

export function Pipeline({ c }: { c: Copy["pipeline"] }) {
  const cards = c.cards as CardStage[];
  const flow = c.flow as FlowStage[];

  return (
    <section id="how-it-works" className="relative scroll-mt-24 px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} sub={c.sub} />

        {/* ---------- pipeline flow ---------- */}
        <Reveal delay={100} className="mt-12">
          <div className="relative">
            <div
              aria-hidden
              className="absolute top-[34px] right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-iris-500/30 to-transparent lg:block"
            />
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {flow.map((stage, i) => (
                <li key={stage.tag} className="relative">
                  <div className="flex items-center gap-3 lg:flex-col lg:items-start">
                    <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-iris-500/30 bg-panel font-mono text-[11px] text-iris-200 shadow-[0_0_24px_-6px_rgba(124,108,255,0.9)]">
                      {stage.tag}
                    </span>
                    <div className="lg:mt-4">
                      <div className="font-display text-[0.92rem] font-medium text-white">{stage.title}</div>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/45">{stage.desc}</p>
                    </div>
                  </div>
                  {i < flow.length - 1 && (
                    <span className="absolute top-4 -right-2 hidden h-1.5 w-1.5 rounded-full bg-iris-400/60 lg:block" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* ---------- two engines ---------- */}
        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Reveal delay={60}>
            <Spotlight className="panel lift h-full p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-mint-500/25 bg-mint-500/10 text-mint-300">
                  <Radar size={16} />
                </span>
                <div>
                  <div className="font-mono text-[10.5px] tracking-wider text-mint-300 uppercase">{cards[0].tag}</div>
                  <div className="font-display text-[1rem] font-medium text-white">{cards[0].title}</div>
                </div>
              </div>
              <p className="mt-4 text-[12.5px] leading-relaxed text-white/55">{cards[0].body}</p>
              <div className="mt-5 flex items-center gap-2 border-t border-white/[0.07] pt-4 font-mono text-[11px] text-mint-300">
                <Check size={12} />
                {cards[0].footer}
              </div>
            </Spotlight>
          </Reveal>

          <Reveal delay={120}>
            <Spotlight className="panel lift h-full p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-iris-500/30 bg-iris-500/12 text-iris-200">
                  <BrainCircuit size={16} />
                </span>
                <div>
                  <div className="font-mono text-[10.5px] tracking-wider text-iris-200 uppercase">
                    {cards[1].tag}
                  </div>
                  <div className="font-display text-[1rem] font-medium text-white">{cards[1].title}</div>
                </div>
              </div>
              <p className="mt-4 text-[12.5px] leading-relaxed text-white/55">{cards[1].body}</p>
              <div className="mt-5 flex items-center gap-2 border-t border-white/[0.07] pt-4 font-mono text-[11px] text-iris-200">
                <Check size={12} />
                {cards[1].footer}
              </div>
            </Spotlight>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
