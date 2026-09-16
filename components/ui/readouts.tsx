"use client";

import { useEffect, useRef } from "react";
import { CountUp } from "@/components/fx/count-up";

/** Phosphor ramp: healthy acid → warning amber → critical rot. */
export function scoreColor(v: number): string {
  const stops: Array<[number, [number, number, number]]> = [
    [0, [200, 255, 60]],
    [55, [255, 196, 46]],
    [100, [255, 46, 99]],
  ];
  const clamped = Math.max(0, Math.min(100, v));
  let lo = stops[0];
  let hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i][0] && clamped <= stops[i + 1][0]) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const span = hi[0] - lo[0] || 1;
  const t = (clamped - lo[0]) / span;
  const c = lo[1].map((a, i) => Math.round(a + (hi[1][i] - a) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

interface DoomsdayDialProps {
  score: number;
  size?: number;
  caption: string;
  sub?: string;
}

/**
 * The headline instrument: a 180° phosphor arc dial with an engraved tick ring,
 * a rotating sweep hand and a giant tabular numeral at the core.
 */
export function DoomsdayDial({ score, size = 320, caption, sub }: DoomsdayDialProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = scoreColor(clamped);
  const r = 78;
  const arcLen = Math.PI * r;
  const ref = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGPathElement>(null);

  /**
   * The arc is animated by writing stroke-dashoffset straight to the SVG node:
   * it is a presentation-layer concern, so it should never cost a render.
   */
  useEffect(() => {
    const arc = arcRef.current;
    if (!arc) return;
    const target = arcLen * (1 - clamped / 100);

    arc.style.transition = "none";
    arc.style.strokeDashoffset = String(arcLen);

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        arc.style.transition =
          "stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1), stroke .5s ease";
        arc.style.strokeDashoffset = String(target);
      });
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [clamped, arcLen]);

  const ticks = Array.from({ length: 45 }, (_, i) => i);

  return (
    <div ref={ref} className="flex flex-col items-center w-full">
      <div
        className="relative w-full"
        style={{ maxWidth: size, aspectRatio: "200 / 118" }}
      >
      <svg
        viewBox="0 0 200 118"
        role="img"
        aria-label={`${caption}: ${clamped}%`}
        className="w-full h-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="dialGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* engraved tick ring */}
        {ticks.map((i) => {
          const t = i / (ticks.length - 1);
          const a = Math.PI - t * Math.PI;
          const lit = t * 100 <= clamped;
          const x1 = 100 + Math.cos(a) * 92;
          const y1 = 100 - Math.sin(a) * 92;
          const x2 = 100 + Math.cos(a) * (i % 5 === 0 ? 84 : 88);
          const y2 = 100 - Math.sin(a) * (i % 5 === 0 ? 84 : 88);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={lit ? color : "rgba(237,234,227,.14)"}
              strokeWidth={i % 5 === 0 ? 1.6 : 0.8}
            />
          );
        })}

        {/* track */}
        <path
          d={`M ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100`}
          fill="none"
          stroke="rgba(237,234,227,.1)"
          strokeWidth="7"
          strokeLinecap="butt"
        />

        {/* value arc */}
        <path
          ref={arcRef}
          d={`M ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100`}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="butt"
          filter="url(#dialGlow)"
          style={{ strokeDasharray: arcLen, strokeDashoffset: arcLen }}
        />

        {/* sweep hand */}
        <g
          style={{
            transformOrigin: "100px 100px",
            animation: "dialSweep 6.5s linear infinite",
          }}
        >
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="18"
            stroke="rgba(237,234,227,.22)"
            strokeWidth="0.8"
          />
        </g>

        <circle cx="100" cy="100" r="2.4" fill={color} />
      </svg>

        {/* readout anchored to the centre of the semicircle — scales with the dial */}
        <div
          className="absolute inset-x-0 text-center pointer-events-none px-2"
          style={{ top: "56%", transform: "translateY(-50%)" }}
        >
          <div
            className="d1 leading-none tabular-nums"
            style={{
              color,
              fontSize: `clamp(2.2rem, ${size / 6.6}px, 4.4rem)`,
              textShadow: `0 0 34px ${color}44`,
            }}
          >
            <CountUp value={clamped} />
            <span className="text-[0.34em] align-top ml-1">%</span>
          </div>
          <div className="lbl mt-2.5">{caption}</div>
          {sub ? (
            <div className="mono text-[10px] text-[var(--bone-dim)] mt-1.5 leading-snug">
              {sub}
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes dialSweep {
          from { transform: rotate(-90deg); }
          to   { transform: rotate(90deg); }
        }
      `}</style>
    </div>
  );
}

interface LedBarProps {
  value: number;
  label?: string;
  readout?: string;
  segments?: number;
  tone?: "auto" | "acid" | "rot" | "bone";
}

/** Segmented LED bargraph — the workhorse readout for health pillars. */
export function LedBar({
  value,
  label,
  readout,
  segments = 28,
  tone = "auto",
}: LedBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const litCount = Math.round((clamped / 100) * segments);
  const color =
    tone === "acid"
      ? "var(--acid)"
      : tone === "rot"
      ? "var(--rot)"
      : tone === "bone"
      ? "var(--bone)"
      : scoreColor(100 - clamped);

  return (
    <div>
      {(label || readout) && (
        <div className="flex items-baseline justify-between gap-3 mb-2">
          {label ? (
            <span className="mono text-[11px] text-[var(--bone)]">{label}</span>
          ) : null}
          {readout ? (
            <span className="mono text-[12px] font-semibold tabular-nums" style={{ color }}>
              {readout}
            </span>
          ) : null}
        </div>
      )}
      <div
        className="flex gap-[3px] h-3.5"
        role="meter"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className="flex-1 min-w-0"
            style={{
              background: i < litCount ? color : "rgba(237,234,227,.07)",
              boxShadow: i < litCount ? `0 0 7px ${color}55` : "none",
              transition: `background .35s ease ${i * 14}ms, box-shadow .35s ease ${i * 14}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface StatProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  hint?: string;
  tone?: "acid" | "rot" | "bone" | "violet";
  size?: "sm" | "lg";
}

/** Plain numeric stat cell for the report header strip. */
export function Stat({ label, value, unit, hint, tone = "bone", size = "sm" }: StatProps) {
  const color =
    tone === "acid"
      ? "var(--acid)"
      : tone === "rot"
      ? "var(--rot)"
      : tone === "violet"
      ? "var(--violet)"
      : "var(--bone)";

  return (
    <div className="px-4 py-4 sm:px-5 sm:py-5">
      <div className="lbl">{label}</div>
      <div
        className={`mt-2.5 tabular-nums ${
          size === "lg" ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl"
        } mono font-semibold leading-none`}
        style={{ color }}
      >
        {value}
        {unit ? (
          <span className="text-[0.5em] font-normal ml-1.5 text-[var(--bone-dim)]">{unit}</span>
        ) : null}
      </div>
      {hint ? (
        <div className="mono text-[10px] text-[var(--bone-dim)] mt-2 leading-snug">{hint}</div>
      ) : null}
    </div>
  );
}
