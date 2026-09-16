"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ==================================================================
   UI PRIMITIVES — scroll reveal, animated counters, gauges, meters,
   segmented controls, accordion, spotlight cards and clipboard hook.
   ================================================================== */

export type Tone = "critical" | "elevated" | "healthy" | "neutral";

export const TONE_COLOR: Record<Tone, string> = {
  critical: "#ff5c80",
  elevated: "#ffb545",
  healthy: "#4fe0a8",
  neutral: "#9b8cff",
};

/* ---------------- clipboard ---------------- */
export function useCopy(timeout = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    (text: string, key: string = "default") => {
      void navigator.clipboard?.writeText(text);
      setCopiedKey(key);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiedKey(null), timeout);
    },
    [timeout]
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return { copy, copiedKey, isCopied: (key: string = "default") => copiedKey === key };
}

/* ---------------- shared in-view detection ---------------- */
export function useInView<T extends HTMLElement>(
  threshold = 0.15,
  rootMargin = "0px 0px -6% 0px",
  fallbackDelay = 0
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Environments without IntersectionObserver simply show the content.
    if (typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setInView(true), fallbackDelay);
      return () => clearTimeout(t);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, fallbackDelay]);

  return { ref, inView };
}

/* ---------------- scroll reveal ---------------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12, "0px 0px -6% 0px", 0);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/* ---------------- animated counter ---------------- */
export function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1500,
  className = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4, undefined, 0);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      const t = setTimeout(() => setDisplay(value), 0);
      return () => clearTimeout(t);
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(value * (1 - Math.pow(1 - p, 4)));
      if (p < 1) frame = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  const shown =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString("ru-RU").replace(/,/g, " ");

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/* ---------------- circular score gauge ---------------- */
export function ScoreGauge({
  value,
  size = 168,
  thickness = 10,
  label,
  sublabel,
  tone,
  children,
}: {
  value: number;
  size?: number;
  thickness?: number;
  label?: string;
  sublabel?: string;
  tone: Tone;
  children?: ReactNode;
}) {
  const gid = useId().replace(/:/g, "");
  const { ref, inView } = useInView<HTMLDivElement>(0.3, undefined, 200);

  const r = (size - thickness) / 2 - 4;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (inView ? pct / 100 : 0) * c;
  const color = TONE_COLOR[tone];

  return (
    <div ref={ref} className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={`g-${gid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="55%" stopColor={color} />
            <stop offset="100%" stopColor="#9b8cff" />
          </linearGradient>
          <filter id={`f-${gid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#g-${gid})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          filter={`url(#f-${gid})`}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        {children ?? (
          <>
            <div className="font-display text-4xl font-semibold tabular text-white">
              {Math.round(value)}
              <span className="text-lg text-white/45">%</span>
            </div>
            {label && <div className="mono-label mt-1">{label}</div>}
            {sublabel && <div className="mt-0.5 text-[11px] text-white/40">{sublabel}</div>}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- linear meter ---------------- */
export function Meter({
  value,
  tone = "neutral",
  height = 6,
  delay = 0,
  className = "",
}: {
  value: number;
  tone?: Tone;
  height?: number;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3, undefined, 150);
  const pct = Math.max(0, Math.min(100, value));
  const color = TONE_COLOR[tone];

  return (
    <div
      ref={ref}
      className={`w-full overflow-hidden rounded-full bg-white/[0.07] ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${inView ? pct : 0}%`,
          background: `linear-gradient(90deg, ${color}66, ${color})`,
          boxShadow: `0 0 18px -2px ${color}aa`,
          transition: `width 1.1s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        }}
      />
    </div>
  );
}

/* ---------------- section heading ---------------- */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  sub,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <Reveal>
          <div
            className={`mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 ${
              align === "center" ? "mx-auto" : ""
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-iris-400 shadow-[0_0_12px_2px_rgba(124,108,255,0.7)]" />
            <span className="mono-label text-white/60">{eyebrow}</span>
          </div>
        </Reveal>
      )}
      <Reveal delay={60}>
        <h2 className="text-2xl font-semibold text-white sm:text-[2.1rem] sm:leading-[1.15]">
          {title}
          {accent && <span className="accent-serif grad-text"> {accent}</span>}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={120}>
          <p className="mt-3 text-sm leading-relaxed text-white/55 sm:text-[0.95rem]">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------------- spotlight card (mouse-follow glow) ---------------- */
export function Spotlight({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };
  const Component = Tag as React.ElementType;
  return (
    <Component className={`spotlight ${className}`} onMouseMove={onMove}>
      {children}
    </Component>
  );
}

/* ---------------- segmented control ---------------- */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  className = "",
  ariaLabel,
}: {
  items: { id: T; label: ReactNode; icon?: ReactNode }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={`seg ${className}`} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          data-active={value === item.id}
          className="seg-item"
          onClick={() => onChange(item.id)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- accordion ---------------- */
export function Accordion({
  items,
  className = "",
}: {
  items: { q: string; a: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={`divide-y divide-white/[0.07] ${className}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="group">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full cursor-pointer items-start justify-between gap-6 py-5 text-left"
            >
              <span
                className={`font-display text-[0.95rem] font-medium transition-colors ${
                  isOpen ? "text-white" : "text-white/75 group-hover:text-white"
                }`}
              >
                {item.q}
              </span>
              <span
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                  isOpen
                    ? "rotate-45 border-iris-400/60 bg-iris-500/15 text-iris-200"
                    : "border-white/12 text-white/50 group-hover:border-white/25"
                }`}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div
              className="grid overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
            >
              <p className="min-h-0 pr-10 pb-6 text-[0.85rem] leading-relaxed text-white/55">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- brand mark ---------------- */
export function Logo({ size = 34 }: { size?: number }) {
  const gid = useId().replace(/:/g, "");
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-[0.85rem]"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
        <defs>
          <linearGradient id={`lg-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8f7dff" />
            <stop offset="55%" stopColor="#5b48e6" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="11" fill={`url(#lg-${gid})`} />
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="11"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.8"
        />
        <circle cx="20" cy="20" r="9.2" stroke="rgba(6,6,14,0.55)" strokeWidth="1.4" fill="none" />
        <circle cx="20" cy="20" r="1.9" fill="#07070f" />
        <path d="M20 20 L26.4 13.6" stroke="#07070f" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M20 20 L13.6 24.4" stroke="rgba(7,7,15,0.45)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}
