"use client";

import { useEffect } from "react";

/**
 * RevealEngine
 * A single IntersectionObserver that drives every `.reveal` / `.wipe` element on
 * the page — including nodes injected later (audit reports, error states), which
 * a MutationObserver picks up. Zero per-component wiring, zero re-renders.
 */
export function RevealEngine() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          ".reveal:not([data-shown]), .wipe:not([data-shown]), .reveal-lines:not([data-shown])"
        )
      );

    if (reduce) {
      targets().forEach((el) => el.setAttribute("data-shown", "true"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.delay || 0);
          if (delay > 0) {
            window.setTimeout(() => el.setAttribute("data-shown", "true"), delay);
          } else {
            el.setAttribute("data-shown", "true");
          }
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    const observeAll = () => targets().forEach((el) => io.observe(el));
    observeAll();

    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
