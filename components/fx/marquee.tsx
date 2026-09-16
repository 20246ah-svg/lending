"use client";

import React from "react";

interface MarqueeProps {
  children: React.ReactNode;
  slow?: boolean;
  reverse?: boolean;
  className?: string;
}

/**
 * Infinite CSS-driven ticker. Duplicates its payload once so the -50% translate
 * loops seamlessly without JS.
 */
export function Marquee({ children, slow, reverse, className = "" }: MarqueeProps) {
  return (
    <div className={`marquee-mask ${className}`}>
      <div
        className={`marquee ${slow ? "marquee-slow" : ""} ${
          reverse ? "marquee-rev" : ""
        }`}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
