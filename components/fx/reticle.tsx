"use client";

import { useEffect, useRef } from "react";

/**
 * Reticle — a laboratory crosshair replaces the native cursor on precision
 * pointers. Two bodies: an outer ring that trails on a spring, an inner pin that
 * tracks 1:1. Both expand and a label stamps in when hovering interactive or
 * specimen targets.
 *
 * The markup always renders (hidden, non-interactive); the effect decides
 * whether to engage and then drives every transform straight to the DOM through
 * one animation frame loop, so pointer movement never causes a React render.
 */
export function Reticle() {
  const ringRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const ring = ringRef.current;
    const pin = pinRef.current;
    const tag = tagRef.current;
    if (!ring || !pin || !tag) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let raf = 0;
    let running = false;
    let scale = 1;
    let scaleTarget = 1;
    let visible = false;

    const sectorOf = (el: Element | null) =>
      el?.closest?.("a, button, input, textarea, summary, [data-cursor]") as HTMLElement | null;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        ring.style.opacity = "1";
        pin.style.opacity = "1";
      }
      kick();
    };

    const onOver = (e: PointerEvent) => {
      const el = sectorOf(e.target as Element);
      if (!el) {
        scaleTarget = 1;
        tag.textContent = "";
        tag.style.opacity = "0";
        return;
      }
      const custom = el.getAttribute("data-cursor");
      tag.textContent = custom || "";
      tag.style.opacity = custom ? "1" : "0";
      scaleTarget = custom ? 2.05 : 0.6;
      kick();
    };

    const onDown = () => {
      scaleTarget = Math.max(0.45, scaleTarget * 0.8);
      kick();
    };

    const onUp = (e: PointerEvent) => {
      const el = sectorOf(document.elementFromPoint(e.clientX, e.clientY));
      scaleTarget = el ? (el.getAttribute("data-cursor") ? 2.05 : 0.6) : 1;
      kick();
    };

    const onLeave = () => {
      visible = false;
      ring.style.opacity = "0";
      pin.style.opacity = "0";
      tag.style.opacity = "0";
    };

    const loop = () => {
      ringX += (targetX - ringX) * 0.17;
      ringY += (targetY - ringY) * 0.17;
      scale += (scaleTarget - scale) * 0.16;

      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(
        2
      )}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      pin.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      tag.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(
        2
      )}px, 0) translate(22px, -50%)`;

      // Park the loop once the ring has settled — no idle frames.
      const settled =
        Math.abs(targetX - ringX) < 0.25 &&
        Math.abs(targetY - ringY) < 0.25 &&
        Math.abs(scaleTarget - scale) < 0.002;

      if (settled) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.body.classList.add("cursor-none-desktop");
    kick();

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.body.classList.remove("cursor-none-desktop");
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="reticle" aria-hidden="true">
      <div
        ref={ringRef}
        style={{ position: "fixed", top: 0, left: 0, opacity: 0, transition: "opacity .3s" }}
      >
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
          <circle
            cx="21"
            cy="21"
            r="14.5"
            stroke="#c8ff3c"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <path d="M21 0v9M21 33v9M0 21h9M33 21h9" stroke="#c8ff3c" strokeWidth="1" />
        </svg>
      </div>

      <div
        ref={pinRef}
        style={{ position: "fixed", top: 0, left: 0, opacity: 0, transition: "opacity .3s" }}
      >
        <div
          style={{
            width: 4,
            height: 4,
            background: "#c8ff3c",
            boxShadow: "0 0 10px rgba(200,255,60,.9)",
          }}
        />
      </div>

      <span
        ref={tagRef}
        className="mono"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 0,
          fontSize: 9,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "#c8ff3c",
          whiteSpace: "nowrap",
          transition: "opacity .2s",
        }}
      />
    </div>
  );
}
