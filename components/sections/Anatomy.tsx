"use client";

import React from "react";
import { ArrowUpRight, KeyRound, Layers, OctagonAlert, RefreshCcwDot } from "lucide-react";
import { Reveal, SectionHeading, Spotlight } from "@/components/ui/primitives";
import type { Copy, Lang } from "@/components/lib/copy";

const TONES = [
  { text: "text-ember-300", border: "hover:border-ember-500/35", chip: "bg-ember-500/12 border-ember-500/25" },
  { text: "text-amber-300", border: "hover:border-amber-500/35", chip: "bg-amber-500/12 border-amber-500/25" },
  { text: "text-iris-300", border: "hover:border-iris-400/35", chip: "bg-iris-500/12 border-iris-500/25" },
  { text: "text-mint-300", border: "hover:border-mint-500/35", chip: "bg-mint-500/12 border-mint-500/25" },
];

const ICONS = [Layers, OctagonAlert, RefreshCcwDot, KeyRound];

export function Anatomy({ c, lang }: { c: Copy["anatomy"]; lang: Lang }) {
  return (
    <section id="antipatterns" className="relative scroll-mt-24 px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} sub={c.sub} />

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {c.items.map((item, i) => {
            const tone = TONES[i % TONES.length];
            const Icon = ICONS[i] ?? Layers;
            return (
              <Reveal key={item.n} delay={i * 80}>
                <Spotlight className={`panel lift group relative h-full overflow-hidden p-5 sm:p-6 ${tone.border}`}>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-6 right-2 font-display text-[5.5rem] leading-none font-bold text-white/[0.035] transition group-hover:text-white/[0.06]"
                  >
                    {item.n}
                  </span>

                  <div className="relative flex items-start gap-4">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${tone.chip} ${tone.text}`}>
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-[1.02rem] leading-snug font-medium text-white">{item.title}</h3>
                      <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/55">{item.body}</p>
                    </div>
                  </div>

                  <div className="relative mt-5 flex items-start gap-2.5 border-t border-white/[0.07] pt-4">
                    <span className={`mt-1 shrink-0 font-mono text-[10.5px] tracking-wide uppercase ${tone.text}`}>
                      {lang === "ru" ? "симптом" : "symptom"}
                    </span>
                    <p className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-white/45 italic">
                      <ArrowUpRight size={12} className="mt-0.5 shrink-0" />
                      {item.symptom}
                    </p>
                  </div>
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
