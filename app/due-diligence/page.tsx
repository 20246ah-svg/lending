"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldAlertIcon, CheckIcon, ZapIcon, ArrowRightIcon, FileCodeIcon } from "@/components/icons";
import AuditOrderModal from "@/components/landing/AuditOrderModal";

export default function DueDiligencePage() {
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black relative">
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-25 z-0" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-800/80 bg-[#050508]/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 transition">
                <ZapIcon size={16} />
              </span>
              <span className="font-mono font-bold tracking-wider text-base text-white">
                VIBE<span className="text-emerald-400">DEBT</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 ml-1">
                M&A DUE DILIGENCE
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
            <Link
              href="/due-diligence/sample"
              className="text-zinc-400 hover:text-white transition flex items-center gap-1.5"
            >
              <FileCodeIcon size={13} />
              <span>Sample Report</span>
            </Link>
            <button
              onClick={() => setOrderModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
            >
              Order Audit ($149)
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-8 max-w-5xl mx-auto z-10 relative text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-950/20 text-xs font-mono text-rose-300 mb-8 backdrop-blur-md">
          <ShieldAlertIcon size={14} className="text-rose-400" />
          <span>INDEPENDENT CODE & SECURITY INSPECTION FOR BUYERS</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300 font-bold">48H SLA</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          Buying an AI SaaS on Acquire.com? <br />
          <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
            Don&apos;t acquire a vibe-coded lemon.
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-sm sm:text-base text-zinc-400 font-sans leading-relaxed mb-10">
          Generative AI tools (Cursor, Lovable, Bolt) make it easy to generate 10,000 lines of code in 72 hours.
          Before releasing escrow funds on a $15,000–$100,000 acquisition, verify what&apos;s actually under the hood
          with an independent 48-hour technical audit under mutual NDA.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => setOrderModalOpen(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-extrabold text-sm uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <ZapIcon size={16} className="fill-zinc-950 text-zinc-950" />
            <span>Order Deal Audit ($149) →</span>
          </button>

          <Link
            href="/due-diligence/sample"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-mono text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
          >
            <span>Inspect Sample Report PDF</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        {/* Institutional Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-zinc-400 max-w-3xl mx-auto">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex items-center gap-2.5 justify-center">
            <span className="text-emerald-400">🔒</span>
            <span>Strict Mutual NDA Protection</span>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex items-center gap-2.5 justify-center">
            <span className="text-emerald-400">⏱️</span>
            <span>Guaranteed 48-Hour Turnaround</span>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex items-center gap-2.5 justify-center">
            <span className="text-emerald-400">⚖️</span>
            <span>100% Conflict-Free Inspection</span>
          </div>
        </div>
      </section>

      {/* The 4 Failure Vectors Inspected */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto z-10 relative border-t border-zinc-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            What Platforms Miss, We Catch
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            AI app builders grade their own homework. Lovable checks whether a checkbox exists; we test whether your customer data is actually protected.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-3">
            <div className="text-rose-400 text-xs font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>VECTOR 1: SUPABASE RLS BYPASS (CVE-2025-48757)</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Lovable and Supabase security advisors flag green if Row Level Security is &quot;enabled&quot;.
              However, 80%+ of AI templates generate dummy policies using <code>USING (true)</code>,
              allowing any unauthenticated visitor to scrape your entire customer database via curl.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-3">
            <div className="text-amber-400 text-xs font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>VECTOR 2: CLIENT BUNDLE SECRET LEAKS</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              AI models frequently insert <code>process.env.SUPABASE_SERVICE_ROLE_KEY</code> or <code>sk_live_...</code> into
              Next.js <code>&apos;use client&apos;</code> components to circumvent database permission errors.
              We inspect build bundles and git reflogs for leaked master credentials.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-3">
            <div className="text-purple-400 text-xs font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>VECTOR 3: UNMAINTAINABLE GOD-COMPONENTS</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              LLMs append code indefinitely to single files rather than refactoring.
              A single 2,500-line <code>page.tsx</code> with 20+ unmemoized hooks will break the moment
              you attempt to add a new Stripe tier or integrate post-acquisition analytics.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-3">
            <div className="text-cyan-400 text-xs font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>VECTOR 4: FAKE CI & HIDDEN QUOTA DEBT</span>
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Many AI projects have mock test files committed that have never run in a CI pipeline.
              Additionally, apps often run on the seller&apos;s personal OpenAI Tier 1 rate-limited key ($100/mo quota),
              which will throw 429 errors under real production load.
            </p>
          </div>
        </div>
      </section>

      {/* Deliverable Breakdown */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto z-10 relative border-t border-zinc-800/80">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-8 sm:p-10 text-left">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                WHAT YOU RECEIVE IN 48 HOURS
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-2">
                4-Page Executive Tech DD Dossier + Loom Walkthrough
              </h3>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-extrabold font-mono text-white">$149</div>
              <div className="text-xs font-mono text-zinc-400">One-time per deal</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-zinc-300 mb-8">
            <div className="flex items-start gap-2.5">
              <CheckIcon size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Green/Yellow/Red Flag traffic-light verdict with zero developer jargon</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckIcon size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Full Supabase RLS policy audit with proof-of-exploit curl commands</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckIcon size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Calculated Senior Engineer CAPEX estimate ($ amount to stabilize)</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckIcon size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>12 lethal technical questions for the seller call + price discount formula</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => setOrderModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Order Due Diligence for Your Deal ($149) →
            </button>
            <Link
              href="/due-diligence/sample"
              className="text-emerald-400 hover:text-emerald-300 font-mono text-xs underline underline-offset-4"
            >
              Read full sample report →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 text-center text-xs font-mono text-zinc-500">
        <div>VIBEDEBT // Independent Technical Inspection for Micro-SaaS M&A</div>
        <div className="mt-2 text-zinc-600">
          Not affiliated with Acquire.com or Microns.io. Audits conducted under strict mutual NDA.
        </div>
      </footer>

      {/* Order Modal */}
      <AuditOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        lang="en"
        initialTier="due_diligence"
      />
    </div>
  );
}
