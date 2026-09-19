"use client";

import React, { useEffect, useRef } from "react";
import { useIsClient } from "@/lib/useIsClient";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  depth: number;
  hue: "emerald" | "cyan";
  twinklePhase: number;
  twinkleSpeed: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

const COLORS: Record<Particle["hue"], string> = {
  emerald: "16, 185, 129",
  cyan: "56, 189, 248",
};

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const applyCanvasSize = () => {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    applyCanvasSize();

    const particles: Particle[] = [];
    const count = Math.min(Math.floor((width * height) / 22000), 90);

    for (let i = 0; i < count; i++) {
      // depth creates a subtle parallax feel: far particles are smaller, dimmer, slower
      const depth = 0.4 + Math.random() * 0.6;
      const baseAlpha = (0.12 + Math.random() * 0.3) * depth;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35 * depth,
        vy: (Math.random() - 0.5) * 0.35 * depth,
        size: (0.8 + Math.random() * 1.6) * depth,
        alpha: baseAlpha,
        baseAlpha,
        depth,
        hue: Math.random() < 0.85 ? "emerald" : "cyan",
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.006 + Math.random() * 0.012,
      });
    }

    const ripples: Ripple[] = [];

    let mouseX = -1000;
    let mouseY = -1000;
    let scrollOffset = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
      ripples.push({ x: e.clientX, y: e.clientY, radius: 0, alpha: 0.35 });
    };

    const handleScroll = () => {
      scrollOffset = window.scrollY;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      applyCanvasSize();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    let animationId: number;
    let t = 0;

    const render = () => {
      t += 1;
      ctx.clearRect(0, 0, width, height);

      // gentle parallax drift derived from scroll position
      const parallax = scrollOffset * 0.02;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0) p1.x = width;
        else if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        else if (p1.y > height) p1.y = 0;

        const drawX = p1.x;
        const drawY = p1.y + parallax * (1 - p1.depth);

        // Mouse distance
        const dx = mouseX - drawX;
        const dy = mouseY - drawY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p1.x -= (dx / dist) * force * 1.5;
          p1.y -= (dy / dist) * force * 1.5;
          p1.alpha = Math.min(1, p1.baseAlpha + 0.4);
        } else {
          // subtle twinkle when idle
          p1.twinklePhase += p1.twinkleSpeed;
          p1.alpha =
            p1.baseAlpha * (0.75 + 0.25 * Math.sin(p1.twinklePhase));
        }

        const color = COLORS[p1.hue];
        ctx.beginPath();
        ctx.arc(drawX, drawY, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p1.alpha})`;
        ctx.shadowColor = `rgba(${color}, ${p1.alpha * 0.6})`;
        ctx.shadowBlur = 4 * p1.depth;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist2 < 110) {
            ctx.beginPath();
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(p2.x, p2.y + parallax * (1 - p2.depth));
            ctx.strokeStyle = `rgba(${color}, ${(1 - dist2 / 110) * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // click ripples: soft expanding rings, fintech "scan" feel
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.6;
        r.alpha *= 0.965;
        if (r.alpha < 0.01) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${r.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isClient]);

  if (!isClient) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
    />
  );
}
