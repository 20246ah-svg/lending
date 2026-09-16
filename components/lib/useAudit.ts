"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_REPORT } from "@/components/lib/data";
import type { AiTool, AuditReport, InputMode, Lang, ReportTab } from "@/components/lib/types";

/* ==================================================================
   useAudit — вся логика рабочей станции аудита:
   ввод (github / сниппет / пресет), запуск запроса к /api/audit,
   прогресс сканирования, отчёт, вкладки и действия с буфером обмена.
   ================================================================== */

export interface AuditPayload {
  url?: string;
  snippet?: string;
  archetype?: string;
}

export function useAudit(lang: Lang, stages: string[]) {
  const [inputMode, setInputMode] = useState<InputMode>("github");
  const [githubUrl, setGithubUrl] = useState("https://github.com/shadcn-ui/ui");
  const [snippetCode, setSnippetCode] = useState("");
  const [activePreset, setActivePreset] = useState("cursor-saas");

  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState({ stage: 0, label: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [report, setReport] = useState<AuditReport>(DEFAULT_REPORT);
  const [isDemo, setIsDemo] = useState(true);
  const [reportTab, setReportTab] = useState<ReportTab>("antipatterns");
  const [targetTool, setTargetTool] = useState<AiTool>("cursor");

  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (stageTimer.current) clearInterval(stageTimer.current);
    },
    []
  );

  const finish = useCallback(() => {
    if (stageTimer.current) clearInterval(stageTimer.current);
    setIsAuditing(false);
    setProgress({ stage: 0, label: "" });
  }, []);

  const runAudit = useCallback(
    async (payload?: AuditPayload) => {
      setIsAuditing(true);
      setErrorMessage(null);

      if (stageTimer.current) clearInterval(stageTimer.current);
      let stage = 0;
      setProgress({ stage: 0, label: stages[0] });
      stageTimer.current = setInterval(() => {
        stage = Math.min(stages.length - 1, stage + 1);
        setProgress({ stage, label: stages[stage] });
      }, 900);

      try {
        const body: AuditPayload =
          payload ??
          (inputMode === "github"
            ? { url: githubUrl }
            : inputMode === "snippet"
              ? { snippet: snippetCode }
              : { archetype: activePreset });

        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (!res.ok || data?.error) {
          setErrorMessage(
            data?.error ??
              (lang === "ru" ? "Не удалось завершить аудит." : "Audit failed.")
          );
        } else if (data?.data) {
          setReport(data.data as AuditReport);
          setIsDemo(false);
          setReportTab("antipatterns");
          window.setTimeout(() => {
            reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 260);
        }
      } catch {
        setErrorMessage(
          lang === "ru"
            ? "Ошибка сети при обращении к серверу аудита."
            : "Network error reaching the audit engine."
        );
      } finally {
        finish();
      }
    },
    [activePreset, finish, githubUrl, inputMode, lang, snippetCode, stages]
  );

  const auditFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = String(event.target?.result ?? "");
        setSnippetCode(content);
        setInputMode("snippet");
        void runAudit({ snippet: content });
      };
      reader.readAsText(file);
    },
    [runAudit]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) auditFile(file);
      e.target.value = "";
    },
    [auditFile]
  );

  return {
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
  };
}

export type AuditEngine = ReturnType<typeof useAudit>;
