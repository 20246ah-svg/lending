"use client";

import React, { useEffect, useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { Logo } from "@/components/ui/primitives";
import type { Copy, Lang } from "@/components/lib/copy";

export function SiteHeader({
  lang,
  setLang,
  c,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  c: Copy;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(max > 0 ? Math.min(100, (y / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const links: [string, string][] = [
    ["#audit-tool", c.nav.auditor],
    ["#calculator", c.nav.calculator],
    ["#cli-section", c.nav.cli],
    ["#antipatterns", c.nav.smells],
    ["#pricing", c.nav.pricing],
    ["#faq", c.nav.faq],
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/[0.07] bg-void/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* reading progress */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-iris-500 via-iris-400 to-mint-400 transition-[width] duration-150 ease-out"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <a href="#top" className="group flex items-center gap-3">
          <Logo size={34} />
          <span className="flex flex-col">
            <span className="flex items-center gap-2">
              <span className="font-display text-[0.95rem] leading-none font-semibold tracking-tight text-white">
                VibeDebt
              </span>
              <span className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[9.5px] tracking-wider text-white/50 uppercase">
                v2.4
              </span>
            </span>
            <span className="mt-1 hidden text-[10.5px] text-white/40 sm:block">{c.nav.tagline}</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 font-mono text-[11.5px] text-white/55 transition hover:bg-white/[0.05] hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="seg !p-[3px]">
            {(["ru", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                data-active={lang === l}
                className="seg-item !px-2.5 !py-1.5 !text-[11px] uppercase"
                aria-label={l === "ru" ? "Русский" : "English"}
              >
                {l}
              </button>
            ))}
          </div>

          <a href="#audit-tool" className="btn btn-primary hidden !py-2.5 !text-[11.5px] sm:inline-flex">
            <Zap size={12} />
            {c.nav.cta}
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:text-white lg:hidden"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* sticky mobile CTA */}
      {!menuOpen && (
        <div className="border-t border-white/[0.06] bg-void/90 px-4 py-2 backdrop-blur-xl sm:hidden">
          <a href="#audit-tool" className="btn btn-primary h-9 w-full !py-0 !text-[12px]">
            <Zap size={13} />
            {c.nav.cta}
          </a>
        </div>
      )}

      {/* mobile sheet */}
      <div
        className={`overflow-hidden border-t border-white/[0.06] bg-void/95 backdrop-blur-xl transition-[max-height,opacity] duration-500 lg:hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-4 sm:px-8">
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 font-mono text-[12.5px] text-white/65 transition hover:bg-white/[0.05] hover:text-white"
            >
              {label}
            </a>
          ))}
          <a
            href="#audit-tool"
            onClick={() => setMenuOpen(false)}
            className="btn btn-primary mt-2 w-full"
          >
            <Zap size={13} />
            {c.nav.cta}
          </a>
        </nav>
      </div>
    </header>
  );
}
