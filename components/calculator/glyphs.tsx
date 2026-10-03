"use client";

import type { SVGProps } from "react";

/**
 * The project's icon set lives in components/icons.tsx as stroke icons.
 * The calculator needs a few small filled/structural glyphs of its own.
 */

interface GlyphProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function PillMinusIcon({ size = 12, ...props }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function PillPlusIcon({ size = 12, ...props }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
