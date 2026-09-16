"use client";

import Image from "next/image";
import {
  ZapIcon,
  FileCodeIcon,
  CheckCircleIcon,
  CopyIcon,
  CheckIcon,
  ShieldAlertIcon,
} from "@/components/icons";
import { FieldCanvas } from "@/components/fx/field-canvas";
import { Marquee } from "@/components/fx/marquee";
import { DoomsdayDial } from "@/components/ui/readouts";
import type { AuditReport, Lang } from "@/lib/types";

interface HeroProps {
  lang: Lang;
  report: AuditReport | null;
  copiedCli: boolean;
  onRunAudit: () => void;
  onShowDemo: () => void;
  onCopyCli: () => void;
}

const SIGNATURES_RU = [
  "CWE-798 · СЕКРЕТ В КЛИЕНТСКОМ БАНДЛЕ",
  "БЕСКОНЕЧНЫЙ ЦИКЛ useEffect",
  "GOD-КОМПОНЕНТ НА 2 420 СТРОК",
  "54 КАСКАДА `as any`",
  "0 АВТОТЕСТОВ",
  "LOCK-ФАЙЛ ОТСУТСТВУЕТ",
  "ПУСТОЙ catch",
  "МАСТЕР-КЛЮЧ В BROWSER DEVTOOLS",
  "ЛОГИРОВАНИЕ ПРИВАТНЫХ КЛЮЧЕЙ",
];

const SIGNATURES_EN = [
  "CWE-798 · SECRET IN CLIENT BUNDLE",
  "INFINITE useEffect LOOP",
  "2,420-LINE GOD COMPONENT",
  "54 `as any` CASCADES",
  "0 AUTOMATED TESTS",
  "MISSING LOCKFILE",
  "SILENT EMPTY catch",
  "SERVICE ROLE KEY IN DEVTOOLS",
  "PRIVATE KEYS WRITTEN TO LOGS",
];

export function Hero({
  lang,
  report,
  copiedCli,
  onRunAudit,
  onShowDemo,
  onCopyCli,
}: HeroProps) {
  const ru = lang === "ru";
  const signatures = ru ? SIGNATURES_RU : SIGNATURES_EN;

  const score = report?.doomsdayScore ?? 89;
  const specimenName = report?.repoName ?? "founder/instant-ai-landing-builder";

  return (
    <section id="top" className="relative z-10 overflow-hidden">
      {/* generative phosphor lattice */}
      <FieldCanvas className="absolute inset-0 w-full h-full z-0" />

      {/* edge index label */}
      <span
        aria-hidden="true"
        className="vert-label absolute right-2 top-[28%] hidden xl:block z-10"
      >
        ROT SPECIMEN · THE LIVING CODEBASE
      </span>

      {/* One reveal group for the whole hero lockup so the headline lines, the
          infected word and the meta rail choreograph together. */}
      <div className="shell relative z-10 pt-[112px] sm:pt-[132px] reveal-lines">
        {/* ---- meta rail ---- */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-[var(--line)] py-2.5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <span className="lbl lbl-acid">ACCESSION VD-2026-0041</span>
            <span className="hidden sm:block w-px h-3 bg-[var(--line-2)]" />
            <span className="lbl">CURSOR · BOLT.NEW · LOVABLE</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="led led-rot" aria-hidden="true" />
            <span className="lbl rot-text">
              {ru ? "СЧЁТЧИК СУДНОГО ДНЯ АКТИВЕН" : "DOOMSDAY CLOCK ACTIVE"}
            </span>
          </div>
        </div>

        {/* ---- kinetic headline ---- */}
        <h1 className="mt-8 sm:mt-12">
          <span className="sr-only">
            {ru
              ? "Узнай, через сколько коммитов рухнет твой вайбкод-стартап"
              : "Know exactly which commit kills your AI-built startup"}
          </span>

          <span aria-hidden="true" className="block uppercase">
            <span
              className="mask-line d1"
              style={{ fontSize: "clamp(2.2rem, 7.5vw, 8.4rem)", lineHeight: 0.86 }}
            >
              <span style={{ transitionDelay: "60ms" }}>
                {ru ? "УЗНАЙ, ЧЕРЕЗ СКОЛЬКО" : "KNOW EXACTLY WHICH"}
              </span>
            </span>
            <span
              className="mask-line d1"
              style={{ fontSize: "clamp(2.2rem, 7.5vw, 8.4rem)", lineHeight: 0.86 }}
            >
              <span style={{ transitionDelay: "180ms" }}>
                {ru ? "КОММИТОВ РУХНЕТ ТВОЙ" : "COMMIT KILLS YOUR"}
              </span>
            </span>
          </span>
        </h1>

        {/* ---- asymmetric body: headline tail + lede | instrument ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-10 mt-10 lg:mt-14 pb-14 lg:pb-20">
          <div className="lg:col-span-6 flex flex-col">
            <span
              aria-hidden="true"
              className="mask-line d1 infected split"
              style={{ fontSize: "clamp(1.9rem, 5.4vw, 5.6rem)", lineHeight: 0.88 }}
            >
              <span style={{ transitionDelay: "300ms" }}>
                {ru ? "ВАЙБКОД-СТАРТАП" : "AI-BUILT STARTUP"}
              </span>
            </span>

            <p className="lede mt-8 max-w-xl">
              {ru
                ? "ИИ пишет код со скоростью, которую ты не успеваешь читать. Вместе с фичами он оставляет скрытые дефекты: файлы на две тысячи строк, каскады приведений типов, циклические хуки и секретные ключи прямо в клиентском бандле. Аудитор вычисляет запас прочности кодовой базы и выдаёт хирургический промпт для безопасного рефакторинга."
                : "AI writes code faster than you can read it. Alongside the features it leaves hidden pathology: two-thousand-line files, cascading type assertions, cyclical hooks and service keys inside the client bundle. The auditor computes your codebase's remaining structural margin and hands you a surgical prompt to fix it."}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onRunAudit}
                data-cursor="INITIATE"
                className="btn btn-acid"
              >
                <ZapIcon size={13} />
                {ru ? "Запустить экспресс-аудит" : "Run instant audit"}
              </button>

              <button
                type="button"
                onClick={onShowDemo}
                data-cursor="OPEN"
                className="btn"
              >
                <FileCodeIcon size={13} />
                {ru ? "Открыть демо-отчёт" : "Open demo report"}
              </button>
            </div>

            {/* CLI one-liner */}
            <div className="mt-6 flex items-center gap-3 border border-[var(--line-2)] bg-[#020306] px-3.5 py-2.5 max-w-md">
              <span className="mono text-[11px] text-[var(--acid)] font-bold shrink-0">$</span>
              <code className="mono text-[10.5px] sm:text-[11.5px] text-[var(--bone-dim)] truncate flex-1">
                npx vibedebt audit ./src
              </code>
              <button
                type="button"
                onClick={onCopyCli}
                aria-label="Скопировать CLI-команду"
                className="mono text-[9.5px] tracking-[0.16em] text-[var(--bone-dim)] hover:text-[var(--acid)] transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedCli ? (
                  <CheckIcon size={11} className="text-[var(--acid)]" />
                ) : (
                  <CopyIcon size={11} />
                )}
                {copiedCli ? "OK" : "COPY"}
              </button>
            </div>

            <ul className="mt-8 space-y-2.5">
              {[
                ru
                  ? "Детерминированный AST-анализ — ноль галлюцинаций"
                  : "Deterministic AST analysis — zero hallucination",
                ru
                  ? "Код не сохраняется: сканирование в памяти, логи секретов отключены"
                  : "Nothing stored: in-memory scan, secret logging disabled",
                ru
                  ? "Промпты заточены под Cursor Composer и Claude"
                  : "Prompts tuned for Cursor Composer and Claude",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircleIcon
                    size={13}
                    className="text-[var(--acid)] shrink-0 mt-0.5"
                  />
                  <span className="mono text-[11px] text-[var(--bone-dim)] leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- instrument: specimen under lens ---- */}
          <div className="lg:col-span-6">
            <div className="panel-solid bracket scanlines relative overflow-hidden">
              {/* specimen substrate */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/specimens/hero-core.jpg"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center 42%",
                    filter: "grayscale(.55) contrast(1.15) brightness(.5)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(70% 55% at 50% 52%, rgba(5,6,10,.35), rgba(5,6,10,.94) 78%)",
                  }}
                />
              </div>

              <div className="relative z-10 p-5 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="lbl lbl-acid">
                    {ru ? "ОБРАЗЕЦ ПОД ЛИНЗОЙ" : "SPECIMEN UNDER LENS"}
                  </span>
                  <span className="mono text-[10px] text-[var(--bone-dim)]">
                    {report?.isRealRepo ? "LIVE GITHUB API" : "SIMULATED MOUNT"}
                  </span>
                </div>

                <p className="mono text-[11px] sm:text-[12.5px] text-[var(--bone)] mt-3 truncate">
                  {specimenName}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="led" aria-hidden="true" />
                  <span className="mono text-[9.5px] tracking-[0.2em] text-[var(--bone-dim)]">
                    {report
                      ? ru
                        ? "РЕЗУЛЬТАТ АУДИТА ЗАГРУЖЕН В ПОКАЗАНИЯ"
                        : "AUDIT RESULT LOADED INTO READOUTS"
                      : ru
                      ? "ДЕМО-ЗАМЕР · ЖДЁТ ОБРАЗЦА"
                      : "DEMO READING · AWAITING SPECIMEN"}
                  </span>
                </div>

                <div className="mt-6">
                  <DoomsdayDial
                    score={score}
                    size={300}
                    caption={ru ? "Счётчик Судного Дня" : "Doomsday Score"}
                    sub={
                      report
                        ? report.timeToCollapse
                        : ru
                        ? "11 коммитов или 2 вебхука Stripe"
                        : "11 commits or 2 Stripe webhooks"
                    }
                  />
                </div>

                <div className="mt-6 grid grid-cols-3 border-t border-[var(--line-2)]">
                  {[
                    {
                      k: ru ? "ТИПЫ" : "GHOST TYPES",
                      v: report ? `${report.ghostTypesCount}` : "54",
                    },
                    {
                      k: ru ? "СПАГЕТТИ" : "SPAGHETTI",
                      v: report ? `${report.spaghettiIndex}` : "9.3",
                    },
                    {
                      k: ru ? "ФАЙЛОВ" : "FILES",
                      v: report ? `${report.filesScanned}` : "38",
                    },
                  ].map((cell) => (
                    <div
                      key={cell.k}
                      className="px-2 py-3 text-center border-r border-[var(--line)] last:border-r-0"
                    >
                      <div className="mono text-lg font-semibold text-[var(--bone)] tabular-nums leading-none">
                        {cell.v}
                      </div>
                      <div className="lbl mt-2" style={{ fontSize: 8.5 }}>
                        {cell.k}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-start gap-2.5 border-l-2 border-[var(--rot)] pl-3 py-1">
                  <ShieldAlertIcon size={14} className="text-[var(--rot)] shrink-0 mt-0.5" />
                  <p className="mono text-[10px] leading-relaxed text-[var(--bone-dim)]">
                    {ru
                      ? "Класс риска CWE-798: мастер-ключ доступен из Browser DevTools каждому посетителю."
                      : "Risk class CWE-798: master key readable from Browser DevTools by any visitor."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- defect signature ticker ---- */}
      <div className="relative z-10 border-y border-[var(--line-2)] bg-[#020306]/80">
        <Marquee className="py-3">
          {signatures.map((s, i) => (
            <span key={`${s}-${i}`} className="flex items-center shrink-0">
              <span className="mono text-[10.5px] tracking-[0.2em] text-[var(--bone-dim)] px-5">
                {s}
              </span>
              <span className="text-[var(--acid)] text-[9px]">◆</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
