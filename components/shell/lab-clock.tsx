"use client";

import { useEffect, useState } from "react";

/**
 * Isolated ticking clock so the second-by-second update never re-renders the
 * surrounding chrome. Renders empty on the server to avoid hydration drift.
 */
export function LabClock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setTime(`${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}Z`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={`mono text-[10px] tabular-nums text-[var(--bone-dim)] ${className}`}>
      {time || "--:--:--Z"}
    </span>
  );
}
