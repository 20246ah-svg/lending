"use client";

import React, { useState } from "react";
import { BellRing, Check, GitPullRequest, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/primitives";
import type { Copy, Lang } from "@/components/lib/copy";

export function Waitlist({ c, lang }: { c: Copy["waitlist"]; lang: Lang }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="relative px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="panel rim rim-mint relative overflow-hidden p-6 sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-mint-500/12 blur-[100px]"
            />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="inline-flex items-center gap-2.5 rounded-full border border-mint-500/25 bg-mint-500/10 px-3.5 py-1.5">
                  <ShieldCheck size={13} className="text-mint-300" />
                  <span className="font-mono text-[11px] tracking-wide text-mint-200">{c.eyebrow}</span>
                </div>

                <h2 className="mt-5 flex items-center gap-2.5 font-display text-2xl font-semibold text-white">
                  {c.title}
                </h2>
                <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-white/55">{c.sub}</p>

                {done ? (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-mint-500/30 bg-mint-500/10 p-4">
                    <Check size={16} className="mt-0.5 shrink-0 text-mint-300" />
                    <p className="text-[12.5px] leading-relaxed text-mint-200">{c.success}</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!email.trim()) return;
                      setDone(true);
                    }}
                    className="mt-6 flex flex-col gap-2 sm:flex-row"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={c.placeholder}
                      className="field flex-1"
                      aria-label={c.placeholder}
                    />
                    <button type="submit" className="btn btn-mint shrink-0">
                      <BellRing size={13} />
                      {c.cta}
                    </button>
                  </form>
                )}

                <p className="mt-3.5 text-[11px] leading-relaxed text-white/35">{c.note}</p>
              </div>

              {/* mini anatomy of the bot */}
              <div className="panel-flat relative overflow-hidden p-4">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                  <span className="flex items-center gap-2 font-mono text-[10.5px] text-white/50">
                    <GitPullRequest size={12} />
                    PR #482 · cursor/feat-billing
                  </span>
                  <span className="rounded-md border border-ember-500/30 bg-ember-500/10 px-2 py-0.5 font-mono text-[9.5px] text-ember-300">
                    BLOCKED
                  </span>
                </div>
                <ul className="mt-3 space-y-2.5 font-mono text-[10.5px]">
                  <li className="flex items-start gap-2 text-ember-300">
                    <span>✗</span>
                    <span>app/checkout/page.tsx — 612 строк (&gt; 400)</span>
                  </li>
                  <li className="flex items-start gap-2 text-ember-300">
                    <span>✗</span>
                    <span>+14 новых `as any` в diff</span>
                  </li>
                  <li className="flex items-start gap-2 text-ember-300">
                    <span>✗</span>
                    <span>STRIPE_SECRET_KEY в клиентском компоненте</span>
                  </li>
                  <li className="flex items-start gap-2 text-mint-300">
                    <span>✓</span>
                    <span>тесты запущены: 42 passed</span>
                  </li>
                </ul>
                <div className="mt-4 rounded-lg border border-white/[0.07] bg-void/50 p-3 font-mono text-[10px] leading-relaxed text-white/45">
                  {lang === "ru"
                    ? "Бот вернёт diff с готовыми промптами, чтобы вы починили это за один заход."
                    : "The bot replies with a diff plus ready prompts, so you can fix it in a single pass."}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
