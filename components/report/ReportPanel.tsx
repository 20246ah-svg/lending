"use client";

import React, { type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  Bug,
  Check,
  Clock,
  Copy as CopyIcon,
  FileCode2,
  Flame,
  Layers,
  Share2,
  Sparkles,
  TriangleAlert,
  Wallet,
  Zap,
} from "lucide-react";
import {
  Meter,
  Reveal,
  ScoreGauge,
  Segmented,
  useCopy,
} from "@/components/ui/primitives";
import { formatNumber, riskOf, type AiTool, type AuditReport, type ReportTab } from "@/components/lib/types";
import type { Copy, Lang } from "@/components/lib/copy";

type Tone = "critical" | "elevated" | "healthy";

const TONE_CLASS: Record<Tone, { text: string; border: string; bg: string; dot: string }> = {
  critical: {
    text: "text-ember-300",
    border: "border-ember-500/30",
    bg: "bg-ember-500/[0.07]",
    dot: "bg-ember-400",
  },
  elevated: {
    text: "text-amber-300",
    border: "border-amber-500/30",
    bg: "bg-amber-500/[0.06]",
    dot: "bg-amber-400",
  },
  healthy: {
    text: "text-mint-300",
    border: "border-mint-500/30",
    bg: "bg-mint-500/[0.06]",
    dot: "bg-mint-400",
  },
};

function Chip({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "mint" | "ember" | "iris";
  className?: string;
}) {
  const tones = {
    neutral: "border-white/10 bg-white/[0.04] text-white/65",
    mint: "border-mint-500/25 bg-mint-500/10 text-mint-300",
    ember: "border-ember-500/25 bg-ember-500/10 text-ember-300",
    iris: "border-iris-500/30 bg-iris-500/12 text-iris-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

function CodeBlock({
  title,
  code,
  tone,
  copyLabel,
  copiedLabel,
  onCopy,
  copied,
}: {
  title: string;
  code: string;
  tone: "bad" | "good";
  copyLabel?: string;
  copiedLabel?: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  const accent = tone === "bad" ? "text-ember-300" : "text-mint-300";
  return (
    <div className={`code-surface group relative overflow-hidden ${tone === "bad" ? "rim rim-ember" : "rim rim-mint"}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-3.5 py-2">
        <span className={`font-mono text-[10.5px] font-semibold tracking-wide ${accent}`}>{title}</span>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
          <span
            className={`h-1.5 w-1.5 rounded-full ${tone === "bad" ? "bg-ember-500/60" : "bg-mint-500/60"}`}
          />
        </div>
      </div>
      <pre className="max-h-[320px] overflow-auto p-3.5 whitespace-pre">{code}</pre>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="absolute right-3 bottom-3 flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-void/85 px-2.5 py-1.5 font-mono text-[10.5px] text-white/70 opacity-0 backdrop-blur transition hover:text-white group-hover:opacity-100"
        >
          {copied ? <Check size={11} className="text-mint-300" /> : <CopyIcon size={11} />}
          {copied ? copiedLabel : copyLabel}
        </button>
      )}
    </div>
  );
}

function KpiCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`panel lift relative overflow-hidden p-4 sm:p-5 ${className}`} style={style}>
      {children}
    </div>
  );
}

export function ReportPanel({
  report,
  lang,
  c,
  isDemo,
  tab,
  setTab,
  targetTool,
  setTargetTool,
  anchorRef,
}: {
  report: AuditReport;
  lang: Lang;
  c: Copy["workbench"]["report"];
  isDemo: boolean;
  tab: ReportTab;
  setTab: (t: ReportTab) => void;
  targetTool: AiTool;
  setTargetTool: (t: AiTool) => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const badge = useCopy();
  const post = useCopy();

  const tone: Tone = riskOf(report.doomsdayScore);
  const t = TONE_CLASS[tone];

  const verdict =
    tone === "critical" ? c.scoreCritical : tone === "elevated" ? c.scoreElevated : c.scoreHealthy;

  const fixHours = Math.max(1, Math.round(report.estimatedFixCost / 60));

  const handleShare = () => {
    const text =
      lang === "ru"
        ? `Мой вайбкод-проект набрал ${report.doomsdayScore}% по Счётчику Судного Дня (крах через ${report.timeToCollapse}). Проверь свой техдолг:`
        : `My AI-built SaaS scored ${report.doomsdayScore}% on the Doomsday Clock (collapse in ${report.timeToCollapse}). Check your tech debt:`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent("https://vibedebt.dev")}`,
      "_blank",
      "noopener"
    );
  };

  const handleCopyPost = () => {
    const text =
      lang === "ru"
        ? `Аудит VibeDebt для ${report.repoName}: Doomsday Score ${report.doomsdayScore}% · запас прочности — ${report.timeToCollapse}. Проверь свой проект: https://vibedebt.dev`
        : `VibeDebt audit for ${report.repoName}: Doomsday Score ${report.doomsdayScore}% · time to collapse — ${report.timeToCollapse}. Check yours: https://vibedebt.dev`;
    post.copy(text, "post");
  };

  const handleCopyBadge = () => {
    const state = report.doomsdayScore > 75 ? "CRITICAL" : "ELEVATED";
    badge.copy(
      `[![VibeDebt Doomsday](https://img.shields.io/badge/VibeDebt_Doomsday-${report.doomsdayScore}%25_${state}-f43f5e?style=flat-square&logo=github)](https://vibedebt.dev)`,
      "badge"
    );
  };

  return (
    <div ref={anchorRef} className="mt-8 scroll-mt-28">
      {/* ------- header ------- */}
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono-label">{c.for}</span>
              <span className="max-w-[240px] truncate rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-white/85">
                {report.repoName}
              </span>
              <Chip tone={report.isRealRepo ? "mint" : "neutral"}>
                <span className={`h-1.5 w-1.5 rounded-full ${report.isRealRepo ? "bg-mint-400 animate-pulse-soft" : "bg-white/40"}`} />
                {report.isRealRepo ? c.live : c.demo}
              </Chip>
            </div>
            <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-white/50">
              {report.diagnosticsSummary}
            </p>
            {isDemo && (
              <p className="mt-2 font-mono text-[10.5px] text-amber-200/70">
                {lang === "ru"
                  ? "↑ Показан демо-отчёт: запустите аудит в панели выше, чтобы увидеть данные своего проекта."
                  : "↑ This is a demo report: run an audit in the panel above to see your own project."}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleShare} className="btn btn-ghost !px-3 !py-2 !text-[11.5px]">
              <Share2 size={12} />
              {c.shareX}
            </button>
            <button type="button" onClick={handleCopyPost} className="btn btn-ghost !px-3 !py-2 !text-[11.5px]">
              {post.isCopied("post") ? <Check size={12} className="text-mint-300" /> : <CopyIcon size={12} />}
              {post.isCopied("post") ? c.copied : c.copyPost}
            </button>
            <button type="button" onClick={handleCopyBadge} className="btn btn-ghost !px-3 !py-2 !text-[11.5px]">
              {badge.isCopied("badge") ? <Check size={12} className="text-mint-300" /> : <Layers size={12} />}
              {badge.isCopied("badge") ? c.copied : c.badge}
            </button>
          </div>
        </div>
      </Reveal>

      {/* ------- KPI grid ------- */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12">
        <Reveal delay={40} className="sm:col-span-2 xl:col-span-5">
          <KpiCard className={`h-full ${t.border}`} style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0)) , var(--color-abyss)" }}>
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
              <ScoreGauge value={report.doomsdayScore} tone={tone} size={148} thickness={9} />
              <div className="w-full text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <TriangleAlert size={13} className={t.text} />
                  <span className="mono-label !text-white/60">{c.score}</span>
                </div>
                <div className={`mt-2 font-display text-lg font-semibold ${t.text}`}>{verdict}</div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">{c.scoreHint}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Meter value={report.doomsdayScore} tone={tone} height={5} />
                  <span className="font-mono text-[10.5px] text-white/40">100</span>
                </div>
              </div>
            </div>
          </KpiCard>
        </Reveal>

        <Reveal delay={90} className="xl:col-span-3">
          <KpiCard className="h-full">
            <div className="flex items-center justify-between">
              <span className="mono-label">{c.ttd}</span>
              <Clock size={14} className="text-white/35" />
            </div>
            <p className="mt-4 font-display text-[1.05rem] leading-snug font-medium text-balance text-white">
              {report.timeToCollapse}
            </p>
            <p className="mt-3 border-t border-white/[0.07] pt-3 font-mono text-[10.5px] text-white/35">
              {c.ttdHint}
            </p>
          </KpiCard>
        </Reveal>

        <Reveal delay={140} className="xl:col-span-2">
          <KpiCard className="h-full">
            <div className="flex items-center justify-between">
              <span className="mono-label">{c.cost}</span>
              <Wallet size={14} className="text-white/35" />
            </div>
            <div className="mt-4 font-display text-2xl font-semibold text-white tabular">
              ${formatNumber(report.estimatedFixCost)}
            </div>
            <p className="mt-1 text-[11.5px] text-white/45">{c.costFree}</p>
            <p className="mt-3 border-t border-white/[0.07] pt-3 font-mono text-[10.5px] text-mint-300">
              {c.costSaved}
            </p>
            <p className="mt-1 font-mono text-[10px] text-white/30">
              ≈ {fixHours} {lang === "ru" ? "часов работы" : "hours of work"}
            </p>
          </KpiCard>
        </Reveal>

        <Reveal delay={190} className="sm:col-span-2 xl:col-span-2">
          <KpiCard className="h-full">
            <span className="mono-label">{c.metrics}</span>
            <dl className="mt-3.5 space-y-2 font-mono text-[11.5px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-white/45">{c.spaghetti}</dt>
                <dd className="font-semibold text-white">{report.spaghettiIndex} / 10</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-white/45">{c.filesScanned}</dt>
                <dd className="font-semibold text-white">{report.filesScanned}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-white/45">{c.tests}</dt>
                <dd className={`font-semibold ${report.hasTests ? "text-mint-300" : "text-ember-300"}`}>
                  {report.hasTests ? c.found : c.none}
                </dd>
              </div>
              {report.primaryLanguage && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-white/45">{lang === "ru" ? "Стек" : "Stack"}</dt>
                  <dd className="font-semibold text-white">{report.primaryLanguage}</dd>
                </div>
              )}
            </dl>
          </KpiCard>
        </Reveal>
      </div>

      {/* ------- tabs ------- */}
      <Reveal delay={80} className="mt-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-0">
          <Segmented<ReportTab>
            value={tab}
            onChange={setTab}
            ariaLabel="Report sections"
            className="!rounded-none !border-0 !bg-transparent !p-0"
            items={[
              {
                id: "antipatterns",
                label: (
                  <span className="flex items-center gap-1.5">
                    <Bug size={13} />
                    {c.tabSmells}
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">
                      {report.antipatterns.length}
                    </span>
                  </span>
                ),
              },
              {
                id: "god-files",
                label: (
                  <span className="flex items-center gap-1.5">
                    <FileCode2 size={13} />
                    {c.tabGod}
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">
                      {report.godComponents.length}
                    </span>
                  </span>
                ),
              },
              {
                id: "prompts",
                label: (
                  <span className="flex items-center gap-1.5">
                    <Flame size={13} className="text-ember-400" />
                    {c.tabPrompts}
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">
                      {report.refactorSteps.length}
                    </span>
                  </span>
                ),
              },
              {
                id: "radar",
                label: (
                  <span className="flex items-center gap-1.5">
                    <Zap size={13} />
                    {c.tabXray}
                  </span>
                ),
              },
            ]}
          />
          <span className="hidden pb-2 font-mono text-[10.5px] text-white/30 lg:block">
            {lang === "ru" ? "сгенерировано движком VibeDebt" : "generated by the VibeDebt engine"}
          </span>
        </div>
      </Reveal>

      {/* ------- smells ------- */}
      {tab === "antipatterns" && (
        <div className="mt-5 space-y-4">
          {report.antipatterns.map((item, i) => {
            const sevTone: Tone =
              item.severity === "CRITICAL" ? "critical" : item.severity === "HIGH" ? "elevated" : "elevated";
            const st = TONE_CLASS[sevTone];
            const sevLabel =
              item.severity === "CRITICAL" ? c.riskCritical : item.severity === "HIGH" ? c.riskHigh : c.riskMedium;
            return (
              <Reveal key={`${item.title}-${i}`} delay={i * 60}>
                <article className={`panel lift p-4 sm:p-5 ${st.border}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${st.border} ${st.bg}`}>
                        <TriangleAlert size={13} className={st.text} />
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-display text-[0.95rem] leading-snug font-medium text-white">
                          {item.title}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`font-mono text-[10.5px] font-semibold tracking-wide uppercase ${st.text}`}>
                            {sevLabel}
                          </span>
                          <span className="text-white/20">•</span>
                          <span className="truncate font-mono text-[10.5px] text-white/40">{item.detectedIn}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 max-w-4xl text-[12.5px] leading-relaxed text-white/55">{item.description}</p>

                  <div className="mt-4 grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr]">
                    <CodeBlock title={c.badCode} code={item.sampleBadCode} tone="bad" />
                    <div className="hidden items-center justify-center lg:flex">
                      <span className="grid h-8 w-8 place-items-center rounded-full border border-white/12 bg-panel text-white/45">
                        <ArrowRight size={14} />
                      </span>
                    </div>
                    <CodeBlock title={c.goodCode} code={item.sampleFix} tone="good" />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* ------- god files ------- */}
      {tab === "god-files" && (
        <div className="mt-5 space-y-3">
          {report.godComponents.map((file, i) => {
            const ft: Tone =
              file.risk === "critical" ? "critical" : file.risk === "high" ? "elevated" : "healthy";
            const fs = TONE_CLASS[ft];
            const weight = Math.min(100, Math.round((file.lines / 2500) * 100));
            return (
              <Reveal key={`${file.name}-${i}`} delay={i * 70}>
                <div className="panel lift p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${fs.dot}`} />
                      <FileCode2 size={15} className="text-white/40" />
                      <span className="font-mono text-[12.5px] font-semibold text-white">{file.name}</span>
                      <Chip tone={file.risk === "critical" ? "ember" : "neutral"}>
                        ~{file.lines} {lang === "ru" ? "строк" : "lines"}
                      </Chip>
                    </div>
                    <div className="text-right">
                      <span className="mono-label block">{c.recommendation}</span>
                      <span className="font-mono text-[11.5px] text-white/75">{c.decompose}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Meter value={weight} tone={ft} height={4} delay={i * 80} />
                  </div>

                  <ul className="mt-4 space-y-2">
                    {file.issues.map((issue, k) => (
                      <li key={k} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-white/60">
                        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${fs.dot}`} />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* ------- rescue prompts ------- */}
      {tab === "prompts" && <PromptPlan report={report} c={c} targetTool={targetTool} setTargetTool={setTargetTool} />}

      {/* ------- health x-ray ------- */}
      {tab === "radar" && (
        <Reveal>
          <div className="panel mt-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-medium text-white">{c.xrayTitle}</h3>
                <p className="mt-1 text-[12.5px] text-white/50">{c.xraySub}</p>
              </div>
              <Chip tone="iris">
                <Sparkles size={11} />
                {lang === "ru" ? "4 столпа надёжности" : "4 reliability pillars"}
              </Chip>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {c.pillars.map((pillar, i) => {
                const m = pillar.metric(
                  report.doomsdayScore,
                  report.spaghettiIndex,
                  report.ghostTypesCount,
                  report.hasTests
                );
                const pt = TONE_CLASS[m.tone];
                return (
                  <div key={pillar.title} className="panel-flat p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10.5px] text-white/30">0{i + 1}</span>
                        <span className="font-display text-[0.9rem] font-medium text-white/90">{pillar.title}</span>
                      </div>
                      <span className={`font-mono text-[11.5px] font-semibold ${pt.text}`}>{m.label}</span>
                    </div>
                    <div className="mt-3">
                      <Meter value={m.value} tone={m.tone} height={6} delay={i * 90} />
                    </div>
                    <p className="mt-2.5 text-[11.5px] leading-relaxed text-white/40">{pillar.hint}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Rescue plan sub-tab: target tool switch, copy-all and prompt cards
   ------------------------------------------------------------------ */
function PromptPlan({
  report,
  c,
  targetTool,
  setTargetTool,
}: {
  report: AuditReport;
  c: Copy["workbench"]["report"];
  targetTool: AiTool;
  setTargetTool: (t: AiTool) => void;
}) {
  const all = useCopy(2400);
  const single = useCopy(2400);

  const combinedPlan = report.refactorSteps
    .map(
      (s) =>
        `### ${s.step}. ${s.title} (${s.estimatedTime})\n${
          targetTool === "cursor" ? "Cursor Composer (Cmd+I)" : "Claude Thinking"
        }\n\n${s.prompt}`
    )
    .join("\n\n---\n\n");

  return (
    <div className="mt-5 space-y-4">
      <Reveal>
        <div className="panel rim rim-mint overflow-hidden p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="mint">
                  <Flame size={11} />
                  {c.rescueBadge}
                </Chip>
                <span className="font-display text-[0.95rem] font-medium text-white">{c.rescueTitle}</span>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-white/55">{c.rescueSub}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Segmented<AiTool>
                value={targetTool}
                onChange={setTargetTool}
                ariaLabel="Target assistant"
                items={[
                  {
                    id: "cursor",
                    label: c.targetCursor,
                    icon: <Zap size={11} className="text-mint-300" />,
                  },
                  {
                    id: "claude",
                    label: c.targetClaude,
                    icon: <Sparkles size={11} className="text-iris-300" />,
                  },
                ]}
              />
              <button
                type="button"
                onClick={() => all.copy(combinedPlan, "all")}
                className="btn btn-primary !py-2.5 !text-[11.5px]"
              >
                {all.isCopied("all") ? <Check size={12} /> : <CopyIcon size={12} />}
                {all.isCopied("all") ? c.allCopied : c.copyAll}
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {report.refactorSteps.map((step, i) => (
        <Reveal key={step.step} delay={i * 70}>
          <article className="panel group overflow-hidden">
            <div className="border-b border-white/[0.07] px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-iris-500/30 bg-iris-500/12 font-mono text-[11.5px] font-bold text-iris-200">
                  {step.step}
                </span>
                <span className="min-w-0 flex-1 font-display text-[0.92rem] leading-snug font-medium text-white">
                  {step.title}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-10">
                <Chip tone={targetTool === "cursor" ? "mint" : "iris"}>
                  {targetTool === "cursor" ? <Zap size={10} /> : <Sparkles size={10} />}
                  {targetTool === "cursor" ? c.toolCursor : c.toolClaude}
                </Chip>
                <Chip>
                  <Clock size={10} />
                  {step.estimatedTime}
                </Chip>
              </div>
            </div>

            <div className="relative">
              <pre className="max-h-[360px] overflow-auto bg-void/40 p-4 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-white/75 sm:p-5">
                {step.prompt}
              </pre>
              <button
                type="button"
                onClick={() => single.copy(step.prompt, String(step.step))}
                className="absolute top-3 right-3 flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/12 bg-panel/90 px-3 py-1.5 font-mono text-[10.5px] text-white/80 backdrop-blur transition hover:border-iris-400/50 hover:text-white"
              >
                {single.isCopied(String(step.step)) ? (
                  <>
                    <Check size={11} className="text-mint-300" />
                    <span className="text-mint-300">{c.copied}</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={11} />
                    {c.copyFor}
                  </>
                )}
              </button>
            </div>

            <div className="flex items-start gap-2 border-t border-white/[0.07] px-4 py-3 font-mono text-[10.5px] text-white/40 sm:px-5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mint-400" />
              {c.howToApply}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
