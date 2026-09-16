"use client";

import { SectionHead } from "@/components/ui/panel";
import { CheckIcon } from "@/components/icons";
import type { Lang } from "@/lib/types";

interface Tier {
  idx: string;
  code: string;
  name: { ru: string; en: string };
  price: string;
  per?: { ru: string; en: string };
  pitch: { ru: string; en: string };
  features: { ru: string[]; en: string[] };
  cta: { ru: string; en: string };
  featured?: boolean;
  ctaAction: "scroll" | "none";
}

const TIERS: Tier[] = [
  {
    idx: "01",
    code: "VD-GUEST",
    name: { ru: "Гостевой пропуск", en: "Guest pass" },
    price: "0 ₽",
    pitch: {
      ru: "Разовый осмотр одного публичного репозитория, чтобы понять масштаб проблемы.",
      en: "A one-off inspection of a single public repository, enough to size the problem.",
    },
    features: {
      ru: [
        "Аудит одного репозитория",
        "Счётчик Судного Дня",
        "Базовый список дефектов и CWE",
        "Матрица здоровья из 4 столпов",
      ],
      en: [
        "One repository audit",
        "Doomsday Score",
        "Core defect & CWE list",
        "Four-pillar health matrix",
      ],
    },
    cta: { ru: "Попробовать бесплатно", en: "Start free audit" },
    ctaAction: "scroll",
  },
  {
    idx: "02",
    code: "VD-PRO",
    name: { ru: "Лабораторный допуск", en: "Lab clearance" },
    price: "1 490 ₽",
    per: { ru: "в месяц", en: "per month" },
    pitch: {
      ru: "Полный инструментарий рефакторинга и защита от поломок на каждом коммите.",
      en: "The full refactoring toolkit plus per-commit protection against breakage.",
    },
    features: {
      ru: [
        "Безлимитный аудит проектов",
        "Генератор хирургических промптов",
        "Мониторинг утечек API-ключей",
        "GitHub Action для проверки PR",
        "История замеров по всем коммитам",
      ],
      en: [
        "Unlimited project audits",
        "Surgical prompt generator",
        "Secret-leak monitoring",
        "GitHub PR Action guard",
        "Measurement history across commits",
      ],
    },
    cta: { ru: "Подключить PRO", en: "Upgrade to PRO" },
    featured: true,
    ctaAction: "none",
  },
  {
    idx: "03",
    code: "VD-LIFETIME",
    name: { ru: "Пожизненный образец", en: "Permanent specimen" },
    price: "4 900 ₽",
    per: { ru: "разово", en: "one-time" },
    pitch: {
      ru: "Для серийных инди-хакеров, которые запускают несколько проектов в год.",
      en: "For serial indie builders shipping several projects a year.",
    },
    features: {
      ru: [
        "Все возможности PRO навсегда",
        "До 10 активных репозиториев",
        "Приоритетный разбор через Claude",
        "Ранний доступ к новым сканерам",
      ],
      en: [
        "Every PRO capability, forever",
        "Up to 10 active repositories",
        "Priority Claude reasoning tier",
        "Early access to new scanners",
      ],
    },
    cta: { ru: "Купить Lifetime", en: "Get lifetime" },
    ctaAction: "none",
  },
];

export function Pricing({ lang }: { lang: Lang }) {
  const ru = lang === "ru";

  return (
    <section id="pricing" className="band scroll-mt-24 relative z-10">
      <div className="shell py-16 sm:py-24">
        <SectionHead
          index="05"
          label={ru ? "УРОВНИ ДОСТУПА" : "ACCESS LEVELS"}
          title={
            ru ? (
              <>
                Прозрачные
                <br />
                тарифы
              </>
            ) : (
              <>
                Transparent
                <br />
                pricing
              </>
            )
          }
          lede={
            ru
              ? "Окупается при первом же предотвращённом сбое на проде. Никаких скрытых лимитов на количество дефектов в отчёте."
              : "It pays for itself the first time production does not fall over. No hidden cap on how many defects a report may contain."
          }
        />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
          {TIERS.map((tier) => {
            const featured = Boolean(tier.featured);
            const fg = featured ? "#05060a" : "var(--bone)";
            const fgDim = featured ? "rgba(5,6,10,.62)" : "var(--bone-dim)";
            const accent = featured ? "#05060a" : "var(--acid)";
            const rule = featured ? "rgba(5,6,10,.18)" : "var(--line)";

            return (
              <article
                key={tier.code}
                className="reveal relative flex flex-col"
                style={{ background: featured ? "var(--acid)" : "var(--ink)" }}
              >
                {featured && (
                  <span
                    className="mono text-[9px] font-bold tracking-[0.24em] absolute -top-px right-4 px-2 py-1"
                    style={{ background: "#05060a", color: "var(--acid)" }}
                  >
                    {ru ? "ВЫБОР ФАУНДЕРОВ" : "FOUNDER CHOICE"}
                  </span>
                )}

                {/* header */}
                <div
                  className="flex items-center justify-between px-5 py-3 border-b"
                  style={{ borderColor: rule }}
                >
                  <span className="mono text-[10px] tracking-[0.2em]" style={{ color: fgDim }}>
                    {tier.idx} · {tier.code}
                  </span>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <h3 className="d3 text-[24px]" style={{ color: fg }}>
                    {ru ? tier.name.ru : tier.name.en}
                  </h3>

                  <div className="mt-5 flex items-end gap-2.5">
                    <span
                      className="mono font-semibold tabular-nums leading-none"
                      style={{ color: fg, fontSize: "clamp(2.1rem, 4.4vw, 3rem)" }}
                    >
                      {tier.price}
                    </span>
                    {tier.per ? (
                      <span className="mono text-[11px] pb-1.5" style={{ color: fgDim }}>
                        / {ru ? tier.per.ru : tier.per.en}
                      </span>
                    ) : null}
                  </div>

                  <p className="mono text-[10.5px] leading-relaxed mt-4" style={{ color: fgDim }}>
                    {ru ? tier.pitch.ru : tier.pitch.en}
                  </p>

                  <ul className="mt-6 space-y-3 flex-1">
                    {(ru ? tier.features.ru : tier.features.en).map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckIcon size={13} style={{ color: accent }} className="shrink-0 mt-0.5" />
                        <span className="mono text-[10.5px] leading-relaxed" style={{ color: fg }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      if (tier.ctaAction !== "scroll") return;
                      document
                        .getElementById("audit-tool")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="btn w-full mt-7"
                    style={
                      featured
                        ? {
                            background: "#05060a",
                            borderColor: "#05060a",
                            color: "var(--acid)",
                          }
                        : undefined
                    }
                    data-cursor="SELECT"
                  >
                    {ru ? tier.cta.ru : tier.cta.en}
                  </button>
                </div>

                {/* barcode foot */}
                <div
                  className="flex items-center justify-between gap-4 px-5 py-3 border-t"
                  style={{ borderColor: rule }}
                >
                  <span
                    className="barcode w-[130px]"
                    style={{ color: featured ? "#05060a" : "var(--bone)" }}
                    aria-hidden="true"
                  />
                  <span className="mono text-[9px] tracking-[0.18em]" style={{ color: fgDim }}>
                    {tier.code}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mono text-[10px] text-[var(--bone-dim)] mt-6 leading-relaxed max-w-3xl">
          {ru
            ? "Тарифы указаны для физических лиц и инди-команд. Для корпоративного внедрения с приватным раннером и SSO — отдельный договор."
            : "Prices shown for individuals and indie teams. Enterprise deployment with a private runner and SSO is quoted separately."}
        </p>
      </div>
    </section>
  );
}
