"use client";

import { useEffect, useRef } from "react";
import { formatNumber } from "@/lib/types";

/* Reuses the shared grouping helper rather than toLocaleString: ICU data can
   differ between the Node renderer and the browser, which would break hydration. */
const defaultFormat = formatNumber;

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
}

/**
 * Counts a readout up from zero the first time it enters the viewport.
 *
 * The running number is written straight to the DOM instead of through state:
 * a 60 fps counter should never trigger 60 React renders. Later value changes
 * (a new audit, a moved slider) are painted immediately without replaying the
 * animation. Reduced-motion users get the final value instantly.
 */
export function CountUp({ value, duration = 1400, className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const animatedFor = useRef<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // A value change after the intro animation: just paint it.
    if (started.current) {
      if (animatedFor.current !== value) {
        node.textContent = defaultFormat(value);
        animatedFor.current = value;
      }
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      started.current = true;
      animatedFor.current = value;
      node.textContent = defaultFormat(value);
      return;
    }

    let raf = 0;

    const run = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        // easeOutExpo — fast attack, long settle
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        node.textContent = defaultFormat(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || started.current) continue;
          started.current = true;
          animatedFor.current = value;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {defaultFormat(value)}
    </span>
  );
}
