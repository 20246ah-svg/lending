"use client";

import { useEffect, useRef, useState } from "react";
import { ZapIcon, GithubIcon } from "@/components/icons";
import { LabClock } from "./lab-clock";
import type { Lang } from "@/lib/types";

interface HeaderProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  onAudit: () => void;
}

/* Ordered to match the document flow so the section indices never disagree. */
const NAV = [
  { id: "audit-tool", ru: "Аудитор", en: "Auditor" },
  { id: "calculator", ru: "Симулятор", en: "Simulator" },
  { id: "antipatterns", ru: "Дефекты", en: "Defects" },
  { id: "cli-section", ru: "CLI", en: "CLI" },
  { id: "pricing", ru: "Тарифы", en: "Pricing" },
];

/**
 * Chrome as instrument fascia: hazard strip, accession plate, indexed nav,
 * live UTC readout and an acid scroll-progress rail welded to the bottom edge.
 */
export function Header({ lang, setLang, onAudit }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const railRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, y / max) : 0;
      if (railRef.current) {
        railRef.current.style.transform = `scaleX(${pct.toFixed(4)})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="hazard fixed top-0 left-0 right-0 z-50 h-[3px]" aria-hidden="true" />

      <header
        className="fixed top-[3px] left-0 right-0 z-50 border-b transition-colors duration-300"
        style={{
          borderColor: scrolled ? "var(--line-2)" : "transparent",
          background: scrolled ? "rgba(5,6,10,.82)" : "rgba(5,6,10,.35)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="shell flex items-center justify-between gap-4 h-[62px]">
          {/* accession plate */}
          <a href="#top" className="flex items-center gap-3 group shrink-0">
            <span className="relative grid place-items-center w-9 h-9 border border-[var(--line-3)] overflow-hidden">
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(200,255,60,.22), transparent 55%)",
                }}
              />
              <span className="d3 relative leading-none text-[var(--acid)] text-[15px]">
                VD
              </span>
            </span>
            <span className="leading-none">
              <span className="block d3 text-[15px] tracking-[0.06em] text-[var(--bone)]">
                VibeDebt
              </span>
              <span className="hidden sm:block mono text-[9px] tracking-[0.22em] text-[var(--bone-dim)] mt-1">
                FORENSIC CODE ANALYSIS
              </span>
            </span>
          </a>

          {/* indexed nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Основная навигация">
            {NAV.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group px-3 py-2 mono text-[10.5px] tracking-[0.16em] uppercase text-[var(--bone-dim)] hover:text-[var(--acid)] transition-colors flex items-center gap-2"
              >
                <span className="text-[8.5px] text-[var(--line-3)] group-hover:text-[var(--acid)] transition-colors tabular-nums">
                  0{i + 1}
                </span>
                {lang === "ru" ? item.ru : item.en}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LabClock className="hidden xl:block" />

            {/* language fader */}
            <div
              className="flex items-center border border-[var(--line-2)] p-[3px]"
              role="group"
              aria-label="Язык интерфейса"
            >
              {(["ru", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className="mono text-[10px] tracking-[0.14em] px-2 py-1 transition cursor-pointer"
                  style={
                    lang === l
                      ? { background: "var(--acid)", color: "#05060a", fontWeight: 700 }
                      : { color: "var(--bone-dim)" }
                  }
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onAudit}
              data-cursor="RUN"
              className="btn btn-acid !py-2 !px-3 hidden sm:inline-flex"
            >
              <ZapIcon size={12} />
              <span>{lang === "ru" ? "Проверить" : "Audit"}</span>
            </button>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Открыть меню"
              className="lg:hidden w-9 h-9 grid place-items-center border border-[var(--line-2)] cursor-pointer"
            >
              <span className="sr-only">Меню</span>
              <span aria-hidden="true" className="flex flex-col gap-1">
                <span className="block w-4 h-px bg-[var(--bone)]" />
                <span className="block w-4 h-px bg-[var(--bone)]" />
                <span className="block w-2.5 h-px bg-[var(--bone)]" />
              </span>
            </button>
          </div>
        </div>

        {/* scroll charge rail */}
        <span
          ref={railRef}
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
          style={{ background: "var(--acid)", transform: "scaleX(0)", boxShadow: "0 0 10px rgba(200,255,60,.55)" }}
        />
      </header>

      {/* mobile console */}
      {open && (
        <div className="fixed inset-0 z-[70] bg-[#05060a] lg:hidden flex flex-col">
          <div className="hazard h-[3px]" />
          <div className="shell flex items-center justify-between h-[62px] border-b border-[var(--line)]">
            <span className="lbl">NAVIGATION CONSOLE</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mono text-[11px] tracking-[0.16em] px-3 py-2 border border-[var(--line-2)] cursor-pointer"
            >
              ЗАКРЫТЬ ✕
            </button>
          </div>
          <nav className="shell flex-1 flex flex-col justify-center gap-1">
            {NAV.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="d3 py-4 border-b border-[var(--line)] flex items-baseline justify-between gap-4 text-[var(--bone)]"
              >
                <span>{lang === "ru" ? item.ru : item.en}</span>
                <span className="mono text-[10px] text-[var(--acid)]">0{i + 1}</span>
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onAudit();
              }}
              className="btn btn-acid mt-8 w-full"
            >
              <ZapIcon size={13} />
              {lang === "ru" ? "Запустить аудит" : "Run audit"}
            </button>
            <a
              href="https://github.com/20246ah-svg/lending"
              target="_blank"
              rel="noreferrer"
              className="mono text-[10px] tracking-[0.2em] text-[var(--bone-dim)] mt-6 flex items-center gap-2"
            >
              <GithubIcon size={13} /> SOURCE REPOSITORY
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
