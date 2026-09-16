"use client";

import React from "react";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { Reveal, SectionHeading, Spotlight } from "@/components/ui/primitives";
import type { Copy } from "@/components/lib/copy";

export function Pricing({ c }: { c: Copy["pricing"] }) {
  return (
    <section
      id="pricing"
      className="relative scroll-mt-24 border-y border-white/[0.06] bg-abyss/50 px-4 py-20 sm:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-30 blueprint fade-mask-b"
      />
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} sub={c.sub} />

        <div className="mt-12 grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
          {c.tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 90} className={tier.featured ? "md:-mt-3 md:mb-3" : ""}>
              <Spotlight
                className={`relative flex h-full flex-col p-5 sm:p-6 ${
                  tier.featured ? "panel rim rim-iris bg-panel" : "panel lift"
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-iris-400/40 bg-gradient-to-r from-iris-600 to-iris-500 px-3 py-1 font-mono text-[10px] font-semibold tracking-wide text-white uppercase shadow-[0_10px_30px_-10px_rgba(124,108,255,0.9)]">
                    <Crown size={11} />
                    {tier.badge}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[11px] tracking-wider uppercase ${
                      tier.featured ? "text-iris-200" : "text-white/45"
                    }`}
                  >
                    {tier.name}
                  </span>
                  {!tier.featured && i === 0 && <Sparkles size={12} className="text-white/30" />}
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-[2.15rem] leading-none font-semibold text-white">
                    {tier.price}
                  </span>
                  <span className="font-mono text-[11px] text-white/40">{tier.unit}</span>
                </div>

                <p className="mt-3 min-h-[2.5rem] text-[12.5px] leading-relaxed text-white/50">{tier.desc}</p>

                <div className="my-5 h-px w-full bg-gradient-to-r from-white/[0.12] to-transparent" />

                <ul className="flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                          tier.featured ? "bg-iris-500/20 text-iris-200" : "bg-mint-500/15 text-mint-300"
                        }`}
                      >
                        <Check size={10} strokeWidth={3} />
                      </span>
                      <span className="text-[12.5px] leading-snug text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => document.getElementById("audit-tool")?.scrollIntoView({ behavior: "smooth" })}
                  className={`btn mt-6 w-full ${tier.featured ? "btn-primary" : "btn-ghost"}`}
                >
                  {tier.featured ? <Zap size={13} /> : null}
                  {tier.cta}
                </button>
              </Spotlight>
            </Reveal>
          ))}
        </div>

        <Reveal delay={140}>
          <p className="mt-8 text-center font-mono text-[11px] text-white/35">{c.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
