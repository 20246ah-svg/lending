"use client";

import { PillMinusIcon, PillPlusIcon } from "./glyphs";

interface ChannelProps {
  idx: string;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Pre-formatted value shown on the right of the label. */
  readout: string;
  unit?: string;
  /** Optional end-stop captions, each a `[value, caption]` pair. */
  scale?: ReadonlyArray<readonly string[]>;
  tone?: string;
}

/**
 * One channel of the calculator: strip index, label, live readout, a fader with
 * an engraved scale, and a stepper for when you want an exact integer rather
 * than a drag.
 */
export function Channel({
  idx,
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
  readout,
  unit,
  scale,
  tone = "var(--bone)",
}: ChannelProps) {
  const clampTo = (v: number) => Math.min(max, Math.max(min, v));
  // Floating point drift on fractional steps (rate, mttr) — snap to the grid.
  const quantise = (v: number) => Math.round(v / step) * step;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mono text-[10px] tabular-nums shrink-0 pt-[3px] text-[var(--bone-dim)]">
            {idx}
          </span>
          <label
            htmlFor={`ch-${idx}`}
            className="mono text-[11px] leading-snug text-[var(--bone)] cursor-pointer"
          >
            {label}
          </label>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onChange(quantise(clampTo(value - step)))}
            disabled={value <= min}
            aria-label={`${label} — уменьшить`}
            className="w-6 h-6 grid place-items-center border border-[var(--line-2)] text-[var(--bone-dim)] hover:text-[var(--acid)] hover:border-[var(--acid)] transition disabled:opacity-30 disabled:hover:border-[var(--line-2)] disabled:hover:text-[var(--bone-dim)] cursor-pointer disabled:cursor-not-allowed"
          >
            <PillMinusIcon size={10} />
          </button>

          <span
            className="mono text-[13px] font-semibold tabular-nums min-w-[5.5rem] text-right"
            style={{ color: tone }}
          >
            {readout}
            {unit ? (
              <span className="text-[9px] font-normal text-[var(--bone-dim)] ml-1.5 uppercase">
                {unit}
              </span>
            ) : null}
          </span>

          <button
            type="button"
            onClick={() => onChange(quantise(clampTo(value + step)))}
            disabled={value >= max}
            aria-label={`${label} — увеличить`}
            className="w-6 h-6 grid place-items-center border border-[var(--line-2)] text-[var(--bone-dim)] hover:text-[var(--acid)] hover:border-[var(--acid)] transition disabled:opacity-30 disabled:hover:border-[var(--line-2)] disabled:hover:text-[var(--bone-dim)] cursor-pointer disabled:cursor-not-allowed"
          >
            <PillPlusIcon size={10} />
          </button>
        </div>
      </div>

      <input
        id={`ch-${idx}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="fader mt-2"
        aria-valuetext={readout}
      />

      <div className="flex items-start justify-between gap-3">
        {scale ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {scale.map(([v, k]) => (
              <span key={k} className="mono text-[9px] tracking-[0.08em] text-[var(--bone-dim)]">
                <span className="text-[var(--bone)]">{v}</span> {k}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}
      </div>

      <p className="mono text-[10px] text-[var(--bone-dim)] mt-2 leading-relaxed opacity-75">
        {hint}
      </p>
    </div>
  );
}
