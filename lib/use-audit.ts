"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  DEFAULT_REPORT,
  SAMPLE_BAD_SNIPPET,
} from "./demo-report";
import type { AuditReport, InputMode, Lang, ReportTab } from "./types";

/* ------------------------------------------------------------------------- */
/*  Translation table — every user-facing string lives here, in RU and EN.   */
/* ------------------------------------------------------------------------- */

const COPY = {
  ru: {
    scanningGithub: "Подключение к репозиторию и анализ AST дерева...",
    auditFailed: "Не удалось завершить аудит.",
    networkError: "Ошибка сети при обращении к серверу аудита.",
    copied: "Скопировано!",
  },
  en: {
    scanningGithub: "Connecting to repository & analyzing AST tree...",
    auditFailed: "Audit failed.",
    networkError: "Network error reaching audit engine.",
    copied: "Copied!",
  },
} as const;

export type Copy = (typeof COPY)["ru"];

export interface AuditPayload {
  url?: string;
  snippet?: string;
  archetype?: string;
}

/**
 * Single source of truth for the audit instrument.
 * Every piece of state, request and clipboard side-effect funnels through here
 * so the view layer stays declarative and swappable.
 */
export function useAudit() {
  /* ---------------- language ---------------- */
  const [lang, setLang] = useState<Lang>("ru");
  const t = COPY[lang];

  /* ---------------- input ---------------- */
  const [inputMode, setInputMode] = useState<InputMode>("github");
  const [githubUrl, setGithubUrl] = useState<string>(
    "https://github.com/shadcn-ui/ui"
  );
  const [snippetCode, setSnippetCode] = useState<string>("");
  const [activePreset, setActivePreset] = useState<string>("cursor-saas");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- audit run ---------------- */
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditProgress, setAuditProgress] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [activeReportTab, setActiveReportTab] =
    useState<ReportTab>("antipatterns");

  /* ---------------- clipboard feedback ---------------- */
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);
  const [copiedBadge, setCopiedBadge] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [copiedAllPrompts, setCopiedAllPrompts] = useState<boolean>(false);
  const [targetAiTool, setTargetAiTool] = useState<"cursor" | "claude">("cursor");

  /* ---------------- waitlist ---------------- */
  const [botEmail, setBotEmail] = useState<string>("");
  const [botSubscribed, setBotSubscribed] = useState<boolean>(false);

  /* ---------------- simulator ---------------- */
  const [calcAiLines, setCalcAiLines] = useState<number>(5500);
  const [calcGodFiles, setCalcGodFiles] = useState<number>(3);
  const [calcJustWorkCount, setCalcJustWorkCount] = useState<number>(14);
  const [calcHasTests, setCalcHasTests] = useState<boolean>(false);
  const [calcDbState, setCalcDbState] = useState<"clean" | "medium" | "mess">(
    "medium"
  );

  /* --------------------------------------------------------------------- */
  /*  Actions                                                              */
  /* --------------------------------------------------------------------- */

  const runAudit = useCallback(
    async (customPayload?: AuditPayload) => {
      setIsAuditing(true);
      setErrorMessage(null);
      setAuditProgress(COPY[lang].scanningGithub);

      try {
        const payload: AuditPayload =
          customPayload ??
          (inputMode === "github"
            ? { url: githubUrl }
            : inputMode === "snippet"
            ? { snippet: snippetCode }
            : { archetype: activePreset });

        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          setErrorMessage(data.error || COPY[lang].auditFailed);
        } else if (data.data) {
          setAuditReport(data.data as AuditReport);
          setActiveReportTab("antipatterns");
        }
      } catch {
        setErrorMessage(COPY[lang].networkError);
      } finally {
        setIsAuditing(false);
        setAuditProgress("");
      }
    },
    [activePreset, githubUrl, inputMode, lang, snippetCode]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = String(event.target?.result || "");
        setSnippetCode(content);
        setInputMode("snippet");
        runAudit({ snippet: content });
      };
      reader.readAsText(file);
    },
    [runAudit]
  );

  const loadSampleSnippet = useCallback(() => {
    setSnippetCode(SAMPLE_BAD_SNIPPET);
    setInputMode("snippet");
  }, []);

  const copyPrompt = useCallback((text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIdx(idx);
    setTimeout(() => setCopiedPromptIdx(null), 2000);
  }, []);

  const copyBadgeMarkdown = useCallback(() => {
    if (!auditReport) return;
    const badge = `[![VibeDebt Doomsday](https://img.shields.io/badge/VibeDebt_Doomsday-${
      auditReport.doomsdayScore
    }%25_${
      auditReport.doomsdayScore > 75 ? "CRITICAL" : "ELEVATED"
    }-f43f5e?style=flat-square&logo=github)](https://vibedebt.dev)`;
    navigator.clipboard.writeText(badge);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  }, [auditReport]);

  const handleShareToTwitter = useCallback(() => {
    if (!auditReport) return;
    const text =
      lang === "ru"
        ? `Мой вайбкод-проект на Cursor имеет ${auditReport.doomsdayScore}% по Счётчику Судного Дня (крах через ${auditReport.timeToCollapse}). Проверь свой техдолг на @VibeDebt:`
        : `My AI-built SaaS has a ${auditReport.doomsdayScore}% Doomsday Score (collapse in ${auditReport.timeToCollapse}). Check your tech debt with @VibeDebt:`;
    const url = "https://vibedebt.dev";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  }, [auditReport, lang]);

  const handleCopyShareLink = useCallback(() => {
    if (!auditReport) return;
    const text =
      lang === "ru"
        ? `🔥 Аудит VibeDebt для ${auditReport.repoName}: Doomsday Score ${auditReport.doomsdayScore}% | Запас прочности: ${auditReport.timeToCollapse}. Проверь свой проект: https://vibedebt.dev`
        : `🔥 VibeDebt Audit for ${auditReport.repoName}: Doomsday Score ${auditReport.doomsdayScore}% | Time to Collapse: ${auditReport.timeToCollapse}. Check yours: https://vibedebt.dev`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  }, [auditReport, lang]);

  const handleCopyCli = useCallback(() => {
    navigator.clipboard.writeText("npx vibedebt audit ./src");
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  }, []);

  const handleCopyAllPrompts = useCallback(() => {
    if (!auditReport) return;
    const fullPlan = auditReport.refactorSteps
      .map(
        (s) =>
          `### ШАГ ${s.step}: ${s.title} (${s.estimatedTime})\nИнструмент: ${
            targetAiTool === "cursor"
              ? "Cursor Composer (Cmd+I)"
              : "Claude 3.7 Thinking"
          }\n\n${s.prompt}\n`
      )
      .join("\n---\n\n");
    navigator.clipboard.writeText(fullPlan);
    setCopiedAllPrompts(true);
    setTimeout(() => setCopiedAllPrompts(false), 2000);
  }, [auditReport, targetAiTool]);

  const handleBotSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!botEmail.trim()) return;
      setBotSubscribed(true);
    },
    [botEmail]
  );

  const showDemoReport = useCallback(() => {
    setAuditReport(DEFAULT_REPORT);
    setErrorMessage(null);
    setActiveReportTab("antipatterns");
  }, []);

  /* --------------------------------------------------------------------- */
  /*  Simulator maths                                                      */
  /* --------------------------------------------------------------------- */

  const calcResult = useMemo(() => {
    const baseLife = 90;
    const aiPenalty = (calcAiLines / 1000) * 3.5;
    const godPenalty = calcGodFiles * 6;
    const promptPenalty = calcJustWorkCount * 1.6;
    const testBonus = calcHasTests ? 30 : -14;
    const dbPenalty =
      calcDbState === "clean" ? 0 : calcDbState === "medium" ? 12 : 24;

    const days = Math.max(
      2,
      Math.round(
        baseLife - (aiPenalty + godPenalty + promptPenalty + dbPenalty) + testBonus
      )
    );
    const hoursNeeded = Math.round(
      calcAiLines / 220 + calcGodFiles * 5 + calcJustWorkCount * 1.5 + (calcHasTests ? 0 : 16)
    );
    const emergencyCost = hoursNeeded * 60;
    const fragilityPercent = Math.min(
      99,
      Math.max(12, Math.round(100 - days * 0.95))
    );

    return { days, emergencyCost, fragilityPercent, hoursNeeded };
  }, [calcAiLines, calcDbState, calcGodFiles, calcHasTests, calcJustWorkCount]);

  return {
    /* language */
    lang,
    setLang,
    t,
    /* input */
    inputMode,
    setInputMode,
    githubUrl,
    setGithubUrl,
    snippetCode,
    setSnippetCode,
    activePreset,
    setActivePreset,
    fileInputRef,
    /* audit */
    isAuditing,
    auditProgress,
    errorMessage,
    auditReport,
    setAuditReport,
    activeReportTab,
    setActiveReportTab,
    runAudit,
    showDemoReport,
    /* clipboard */
    copiedPromptIdx,
    copiedBadge,
    copiedShare,
    copiedCli,
    copiedAllPrompts,
    targetAiTool,
    setTargetAiTool,
    copyPrompt,
    copyBadgeMarkdown,
    handleShareToTwitter,
    handleCopyShareLink,
    handleCopyCli,
    handleCopyAllPrompts,
    /* waitlist */
    botEmail,
    setBotEmail,
    botSubscribed,
    handleBotSubmit,
    /* simulator */
    calcAiLines,
    setCalcAiLines,
    calcGodFiles,
    setCalcGodFiles,
    calcJustWorkCount,
    setCalcJustWorkCount,
    calcHasTests,
    setCalcHasTests,
    calcDbState,
    setCalcDbState,
    calcResult,
    /* misc */
    handleFileUpload,
    loadSampleSnippet,
  };
}

export type AuditStore = ReturnType<typeof useAudit>;
