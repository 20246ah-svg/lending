"use client";

import { useMemo } from "react";
import { SectionHead } from "@/components/ui/panel";
import { LedBar } from "@/components/ui/readouts";
import { CountUp } from "@/components/fx/count-up";
import { ZapIcon, AlertTriangleIcon, CheckCircleIcon, ShieldAlertIcon } from "@/components/icons";
import { formatNumber } from "@/lib/types";
import type { AuditStore } from "@/lib/use-audit";

/* ------------------------------------------------------------------------- */

const PROFILES = [
  {
    id: "clean",
    ru: "Аккуратный MVP",
    en: "Disciplined MVP",
    v: { lines: 1200, god: 0, justFix: 2, tests: true, db: "clean" as const },
  },
  {
    id: "vibe",
    ru: "Типичный вайбкод",
    en: "Typical vibe-coding",
    v: { lines: 5500, god: 3, justFix: 14, tests: false, db: "medium" as const },
  },
  {
    id: "pyramid",
    ru: "Пирамида долга",
    en: "Debt pyramid",
    v: { lines: 18000, god: 9, justFix: 32, tests: false, db: "mess" as const },
  },
];

/* ------------------------------------------------------------------------- */

export function Simulator({ store }: { store: AuditStore }) {
  const {
    lang,
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
  } = store;

  const ru = lang === "ru";
  const { days, emergencyCost, fragilityPercent } = calcResult;

  /* --- counterfactual: same project with / without a test suite ---------- */

  const curve = useMemo(() => {
    const daysWith = Math.max(2, days + (calcHasTests ? -44 : 44));
    const build = (collapse: number, span: number) => {
      const pts: Array<[number, number]> = [];
      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const c = (i / steps) * span;
        const s = Math.max(0, 100 * Math.pow(1 - c / collapse, 0.82));
        pts.push([20 + (c / span) * 300, 118 - (s / 100) * 96]);
      }
      return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    };
    const span = Math.max(8, daysWith * 1.25);
    return {
      daysWith,
      span,
      alt: build(daysWith, span),
      withMarkX: 20 + (days / span) * 300,
    };
  }, [days, calcHasTests]);

  const risk =
    days < 14
      ? { ru: "КРИТИЧЕСКИЙ", en: "CRITICAL", c: "var(--rot)" }
      : days < 40
      ? { ru: "ПОВЫШЕННЫЙ", en: "ELEVATED", c: "#ffc42e" }
      : { ru: "КОНТРОЛИРУЕМЫЙ", en: "CONTAINED", c: "var(--acid)" };

  /* --- channel definitions ---------------------------------------------- */

  const faders = [
    {
      n: "01",
      label: ru ? "Строк, сгенерированных ИИ" : "AI-generated lines of code",
      value: formatNumber(calcAiLines),
      unit: ru ? "строк" : "LOC",
      min: 500,
      max: 20000,
      step: 500,
      raw: calcAiLines,
      set: setCalcAiLines,
      tone: "var(--bone)",
      scale: [
        ["500", "MVP"],
        ["10 000", "SaaS"],
        ["20 000+", ru ? "СПАГЕТТИ" : "SPAGHETTI"],
      ],
      hint: ru
        ? "Объём кода, который модель написала без человеческого ревью."
        : "The volume of code the model wrote without human review.",
    },
    {
      n: "02",
      label: ru ? "Файлов длиннее 500 строк" : "Files longer than 500 lines",
      value: String(calcGodFiles),
      unit: ru ? "файлов" : "files",
      min: 0,
      max: 10,
      step: 1,
      raw: calcGodFiles,
      set: setCalcGodFiles,
      tone: "var(--bone)",
      scale: [
        ["0", ru ? "МОДУЛЬНО" : "MODULAR"],
        ["3–5", ru ? "ОПАСНО" : "RISKY"],
        ["10", ru ? "МОНОЛИТ" : "MONOLITH"],
      ],
      hint: ru
        ? "Каждый такой файл превышает комфортное окно контекста модели."
        : "Each such file exceeds the model's comfortable context window.",
    },
    {
      n: "03",
      label: ru ? "Промптов «Just fix it, don't change anything else»" : "\u201CJust fix it, don't change anything else\u201D prompts",
      value: String(calcJustWorkCount),
      unit: ru ? "раз" : "times",
      min: 0,
      max: 40,
      step: 1,
      raw: calcJustWorkCount,
      set: setCalcJustWorkCount,
      tone: "var(--rot)",
      scale: [
        ["0", ru ? "ХИРУРГИЯ" : "SURGERY"],
        ["20", ru ? "КОСТЫЛИ" : "HACKS"],
        ["40", ru ? "СЛОЙ ЗА СЛОЕМ" : "LAYER ON LAYER"],
      ],
      hint: ru
        ? "Каждый такой промпт заставляет ИИ оборачивать костыль в новый костыль."
        : "Each one forces the LLM to wrap an old hack in a brand-new hack.",
    },
  ];

  const dbOptions = [
    { id: "clean" as const, ru: "Миграции и схема", en: "Migrations & schema" },
    { id: "medium" as const, ru: "JSON-колонки", en: "JSON blobs" },
    { id: "mess" as const, ru: "LocalStorage как БД", en: "LocalStorage as a DB" },
  ];

  return (
    <section id="calculator" className="band scroll-mt-24 relative z-10">
      <div className="shell py-16 sm:py-24">
        <SectionHead
          index="02"
          label={ru ? "РЕАКТОР ДОЛГА" : "DEBT REACTOR"}
          title={
            ru ? (
              <>
                Спроектируй крушение
                <br />
                до того, как оно случится
              </>
            ) : (
              <>
                Project the collapse
                <br />
                before it happens
              </>
            )
          }
          lede={
            ru
              ? "Пять параметров твоего проекта описывают его будущее точнее, чем метрики роста. Двигай рычаги и смотри, где кривая стабильности пересечёт ноль."
              : "Five parameters of your project describe its future more accurately than your growth metrics. Move the levers and watch where the stability curve crosses zero."
          }
          tone="rot"
        />

        {/* scenario presets */}
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="lbl mr-1">{ru ? "ПРОФИЛЬ" : "PROFILE"}:</span>
          {PROFILES.map((p) => {
            const active =
              calcAiLines === p.v.lines &&
              calcGodFiles === p.v.god &&
              calcJustWorkCount === p.v.justFix &&
              calcHasTests === p.v.tests &&
              calcDbState === p.v.db;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setCalcAiLines(p.v.lines);
                  setCalcGodFiles(p.v.god);
                  setCalcJustWorkCount(p.v.justFix);
                  setCalcHasTests(p.v.tests);
                  setCalcDbState(p.v.db);
                }}
                aria-pressed={active}
                className="mono text-[10px] tracking-[0.16em] uppercase px-3 py-2 border transition cursor-pointer"
                style={
                  active
                    ? { borderColor: "var(--acid)", background: "var(--acid)", color: "#05060a", fontWeight: 700 }
                    : { borderColor: "var(--line-2)", color: "var(--bone-dim)" }
                }
              >
                {ru ? p.ru : p.en}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ---------- channel bank ---------- */}
          <div className="lg:col-span-7 panel bracket">
            <div className="flex items-center justify-between border-b border-[var(--line-2)] px-4 py-2.5">
              <span className="lbl">{ru ? "БАНК КАНАЛОВ" : "CHANNEL BANK"}</span>
              <span className="mono text-[10px] text-[var(--bone-dim)]">
                {ru ? "РЕАКТИВНЫЙ РАСЧЁТ" : "REACTIVE SOLVER"}
              </span>
            </div>

            <div className="p-4 sm:p-6 space-y-8">
              {faders.map((f) => (
                <div key={f.n}>
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex items-baseline gap-3 min-w-0">
                      <span
                        className="mono text-[10px] tabular-nums shrink-0"
                        style={{ color: "var(--line-3)" }}
                      >
                        {f.n}
                      </span>
                      <label
                        htmlFor={`fader-${f.n}`}
                        className="mono text-[11px] text-[var(--bone)] leading-snug"
                      >
                        {f.label}
                      </label>
                    </div>
                    <span
                      className="mono text-[13px] font-semibold tabular-nums shrink-0"
                      style={{ color: f.tone }}
                    >
                      {f.value}
                      <span className="text-[9px] font-normal text-[var(--bone-dim)] ml-1.5 uppercase">
                        {f.unit}
                      </span>
                    </span>
                  </div>

                  <input
                    id={`fader-${f.n}`}
                    type="range"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={f.raw}
                    onChange={(e) => f.set(Number(e.target.value))}
                    className="fader mt-2"
                    aria-valuetext={`${f.raw}`}
                  />

                  <div className="flex justify-between gap-2">
                    {f.scale.map(([v, k]) => (
                      <span key={k} className="mono text-[9px] tracking-[0.1em] text-[var(--bone-dim)]">
                        <span className="text-[var(--bone-dim)]">{v}</span> {k}
                      </span>
                    ))}
                  </div>

                  <p className="mono text-[10px] text-[var(--bone-dim)] mt-2 leading-relaxed">
                    {f.hint}
                  </p>
                </div>
              ))}

              <div className="tick-rail" aria-hidden="true" />

              {/* channel 04 — rocker switch */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="mono text-[10px] tabular-nums shrink-0 text-[var(--line-3)]">
                    04
                  </span>
                  <div>
                    <span className="mono text-[11px] text-[var(--bone)] block">
                      {ru ? "Есть хотя бы один работающий автотест" : "At least one working automated test"}
                    </span>
                    <span className="mono text-[10px] text-[var(--line-3)]">
                      {ru
                        ? "Ручное кликанье мышкой в браузере не считается."
                        : "Clicking around in the browser does not count."}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={calcHasTests}
                  onClick={() => setCalcHasTests(!calcHasTests)}
                  className="relative w-[104px] h-9 border shrink-0 cursor-pointer transition-colors"
                  style={{
                    borderColor: calcHasTests ? "var(--acid)" : "var(--line-3)",
                    background: calcHasTests ? "rgba(200,255,60,.1)" : "rgba(255,46,99,.08)",
                  }}
                >
                  <span
                    className="absolute top-1 bottom-1 w-[46px] transition-all duration-300"
                    style={{
                      left: calcHasTests ? 4 : 54,
                      background: calcHasTests ? "var(--acid)" : "var(--rot)",
                      boxShadow: `0 0 14px ${calcHasTests ? "rgba(200,255,60,.5)" : "rgba(255,46,99,.5)"}`,
                    }}
                  />
                  <span
                    className="absolute inset-0 flex items-center justify-between px-2.5 mono text-[9px] font-bold tracking-[0.14em]"
                    aria-hidden="true"
                  >
                    <span style={{ color: calcHasTests ? "var(--acid)" : "#05060a" }}>ON</span>
                    <span style={{ color: calcHasTests ? "#05060a" : "var(--rot)" }}>OFF</span>
                  </span>
                </button>
              </div>

              {/* channel 05 — state architecture */}
              <div>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="mono text-[10px] tabular-nums shrink-0 text-[var(--line-3)]">
                    05
                  </span>
                  <span className="mono text-[11px] text-[var(--bone)]">
                    {ru ? "Состояние и база данных" : "Database & state architecture"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
                  {dbOptions.map((o) => {
                    const active = calcDbState === o.id;
                    const bad = o.id === "mess";
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setCalcDbState(o.id)}
                        aria-pressed={active}
                        className="mono text-[10.5px] py-3 px-3 transition-colors cursor-pointer"
                        style={{
                          background: active
                            ? bad
                              ? "rgba(255,46,99,.14)"
                              : "rgba(237,234,227,.08)"
                            : "var(--ink)",
                          color: active
                            ? bad
                              ? "var(--rot)"
                              : "var(--bone)"
                            : "var(--bone-dim)",
                          boxShadow: active
                            ? `inset 0 -2px 0 ${bad ? "var(--rot)" : "var(--bone)"}`
                            : "none",
                        }}
                      >
                        {ru ? o.ru : o.en}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- projection ---------- */}
          <div className="lg:col-span-5 panel-solid bracket bracket-rot">
            <div className="flex items-center justify-between border-b border-[var(--line-2)] px-4 py-2.5">
              <span className="lbl">{ru ? "ПРОГНОЗ ОТКАЗА" : "FAILURE PROJECTION"}</span>
              <span className="flex items-center gap-2">
                <span className="led led-rot" aria-hidden="true" />
                <span className="mono text-[9.5px] tracking-[0.18em] text-[var(--bone-dim)]">
                  SOLVING
                </span>
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <span className="lbl">
                {ru ? "До критического отказа системы" : "Until critical production failure"}
              </span>
              <div className="flex items-end gap-3 mt-3">
                <span
                  className="d1 tabular-nums leading-none"
                  style={{ fontSize: "clamp(3.4rem, 9vw, 5.6rem)", color: risk.c }}
                >
                  <CountUp value={days} duration={900} />
                </span>
                <span className="mono text-sm text-[var(--bone-dim)] pb-2">
                  {ru ? (days === 1 ? "день" : days < 5 ? "дня" : "дней") : "days"}
                </span>
              </div>

              <div
                className="mt-4 inline-flex items-center gap-2 px-2.5 py-1.5"
                style={{ background: `${risk.c}1f`, border: `1px solid ${risk.c}55` }}
              >
                <ShieldAlertIcon size={12} style={{ color: risk.c }} />
                <span
                  className="mono text-[9.5px] font-bold tracking-[0.2em]"
                  style={{ color: risk.c }}
                >
                  {ru ? risk.ru : risk.en}
                </span>
              </div>

              {/* collapse curve */}
              <div className="mt-6">
                <svg viewBox="0 0 340 132" className="w-full" role="img" aria-label={ru ? "Кривая стабильности по коммитам" : "Stability curve over commits"}>
                  {[0, 1, 2, 3].map((i) => (
                    <line
                      key={i}
                      x1="20"
                      x2="320"
                      y1={118 - i * 32}
                      y2={118 - i * 32}
                      stroke="var(--line)"
                      strokeWidth="1"
                    />
                  ))}
                  <line x1="20" y1="118" x2="320" y2="118" stroke="var(--line-2)" strokeWidth="1" />
                  <line x1="20" y1="8" x2="20" y2="118" stroke="var(--line-2)" strokeWidth="1" />

                  {/* counterfactual: with tests */}
                  <path
                    d={curve.alt}
                    fill="none"
                    stroke={calcHasTests ? "var(--line-3)" : "var(--acid)"}
                    strokeWidth="1.3"
                    strokeDasharray="4 4"
                  />

                  {/* actual */}
                  <path
                    d={(() => {
                      const steps = 60;
                      const span = curve.span;
                      const pts: string[] = [];
                      for (let i = 0; i <= steps; i++) {
                        const c = (i / steps) * span;
                        const s = Math.max(0, 100 * Math.pow(1 - c / days, 0.82));
                        const x = 20 + (c / span) * 300;
                        const y = 118 - (s / 100) * 96;
                        pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
                      }
                      return pts.join(" ");
                    })()}
                    fill="none"
                    stroke={risk.c}
                    strokeWidth="2"
                  />

                  {/* failure marker */}
                  <line
                    x1={curve.withMarkX}
                    y1="12"
                    x2={curve.withMarkX}
                    y2="118"
                    stroke="var(--rot)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <circle cx={curve.withMarkX} cy="118" r="3.2" fill="var(--rot)" />
                  <text
                    x={Math.min(curve.withMarkX + 6, 250)}
                    y="22"
                    fill="var(--rot)"
                    style={{ fontFamily: "var(--f-mono)", fontSize: 8, letterSpacing: "0.14em" }}
                  >
                    {ru ? "ТОЧКА ОТКАЗА" : "FAILURE POINT"}
                  </text>

                  <text
                    x="20"
                    y="128"
                    fill="var(--line-3)"
                    style={{ fontFamily: "var(--f-mono)", fontSize: 8 }}
                  >
                    0
                  </text>
                  <text
                    x="312"
                    y="128"
                    fill="var(--line-3)"
                    textAnchor="end"
                    style={{ fontFamily: "var(--f-mono)", fontSize: 8 }}
                  >
                    {Math.round(curve.span)} {ru ? "КОММИТОВ" : "COMMITS"}
                  </text>
                </svg>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="mono text-[9.5px] text-[var(--bone-dim)] flex items-center gap-1.5">
                    <span
                      className="w-3 h-[2px] inline-block"
                      style={{ background: risk.c }}
                    />
                    {ru ? "ТЕКУЩИЙ ПРОЕКТ" : "CURRENT PROJECT"}
                  </span>
                  <span className="mono text-[9.5px] text-[var(--bone-dim)] flex items-center gap-1.5">
                    <span
                      className="w-3 h-[2px] inline-block"
                      style={{
                        background: calcHasTests ? "var(--line-3)" : "var(--acid)",
                        backgroundImage:
                          "repeating-linear-gradient(90deg, currentColor 0 3px, transparent 3px 6px)",
                      }}
                    />
                    {calcHasTests
                      ? ru
                        ? "БЕЗ ТЕСТОВ (контрфакт)"
                        : "WITHOUT TESTS (counterfactual)"
                      : ru
                      ? "С ОДНИМ ТЕСТОМ (контрфакт)"
                      : "WITH ONE TEST (counterfactual)"}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <LedBar
                  value={fragilityPercent}
                  tone="auto"
                  segments={30}
                  label={ru ? "УРОВЕНЬ ХРУПКОСТИ" : "FRAGILITY INDEX"}
                  readout={`${fragilityPercent}%`}
                />
                <LedBar
                  value={Math.max(4, 100 - Math.min(100, (emergencyCost / 12000) * 100))}
                  tone="rot"
                  segments={30}
                  label={ru ? "ОСТАТОК РЕЗЕРВА ВРЕМЕНИ" : "REMAINING TIME RESERVE"}
                  readout={`${Math.round(Math.max(0, 100 - Math.min(100, (emergencyCost / 12000) * 100)))}%`}
                />
              </div>

              <div className="mt-6 border border-[var(--line-2)] bg-[#020306] p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="mono text-[10px] text-[var(--bone-dim)]">
                    {ru ? "ЭКСТРЕННЫЙ НАЁМ SENIOR" : "EMERGENCY SENIOR CONTRACTOR"}
                  </span>
                  <span className="mono text-lg font-semibold text-[var(--bone)] tabular-nums">
                    ${formatNumber(emergencyCost)}
                  </span>
                </div>
                <p className="mono text-[10px] leading-relaxed text-[var(--bone-dim)] mt-2">
                  {ru
                    ? "Оценка по 60 $/час: суммарные часы на разбор монолитов, восстановление тестов и изоляцию ключей."
                    : "Estimated at $60/hour: total hours to dismantle monoliths, restore tests and isolate credentials."}
                </p>
              </div>

              <div
                className="mt-4 flex items-start gap-3 border-l-2 pl-3.5 py-1"
                style={{ borderColor: "var(--acid)" }}
              >
                {calcHasTests ? (
                  <CheckCircleIcon size={14} className="text-[var(--acid)] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangleIcon size={14} className="text-[var(--acid)] shrink-0 mt-0.5" />
                )}
                <p className="mono text-[10px] leading-relaxed text-[var(--bone-dim)]">
                  {ru
                    ? "Вместо найма подрядчика выполни хирургический план из отчёта аудитора — он собирается автоматически по найденным дефектам."
                    : "Instead of hiring a contractor, execute the surgical plan from the audit report — it is assembled automatically from the defects found."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("audit-tool");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn w-full mt-5"
              >
                <ZapIcon size={12} />
                {ru ? "Собрать план ремонта" : "Assemble the repair plan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
