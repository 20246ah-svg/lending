"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, ArrowUp, Heart, Sparkles, Zap } from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/icons";
import { Logo, Reveal } from "@/components/ui/primitives";
import type { Copy } from "@/components/lib/copy";

/* ---------------- closing CTA band ---------------- */
export function FinalCta({ c }: { c: Copy["finalCta"] }) {
  return (
    <section className="relative px-4 pb-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="panel rim relative overflow-hidden px-6 py-12 text-center sm:px-10 sm:py-16">
            <Image
              src="/cta-atmosphere.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-[0.28] [mask-image:radial-gradient(90%_120%_at_50%_50%,#000_10%,transparent_80%)]"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-void/60 via-void/35 to-void/70" />

            <div className="relative mx-auto max-w-2xl">
              <div className="mx-auto mb-5 inline-flex items-center gap-2.5 rounded-full border border-iris-400/30 bg-iris-500/10 px-3.5 py-1.5">
                <Sparkles size={12} className="text-iris-200" />
                <span className="font-mono text-[11px] tracking-wide text-iris-100">{c.eyebrow}</span>
              </div>

              <h2 className="font-display text-[1.7rem] leading-tight font-semibold text-white sm:text-[2.35rem]">
                {c.title}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[13.5px] leading-relaxed text-white/60">{c.sub}</p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a href="#audit-tool" className="btn btn-primary !px-5 !py-3.5 !text-[13px]">
                  <Zap size={14} />
                  {c.primary}
                  <ArrowRight size={14} />
                </a>
                <a href="#pricing" className="btn btn-ghost !px-4.5 !py-3.5 !text-[13px]">
                  {c.secondary}
                </a>
              </div>

              <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {c.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 font-mono text-[11px] text-white/45">
                    <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- footer ---------------- */
export function SiteFooter({ c }: { c: Copy["footer"] }) {
  /* явная группировка ссылок: продукт / ресурсы / компания */
  const groups = [
    { title: c.product, links: [c.links[0], c.links[1], c.links[4]] },
    { title: c.resources, links: [c.links[2], c.links[3]] },
    { title: c.company, links: [] as { label: string; href: string }[] },
  ];

  return (
    <footer className="relative border-t border-white/[0.07] bg-abyss/70 px-4 pt-14 pb-8 sm:px-8">
      <div aria-hidden className="blueprint pointer-events-none absolute inset-0 -z-10 opacity-20" />
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={34} />
              <div>
                <div className="font-display text-[0.95rem] font-semibold text-white">VibeDebt</div>
                <div className="font-mono text-[10.5px] text-white/35">Doomsday Clock · 2026</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-[12.5px] leading-relaxed text-white/45">{c.tagline}</p>

            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fvibedebt.dev"
                target="_blank"
                rel="noopener"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/55 transition hover:border-iris-400/40 hover:text-white"
                aria-label="X (Twitter)"
              >
                <TwitterIcon size={14} />
              </a>
              <a
                href="https://github.com/20246ah-svg/lending"
                target="_blank"
                rel="noopener"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/55 transition hover:border-iris-400/40 hover:text-white"
                aria-label="GitHub"
              >
                <GithubIcon size={14} />
              </a>
              <span className="ml-2 flex items-center gap-2 rounded-full border border-mint-500/25 bg-mint-500/10 px-3 py-1.5 font-mono text-[10.5px] text-mint-300">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mint-400" />
                {c.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((group, i) => (
              <div key={group.title}>
                <div className="mono-label mb-4 !text-[10px]">{group.title}</div>
                <ul className="space-y-2.5">
                  {group.links.filter(Boolean).map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-[12.5px] text-white/50 transition hover:text-white">
                        {link.label}
                      </a>
                    </li>
                  ))}
                  {i === 2 && (
                    <>
                      <li>
                        <a href="#faq" className="text-[12.5px] text-white/50 transition hover:text-white">
                          FAQ
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://github.com/20246ah-svg/lending"
                          target="_blank"
                          rel="noopener"
                          className="text-[12.5px] text-white/50 transition hover:text-white"
                        >
                          GitHub
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="divider-x my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="flex items-center gap-2 font-mono text-[11px] text-white/35">
            {c.rights}
            <Heart size={11} className="text-ember-400" />
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-white/30">{c.builtFor}</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[10.5px] text-white/55 transition hover:border-iris-400/40 hover:text-white"
            >
              <ArrowUp size={11} />
              {c.backToTop}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
