"use client";

import React, { useState } from "react";
import {
  FileCodeIcon,
  CheckIcon,
  CopyIcon,
  Share2Icon,
  SparklesIcon,
} from "@/components/icons";
import { AuditReport } from "@/lib/types";
import { getCursorPrompt, getClaudePrompt } from "@/lib/audit-core";
import RadarGauge from "@/components/ui/RadarGauge";
import { trackEvent } from "@/lib/analytics";

interface AuditWorkbenchProps {
  report: AuditReport;
  lang: "ru" | "en";
}

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function AuditWorkbench({ report, lang }: AuditWorkbenchProps) {
  const isRu = lang === "ru";
  const [activeTab, setActiveTab] = useState<"antipatterns" | "god-files" | "prompts">("antipatterns");
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [targetAiTool, setTargetAiTool] = useState<"cursor" | "claude">("cursor");

  const copyPrompt = (text: string, idx: number) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedPromptIdx(idx);
      trackEvent("prompt_copied", {
        tool: idx === 0 ? "cursor" : "claude",
        repo: report.repoName.slice(0, 40),
        step: idx + 1,
      });
      setTimeout(() => setCopiedPromptIdx(null), 2000);
    } catch {
      // safe
    }
  };

  const copyBadgeMarkdown = () => {
    try {
      const badge = `[![VibeDebt Doomsday](https://img.shields.io/badge/VibeDebt_Doomsday-${report.doomsdayScore}%25_${
        report.doomsdayScore > 75 ? "CRITICAL" : "ELEVATED"
      }-f43f5e?style=flat-square&logo=github)](https://github.com/20246ah-svg/lending)`;
      navigator.clipboard.writeText(badge);
      setCopiedBadge(true);
      trackEvent("badge_copied", {
        repo: report.repoName.slice(0, 40),
        score: report.doomsdayScore,
      });
      setTimeout(() => setCopiedBadge(false), 2000);
    } catch {
      // safe
    }
  };

  const handleShareTwitter = () => {
    try {
      const text = isRu
        ? `Мой проект набрал ${report.doomsdayScore}% в VibeDebt Doomsday Audit 💀 До критического сбоя: ${report.timeToCollapse}. Проверь свой вайбкод перед релизом:`
        : `My codebase scored ${report.doomsdayScore}% on VibeDebt Doomsday Audit 💀 Collapse horizon: ${report.timeToCollapse}. Test your Cursor/Lovable code:`;
      const url = "https://vibedebt.dev";
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      trackEvent("share_clicked", {
        platform: "twitter",
        score: report.doomsdayScore,
        repo: report.repoName.slice(0, 40),
      });
      window.open(twitterUrl, "_blank", "noopener,noreferrer");
    } catch {
      // safe
    }
  };

  const mainFile = report.godComponents[0]?.name || "src/App.tsx";
  const mainLines = report.godComponents[0]?.lines || 450;
  const daysToDisaster = Math.max(2, Math.round(90 - (report.doomsdayScore / 100) * 85));

  return (
    <section id="report-view" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto z-10 relative">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Header Terminal Bar */}
        <div className="px-6 py-4 bg-zinc-900/70 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="font-mono text-xs text-zinc-300 font-bold ml-2">
              {isRu ? "ОТЧЕТ АУДИТА:" : "AUDIT REPORT:"} {report.repoName}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {report.filesScanned} {isRu ? "файлов проверено" : "files scanned"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareTwitter}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="font-bold text-sm leading-none">𝕏</span>
              <span>{isRu ? "Поделиться" : "Share"}</span>
            </button>

            <button
              onClick={copyBadgeMarkdown}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedBadge ? <CheckIcon size={13} className="text-emerald-400" /> : <Share2Icon size={13} />}
              <span>{copiedBadge ? (isRu ? "Скопирован!" : "Copied!") : (isRu ? "README бейдж" : "README Badge")}</span>
            </button>
          </div>
        </div>

        {/* Real Data Visualizer: SVG Radar + Metrics Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-zinc-800/80 bg-zinc-950/40">
          {/* Radar HUD reflecting genuine audit calculation */}
          <div className="lg:col-span-5 flex justify-center border-b lg:border-b-0 lg:border-r border-zinc-800/80 pb-6 lg:pb-0 lg:pr-6">
            <RadarGauge
              fragilityPercent={report.doomsdayScore}
              daysToDisaster={daysToDisaster}
              emergencyCost={report.estimatedFixCost}
              lang={lang}
            />
          </div>

          {/* Key Metrics Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
              <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider mb-1">
                Doomsday Score
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-400">
                {report.doomsdayScore}%
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-1">
                {report.timeToCollapse}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1">
                {isRu ? "Критические точки" : "Critical Points"}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">
                {report.criticalBugsCount}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-1">
                {isRu ? "Утечки ключей и петли" : "CWE Leaks & Loops"}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
              <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-1">
                {isRu ? "God-компоненты" : "God Components"}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-purple-400">
                {report.godComponents.length}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-1">
                {isRu ? "файлы >300 строк" : ">300 LOC monoliths"}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                {isRu ? "Оценка фикса" : "Estimated Fix Cost"}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                ${formatNumber(report.estimatedFixCost)}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-1">
                {isRu ? "Ставка экстренного найма" : "Contractor emergency rate"}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 text-xs font-mono bg-zinc-900/40 px-6 gap-2 overflow-x-auto">
          {[
            { id: "antipatterns", label: isRu ? `Точки отказа (${report.antipatterns.length})` : `Failure Points (${report.antipatterns.length})` },
            { id: "god-files", label: isRu ? `God-компоненты (${report.godComponents.length})` : `God Components (${report.godComponents.length})` },
            { id: "prompts", label: isRu ? `Хирургические промпты (${report.refactorSteps.length})` : `Surgical Prompts (${report.refactorSteps.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "antipatterns" | "god-files" | "prompts")}
              className={`py-3.5 px-4 font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: ANTIPATTERNS */}
          {activeTab === "antipatterns" && (
            <div className="space-y-6">
              {report.antipatterns.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="text-emerald-400 text-base font-bold mb-1">
                    {isRu ? "🎉 Критических антипаттернов не обнаружено" : "🎉 Zero Critical Antipatterns Detected"}
                  </div>
                  <p className="text-xs text-zinc-400 font-sans max-w-md mx-auto">
                    {isRu
                      ? "Кодовая база соблюдает ключевые правила безопасности и модульности. Продолжайте в том же духе!"
                      : "The codebase follows security and architectural guidelines. Keep up the clean code!"}
                  </p>
                </div>
              ) : (
                report.antipatterns.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            item.severity === "CRITICAL"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {item.severity}
                        </span>
                        {item.cwe && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            [{item.cwe}]
                          </span>
                        )}
                        <h4 className="font-semibold text-sm sm:text-base text-white">
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-zinc-500">{item.detectedIn}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed mb-4">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="rounded-lg bg-zinc-950 p-3.5 border border-rose-500/20">
                        <div className="text-rose-400 font-semibold mb-2 flex items-center gap-1.5">
                          <span>✖</span> <span>{isRu ? "Текущий небезопасный код:" : "Current Vulnerable Code:"}</span>
                        </div>
                        <pre className="text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
                          {item.sampleBadCode}
                        </pre>
                      </div>

                      <div className="rounded-lg bg-zinc-950 p-3.5 border border-emerald-500/20">
                        <div className="text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
                          <span>✓</span> <span>{isRu ? "Хирургическое исправление:" : "Surgical Fix:"}</span>
                        </div>
                        <pre className="text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
                          {item.sampleFix}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: GOD-COMPONENTS */}
          {activeTab === "god-files" && (
            <div className="space-y-4">
              {report.godComponents.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="text-emerald-400 text-base font-bold mb-1">
                    {isRu ? "🎉 Отличная модульность: монолитов не обнаружено" : "🎉 Excellent Modularity: No Monoliths Found"}
                  </div>
                  <p className="text-xs text-zinc-400 font-sans max-w-md mx-auto">
                    {isRu
                      ? "В кодовой базе нет раздутых файлов (>300 строк). Компоненты компактные и удобные для работы в Cursor."
                      : "No oversized files (>300 LOC) found. Components are modular and context-friendly."}
                  </p>
                </div>
              ) : (
                report.godComponents.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <FileCodeIcon size={16} className="text-purple-400" />
                        <span className="font-mono text-sm font-bold text-white">
                          {file.name}
                        </span>
                        <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          {file.lines} LOC
                        </span>
                      </div>
                      <ul className="text-xs text-zinc-400 font-sans space-y-1">
                        {file.issues.map((iss, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400">●</span>
                            <span>{iss}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => setActiveTab("prompts")}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 transition shrink-0 cursor-pointer"
                    >
                      {isRu ? "Получить промпт распила →" : "Get Decouple Prompt →"}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PROMPTS WITH ACTIVE TARGET TOOL SWITCHER */}
          {activeTab === "prompts" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 gap-2">
                <span className="text-xs font-mono text-zinc-400">
                  {isRu ? "Оптимизация формата промптов под инструмент:" : "Format prompts specifically for:"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTargetAiTool("cursor")}
                    className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                      targetAiTool === "cursor"
                        ? "bg-emerald-500 text-zinc-950 font-bold"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span>Cursor Composer</span>
                  </button>
                  <button
                    onClick={() => setTargetAiTool("claude")}
                    className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                      targetAiTool === "claude"
                        ? "bg-emerald-500 text-zinc-950 font-bold"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <SparklesIcon size={13} />
                    <span>Claude 3.7 Thinking</span>
                  </button>
                </div>
              </div>

              {/* Dynamic prompt tailored to the active tool */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    <h4 className="font-semibold text-sm sm:text-base text-white">
                      {targetAiTool === "cursor"
                        ? (isRu ? `Cursor Composer: Распил монолита ${mainFile}` : `Cursor Composer: Decouple ${mainFile}`)
                        : (isRu ? `Claude 3.7 Thinking: Глубокий рефакторинг ${mainFile}` : `Claude 3.7 Thinking: Deep Architecture Plan`)}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      const promptText = targetAiTool === "cursor"
                        ? getCursorPrompt(mainFile, mainLines, isRu)
                        : getClaudePrompt(mainFile, mainLines, isRu);
                      copyPrompt(promptText, 0);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedPromptIdx === 0 ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                    <span>{copiedPromptIdx === 0 ? (isRu ? "Скопировано!" : "Copied!") : (isRu ? "Копировать" : "Copy")}</span>
                  </button>
                </div>

                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-850 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
                    {targetAiTool === "cursor"
                      ? getCursorPrompt(mainFile, mainLines, isRu)
                      : getClaudePrompt(mainFile, mainLines, isRu)}
                  </pre>
                </div>
              </div>

              {/* Step 2 from report if available */}
              {report.refactorSteps.length > 1 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs flex items-center justify-center font-bold">
                        2
                      </span>
                      <h4 className="font-semibold text-sm sm:text-base text-white">
                        {report.refactorSteps[1].title}
                      </h4>
                    </div>
                    <button
                      onClick={() => copyPrompt(report.refactorSteps[1].prompt, 1)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedPromptIdx === 1 ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                      <span>{copiedPromptIdx === 1 ? (isRu ? "Скопировано!" : "Copied!") : (isRu ? "Копировать" : "Copy")}</span>
                    </button>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-850 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{report.refactorSteps[1].prompt}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
