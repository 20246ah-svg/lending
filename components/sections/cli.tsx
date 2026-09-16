"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHead } from "@/components/ui/panel";
import { TerminalIcon, CopyIcon, CheckIcon, ShieldAlertIcon } from "@/components/icons";
import type { Lang } from "@/lib/types";

/* ------------------------------------------------------------------------- */
/*  Transcript model                                                         */
/* ------------------------------------------------------------------------- */

type Tone = "cmd" | "dim" | "bone" | "rot" | "amber" | "acid" | "ok" | "plain";
interface Seg {
  t?: Tone;
  s: string;
}
type Line = Seg[];

const TONE_COLOR: Record<Tone, string> = {
  cmd: "var(--acid)",
  dim: "#5f6470",
  bone: "var(--bone)",
  rot: "var(--rot)",
  amber: "#ffc42e",
  acid: "var(--acid)",
  ok: "var(--acid)",
  plain: "var(--bone)",
};

const SCRIPT: Line[] = [
  [{ t: "cmd", s: "$ npx vibedebt audit ./src" }],
  [{ t: "dim", s: "  VIBEDEBT v2.4 · deterministic AST scan · 0 model calls" }],
  [{ s: "" }],
  [{ t: "dim", s: "  walking file tree ................ 214 files" }],
  [{ t: "dim", s: "  measuring module volumes .......... done" }],
  [{ t: "dim", s: "  matching CWE signatures ........... 5 classes" }],
  [{ s: "" }],
  [{ t: "rot", s: "  ✖ app/page.tsx                          2 420 lines   CWE-398" }],
  [{ t: "rot", s: "  ✖ lib/ai-handler.ts                       840 lines   CWE-704" }],
  [{ t: "amber", s: "  ⚠ SUPABASE_SERVICE_ROLE_KEY            exposed      CWE-798" }],
  [{ t: "amber", s: "  ⚠ useEffect dependency cycle           3 hooks      CWE-400" }],
  [{ t: "amber", s: "  ⚠ package-lock.json                    missing      CWE-1357" }],
  [{ s: "" }],
  [
    { t: "bone", s: "  DOOMSDAY SCORE       " },
    { t: "acid", s: "89 / 100   " },
    { t: "dim", s: "████████████░░░░" },
  ],
  [
    { t: "bone", s: "  TIME TO COLLAPSE     " },
    { t: "rot", s: "11 commits" },
  ],
  [
    { t: "bone", s: "  FRAGILITY INDEX      " },
    { t: "rot", s: "92%" },
  ],
  [{ s: "" }],
  [{ t: "ok", s: "  ✓ repair plan written to ./vibedebt-report.md" }],
  [{ t: "ok", s: "  ✓ 3 surgical prompts ready for Cursor Composer" }],
];

const TRANSCRIPT_TEXT = SCRIPT.map((l) => l.map((s) => s.s).join("")).join("\n");

/* ------------------------------------------------------------------------- */

export function Cli({
  lang,
  copiedCli,
  onCopyCli,
}: {
  lang: Lang;
  copiedCli: boolean;
  onCopyCli: () => void;
}) {
  const ru = lang === "ru";
  const [visible, setVisible] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reduced motion streams the whole transcript in one tick instead of typing.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cadence = reduce ? 0 : 185;
    const stride = reduce ? SCRIPT.length : 1;

    let timer = 0;
    let i = 0;

    const start = () => {
      if (started.current) return;
      started.current = true;
      i = stride;
      setVisible(Math.min(i, SCRIPT.length));
      if (i >= SCRIPT.length) return;
      timer = window.setInterval(() => {
        i += stride;
        setVisible(Math.min(i, SCRIPT.length));
        if (i >= SCRIPT.length) window.clearInterval(timer);
      }, cadence);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          start();
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(node);

    return () => {
      io.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, []);

  return (
    <section id="cli-section" className="band scroll-mt-24 relative z-10">
      <div className="shell py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <SectionHead
              index="04"
              label={ru ? "ЛОКАЛЬНЫЙ ТЕРМИНАЛ" : "LOCAL TERMINAL"}
              title={
                ru ? (
                  <>
                    Аудит в одну
                    <br />
                    команду
                  </>
                ) : (
                  <>
                    Audit in one
                    <br />
                    command
                  </>
                )
              }
              lede={
                ru
                  ? "Для приватных репозиториев и корпоративного кода. Ни один файл не покидает твою машину: анализатор работает полностью офлайн, без обращений к модели и без телеметрии."
                  : "For private repositories and enterprise codebases. Not a single file leaves your machine: the analyzer runs fully offline, with no model calls and no telemetry."
              }
            />

            <div className="mt-8 flex items-center gap-3 border border-[var(--line-2)] bg-[#020306] p-3.5">
              <TerminalIcon size={14} className="text-[var(--acid)] shrink-0" />
              <code className="mono text-[11px] text-[var(--bone)] truncate flex-1">
                npx vibedebt audit ./src
              </code>
              <button
                type="button"
                onClick={onCopyCli}
                className="btn !py-1.5 !px-2.5 !text-[9.5px] shrink-0"
                aria-label={ru ? "Скопировать команду" : "Copy command"}
              >
                {copiedCli ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
                {copiedCli ? "OK" : "COPY"}
              </button>
            </div>

            <ul className="mt-6 space-y-3">
              {[
                ru ? "Работает на приватных репозиториях без токенов" : "Runs on private repositories with no tokens",
                ru ? "Полностью офлайн: код не покидает машину" : "Fully offline: code never leaves the machine",
                ru ? "Отчёт в Markdown и JSON для CI-пайплайна" : "Markdown and JSON output for your CI pipeline",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-[7px] w-1.5 h-1.5 bg-[var(--acid)] shrink-0" aria-hidden="true" />
                  <span className="mono text-[10.5px] leading-relaxed text-[var(--bone-dim)]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- terminal window ---- */}
          <div className="lg:col-span-7">
            <div className="panel-solid bracket scanlines relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--line-2)] px-3.5 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--rot)]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffc42e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--acid)]" />
                  </span>
                  <span className="mono text-[10px] text-[var(--bone-dim)]">
                    ~/my-startup — vibedebt
                  </span>
                </div>
                <span className="mono text-[9px] tracking-[0.2em] text-[var(--line-3)]">zsh</span>
              </div>

              <div ref={ref} className="p-4 sm:p-5 min-h-[360px] sm:min-h-[420px]">
                <p className="sr-only">
                  {ru ? "Пример вывода локального аудита:" : "Sample local audit output:"}
                  {"\n"}
                  {TRANSCRIPT_TEXT}
                </p>

                <pre
                  aria-hidden="true"
                  className="m-0 font-mono text-[9.5px] sm:text-[11.5px] leading-[1.9] whitespace-pre-wrap sm:whitespace-pre overflow-x-auto"
                >
                  <code>
                    {SCRIPT.slice(0, visible).map((line, i) => (
                      <span key={i} className="block min-h-[1.9em]">
                        {line.map((seg, k) => (
                          <span key={k} style={{ color: TONE_COLOR[seg.t ?? "plain"] }}>
                            {seg.s || "\u00a0"}
                          </span>
                        ))}
                      </span>
                    ))}
                    {visible < SCRIPT.length && (
                      <span
                        className="inline-block w-[7px] h-[12px] align-middle"
                        style={{
                          background: "var(--acid)",
                          animation: "caretBlink 1s steps(1,end) infinite",
                        }}
                      />
                    )}
                    <style>{`@keyframes caretBlink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }`}</style>
                  </code>
                </pre>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--line)] px-3.5 py-2">
                <span className="mono text-[9px] tracking-[0.2em] text-[var(--bone-dim)]">
                  {visible >= SCRIPT.length
                    ? ru
                      ? "СКАН ЗАВЕРШЁН"
                      : "SCAN COMPLETE"
                    : ru
                    ? "ВЫПОЛНЕНИЕ…"
                    : "RUNNING…"}
                </span>
                <span className="mono text-[9px] tracking-[0.2em] text-[var(--acid)]">exit 0</span>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 border-l-2 border-[var(--acid)] pl-3.5">
              <ShieldAlertIcon size={14} className="text-[var(--acid)] shrink-0 mt-0.5" />
              <p className="mono text-[10px] leading-relaxed text-[var(--bone-dim)]">
                {ru
                  ? "Вывод выше повторяет реальный формат отчёта CLI. Счётчик Судного Дня считается теми же правилами, что и в веб-аудите, поэтому результаты совпадают."
                  : "The transcript above mirrors the real CLI report format. The Doomsday Score is computed by the same rules as the web audit, so both agree."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
