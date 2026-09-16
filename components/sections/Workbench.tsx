"use client";

import React, { useState } from "react";
import {
  Check,
  FileCode2,
  RefreshCw,
  Sparkles,
  SquareTerminal,
  Terminal,
  TriangleAlert,
  UploadCloud,
  Zap,
} from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { Reveal, Segmented } from "@/components/ui/primitives";
import { ReportPanel } from "@/components/report/ReportPanel";
import { PRESETS, SAMPLE_BAD_SNIPPET } from "@/components/lib/data";
import { useAudit } from "@/components/lib/useAudit";
import type { InputMode, Lang, ReportTab, AiTool } from "@/components/lib/types";
import type { Copy } from "@/components/lib/copy";

function ConsoleBar({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ember-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-mint-500/70" />
        </div>
        <span className="font-mono text-[11px] text-white/45">{label}</span>
      </div>
      <span className="hidden items-center gap-1.5 font-mono text-[10.5px] text-white/30 sm:flex">
        <SquareTerminal size={11} />
        /api/audit · POST · json
      </span>
    </div>
  );
}

export function Workbench({
  lang,
  c,
}: {
  lang: Lang;
  c: Copy["workbench"];
}) {
  const engine = useAudit(lang, c.loadingStages);
  const [dragActive, setDragActive] = useState(false);

  const {
    inputMode,
    setInputMode,
    githubUrl,
    setGithubUrl,
    snippetCode,
    setSnippetCode,
    activePreset,
    setActivePreset,
    isAuditing,
    progress,
    errorMessage,
    report,
    isDemo,
    reportTab,
    setReportTab,
    targetTool,
    setTargetTool,
    reportRef,
    fileInputRef,
    runAudit,
    auditFile,
    handleFileInput,
  } = engine;

  const rc = c.report;
  const progressPct = Math.round(((progress.stage + 1) / c.loadingStages.length) * 100);

  return (
    <section id="audit-tool" className="relative scroll-mt-24 px-4 pb-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* section head */}
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-iris-400 shadow-[0_0_12px_2px_rgba(124,108,255,0.7)]" />
                <span className="mono-label text-white/60">{c.eyebrow}</span>
              </div>
              <h2 className="text-2xl font-semibold text-white sm:text-[2.1rem] sm:leading-[1.15]">{c.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{c.sub}</p>
            </div>
            <div className="hidden items-center gap-2 font-mono text-[10.5px] text-white/35 lg:flex">
              <Terminal size={12} />
              {c.engine}
            </div>
          </div>
        </Reveal>

        {/* console */}
        <Reveal delay={80} className="mt-8">
          <div className="panel rim rim-iris relative overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-iris-500/20 blur-[90px]"
            />
            <ConsoleBar label="vibedebt — audit workbench" />

            <div className="relative p-4 sm:p-6">
              {/* tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Segmented<InputMode>
                  value={inputMode}
                  onChange={setInputMode}
                  ariaLabel="Input mode"
                  items={[
                    {
                      id: "github",
                      label: c.tabGithub,
                      icon: <GithubIcon size={13} />,
                    },
                    {
                      id: "snippet",
                      label: c.tabSnippet,
                      icon: <FileCode2 size={13} />,
                    },
                    {
                      id: "preset",
                      label: c.tabPreset,
                      icon: <Sparkles size={13} />,
                    },
                  ]}
                />
                <span className="hidden font-mono text-[10.5px] text-white/30 sm:block">
                  {lang === "ru" ? "без сохранения исходников" : "source code is never stored"}
                </span>
              </div>

              {/* ---- github ---- */}
              {inputMode === "github" && (
                <div className="mt-5 space-y-3">
                  <label htmlFor="repo-url" className="mono-label block">
                    {c.githubLabel}
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <GithubIcon
                        size={15}
                        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-white/35"
                      />
                      <input
                        id="repo-url"
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && githubUrl.trim()) void runAudit();
                        }}
                        placeholder={c.githubPlaceholder}
                        className="field !pl-10"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => void runAudit()}
                      disabled={isAuditing || !githubUrl.trim()}
                      className="btn btn-primary sm:w-auto"
                    >
                      {isAuditing ? <RefreshCw size={13} className="animate-spin" /> : <Terminal size={13} />}
                      {c.run}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="font-mono text-[10.5px] text-white/35">{c.quickExample}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setGithubUrl("https://github.com/shadcn-ui/ui");
                        void runAudit({ url: "https://github.com/shadcn-ui/ui" });
                      }}
                      className="cursor-pointer rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10.5px] text-white/70 transition hover:border-mint-500/40 hover:text-mint-300"
                    >
                      {c.liveExample}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode("preset");
                        setActivePreset("cursor-saas");
                        void runAudit({ archetype: "cursor-saas" });
                      }}
                      className="cursor-pointer rounded-full border border-ember-500/25 bg-ember-500/10 px-2.5 py-1 font-mono text-[10.5px] text-ember-300 transition hover:border-ember-500/50"
                    >
                      {lang === "ru" ? "Cursor AI SaaS · 89% долга" : "Cursor AI SaaS · 89% risk"}
                    </button>
                  </div>
                </div>
              )}

              {/* ---- snippet / file ---- */}
              {inputMode === "snippet" && (
                <div className="mt-5 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".tsx,.ts,.js,.jsx,.json,.py,.vue,.svelte"
                    className="hidden"
                    onChange={handleFileInput}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="mono-label">{c.snippetLabel}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10.5px] text-white/70 transition hover:border-iris-400/50 hover:text-white"
                      >
                        <UploadCloud size={12} />
                        {c.uploadFile}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSnippetCode(SAMPLE_BAD_SNIPPET)}
                        className="cursor-pointer rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10.5px] text-white/60 transition hover:border-mint-500/40 hover:text-mint-300"
                      >
                        {c.sampleCode}
                      </button>
                    </div>
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) auditFile(file);
                    }}
                    className={`relative rounded-2xl border border-dashed p-1.5 transition ${
                      dragActive ? "border-iris-400/70 bg-iris-500/10" : "border-white/12 bg-void/40"
                    }`}
                  >
                    <textarea
                      rows={9}
                      value={snippetCode}
                      onChange={(e) => setSnippetCode(e.target.value)}
                      placeholder={c.snippetPlaceholder}
                      className="field !max-h-[420px] resize-y border-0 bg-transparent !text-[12px] leading-relaxed focus:!shadow-none"
                    />
                    {dragActive && (
                      <div className="absolute inset-0 grid place-items-center rounded-2xl bg-void/70 backdrop-blur-sm">
                        <span className="flex items-center gap-2 font-mono text-[11.5px] text-iris-200">
                          <UploadCloud size={15} />
                          {c.dropActive}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void runAudit()}
                      disabled={isAuditing || !snippetCode.trim()}
                      className="btn btn-primary"
                    >
                      {isAuditing ? <RefreshCw size={13} className="animate-spin" /> : <Terminal size={13} />}
                      {c.auditSnippet}
                    </button>
                    <span className="font-mono text-[10.5px] text-white/30">
                      {lang === "ru"
                        ? "файл читается в браузере и уходит только на анализ"
                        : "the file is read locally and sent for analysis only"}
                    </span>
                  </div>
                </div>
              )}

              {/* ---- presets ---- */}
              {inputMode === "preset" && (
                <div className="mt-5 space-y-3">
                  <span className="mono-label block">{c.presetLabel}</span>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {PRESETS.map((preset) => {
                      const active = activePreset === preset.id;
                      const critical = preset.tone === "critical";
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setActivePreset(preset.id);
                            void runAudit({ archetype: preset.id });
                          }}
                          className={`group cursor-pointer rounded-2xl border p-4 text-left transition ${
                            active
                              ? critical
                                ? "border-ember-500/45 bg-ember-500/[0.08]"
                                : "border-amber-500/45 bg-amber-500/[0.07]"
                              : "border-white/[0.07] bg-white/[0.02] hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-[0.85rem] font-medium text-white">
                              {preset.name}
                            </span>
                            <span
                              className={`font-mono text-[10.5px] font-semibold ${
                                critical ? "text-ember-300" : "text-amber-300"
                              }`}
                            >
                              {preset.score}%
                            </span>
                          </div>
                          <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                critical ? "bg-ember-400" : "bg-amber-400"
                              }`}
                              style={{ width: `${preset.score}%` }}
                            />
                          </div>
                          <p className="mt-2.5 text-[11.5px] leading-snug text-white/45">
                            {c.presetNotes[preset.id]}
                          </p>
                          <span
                            className={`mt-3 flex items-center gap-1.5 font-mono text-[10px] transition ${
                              active ? "text-white/70" : "text-white/30 group-hover:text-white/55"
                            }`}
                          >
                            <Zap size={10} />
                            {lang === "ru" ? "запустить кейс" : "run case"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---- error ---- */}
              {errorMessage && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-ember-500/30 bg-ember-500/[0.08] p-3.5">
                  <TriangleAlert size={15} className="mt-0.5 shrink-0 text-ember-400" />
                  <p className="font-mono text-[11.5px] leading-relaxed text-ember-200">
                    <strong className="font-semibold text-ember-300">{c.errorPrefix}</strong> {errorMessage}
                  </p>
                </div>
              )}

              {/* ---- scanning ---- */}
              {isAuditing && (
                <div className="relative mt-5 overflow-hidden rounded-2xl border border-iris-500/25 bg-void/60 p-4">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-16 animate-scan bg-gradient-to-b from-transparent via-iris-500/25 to-transparent"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-mono text-[11.5px] text-white/80">
                      <RefreshCw size={13} className="animate-spin text-iris-300" />
                      {progress.label || c.loading}
                    </span>
                    <span className="font-mono text-[10.5px] text-white/35">{progressPct}%</span>
                  </div>
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-iris-500 to-mint-400 transition-all duration-700 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {c.loadingStages.map((stage, i) => (
                      <li key={stage} className="flex items-center gap-2 font-mono text-[10.5px]">
                        {i < progress.stage ? (
                          <Check size={11} className="text-mint-300" />
                        ) : i === progress.stage ? (
                          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-iris-400" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                        )}
                        <span className={i <= progress.stage ? "text-white/70" : "text-white/30"}>{stage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* report */}
        <ReportPanel
          report={report}
          lang={lang}
          c={rc}
          isDemo={isDemo}
          tab={reportTab as ReportTab}
          setTab={setReportTab}
          targetTool={targetTool as AiTool}
          setTargetTool={setTargetTool}
          anchorRef={reportRef}
        />
      </div>
    </section>
  );
}
