"use client";

import Image from "next/image";
import React from "react";

export type SlideTone = "acid" | "rot" | "violet";

interface SpecimenSlideProps {
  src: string;
  /** Lab accession number printed on the mount, e.g. "VD-0041". */
  accession: string;
  /** Cross-reference, e.g. "CWE-798". */
  cross?: string;
  title: string;
  tone?: SlideTone;
  /** 0–100 contamination index shown as a thin charge bar. */
  contamination?: number;
  className?: string;
  priority?: boolean;
  ratio?: string;
}

const toneVar: Record<SlideTone, string> = {
  acid: "var(--acid)",
  rot: "var(--rot)",
  violet: "var(--violet)",
};

/**
 * A mounted specimen slide: AI-generated pathology photography in a glass mount
 * with an accession plate, contamination charge and corner registration marks.
 */
export function SpecimenSlide({
  src,
  accession,
  cross,
  title,
  tone = "acid",
  contamination,
  className = "",
  priority = false,
  ratio = "4 / 3",
}: SpecimenSlideProps) {
  const accent = toneVar[tone];

  return (
    <figure className={`specimen-group m-0 group ${className}`}>
      <div className={`slide slide-tone-${tone} relative`} style={{ aspectRatio: ratio }}>
        <Image
          src={src}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          priority={priority}
          style={{ objectFit: "cover" }}
        />

        {/* registration marks */}
        <span
          aria-hidden="true"
          className="absolute top-2.5 left-2.5 w-4 h-4 border-t border-l pointer-events-none"
          style={{ borderColor: accent, opacity: 0.85 }}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b border-r pointer-events-none"
          style={{ borderColor: accent, opacity: 0.85 }}
        />

        {/* accession plate */}
        <figcaption className="absolute top-0 left-0 right-0 flex items-center justify-between gap-2 px-3 py-2">
          <span
            className="mono text-[9.5px] font-bold tracking-[0.22em] px-1.5 py-0.5"
            style={{ background: accent, color: "#05060a" }}
          >
            {accession}
          </span>
          {cross ? (
            <span className="mono text-[9.5px] tracking-[0.18em] text-[var(--bone)]/80">
              {cross}
            </span>
          ) : null}
        </figcaption>

        {/* title + contamination charge */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-8 bg-gradient-to-t from-[#05060a] via-[#05060a]/70 to-transparent">
          <p className="mono text-[10.5px] leading-snug text-[var(--bone)] line-clamp-2">
            {title}
          </p>
          {typeof contamination === "number" ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="lbl" style={{ fontSize: 8, letterSpacing: "0.22em" }}>
                ROT
              </span>
              <span className="flex-1 h-[3px] bg-[var(--line-2)] relative overflow-hidden">
                <span
                  className="absolute inset-y-0 left-0"
                  style={{ width: `${contamination}%`, background: accent }}
                />
              </span>
              <span className="mono text-[9.5px] tabular-nums" style={{ color: accent }}>
                {contamination}%
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </figure>
  );
}
