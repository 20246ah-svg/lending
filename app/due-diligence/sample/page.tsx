"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckIcon, CopyIcon, ArrowRightIcon } from "@/components/icons";
import AuditOrderModal from "@/components/landing/AuditOrderModal";

export default function SampleReportPage() {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const curlExploit = `curl -X GET "https://ai-landing-builder.supabase.co/rest/v1/orders?select=*" \\
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlExploit);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black py-10 px-4 sm:px-8">
      {/* Top Bar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pb-8 border-b border-zinc-800 print:hidden">
        <Link
          href="/due-diligence"
          className="text-xs font-mono text-zinc-400 hover:text-white transition flex items-center gap-1.5"
        >
          <span>← Back to Due Diligence</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 transition cursor-pointer"
          >
            🖨️ Print / Save as PDF
          </button>
          <button
            onClick={() => setOrderModalOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
          >
            Order Deal Audit ($149)
          </button>
        </div>
      </div>

      {/* The Printable 4-Page Dossier */}
      <main className="max-w-4xl mx-auto my-8 space-y-8">
        {/* Document Header */}
        <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  VIBEDEBT // M&A TECH INSPECTION DOSSIER
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  REF: DD-2026-4912
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Technical Due Diligence Report: instant-ai-landing-builder
              </h1>
              <div className="text-xs font-mono text-zinc-400 mt-1">
                Target Listing: Acquire.com #4912 • Seller Asking Price: $38,000 • Stack: Next.js + Supabase + Stripe
              </div>
            </div>

            <div className="shrink-0 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                AUDIT VERDICT
              </div>
              <div className="text-xl font-extrabold text-rose-400 font-mono">
                RED FLAG
              </div>
            </div>
          </div>

          {/* PAGE 1: EXECUTIVE VERDICT & CAPEX */}
          <div className="pt-8 space-y-6">
            <h2 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Section 1: Executive Verdict & Valuation Exposure</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div className="text-zinc-500 text-xs mb-1">Seller Asking Price</div>
                <div className="text-2xl font-bold text-white">$38,000</div>
              </div>
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20">
                <div className="text-rose-400 text-xs mb-1">Calculated Fix CAPEX</div>
                <div className="text-2xl font-bold text-rose-300">-$4,800</div>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
                <div className="text-emerald-400 text-xs mb-1">Recommended Offer</div>
                <div className="text-2xl font-bold text-emerald-300">$30,800 (-19%)</div>
              </div>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              <strong>Executive Summary:</strong> The target codebase was rapidly generated using Lovable and Cursor.
              While the live application works for standard happy-path demo flows, our inspection uncovered critical security
              and architectural debt that directly threatens business continuity post-acquisition. We recommend either requiring
              the seller to remediate the database access policies before escrow release or discounting the purchase price by
              at least $7,200 ($4,800 stabilization cost × 1.5 risk multiplier).
            </p>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2 text-xs font-sans">
              <div className="font-bold text-white font-mono text-xs">
                PRIMARY RISK HIGHLIGHTS:
              </div>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li>
                  <strong>Supabase RLS Bypass (CVE-2025-48757):</strong> All customer records and Stripe checkout emails
                  are publicly readable using the public anonymous client key.
                </li>
                <li>
                  <strong>Master Secret Leak:</strong> <code>SUPABASE_SERVICE_ROLE_KEY</code> was found in a client-side component (<code>Dashboard.tsx</code>).
                </li>
                <li>
                  <strong>Missing Stripe Webhook Idempotency:</strong> Replayed webhooks trigger duplicate balance credit.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* PAGE 2: SECURITY & RLS EXPLOIT PROOF */}
        <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl space-y-6">
          <h2 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Section 2: Security & Supabase RLS Exploit Reproduction</span>
          </h2>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs font-sans text-zinc-300">
            <strong>Vulnerability Overview:</strong> The seller provided a clean security screenshot from Lovable.
            However, Lovable only tests if the RLS toggle is active, not whether the policy expressions are sound.
            The policy for <code>orders</code> uses <code>USING (true)</code>, granting full public read privileges.
          </div>

          <div className="p-4 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-300 font-mono relative">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-850">
              <span className="text-zinc-500">Terminal — Reproduction Command</span>
              <button
                onClick={copyCurl}
                className="px-2.5 py-1 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-200 transition flex items-center gap-1.5 cursor-pointer text-[11px] print:hidden"
              >
                {copiedCurl ? <CheckIcon size={12} className="text-emerald-400" /> : <CopyIcon size={12} />}
                <span>{copiedCurl ? "Copied!" : "Copy curl"}</span>
              </button>
            </div>
            <pre className="text-emerald-400 overflow-x-auto whitespace-pre-wrap">{curlExploit}</pre>
            <div className="mt-3 pt-3 border-t border-zinc-800 text-zinc-400 text-[11px]">
              Response: HTTP/1.1 200 OK — 1,420 customer order records dumped with PII and payment amounts.
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs font-mono">
            <div className="font-bold text-white mb-2">Remediation SQL Patch (Post-Acquisition):</div>
            <pre className="p-3 rounded-lg bg-black text-cyan-300 overflow-x-auto">{`DROP POLICY IF EXISTS "Public read orders" ON public.orders;

CREATE POLICY "Users can only read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);`}</pre>
          </div>
        </div>

        {/* PAGE 3: CODEBASE MONOLITHS & FAKE CI */}
        <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl space-y-6">
          <h2 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Section 3: Codebase Architecture & CI/CD Reality</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="text-zinc-500 mb-1">God-Component Monolith</div>
              <div className="text-base font-bold text-white">src/app/page.tsx</div>
              <div className="text-xs text-rose-400 font-bold mt-1">2,420 lines of code</div>
              <div className="text-[11px] text-zinc-400 font-sans mt-2">
                Contains state management, checkout routing, payment error handlers, and 22 unmemoized React hooks.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="text-zinc-500 mb-1">CI Pipeline Reality</div>
              <div className="text-base font-bold text-white">GitHub Actions</div>
              <div className="text-xs text-rose-400 font-bold mt-1">0 automated tests running</div>
              <div className="text-[11px] text-zinc-400 font-sans mt-2">
                Test files in the repository are hallucinated mock templates with zero execution pipeline.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/10 text-xs font-sans text-zinc-300">
            <strong>Hidden Quota Debt:</strong> The application relies on the seller&apos;s personal OpenAI account on Tier 1
            ($100/mo cap). The buyer will face rate-limit outages (429) unless a $1,000 prepayment deposit is made to upgrade
            the API account tier immediately upon handover.
          </div>
        </div>

        {/* PAGE 4: 12 NEGOTIATION QUESTIONS */}
        <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl space-y-6">
          <h2 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Section 4: Buyer Negotiation Questions for the Seller Call</span>
          </h2>

          <p className="text-xs text-zinc-300 font-sans">
            Use these precise questions during your technical due diligence call with the seller before waiving escrow conditions:
          </p>

          <div className="space-y-3 font-mono text-xs">
            {[
              {
                q: "1. Can you show me the SQL policy body for the 'orders' table in Supabase dashboard?",
                redFlag: "“Everything is automated by Lovable, we didn’t touch the SQL.”",
                leverage: "Policy is USING (true). Use this to demand a $1,500 concession to rewrite RLS policies.",
              },
              {
                q: "2. Where in the Next.js API route does the Stripe webhook verify event signatures?",
                redFlag: "“Stripe sends SSL requests, so signature verification is redundant.”",
                leverage: "Webhook is unauthenticated. Anyone can forge purchase events via curl.",
              },
              {
                q: "3. Can you run 'npm test' live on screen right now?",
                redFlag: "“The tests were generated in Cursor for preview only, not meant for CI.”",
                leverage: "Zero regression coverage. Any future code modifications carry elevated defect risk.",
              },
              {
                q: "4. Whose credit card and organization owns the OpenAI/Anthropic model endpoints?",
                redFlag: "“It's on my personal account, we can just switch the API key.”",
                leverage: "Buyer must apply for tier upgrades to avoid 429 rate limit locks post-close.",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
                <div className="font-bold text-white text-xs">{item.q}</div>
                <div className="text-[11px] text-rose-400">
                  <span className="font-bold">Evasion Signal: </span>
                  <span className="font-sans italic">{item.redFlag}</span>
                </div>
                <div className="text-[11px] text-emerald-400">
                  <span className="font-bold">Buyer Leverage: </span>
                  <span className="font-sans text-zinc-300">{item.leverage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card (Hidden in Print) */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-8 text-center print:hidden">
          <h3 className="text-xl font-bold text-white mb-2">
            Evaluating an AI Micro-SaaS Acquisition?
          </h3>
          <p className="text-xs text-zinc-300 max-w-lg mx-auto mb-6">
            Get an identical 4-page independent Technical Due Diligence Dossier for your target deal within 48 hours under mutual NDA.
          </p>
          <button
            onClick={() => setOrderModalOpen(true)}
            className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/25 inline-flex items-center gap-2"
          >
            <span>Order Deal Audit ($149)</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </main>

      <AuditOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        lang="en"
        initialTier="due_diligence"
      />
    </div>
  );
}
