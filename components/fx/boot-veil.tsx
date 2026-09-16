"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  { t: "ИНИЦИАЛИЗАЦИЯ СПЕКТРАЛЬНОГО АНАЛИЗАТОРА", d: 120 },
  { t: "КАЛИБРОВКА ФОСФОРНОЙ МАТРИЦЫ", d: 380 },
  { t: "ЗАГРУЗКА БАЗЫ СИГНАТУР ДЕФЕКТОВ", d: 640 },
  { t: "МОНТИРОВАНИЕ ОБРАЗЦА // SPECIMEN MOUNTED", d: 900 },
];

/**
 * BootVeil — the instrument powers on before the page does.
 *
 * All motion lives in CSS keyframes (see `.boot-veil` in globals.css); this
 * component only decides whether to play, writes the charge percentage straight
 * to the DOM, and removes itself once the sequence has run. Plays once per
 * browser session and never for reduced-motion users.
 */
export function BootVeil() {
  const ref = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem("vd-boot") === "1";
    } catch {
      seen = false;
    }

    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.display = "none";
      return;
    }

    try {
      sessionStorage.setItem("vd-boot", "1");
    } catch {
      /* storage blocked — the sequence still plays */
    }

    // Kick off the keyframes.
    el.dataset.play = "true";

    // Charge counter — a direct DOM write, no renders.
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1050);
      if (pctRef.current) {
        pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
      }
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const hide = window.setTimeout(() => {
      el.style.display = "none";
    }, 1800);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hide);
    };
  }, []);

  return (
    <div ref={ref} className="boot-veil" aria-hidden="true">
      <div className="w-full max-w-[82rem] mx-auto px-[var(--gut)]">
        <div className="flex items-end justify-between gap-6 border-b border-[var(--line-2)] pb-4">
          <div>
            <div className="lbl">VIBEDEBT // FORENSIC CODE ANALYSIS UNIT</div>
            <div className="d3 mt-2.5 text-[var(--bone)]">ROT SPECIMEN</div>
          </div>
          <div className="mono text-[var(--acid)] text-2xl tabular-nums">
            <span ref={pctRef}>000</span>
            <span className="text-sm">%</span>
          </div>
        </div>

        <div className="mt-3 h-[3px] w-full bg-[var(--line)] overflow-hidden">
          <div className="boot-bar h-full bg-[var(--acid)]" />
        </div>

        <div className="mt-7 space-y-2 min-h-[104px]">
          {STEPS.map((s) => (
            <div
              key={s.t}
              className="boot-step mono text-[10.5px] tracking-[0.2em] flex gap-3"
              style={{ animationDelay: `${s.d}ms` }}
            >
              <span className="text-[var(--acid)]">▸</span>
              <span>{s.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
