"use client";

import { useEffect, useRef } from "react";

/**
 * FieldCanvas
 * A generative lattice of phosphor dots that breathe on a slow interference
 * field and bow away from the pointer. Alpha is quantised into buckets so the
 * whole field renders in a handful of batched passes per frame.
 */
export function FieldCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let t = 0;

    const SPACING = 30;
    let cols = 0;
    let rows = 0;
    let points: Array<{ x: number; y: number }> = [];

    const pointer = { x: -9999, y: -9999, active: false };
    const smooth = { x: -9999, y: -9999 };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // denser lattice on wide screens, sparser on phones
      const spacing = w < 640 ? 38 : SPACING;
      cols = Math.ceil(w / spacing) + 1;
      rows = Math.ceil(h / spacing) + 1;
      points = [];
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          points.push({ x: i * spacing, y: j * spacing });
        }
      }
    };

    const ALPHAS = [0.05, 0.14, 0.3, 0.55, 0.95];
    const buckets: Array<Array<[number, number, number]>> = ALPHAS.map(() => []);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      buckets.forEach((b) => (b.length = 0));

      smooth.x += (pointer.x - smooth.x) * 0.12;
      smooth.y += (pointer.y - smooth.y) * 0.12;

      const R = Math.min(240, Math.max(140, w * 0.16));

      for (let k = 0; k < points.length; k++) {
        const p = points[k];

        // slow interference field
        const fx =
          Math.sin(p.x * 0.011 + t * 0.0007) * 6 +
          Math.cos(p.y * 0.014 - t * 0.0005) * 5;
        const fy =
          Math.cos(p.x * 0.013 - t * 0.0006) * 5 +
          Math.sin(p.y * 0.009 + t * 0.0008) * 6;

        let x = p.x + fx;
        let y = p.y + fy;
        let alpha = 0.05;
        let size = 1;

        if (pointer.active) {
          const dx = x - smooth.x;
          const dy = y - smooth.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = 1 - d / R; // 1 at centre
            const push = f * f * 26;
            x += (dx / d) * push;
            y += (dy / d) * push;
            alpha = 0.05 + f * 0.9;
            size = 1 + f * 1.3;
          }
        }

        const b = Math.min(
          ALPHAS.length - 1,
          Math.max(0, Math.round((alpha - 0.05) / 0.225))
        );
        buckets[b].push([x, y, size]);
      }

      for (let b = 0; b < buckets.length; b++) {
        const bucket = buckets[b];
        if (!bucket.length) continue;
        ctx.fillStyle = b >= 3 ? "200,255,60" : "237,234,227";
        ctx.globalAlpha = ALPHAS[b];
        for (let i = 0; i < bucket.length; i++) {
          const [x, y, s] = bucket[i];
          ctx.fillRect(x, y, s, s);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (!running) return;
      t += 16;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      build();
      if (reduce) draw();
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointer.x = x;
      pointer.y = y;
      pointer.active = x > -80 && y > -80 && x < rect.width + 80 && y < rect.height + 80;
    };

    const onLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    build();

    if (reduce) {
      draw();
      return () => {};
    }

    // only burn frames while the canvas is actually on screen
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const wasRunning = running;
          running = e.isIntersecting;
          if (running && !wasRunning) raf = requestAnimationFrame(loop);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    // The hero grows as webfonts and images land, so follow the box, not just
    // the window, or the lattice stops short of the section's bottom edge.
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    />
  );
}
