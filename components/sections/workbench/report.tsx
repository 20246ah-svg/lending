"use client";

import {
  CheckIcon,
  CopyIcon,
  Share2Icon,
  TwitterIcon,
  TerminalIcon,
  SparklesIcon,
  ClockIcon,
  BugIcon,
} from "@/components/icons";
import { CodeSpecimen } from "@/components/ui/code-specimen";
import { LedBar, Stat, scoreColor } from "@/components/ui/readouts";
import type { AuditReport } from "@/lib/types";
import { formatNumber } from "@/lib/types";
import type { AuditStore } from "@/lib/use-audit";

/* ========================================================================= */
/*  Severity visuals                                                         */
/* ========================================================================= */

const SEVERITY: Record<
  AuditReport["antipatterns"][number]["severity"],
  { bg: string; label: { ru: string; en: string } }
> = {
  CRITICAL: { bg: "var(--rot)", label: { ru: "КРИТИЧНО", en: "CRITICAL" } },
  HIGH: { bg: "#ffc42e", label: { ru: "ВЫСОКИЙ", en: "HIGH" } },
  WARNING: { bg: "var(--acid)", label: { ru: "ВНИМАНИЕ", en: "WARNING" } },
};

const RISK: Record<string, { c: string; ru: string; en: string }> = {
  critical: { c: "var(--rot)", ru: "КРИТИЧНО", en: "CRITICAL" },
  high: { c: "#ffc42e", ru: "ВЫСОКИЙ", en: "HIGH" },
  medium: { c: "var(--bone-dim)", ru: "СРЕДНИЙ", en: "MEDIUM" },
};

/* ========================================================================= */
/*  Verdict dossier header                                                   */
/* ========================================================================= */

function VerdictHeader({ report, store }: { report: AuditReport; store: AuditStore }) {
  const { lang, copiedShare, copiedBadge, handleCopyShareLink, handleShareToTwitter, copyBadgeMarkdown, setAuditReport } =
    store;
  const ru = lang === "ru";
  const color = scoreColor(report.doomsdayScore);

  return (
    <div className="reveal panel-solid bracket bracket-rot relative overflow-hidden">
      {/* ghost numeral bleeding behind the plate */}
      <span
        aria-hidden="true"
        className="d1 absolute -right-2 -top-6 select-none pointer-events-none"
        style={{
          fontSize: "clamp(7rem, 22vw, 17rem)",
          color: "transparent",
          WebkitTextStroke: `1px ${color}22`,
          lineHeight: 0.8,
        }}
      >
        {report.doomsdayScore}
      </span>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-2)] px-4 sm:px-5 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="lbl lbl-acid">
            {ru ? "ДОСЬЕ · ВЕРДИКТ АУДИТА" : "DOSSIER · AUDIT VERDICT"}
          </span>
          {report.isRealRepo ? (
            <span className="mono text-[9.5px] font-bold tracking-[0.18em] px-1.5 py-0.5 bg-[var(--acid)] text-[#05060a]">
              {ru ? "ЖИВЫЕ ДАННЫЕ GITHUB" : "LIVE GITHUB DATA"}
            </span>
          ) : (
            <span className="mono text-[9.5px] font-bold tracking-[0.18em] px-1.5 py-0.5 border border-[var(--line-3)] text-[var(--bone-dim)]">
              {ru ? "СМОДЕЛИРОВАНО" : "SIMULATED"}
            </span>
          )}
          {report.primaryLanguage ? (
            <span className="mono text-[10px] text-[var(--bone-dim)]">
              {report.primaryLanguage}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setAuditReport(null)}
          className="mono text-[10px] tracking-[0.18em] text-[var(--bone-dim)] hover:text-[var(--rot)] transition cursor-pointer"
        >
          {ru ? "НОВЫЙ СКАН ✕" : "NEW SCAN ✕"}
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12">
        {/* score block */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[var(--line)] p-5 sm:p-6">
          <div className="lbl">{ru ? "Счётчик Судного Дня" : "Doomsday Score"}</div>
          <div className="flex items-baseline gap-2 mt-3">
            <span
              className="d1 tabular-nums leading-none"
              style={{ fontSize: "clamp(3.6rem, 9vw, 6rem)", color }}
            >
              {report.doomsdayScore}
            </span>
            <span className="mono text-xl text-[var(--bone-dim)]">/100</span>
          </div>
          <div className="mt-4">
            <LedBar
              value={report.doomsdayScore}
              tone="auto"
              segments={30}
              readout={`${report.spaghettiIndex} ${ru ? "спагетти" : "spaghetti"}`}
              label={ru ? "ИНДЕКС СВЯЗНОСТИ" : "COUPLING INDEX"}
            />
          </div>
        </div>

        {/* identity block */}
        <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col">
          <div className="lbl">{ru ? "Образец" : "Specimen"}</div>
          <p className="mono text-[13px] sm:text-[15px] text-[var(--bone)] mt-2 break-all">
            {report.repoName}
          </p>
          <p className="mono text-[11px] leading-relaxed text-[var(--bone-dim)] mt-3 max-w-2xl">
            {report.diagnosticsSummary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={handleCopyShareLink} className="btn !py-2 !px-3">
              {copiedShare ? (
                <CheckIcon size={12} className="text-[var(--acid)]" />
              ) : (
                <CopyIcon size={12} />
              )}
              {copiedShare ? (ru ? "Скопировано" : "Copied") : ru ? "Копировать ссылку" : "Copy link"}
            </button>
            <button type="button" onClick={handleShareToTwitter} className="btn !py-2 !px-3">
              <TwitterIcon size={12} />
              {ru ? "Поделиться в X" : "Share to X"}
            </button>
            <button type="button" onClick={copyBadgeMarkdown} className="btn !py-2 !px-3">
              {copiedBadge ? (
                <CheckIcon size={12} className="text-[var(--acid)]" />
              ) : (
                <Share2Icon size={12} />
              )}
              {copiedBadge ? (ru ? "Бейдж скопирован" : "Badge copied") : ru ? "Бейдж README" : "README badge"}
            </button>
          </div>
        </div>
      </div>

      {/* metric strip */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 border-t border-[var(--line)] divide-x divide-[var(--line)]">
        <Stat
          label={ru ? "Запас прочности" : "Time to collapse"}
          value={<span className="text-[13px] leading-tight block">{report.timeToCollapse}</span>}
          tone="rot"
        />
        <Stat
          label={ru ? "Критических дефектов" : "Critical defects"}
          value={report.criticalBugsCount}
          tone="rot"
        />
        <Stat
          label={ru ? "Стоимость ремонта" : "Remediation cost"}
          value={`$${formatNumber(report.estimatedFixCost)}`}
          hint={ru ? "по ставке senior-подрядчика" : "at senior contractor rates"}
        />
        <Stat
          label={ru ? "Файлов просканировано" : "Files scanned"}
          value={report.filesScanned}
          hint={
            report.hasTests
              ? ru
                ? "автотесты найдены"
                : "test runner detected"
              : ru
              ? "автотесты не найдены"
              : "no test runner found"
          }
          tone={report.hasTests ? "acid" : "rot"}
        />
      </div>
    </div>
  );
}

/* ========================================================================= */
/*  View 1 — defect records                                                  */
/* ========================================================================= */

function AntipatternView({ report, store }: { report: AuditReport; store: AuditStore }) {
  const ru = store.lang === "ru";

  if (!report.antipatterns.length) {
    return (
      <p className="mono text-[11px] text-[var(--bone-dim)]">
        {ru ? "Сигнатур дефектов не обнаружено." : "No defect signatures detected."}
      </p>
    );
  }

  return (
    <div className="space-y-px bg-[var(--line)] border border-[var(--line)]">
      {report.antipatterns.map((ap, i) => {
        const sev = SEVERITY[ap.severity] ?? SEVERITY.WARNING;
        return (
          <article key={`${ap.title}-${i}`} className="bg-[var(--ink)] p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="mono text-[9.5px] font-bold tracking-[0.2em] px-2 py-1"
                style={{ background: sev.bg, color: "#05060a" }}
              >
                {sev.label[store.lang]}
              </span>
              {ap.cwe ? (
                <span className="mono text-[10px] tracking-[0.16em] text-[var(--bone)] border border-[var(--line-3)] px-2 py-1">
                  {ap.cwe}
                </span>
              ) : null}
              <span className="mono text-[10px] text-[var(--bone-dim)] truncate max-w-full">
                {ap.detectedIn}
              </span>
              <span className="mono text-[10px] text-[var(--bone-dim)] ml-auto tabular-nums">
                #{String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <h3 className="mono text-[13px] sm:text-[15px] text-[var(--bone)] font-semibold mt-4">
              {ap.title}
            </h3>
            <p className="mono text-[11px] leading-relaxed text-[var(--bone-dim)] mt-3 max-w-3xl">
              {ap.description}
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-5">
              <CodeSpecimen
                code={ap.sampleBadCode}
                tone="bad"
                tag={ru ? "ИНФИЦИРОВАНО" : "INFECTED"}
                file={ap.detectedIn}
              />
              <CodeSpecimen
                code={ap.sampleFix}
                tone="good"
                tag={ru ? "СТЕРИЛЬНО" : "TREATED"}
                file={ru ? "рекомендуемая замена" : "recommended replacement"}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ========================================================================= */
/*  View 2 — god files                                                       */
/* ========================================================================= */

function GodFilesView({ report, store }: { report: AuditReport; store: AuditStore }) {
  const ru = store.lang === "ru";
  const files = report.godComponents;

  if (!files.length) {
    return (
      <div className="border border-[var(--line)] p-6 bg-[var(--ink)]">
        <p className="mono text-[11px] text-[var(--acid)]">
          {ru
            ? "Монолитных файлов не обнаружено. Объём модулей в пределах управляемости."
            : "No monolithic files detected. Module volumes stay within a manageable range."}
        </p>
      </div>
    );
  }

  const maxLines = Math.max(...files.map((f) => f.lines), 1);

  return (
    <div className="space-y-4">
      {files.map((f, i) => {
        const risk = RISK[f.risk] ?? RISK.medium;
        const pct = Math.round((f.lines / maxLines) * 100);
        return (
          <article
            key={`${f.name}-${i}`}
            className="panel relative overflow-hidden"
            style={{ borderLeft: `2px solid ${risk.c}` }}
          >
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="mono text-[10px] text-[var(--bone-dim)] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mono text-[12.5px] text-[var(--bone)] break-all font-semibold">
                      {f.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {f.sizeBytes ? (
                    <span className="mono text-[10px] text-[var(--bone-dim)]">
                      {(f.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  ) : null}
                  <span
                    className="mono text-[9.5px] font-bold tracking-[0.18em] px-2 py-0.5"
                    style={{ background: risk.c, color: "#05060a" }}
                  >
                    {risk[store.lang]}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span
                  className="mono text-xl tabular-nums font-semibold shrink-0 w-[5.5rem]"
                  style={{ color: risk.c }}
                >
                  {formatNumber(f.lines)}
                </span>
                <span className="flex-1 h-6 bg-[var(--line)] relative overflow-hidden">
                  <span
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${risk.c}33, ${risk.c})`,
                      transition: "width 1s cubic-bezier(.16,1,.3,1)",
                    }}
                  />
                  <span
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(90deg, rgba(5,6,10,.55) 0 2px, transparent 2px 12px)",
                    }}
                  />
                </span>
                <span className="lbl shrink-0" style={{ fontSize: 9 }}>
                  {ru ? "СТРОК" : "LINES"}
                </span>
              </div>

              <ul className="mt-4 space-y-2">
                {f.issues.map((issue, k) => (
                  <li key={k} className="flex items-start gap-2.5">
                    <span
                      className="mt-[7px] w-1.5 h-1.5 shrink-0"
                      style={{ background: risk.c }}
                      aria-hidden="true"
                    />
                    <span className="mono text-[10.5px] leading-relaxed text-[var(--bone-dim)]">
                      {issue}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        );
      })}

      <p className="mono text-[10px] text-[var(--bone-dim)] leading-relaxed pt-2">
        {ru
          ? "Закон обратной пропорциональности объёма и качества: чем крупнее файл, тем выше шанс, что новое изменение сотрёт существующую логику."
          : "The volume-quality inverse law: the larger the file, the likelier a new change erases logic that already worked."}
      </p>
    </div>
  );
}

/* ========================================================================= */
/*  View 3 — surgical prompts                                                */
/* ========================================================================= */

function PromptView({ report, store }: { report: AuditReport; store: AuditStore }) {
  const { lang, targetAiTool, setTargetAiTool, copyPrompt, copiedPromptIdx, handleCopyAllPrompts, copiedAllPrompts } =
    store;
  const ru = lang === "ru";

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="lbl">{ru ? "Целевой инструмент" : "Target tool"}</span>
          <div className="flex border border-[var(--line-2)]">
            {(
              [
                ["cursor", "CURSOR COMPOSER"],
                ["claude", "CLAUDE THINKING"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTargetAiTool(id)}
                aria-pressed={targetAiTool === id}
                className="mono text-[10px] tracking-[0.14em] px-3 py-2 transition cursor-pointer"
                style={
                  targetAiTool === id
                    ? { background: "var(--acid)", color: "#05060a", fontWeight: 700 }
                    : { color: "var(--bone-dim)" }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleCopyAllPrompts} className="btn !py-2 !px-3">
          {copiedAllPrompts ? (
            <CheckIcon size={12} className="text-[var(--acid)]" />
          ) : (
            <CopyIcon size={12} />
          )}
          {copiedAllPrompts
            ? ru
              ? "Весь план скопирован"
              : "Full plan copied"
            : ru
            ? "Скопировать весь план"
            : "Copy full plan"}
        </button>
      </div>

      {report.refactorSteps.map((step, idx) => (
        <article key={step.step} className="panel relative" style={{ borderLeft: "2px solid var(--acid)" }}>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[var(--line)]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="d3 text-[22px] text-[var(--acid)] leading-none tabular-nums">
                {String(step.step).padStart(2, "0")}
              </span>
              <h3 className="mono text-[12px] text-[var(--bone)] font-semibold max-w-2xl">
                {step.title}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="mono text-[9.5px] tracking-[0.16em] text-[var(--bone-dim)] border border-[var(--line-2)] px-2 py-1">
                {targetAiTool === "cursor" ? "CURSOR COMPOSER" : "CLAUDE THINKING"}
              </span>
              <span className="mono text-[10px] text-[var(--bone-dim)] flex items-center gap-1.5">
                <ClockIcon size={11} />
                {step.estimatedTime}
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="relative">
              <pre className="m-0 border border-[var(--line-2)] bg-[#020306] p-4 pr-4 text-[11.5px] leading-[1.7] font-mono text-[#cdd2dc] whitespace-pre-wrap overflow-x-auto">
                <code>{step.prompt}</code>
              </pre>
              <button
                type="button"
                onClick={() => copyPrompt(step.prompt, idx)}
                className="btn btn-acid absolute top-3 right-3 !py-1.5 !px-2.5 !text-[9.5px]"
              >
                {copiedPromptIdx === idx ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
                {copiedPromptIdx === idx ? (ru ? "ГОТОВО" : "DONE") : ru ? "КОПИРОВАТЬ" : "COPY"}
              </button>
            </div>

            <p className="mono text-[10px] text-[var(--bone-dim)] mt-3 flex items-start gap-2">
              <SparklesIcon size={12} className="text-[var(--acid)] shrink-0 mt-0.5" />
              {ru
                ? "Как применить: открой Cursor, нажми Cmd+I (Composer), вставь промпт и подтверди. Промпт намеренно запрещает ИИ сокращать код заглушками."
                : "How to apply: open Cursor, hit Cmd+I (Composer), paste the prompt and confirm. The prompt explicitly forbids the model from collapsing code into placeholders."}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ========================================================================= */
/*  View 4 — health matrix                                                   */
/* ========================================================================= */

function HealthView({ report, store }: { report: AuditReport; store: AuditStore }) {
  const ru = store.lang === "ru";

  const security = report.doomsdayScore > 75 ? 14 : 85;
  const modularity = Math.max(15, Math.round(100 - report.spaghettiIndex * 9));
  const typeSafety = Math.max(20, Math.round(100 - report.ghostTypesCount * 1.5));
  const tests = report.hasTests ? 100 : 0;

  const pillars = [
    {
      label: ru ? "Безопасность ключей" : "Credential security",
      value: security,
      note: ru
        ? "Поиск сервисных токенов в клиентских файлах и открытом бандле"
        : "Scanning client files and the public bundle for service tokens",
      tone: "auto" as const,
    },
    {
      label: ru ? "Модульность" : "Modularity",
      value: modularity,
      note: ru
        ? "Оценка God-объектов и плотности связности внутри одного файла"
        : "God-object and single-file coupling density estimate",
      tone: "auto" as const,
    },
    {
      label: ru ? "Строгость типов" : "Type strictness",
      value: typeSafety,
      note: ru
        ? "Обнаружение подавления компилятора через `any` и `as any`"
        : "Detection of compiler suppression via `any` and `as any`",
      tone: "bone" as const,
    },
    {
      label: ru ? "Регрессионные тесты" : "Regression tests",
      value: tests,
      note: ru
        ? "Наличие Vitest / Jest / Playwright сценариев в репозитории"
        : "Presence of Vitest / Jest / Playwright scenarios in the repository",
      tone: tests ? ("acid" as const) : ("rot" as const),
    },
  ];

  const values = pillars.map((p) => p.value);
  const cx = 90;
  const cy = 84;
  const R = 62;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i / 4) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const polygon = values
    .map((v, i) => {
      const [x, y] = pt(i, (Math.max(4, v) / 100) * R);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-5 panel p-5 flex flex-col items-center justify-center">
        <span className="lbl self-start">{ru ? "Радар здоровья" : "Health radar"}</span>
        <svg viewBox="0 0 180 172" className="w-full max-w-[280px] mt-2" role="img" aria-label={ru ? "Матрица здоровья кодовой базы" : "Codebase health matrix"}>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <polygon
              key={f}
              points={[0, 1, 2, 3].map((i) => pt(i, R * f).join(",")).join(" ")}
              fill="none"
              stroke="var(--line-2)"
              strokeWidth="0.7"
            />
          ))}
          {[0, 1, 2, 3].map((i) => {
            const [x, y] = pt(i, R);
            return (
              <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line-2)" strokeWidth="0.7" />
            );
          })}
          <polygon
            points={polygon}
            fill="rgba(200,255,60,.14)"
            stroke="var(--acid)"
            strokeWidth="1.4"
            style={{ transition: "all .9s cubic-bezier(.16,1,.3,1)" }}
          />
          {values.map((v, i) => {
            const [x, y] = pt(i, (Math.max(4, v) / 100) * R);
            return <circle key={i} cx={x} cy={y} r="2.6" fill="var(--acid)" />;
          })}
          {[0, 1, 2, 3].map((i) => {
            const [x, y] = pt(i, R + 16);
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--bone-dim)"
                style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, letterSpacing: "0.08em" }}
              >
                {["SEC", "MOD", "TYP", "TST"][i]}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="lg:col-span-7 panel p-5">
        <span className="lbl">{ru ? "Четыре столпа надёжности" : "Four reliability pillars"}</span>
        <div className="mt-5 space-y-6">
          {pillars.map((p) => (
            <div key={p.label}>
              <LedBar
                value={p.value}
                tone={p.tone}
                segments={32}
                label={p.label}
                readout={`${p.value}%`}
              />
              <p className="mono text-[10px] leading-relaxed text-[var(--bone-dim)] mt-2">
                {p.note}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-[var(--line)] flex flex-wrap items-center gap-4">
          <span className="mono text-[10px] text-[var(--bone-dim)] flex items-center gap-2">
            <BugIcon size={12} className="text-[var(--rot)]" />
            {ru ? "Приведений типов-призраков:" : "Ghost type assertions:"}{" "}
            <strong className="text-[var(--bone)]">{report.ghostTypesCount}</strong>
          </span>
          <span className="mono text-[10px] text-[var(--bone-dim)]">
            {ru ? "Лингвистика:" : "Language:"} {report.primaryLanguage ?? "—"}
          </span>
          {typeof report.starsCount === "number" ? (
            <span className="mono text-[10px] text-[var(--bone-dim)]">
              ★ {formatNumber(report.starsCount)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/*  Report router                                                            */
/* ========================================================================= */

const REPORT_TABS = [
  { id: "antipatterns", ru: "Дефекты", en: "Defects", icon: BugIcon },
  { id: "god-files", ru: "God-файлы", en: "God files", icon: TerminalIcon },
  { id: "prompts", ru: "План ремонта", en: "Repair plan", icon: SparklesIcon },
  { id: "radar", ru: "Матрица здоровья", en: "Health matrix", icon: ClockIcon },
] as const;

export function ReportPanel({ store }: { store: AuditStore }) {
  const { auditReport, activeReportTab, setActiveReportTab, lang } = store;
  const ru = lang === "ru";

  if (!auditReport) return null;

  const counts: Record<string, number> = {
    antipatterns: auditReport.antipatterns.length,
    "god-files": auditReport.godComponents.length,
    prompts: auditReport.refactorSteps.length,
    radar: 4,
  };

  return (
    <div className="space-y-4">
      <VerdictHeader report={auditReport} store={store} />

      <div className="reveal" data-delay="120">
        <div
          className="flex flex-wrap gap-px border border-[var(--line-2)] bg-[var(--line)]"
          role="tablist"
          aria-label={ru ? "Разделы отчёта" : "Report sections"}
        >
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeReportTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveReportTab(tab.id)}
                className="tab-btn flex-1 min-w-[9rem] justify-between bg-[var(--ink)]"
                data-active={active}
              >
                <span className="flex items-center gap-2">
                  <Icon size={12} />
                  {ru ? tab.ru : tab.en}
                </span>
                <span className="tabular-nums opacity-70">{counts[tab.id]}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4" role="tabpanel">
          {activeReportTab === "antipatterns" && (
            <AntipatternView report={auditReport} store={store} />
          )}
          {activeReportTab === "god-files" && (
            <GodFilesView report={auditReport} store={store} />
          )}
          {activeReportTab === "prompts" && (
            <PromptView report={auditReport} store={store} />
          )}
          {activeReportTab === "radar" && (
            <HealthView report={auditReport} store={store} />
          )}
        </div>
      </div>
    </div>
  );
}
