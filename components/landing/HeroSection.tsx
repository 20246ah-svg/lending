"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ZapIcon, GithubIcon, FileCodeIcon, SparklesIcon, AlertTriangleIcon } from "@/components/icons";
import CodeShowcase from "@/components/ui/CodeShowcase";
import { i18n } from "@/lib/i18n";
import { AuditRequestBody } from "@/lib/types";
import { track } from "@/lib/analytics";

const HeroScene = dynamic(() => import("@/components/canvas/HeroScene"), {
  ssr: false,
});

interface HeroSectionProps {
  lang: "ru" | "en";
  isAuditing: boolean;
  auditProgress: string;
  errorMessage: string | null;
  onRunAudit: (payload: AuditRequestBody) => void;
  onLoadSample: () => void;
}

const SAMPLE_SNIPPET = `"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Типичный файл из Cursor на 450 строк
export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState({ page: 1 });

  // ⚠️ Утечка master-ключа в открытый JS-бандл браузера (CWE-798):
  const supabase = createClient(
    process.env.NEXT_PUBLIC_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ⚠️ Бесконечный цикл ререндера:
  useEffect(() => {
    supabase.from("orders").select("*").then((res: any) => setData(res.data));
  }, [filters]);

  return <div>Панель управления ({data?.length || 0})</div>;
}`;

export default function HeroSection({
  lang,
  isAuditing,
  auditProgress,
  errorMessage,
  onRunAudit,
  onLoadSample,
}: HeroSectionProps) {
  const t = i18n[lang];
  const [inputTab, setInputTabState] = useState<"github" | "snippet" | "archetype">("github");
  const [githubUrl, setGithubUrl] = useState("https://github.com/shadcn-ui/ui");
  const [snippetCode, setSnippetCode] = useState(SAMPLE_SNIPPET);

  const setInputTab = (tab: "github" | "snippet" | "archetype") => {
    if (tab !== inputTab) track("tab_switched", { tab });
    setInputTabState(tab);
  };

  const handleStartGithub = () => {
    if (!githubUrl.trim() || isAuditing) return;
    onRunAudit({ url: githubUrl.trim(), lang });
  };

  const handleStartSnippet = () => {
    if (!snippetCode.trim() || isAuditing) return;
    onRunAudit({ snippet: snippetCode.trim(), lang });
  };

  const handleStartArchetype = (archetype: string) => {
    if (isAuditing) return;
    onRunAudit({ archetype, lang });
  };

  return (
    <section className="relative pt-16 pb-20 px-4 sm:px-8 z-10 overflow-hidden">
      <HeroScene />

      <div className="max-w-5xl mx-auto w-full relative z-20 text-center flex flex-col items-center">
        {/* Proof Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-xs font-mono text-emerald-300 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold">{t.badgeProof}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">{t.badgeProofSub}</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          {t.heroTitle1} <br />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            {t.heroTitle2}
          </span>
        </h1>

        <p className="max-w-2xl text-sm sm:text-base text-zinc-400 font-sans leading-relaxed mb-10">
          {t.heroSub}
        </p>

        {/* INPUT TABS & WORKBENCH */}
        <div id="audit-tool" className="w-full max-w-2xl mb-8">
          {/* Mode Switcher */}
          <div className="flex items-center justify-center gap-2 mb-3 font-mono text-xs">
            <button
              onClick={() => setInputTab("github")}
              className={`px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                inputTab === "github"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold"
                  : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <GithubIcon size={14} />
              <span>{t.tabGithub}</span>
            </button>

            <button
              onClick={() => setInputTab("snippet")}
              className={`px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                inputTab === "snippet"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold"
                  : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileCodeIcon size={14} />
              <span>{t.tabSnippet}</span>
            </button>

            <button
              onClick={() => setInputTab("archetype")}
              className={`px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                inputTab === "archetype"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold"
                  : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <SparklesIcon size={14} />
              <span>{t.tabArchetypes}</span>
            </button>
          </div>

          {/* TAB 1: GITHUB URL */}
          {inputTab === "github" && (
            <div className="flex flex-col sm:flex-row items-stretch rounded-2xl border-2 border-emerald-500/80 bg-zinc-950/95 p-2 shadow-[0_0_50px_rgba(16,185,129,0.25)] backdrop-blur-xl gap-2">
              <div className="flex items-center gap-3 px-3.5 flex-1">
                <GithubIcon size={18} className="text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className="w-full bg-transparent text-xs sm:text-sm font-mono text-white placeholder-zinc-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleStartGithub();
                  }}
                />
              </div>

              <button
                onClick={handleStartGithub}
                disabled={isAuditing}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <ZapIcon size={15} className="fill-zinc-950 text-zinc-950" />
                <span>{isAuditing ? t.btnScanning : t.btnScan1Sec}</span>
              </button>
            </div>
          )}

          {/* TAB 2: SNIPPET PASTE */}
          {inputTab === "snippet" && (
            <div className="rounded-2xl border-2 border-emerald-500/80 bg-zinc-950/95 p-3 text-left shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2 px-1">
                <span>{lang === "ru" ? "Вставьте подозрительный код из Cursor:" : "Paste suspicious code from Cursor:"}</span>
                <button
                  onClick={() => setSnippetCode(SAMPLE_SNIPPET)}
                  className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                >
                  {lang === "ru" ? "Заполнить примером" : "Insert Sample"}
                </button>
              </div>
              <textarea
                value={snippetCode}
                onChange={(e) => setSnippetCode(e.target.value)}
                rows={7}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-y"
                placeholder={t.snippetPlaceholder}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500">
                  {snippetCode.split("\n").length} {lang === "ru" ? "строк кода" : "lines"}
                </span>
                <button
                  onClick={handleStartSnippet}
                  disabled={isAuditing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <ZapIcon size={14} className="fill-zinc-950 text-zinc-950" />
                  <span>{isAuditing ? t.btnScanning : t.btnScanSnippet}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHETYPE PRESETS */}
          {inputTab === "archetype" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "cursor-saas",
                  title: "Cursor SaaS MVP",
                  desc: lang === "ru" ? "Next.js + Supabase + Stripe" : "Next.js + Supabase + Stripe",
                  score: "88% CRITICAL",
                },
                {
                  id: "bolt-landing",
                  title: "Bolt.new Landing",
                  desc: lang === "ru" ? "Vite + Tailwind + React SPA" : "Vite + Tailwind + React SPA",
                  score: "79% HIGH",
                },
                {
                  id: "crypto-bot",
                  title: "Crypto Trading Bot",
                  desc: lang === "ru" ? "Node.js + Webhook + Wallets" : "Node.js + Webhook + Wallets",
                  score: "92% CRITICAL",
                },
              ].map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => handleStartArchetype(arch.id)}
                  disabled={isAuditing}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 hover:border-emerald-500/60 text-left transition cursor-pointer group"
                >
                  <div className="text-xs font-mono font-bold text-white group-hover:text-emerald-400 mb-1">
                    {arch.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-sans mb-2">{arch.desc}</div>
                  <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-block font-bold">
                    {arch.score}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Demo Repositories */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-mono text-zinc-400">
            <span className="text-zinc-600">{t.tryPresets}</span>
            {[
              { name: "shadcn-ui/ui", url: "https://github.com/shadcn-ui/ui" },
              { name: "calcom/cal.com", url: "https://github.com/calcom/cal.com" },
              { name: "t3-oss/t3-env", url: "https://github.com/t3-oss/t3-env" },
            ].map((repo) => (
              <button
                key={repo.name}
                onClick={() => {
                  setInputTab("github");
                  setGithubUrl(repo.url);
                  onRunAudit({ url: repo.url, lang });
                }}
                className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400 transition cursor-pointer"
              >
                {repo.name}
              </button>
            ))}

            <span className="text-zinc-600">•</span>

            <button
              onClick={onLoadSample}
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
            >
              {t.viewSample}
            </button>
          </div>
        </div>

        {/* Progress / Error HUD */}
        {isAuditing && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-zinc-950/80 font-mono text-xs text-emerald-400 flex items-center gap-3 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{auditProgress}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 font-mono text-xs text-rose-300 flex items-center gap-3">
            <AlertTriangleIcon size={16} className="text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* INTERACTIVE DEVELOPER PRODUCT SHOWCASE */}
        <div className="w-full mt-4">
          <CodeShowcase lang={lang} />
        </div>
      </div>
    </section>
  );
}
