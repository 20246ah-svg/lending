"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  GithubIcon,
  FileCodeIcon,
  TerminalIcon,
  RefreshCwIcon,
  UploadCloudIcon,
  ZapIcon,
  XCircleIcon,
  AlertTriangleIcon,
} from "@/components/icons";
import type { AuditStore } from "@/lib/use-audit";

/* ------------------------------------------------------------------------- */

const ARCHETYPES = [
  {
    id: "cursor-saas",
    score: 89,
    tone: "rot" as const,
    art: "/specimens/spec-01.jpg",
    cwe: "CWE-798",
    label: { ru: "AI SaaS на Cursor", en: "Cursor AI SaaS" },
    note: {
      ru: "Файл на 2 400 строк + мастер-ключ в клиентском бандле",
      en: "2,400-line root file + master key in client bundle",
    },
  },
  {
    id: "bolt-landing",
    score: 64,
    tone: "violet" as const,
    art: "/specimens/spec-02.jpg",
    cwe: "CWE-602",
    label: { ru: "E-Commerce на Bolt.new", en: "Bolt.new E-Commerce" },
    note: {
      ru: "Расчёт цен на клиенте, доверие к данным из браузера",
      en: "Price maths on the client, trusting browser input",
    },
  },
  {
    id: "crypto-bot",
    score: 96,
    tone: "rot" as const,
    art: "/specimens/spec-03.jpg",
    cwe: "CWE-532",
    label: { ru: "Telegram-бот на o3", en: "Telegram bot on o3" },
    note: {
      ru: "Приватные ключи кошелька уходят в логи и в чат",
      en: "Wallet private keys written to logs and chat",
    },
  },
];

const TABS = [
  { id: "github", idx: "01", icon: GithubIcon, ru: "GitHub репозиторий", en: "GitHub repository" },
  { id: "snippet", idx: "02", icon: FileCodeIcon, ru: "Код / файл", en: "Code / file" },
  { id: "preset", idx: "03", icon: TerminalIcon, ru: "Архетип", en: "Archetype" },
] as const;

/* ------------------------------------------------------------------------- */

export function Intake({ store }: { store: AuditStore }) {
  const {
    lang,
    inputMode,
    setInputMode,
    githubUrl,
    setGithubUrl,
    snippetCode,
    setSnippetCode,
    activePreset,
    setActivePreset,
    fileInputRef,
    isAuditing,
    errorMessage,
    runAudit,
    handleFileUpload,
    loadSampleSnippet,
  } = store;

  const ru = lang === "ru";
  const [dragging, setDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const dropDepth = useRef(0);

  const BUSY = [
    ru ? "ЧТЕНИЕ ДЕРЕВА ФАЙЛОВ…" : "READING FILE TREE…",
    ru ? "ИЗМЕРЕНИЕ ОБЪЁМОВ МОДУЛЕЙ…" : "MEASURING MODULE VOLUMES…",
    ru ? "ПОИСК СИГНАТУР CWE…" : "SCANNING FOR CWE SIGNATURES…",
    ru ? "СБОРКА ХИРУРГИЧЕСКОГО ПЛАНА…" : "COMPOSING SURGICAL PLAN…",
  ];

  /* A monotonic tick advanced only from inside the interval callback. */
  useEffect(() => {
    if (!isAuditing) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 700);
    return () => window.clearInterval(id);
  }, [isAuditing]);

  const statusLine = tick % BUSY.length;

  /* ---- real drag & drop, replacing the bare file picker ------------------ */

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target?.result || "");
      setSnippetCode(content);
      setInputMode("snippet");
      setPendingFile(file.name);
      runAudit({ snippet: content });
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dropDepth.current = 0;
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dropDepth.current += 1;
    setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dropDepth.current -= 1;
    if (dropDepth.current <= 0) setDragging(false);
  };

  const canRun =
    inputMode === "github"
      ? Boolean(githubUrl.trim())
      : inputMode === "snippet"
      ? Boolean(snippetCode.trim())
      : true;

  const runLabel = ru
    ? inputMode === "snippet"
      ? "Проверить фрагмент"
      : "Запустить аудит"
    : inputMode === "snippet"
    ? "Audit snippet"
    : "Run audit";

  return (
    <div className="panel bracket scanlines relative">
      {/* console rail */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-2)] px-3 sm:px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="lbl lbl-acid">
            {ru ? "ПОРТ ВНЕДРЕНИЯ ОБРАЗЦА" : "SPECIMEN INTAKE PORT"}
          </span>
          <span className="hidden sm:block w-px h-3 bg-[var(--line-2)]" />
          <span className="hidden sm:block lbl" style={{ letterSpacing: "0.2em" }}>
            {ru ? "В ПАМЯТИ · БЕЗ ЗАПИСИ НА ДИСК" : "IN-MEMORY · NOTHING WRITTEN"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`led ${isAuditing ? "" : "led-rot"}`}
            aria-hidden="true"
          />
          <span className="mono text-[9.5px] tracking-[0.2em] text-[var(--bone-dim)]">
            {isAuditing ? "SCANNING" : "IDLE"}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        {/* mode selector */}
        <div
          className="flex flex-wrap gap-px border border-[var(--line-2)]"
          role="tablist"
          aria-label={ru ? "Источник образца" : "Specimen source"}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = inputMode === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setInputMode(tab.id)}
                className="tab-btn flex-1 min-w-[8.5rem] justify-center"
                data-active={active}
              >
                <span className="opacity-60 tabular-nums">{tab.idx}</span>
                <Icon size={12} />
                <span>{ru ? tab.ru : tab.en}</span>
              </button>
            );
          })}
        </div>

        {/* ---- panel body ---- */}
        <div className="mt-5">
          {/* TAB 1 — GitHub */}
          {inputMode === "github" && (
            <div className="space-y-4">
              <label
                htmlFor="repo-url"
                className="block lbl"
                style={{ letterSpacing: "0.22em" }}
              >
                {ru ? "Публичный URL репозитория" : "Public repository URL"}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <GithubIcon
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bone-dim)] pointer-events-none"
                  />
                  <input
                    id="repo-url"
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canRun && !isAuditing) runAudit();
                    }}
                    placeholder="https://github.com/owner/repository"
                    className="field !pl-9"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="mono text-[10px] text-[var(--bone-dim)]">
                  {ru ? "Живой пример:" : "Live example:"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setGithubUrl("https://github.com/shadcn-ui/ui");
                    runAudit({ url: "https://github.com/shadcn-ui/ui" });
                  }}
                  className="mono text-[10.5px] text-[var(--bone)] underline decoration-[var(--line-3)] underline-offset-4 hover:text-[var(--acid)] hover:decoration-[var(--acid)] transition cursor-pointer"
                >
                  shadcn-ui/ui
                </button>
                <span className="text-[var(--line-3)]">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("preset");
                    setActivePreset("cursor-saas");
                    runAudit({ archetype: "cursor-saas" });
                  }}
                  className="mono text-[10.5px] text-[var(--rot)] underline decoration-[var(--rot)]/40 underline-offset-4 hover:decoration-[var(--rot)] transition cursor-pointer"
                >
                  Cursor AI SaaS · 89% {ru ? "долга" : "risk"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2 — Snippet & file */}
          {inputMode === "snippet" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".tsx,.ts,.js,.jsx,.json,.py"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="lbl" style={{ letterSpacing: "0.22em" }}>
                  {ru ? "Вставка кода или файл" : "Paste code or drop file"}
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mono text-[10.5px] text-[var(--bone)] hover:text-[var(--acid)] transition flex items-center gap-1.5 underline decoration-[var(--line-3)] underline-offset-4 cursor-pointer"
                  >
                    <UploadCloudIcon size={13} />
                    {ru ? "Загрузить" : "Upload"}
                  </button>
                  <button
                    type="button"
                    onClick={loadSampleSnippet}
                    className="mono text-[10.5px] text-[var(--bone-dim)] hover:text-[var(--acid)] transition underline decoration-[var(--line-3)] underline-offset-4 cursor-pointer"
                  >
                    {ru ? "Пример вайб-кода" : "Sample AI code"}
                  </button>
                </div>
              </div>

              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                className="relative"
                style={{
                  boxShadow: dragging ? "inset 0 0 0 1px var(--acid)" : "none",
                  background: dragging ? "rgba(200,255,60,.05)" : "transparent",
                  transition: "box-shadow .2s, background .2s",
                }}
              >
                <textarea
                  rows={9}
                  value={snippetCode}
                  onChange={(e) => setSnippetCode(e.target.value)}
                  placeholder={
                    ru
                      ? "Вставь сюда код React / Next.js компонента или содержимое package.json — либо перетащи файл прямо в это поле…"
                      : "Paste a React / Next.js component or your package.json — or drag a file straight into this field…"
                  }
                  spellCheck={false}
                  className="field resize-y leading-relaxed"
                  style={{ minHeight: 190 }}
                  aria-label={ru ? "Код для анализа" : "Code to analyse"}
                />

                {dragging && (
                  <div className="absolute inset-0 grid place-items-center pointer-events-none">
                    <span className="mono text-[11px] tracking-[0.24em] text-[var(--acid)] bg-[#05060a]/90 px-3 py-1.5">
                      {ru ? "ОТПУСТИ ДЛЯ МОНТИРОВАНИЯ" : "RELEASE TO MOUNT"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="mono text-[10px] text-[var(--bone-dim)]">
                  {snippetCode
                    ? `${snippetCode.split("\n").length} ${ru ? "строк в буфере" : "lines buffered"}${
                        pendingFile ? ` · ${pendingFile}` : ""
                      }`
                    : ru
                    ? "буфер пуст"
                    : "buffer empty"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSnippetCode("");
                    setPendingFile(null);
                  }}
                  className="mono text-[10px] text-[var(--bone-dim)] hover:text-[var(--rot)] transition cursor-pointer"
                >
                  {ru ? "Очистить" : "Clear"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3 — Archetypes */}
          {inputMode === "preset" && (
            <div className="space-y-4">
              <span className="lbl block" style={{ letterSpacing: "0.22em" }}>
                {ru
                  ? "Смоделированные архетипы ИИ-проектов"
                  : "Simulated AI project archetypes"}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
                {ARCHETYPES.map((a) => {
                  const active = activePreset === a.id;
                  const accent =
                    a.tone === "rot" ? "var(--rot)" : "var(--violet)";
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setActivePreset(a.id);
                        runAudit({ archetype: a.id });
                      }}
                      className="group text-left bg-[var(--ink-2)] p-0 cursor-pointer transition-colors"
                      style={
                        active
                          ? { background: "rgba(237,234,227,.055)", boxShadow: `inset 0 2px 0 ${accent}` }
                          : undefined
                      }
                      aria-pressed={active}
                    >
                      <div className="relative h-28 overflow-hidden">
                        <Image
                          src={a.art}
                          alt=""
                          fill
                          sizes="(max-width:640px) 100vw, 30vw"
                          className="object-cover"
                          style={{
                            filter: `grayscale(.7) contrast(1.2) brightness(.62)`,
                            transition: "transform .7s cubic-bezier(.2,.8,.2,1), filter .5s",
                          }}
                        />
                        <span
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(180deg, ${accent}22, rgba(5,6,10,.85))`,
                          }}
                        />
                        <span
                          className="absolute top-2 left-2 mono text-[9px] font-bold tracking-[0.2em] px-1.5 py-0.5"
                          style={{ background: accent, color: "#05060a" }}
                        >
                          {a.cwe}
                        </span>
                        <span
                          className="absolute bottom-2 right-2 mono text-[15px] font-semibold tabular-nums"
                          style={{ color: accent }}
                        >
                          {a.score}%
                        </span>
                      </div>

                      <div className="p-3.5">
                        <div className="mono text-[11.5px] text-[var(--bone)] font-medium">
                          {a.label[lang]}
                        </div>
                        <p className="mono text-[10px] leading-relaxed text-[var(--bone-dim)] mt-1.5">
                          {a.note[lang]}
                        </p>
                        <span
                          className="mono text-[9.5px] tracking-[0.2em] mt-3 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
                          style={{ color: accent }}
                        >
                          {ru ? "МОНТИРОВАТЬ" : "MOUNT"} →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ---- action rail ---- */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t border-[var(--line)] pt-5">
          <button
            type="button"
            onClick={() => runAudit()}
            disabled={isAuditing || !canRun}
            data-cursor="RUN"
            className="btn btn-acid !py-3.5 !px-6"
          >
            {isAuditing ? (
              <RefreshCwIcon size={14} className="animate-spin" />
            ) : (
              <ZapIcon size={14} />
            )}
            {isAuditing ? (ru ? "Сканирование…" : "Scanning…") : runLabel}
          </button>

          <p className="mono text-[10px] leading-relaxed text-[var(--bone-dim)] sm:max-w-sm">
            {ru
              ? "Аудит запускается по нажатию. Публичные репозитории читаются через GitHub REST API, лимит без токена — 60 запросов в час."
              : "Runs on demand. Public repositories are read through the GitHub REST API; the unauthenticated limit is 60 requests/hour."}
          </p>
        </div>

        {/* ---- busy / error states ---- */}
        {isAuditing && (
          <div className="mt-4 border border-[var(--acid)]/30 bg-[var(--acid)]/[0.05] p-4">
            <div className="flex items-center gap-3">
              <RefreshCwIcon size={14} className="animate-spin text-[var(--acid)] shrink-0" />
              <span className="mono text-[11px] text-[var(--acid)] tracking-[0.14em]">
                {BUSY[statusLine]}
              </span>
            </div>
            <div className="mt-3 h-[3px] bg-[var(--line)] overflow-hidden">
              <span
                className="block h-full w-1/3 bg-[var(--acid)]"
                style={{
                  boxShadow: "0 0 12px rgba(200,255,60,.6)",
                  animation: "intakeSweep 1.1s cubic-bezier(.4,0,.6,1) infinite",
                }}
              />
            </div>
            <style>{`@keyframes intakeSweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(320%); } }`}</style>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 border border-[var(--rot)]/40 bg-[var(--rot)]/[0.07] p-4 flex items-start gap-3"
          >
            <XCircleIcon size={15} className="text-[var(--rot)] shrink-0 mt-0.5" />
            <div>
              <div className="mono text-[10px] tracking-[0.2em] text-[var(--rot)] font-bold">
                {ru ? "ОШИБКА ПРОВЕРКИ" : "AUDIT ERROR"}
              </div>
              <p className="mono text-[11px] text-[var(--bone)] mt-1.5 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* ---- idle plaque: shown only before the first result ---- */}
        {!isAuditing && !errorMessage && !store.auditReport && (
          <div className="mt-5 border border-dashed border-[var(--line-2)] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon
                size={16}
                className="text-[var(--bone-dim)] shrink-0 mt-0.5"
              />
              <div>
                <div className="mono text-[11px] tracking-[0.16em] text-[var(--bone)]">
                  {ru ? "АНАЛИЗАТОР ГОТОВ" : "ANALYZER READY"}
                </div>
                <p className="mono text-[10.5px] leading-relaxed text-[var(--bone-dim)] mt-2 max-w-2xl">
                  {ru
                    ? "Введи ссылку на репозиторий или вставь код, чтобы рассчитать персональный Счётчик Судного Дня и собрать хирургические промпты рефакторинга. Либо открой готовый демо-отчёт, чтобы увидеть формат вердикта."
                    : "Enter a repository URL or paste code to compute a personal Doomsday Score and assemble surgical refactoring prompts. Or open the demo report to see the verdict format."}
                </p>
                <button
                  type="button"
                  onClick={store.showDemoReport}
                  className="btn mt-4 !py-2.5"
                >
                  <FileCodeIcon size={12} />
                  {ru ? "Показать демо-отчёт" : "Show demo report"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
