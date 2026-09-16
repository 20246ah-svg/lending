"use client";

import { LabClock } from "./lab-clock";
import { GithubIcon, TwitterIcon } from "@/components/icons";
import type { Lang } from "@/lib/types";

const COLUMNS = [
  {
    title: { ru: "ИНСТРУМЕНТ", en: "INSTRUMENT" },
    links: [
      { ru: "Аудитор", en: "Auditor", href: "#audit-tool" },
      { ru: "Реактор долга", en: "Debt reactor", href: "#calculator" },
      { ru: "Локальный CLI", en: "Local CLI", href: "#cli-section" },
      { ru: "Уровни доступа", en: "Access levels", href: "#pricing" },
    ],
  },
  {
    title: { ru: "ЗНАНИЯ", en: "KNOWLEDGE" },
    links: [
      { ru: "Анатомия дефектов", en: "Defect anatomy", href: "#antipatterns" },
      { ru: "Архив инцидентов", en: "Incident archive", href: "#antipatterns" },
      { ru: "Матрица здоровья", en: "Health matrix", href: "#audit-tool" },
    ],
  },
  {
    title: { ru: "ДАННЫЕ", en: "DATA" },
    links: [
      { ru: "Политика приватности", en: "Privacy policy", href: "#" },
      { ru: "Обработка кода", en: "Code handling", href: "#" },
      { ru: "Открытый исходник", en: "Source repository", href: "https://github.com/20246ah-svg/lending" },
    ],
  },
];

export function Footer({ lang }: { lang: Lang }) {
  const ru = lang === "ru";

  return (
    <footer className="relative z-10 mt-auto overflow-hidden border-t border-[var(--line-2)] bg-[#020306]">
      <div className="hazard" aria-hidden="true" />

      <div className="shell pt-14 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* statement */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-10 h-10 border border-[var(--line-3)] relative overflow-hidden">
                <span
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(200,255,60,.2), transparent 60%)",
                  }}
                />
                <span className="d3 relative text-[16px] text-[var(--acid)] leading-none">VD</span>
              </span>
              <div>
                <div className="d3 text-[17px] text-[var(--bone)] leading-none">VibeDebt</div>
                <div className="mono text-[9px] tracking-[0.22em] text-[var(--bone-dim)] mt-1">
                  FORENSIC CODE ANALYSIS UNIT
                </div>
              </div>
            </div>

            <p className="mono text-[10.5px] leading-relaxed text-[var(--bone-dim)] mt-6 max-w-md">
              {ru
                ? "Аудитор технического долга для соло-фаундеров и инди-хакеров, которые собирают продукты вместе с ИИ. Детерминированный анализ вместо догадок."
                : "A technical-debt auditor for solo founders and indie hackers who build products alongside AI. Deterministic analysis instead of guesswork."}
            </p>

            <div className="mt-7 flex items-center gap-4">
              <a
                href="https://github.com/20246ah-svg/lending"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 mono text-[10px] tracking-[0.16em] text-[var(--bone-dim)] hover:text-[var(--acid)] transition"
              >
                <GithubIcon size={13} /> GITHUB
              </a>
              <span className="w-px h-3 bg-[var(--line-2)]" />
              <a
                href="https://twitter.com/intent/tweet?text=VibeDebt"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 mono text-[10px] tracking-[0.16em] text-[var(--bone-dim)] hover:text-[var(--acid)] transition"
              >
                <TwitterIcon size={13} /> X / TWITTER
              </a>
            </div>
          </div>

          {/* link columns */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {COLUMNS.map((col) => (
              <nav key={col.title.ru} aria-label={ru ? col.title.ru : col.title.en}>
                <div className="lbl">{ru ? col.title.ru : col.title.en}</div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.ru}>
                      <a
                        href={l.href}
                        className="mono text-[10.5px] text-[var(--bone-dim)] hover:text-[var(--acid)] transition"
                      >
                        {ru ? l.ru : l.en}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* status strip */}
        <div className="mt-14 border-y border-[var(--line)] py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <span className="led" aria-hidden="true" />
            <span className="mono text-[10px] tracking-[0.2em] text-[var(--acid)]">
              {ru ? "ВСЕ СИСТЕМЫ В НОРМЕ" : "ALL SYSTEMS OPERATIONAL"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="mono text-[10px] text-[var(--bone-dim)]">
              {ru ? "СКАНЕР" : "SCANNER"} v2.4
            </span>
            <span className="w-px h-3 bg-[var(--line-2)]" />
            <LabClock />
            <span className="w-px h-3 bg-[var(--line-2)]" />
            <span className="barcode w-[120px] text-[var(--bone-dim)]" aria-hidden="true" />
          </div>
        </div>

        <div className="py-6 flex flex-wrap items-center justify-between gap-4">
          <span className="mono text-[10px] text-[var(--bone-dim)]">
            © {new Date().getFullYear()} VibeDebt · MIT License
          </span>
          <span className="mono text-[10px] text-[var(--bone-dim)]">
            {ru ? "Сделано для инди-хакеров" : "Built for indie hackers"}
          </span>
          <a
            href="#top"
            className="mono text-[10px] tracking-[0.18em] text-[var(--bone-dim)] hover:text-[var(--acid)] transition"
          >
            {ru ? "НАВЕРХ ↑" : "BACK TO TOP ↑"}
          </a>
        </div>
      </div>

      {/* oversized stencil wordmark, cropped by the viewport floor */}
      <div className="relative w-full overflow-hidden select-none" aria-hidden="true">
        <div
          className="d1 whitespace-nowrap text-center"
          style={{
            fontSize: "clamp(4rem, 20.5vw, 17rem)",
            lineHeight: 0.78,
            letterSpacing: "-0.02em",
            color: "transparent",
            WebkitTextStroke: "1px var(--line-2)",
            transform: "translateY(0.18em)",
          }}
        >
          VIBEDEBT
        </div>
      </div>
    </footer>
  );
}
