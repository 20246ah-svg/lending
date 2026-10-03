import { formatNumber } from "./types";

/** `$12 480` — grouped, no decimals. Language-neutral. */
export const money = (n: number) => `$${formatNumber(Math.round(n))}`;

/** Compact money for tight readouts: `$12K`, `$1.4M`. */
export const moneyCompact = (n: number) => {
  const v = Math.abs(n);
  if (v >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (v >= 100_000) return `$${Math.round(n / 1000)}K`;
  if (v >= 10_000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${formatNumber(Math.round(n))}`;
};

export const group = (n: number) => formatNumber(Math.round(n));
