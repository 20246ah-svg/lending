"use client";

import React from "react";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { Accordion, Reveal } from "@/components/ui/primitives";
import type { Copy } from "@/components/lib/copy";

export function Faq({ c }: { c: Copy["faq"] }) {
  return (
    <section id="faq" className="relative scroll-mt-24 px-4 py-20 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <Reveal>
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-iris-400 shadow-[0_0_12px_2px_rgba(124,108,255,0.7)]" />
              <span className="mono-label text-white/60">{c.eyebrow}</span>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="font-display text-2xl font-semibold text-white sm:text-[2.1rem] sm:leading-[1.15]">
              {c.title}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-3 text-sm leading-relaxed text-white/55">{c.sub}</p>
          </Reveal>

          <Reveal delay={180}>
            <div className="panel-flat mt-8 p-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-iris-500/30 bg-iris-500/12 text-iris-200">
                <MessagesSquare size={16} />
              </span>
              <div className="mt-3 font-display text-[0.92rem] font-medium text-white">{c.aside.title}</div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-white/50">{c.aside.sub}</p>
              <a
                href="#audit-tool"
                className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11.5px] text-iris-200 transition hover:text-white"
              >
                {c.aside.cta}
                <ArrowRight size={12} />
              </a>
              <p className="mt-3 font-mono text-[10px] text-white/30">{c.aside.note}</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <div className="panel px-5 py-2 sm:px-7 sm:py-3">
            <Accordion items={c.items} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
