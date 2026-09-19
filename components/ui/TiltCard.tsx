"use client";

import React, { useRef, useEffect } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function TiltCard({
  children,
  className = "",
  glowColor = "rgba(16, 185, 129, 0.15)",
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const sheen = sheenRef.current;
    if (!card || !sheen) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.006, 1.006, 1.006)`;
        sheen.style.opacity = "1";
        sheen.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, ${glowColor}, transparent 60%)`;
      });
    };

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      sheen.style.opacity = "0";
    };

    card.addEventListener("mousemove", handleMouseMove, { passive: true });
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [glowColor]);

  return (
    <div
      ref={cardRef}
      style={{
        transition: "transform 0.18s cubic-bezier(0.2, 0, 0.2, 1)",
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden backdrop-blur-md ${className}`}
    >
      {/* Specular Sheen updated via direct DOM styles for 60-120fps performance */}
      <div
        ref={sheenRef}
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-0"
      />
      {children}
    </div>
  );
}
