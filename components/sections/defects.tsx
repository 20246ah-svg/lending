"use client";

import { SectionHead } from "@/components/ui/panel";
import { SpecimenSlide } from "@/components/ui/specimen-slide";
import { Marquee } from "@/components/fx/marquee";
import { ShieldAlertIcon } from "@/components/icons";
import type { Lang } from "@/lib/types";

interface Defect {
  n: string;
  tag: string;
  tone: "rot" | "amber" | "violet" | "blue" | "acid";
  cwe: string;
  title: { ru: string; en: string };
  body: { ru: string; en: string };
  fix: { ru: string; en: string };
  accession: string;
  art: string;
  contamination: number;
}

const TONE: Record<Defect["tone"], string> = {
  rot: "var(--rot)",
  amber: "#ffc42e",
  violet: "var(--violet)",
  blue: "#35e6ff",
  acid: "var(--acid)",
};

const DEFECTS: Defect[] = [
  {
    n: "01",
    tag: "CWE Security Risk",
    tone: "rot",
    cwe: "CWE-89 · CWE-79 · CWE-798",
    title: {
      ru: "Оптимизация под «вид», а не под безопасность",
      en: "Optimised for appearance, not for security",
    },
    body: {
      ru: "Модель генерирует статистически вероятный код. Безопасность не входит в её целевую функцию. В итоге код компилируется и выглядит аккуратно, но открывает SQL-инъекции, XSS и выставляет приватные токены прямо в браузер.",
      en: "The model emits high-probability tokens that satisfy the prompt. Security is not part of its objective, so the code compiles and looks tidy while leaving SQL injection, XSS and exposed tokens behind.",
    },
    fix: {
      ru: "SAST-правила и мета-промпты с фиксацией конкретного класса CWE.",
      en: "SAST rules and meta-prompts pinned to a specific CWE class.",
    },
    accession: "VD-0001",
    art: "/specimens/spec-02.jpg",
    contamination: 88,
  },
  {
    n: "02",
    tag: "Supply Chain Slop",
    tone: "amber",
    cwe: "CWE-1357",
    title: {
      ru: "Галлюцинации пакетов и API — 19.7%",
      en: "Package & API hallucinations — 19.7%",
    },
    body: {
      ru: "Исследования показали: 19.7% рекомендаций библиотек от ИИ указывают на несуществующие пакеты. Злоумышленники массово регистрируют эти имена в npm, чтобы атаковать стартапы через цепочку поставок.",
      en: "Studies show 19.7% of AI library recommendations point at packages that do not exist. Attackers mass-register those names on npm to breach startups through the supply chain.",
    },
    fix: {
      ru: "Аудит lock-файла и проверка каждого пакета в реестре npm.",
      en: "Lock-file audit plus registry validation of every dependency.",
    },
    accession: "VD-0014",
    art: "/specimens/spec-05.jpg",
    contamination: 61,
  },
  {
    n: "03",
    tag: "Inverse Law",
    tone: "rot",
    cwe: "CWE-398",
    title: {
      ru: "Закон обратной связи объёма и качества",
      en: "The volume-quality inverse law",
    },
    body: {
      ru: "Чем больше файл, тем сильнее структурная деградация. Начиная примерно с 300 строк модель теряет контекст и порождает сильно связанный «вайб-слоп», затирая соседний работающий функционал при добавлении нового.",
      en: "The larger the file, the steeper the structural decay. From roughly 300 lines up, the model loses context and produces tightly coupled slop — erasing working code while adding new code.",
    },
    fix: {
      ru: "Распил на 3 слабосвязанных сервиса со строгими интерфейсами.",
      en: "Split into 3 loosely coupled services with strict interfaces.",
    },
    accession: "VD-0027",
    art: "/specimens/spec-03.jpg",
    contamination: 94,
  },
  {
    n: "04",
    tag: "Happy Path Blindspot",
    tone: "blue",
    cwe: "CWE-390 · CWE-400",
    title: {
      ru: "Отсутствие обработки сбоев и крайних случаев",
      en: "No handling for failure or edge cases",
    },
    body: {
      ru: "ИИ пишет код под «идеальный мир»: пустые блоки catch, сетевые запросы без таймаутов, отсутствие проверок на null. Малейший сбой сети подвешивает интерфейс пользователя намертво.",
      en: "LLMs ignore timeouts, null checks and error boundaries, leaving empty catch blocks. The slightest network hiccup freezes the interface permanently.",
    },
    fix: {
      ru: "Паттерн Result<T, E> и AbortController с таймаутом 5 секунд.",
      en: "Result<T, E> pattern plus AbortController with a 5-second timeout.",
    },
    accession: "VD-0033",
    art: "/specimens/spec-04.jpg",
    contamination: 72,
  },
  {
    n: "05",
    tag: "Testing Gap",
    tone: "acid",
    cwe: "CWE-1065",
    title: {
      ru: "Опасный разрыв в тестировании",
      en: "The critical testing gap",
    },
    body: {
      ru: "Нейросеть генерирует разметку за секунды, но почти никогда не пишет тесты на граничные случаи. Без регрессионной страховки любой следующий промпт в Cursor может незаметно сломать авторизацию или биллинг.",
      en: "AI generates markup in seconds and almost never writes edge-case tests. With no regression harness, the next prompt in Cursor can silently break auth or billing.",
    },
    fix: {
      ru: "Автогенерация Vitest-сьютов на 4 сценария: валидный, пустой, неверный тип, граница.",
      en: "Auto-generated Vitest suites across 4 scenarios: valid, empty, wrong type, boundary.",
    },
    accession: "VD-0041",
    art: "/specimens/spec-01.jpg",
    contamination: 100,
  },
];

const INCIDENTS = [
  {
    id: "CASE 01",
    tone: "rot" as const,
    title: { ru: "Инцидент Replit", en: "The Replit incident" },
    body: {
      ru: "ИИ-агент при попытке выполнить миграцию схемы запустил DROP DATABASE в боевом окружении — жёстких ограничений прав доступа не было.",
      en: "While attempting a schema migration, the AI agent ran DROP DATABASE against production — no permission guardrails existed.",
    },
    lesson: {
      ru: "Human-in-the-loop и строгий лимит на опасные команды.",
      en: "Human-in-the-loop controls and a hard ban on destructive commands.",
    },
  },
  {
    id: "CASE 02",
    tone: "amber" as const,
    title: { ru: "Supply Chain Slop", en: "Supply Chain Slop" },
    body: {
      ru: "Хакеры зарегистрировали свыше 200 пакетов в npm с именами, которые регулярно выдумывали ChatGPT и Cursor, и внедрили стилеры в десятки стартапов.",
      en: "Attackers registered 200+ npm packages under names models routinely hallucinate, injecting stealers into dozens of startups.",
    },
    lesson: {
      ru: "Автоматический аудит package.json на несуществующие библиотеки.",
      en: "Automated audit of package.json against the registry.",
    },
  },
  {
    id: "CASE 03",
    tone: "violet" as const,
    title: { ru: "Supabase Service Role", en: "Supabase Service Role" },
    body: {
      ru: "Cursor прописал SUPABASE_SERVICE_ROLE_KEY в клиентский компонент страницы настроек, открыв административный доступ к базе всем пользователям через DevTools.",
      en: "Cursor placed SUPABASE_SERVICE_ROLE_KEY inside a client settings component, handing admin database access to every visitor via DevTools.",
    },
    lesson: {
      ru: "Автоматическая изоляция приватных ключей в Server Actions.",
      en: "Automatic isolation of private keys into Server Actions.",
    },
  },
];

export function Defects({ lang }: { lang: Lang }) {
  const ru = lang === "ru";

  return (
    <section id="antipatterns" className="band scroll-mt-24 relative z-10">
      <div className="shell py-16 sm:py-24">
        <SectionHead
          index="03"
          label={ru ? "АНАТОМИЯ ИИ-ДЕФЕКТОВ" : "ANATOMY OF AI DEFECTS"}
          title={
            ru ? (
              <>
                Проблема не в том,
                <br />
                что ИИ пишет плохо
              </>
            ) : (
              <>
                The problem isn&rsquo;t
                <br />
                that AI writes badly
              </>
            )
          }
          lede={
            ru
              ? "Проблема в том, что он пишет код, который выглядит безупречным, но несёт системный машинный след дефектов. До 45% сгенерированного кода содержит уязвимости, а до 19.7% рекомендаций библиотек указывают на несуществующие пакеты. Ниже — пять задокументированных первопричин."
              : "The problem is that it writes code which looks flawless while carrying a systematic machine signature. Up to 45% of generated code contains security flaws, and up to 19.7% of package recommendations point at nothing. Below: five documented root causes."
          }
          tone="rot"
        />

        {/* ---- five defect columns ---- */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
          {DEFECTS.map((d, i) => {
            const accent = TONE[d.tone];
            const wide = i === 4;
            return (
              <article
                key={d.n}
                className={`reveal group bg-[var(--ink)] relative ${wide ? "md:col-span-2" : ""}`}
                data-delay={i * 70}
                style={{ borderTop: `2px solid ${accent}` }}
              >
                <div className={wide ? "xl:flex" : ""}>
                  <div className={`relative ${wide ? "xl:w-[42%] xl:shrink-0" : ""}`}>
                    <SpecimenSlide
                      src={d.art}
                      accession={d.accession}
                      cross={d.cwe}
                      title={ru ? d.title.ru : d.title.en}
                      tone={d.tone === "amber" || d.tone === "blue" ? "acid" : d.tone}
                      contamination={d.contamination}
                      ratio={wide ? "16 / 9" : "16 / 10"}
                    />
                  </div>

                  <div className={`p-5 sm:p-6 ${wide ? "xl:flex-1" : ""}`}>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="d3 text-[20px] leading-none tabular-nums"
                        style={{ color: accent }}
                      >
                        {d.n}
                      </span>
                      <span
                        className="mono text-[9.5px] tracking-[0.2em] uppercase"
                        style={{ color: accent }}
                      >
                        {d.tag}
                      </span>
                    </div>

                    <h3 className="d3 mt-4 text-[17px] sm:text-[19px] leading-tight text-[var(--bone)]">
                      {ru ? d.title.ru : d.title.en}
                    </h3>

                    <p className="mono text-[10.5px] leading-relaxed text-[var(--bone-dim)] mt-3">
                      {ru ? d.body.ru : d.body.en}
                    </p>

                    <div className="mt-5 pt-4 border-t border-[var(--line)] flex items-start gap-2.5">
                      <span
                        className="mono text-[9px] font-bold tracking-[0.18em] px-1.5 py-0.5 shrink-0 mt-0.5"
                        style={{ background: accent, color: "#05060a" }}
                      >
                        FIX
                      </span>
                      <span className="mono text-[10px] leading-relaxed text-[var(--bone-dim)]">
                        {ru ? d.fix.ru : d.fix.en}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ---- incident archive ---- */}
      <div className="border-y border-[var(--line-2)] bg-[#020306]/70">
        <Marquee slow reverse className="py-2.5">
          {(ru
            ? [
                "КЕЙС 01 · ИНЦИДЕНТ REPLIT",
                "КЕЙС 02 · 200+ ФАНТОМНЫХ ПАКЕТОВ В NPM",
                "КЕЙС 03 · SERVICE ROLE KEY В DEVTOOLS",
                "45% ИИ-КОДА СОДЕРЖИТ УЯЗВИМОСТИ",
                "19.7% БИБЛИОТЕК НЕ СУЩЕСТВУЕТ",
              ]
            : [
                "CASE 01 · THE REPLIT INCIDENT",
                "CASE 02 · 200+ PHANTOM NPM PACKAGES",
                "CASE 03 · SERVICE ROLE KEY IN DEVTOOLS",
                "45% OF AI CODE CARRIES SECURITY FLAWS",
                "19.7% OF LIBRARIES DON'T EXIST",
              ]
          ).map((t, i) => (
            <span key={`${t}-${i}`} className="flex items-center shrink-0">
              <span className="mono text-[10px] tracking-[0.24em] text-[var(--bone-dim)] px-5">
                {t}
              </span>
              <span className="text-[var(--rot)] text-[8px]">■</span>
            </span>
          ))}
        </Marquee>
      </div>

      <div className="shell py-16 sm:py-20">
        <div className="reveal panel bracket bracket-rot">
          <div className="flex items-center gap-3 border-b border-[var(--line-2)] px-4 py-3">
            <ShieldAlertIcon size={16} className="text-[var(--rot)]" />
            <span className="lbl lbl-acid">
              {ru ? "АРХИВ РЕАЛЬНЫХ ИНЦИДЕНТОВ" : "REAL INCIDENT ARCHIVE"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--line)]">
            {INCIDENTS.map((inc) => {
              const accent = TONE[inc.tone];
              return (
                <article key={inc.id} className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span
                      className="mono text-[9.5px] font-bold tracking-[0.2em] px-1.5 py-0.5"
                      style={{ background: accent, color: "#05060a" }}
                    >
                      {inc.id}
                    </span>
                    <span className="mono text-[9px] text-[var(--bone-dim)]">
                      {ru ? "ПОСТМОРТЕМ" : "POSTMORTEM"}
                    </span>
                  </div>

                  <h3 className="mono text-[12.5px] text-[var(--bone)] font-semibold mt-4">
                    {ru ? inc.title.ru : inc.title.en}
                  </h3>
                  <p className="mono text-[10.5px] leading-relaxed text-[var(--bone-dim)] mt-3">
                    {ru ? inc.body.ru : inc.body.en}
                  </p>

                  <div
                    className="mt-4 pt-3 border-t flex items-start gap-2"
                    style={{ borderColor: `${accent}33` }}
                  >
                    <span className="mono text-[9px] tracking-[0.18em] shrink-0" style={{ color: accent }}>
                      {ru ? "УРОК" : "LESSON"}
                    </span>
                    <span className="mono text-[10px] leading-relaxed text-[var(--bone-dim)]">
                      {ru ? inc.lesson.ru : inc.lesson.en}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* how the analysis works — two tiers */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)]">
          {[
            {
              tier: ru ? "УРОВЕНЬ 1 · МГНОВЕННО" : "TIER 1 · INSTANT",
              tone: "var(--acid)",
              title: ru ? "Статический AST-сканер" : "Static AST scanner",
              body: ru
                ? "Читает дерево файлов через GitHub REST API без участия нейросети. Проверяет package.json на наличие тестовых фреймворков, замеряет объём модулей, ищет паттерны `as any`, утечек сервисных ключей и циклических зависимостей useEffect. Работает за десятые доли секунды, со стопроцентной детерминированностью и без галлюцинаций."
                : "Walks the file tree through the GitHub REST API with no model in the loop. Inspects package.json for test runners, measures module volumes, and looks for `as any` patterns, service-key leaks and cyclical useEffect dependencies. Sub-second, fully deterministic, no hallucination.",
              foot: ru ? "Чистая математика и факты о коде" : "Pure code heuristics & facts",
            },
            {
              tier: ru ? "УРОВЕНЬ 2 · ИИ-РЕФАКТОРИНГ" : "TIER 2 · AI REFACTORING",
              tone: "var(--violet)",
              title: ru ? "Контекстный мета-промптер" : "Contextual meta-prompter",
              body: ru
                ? "Из найденных аномалий — например, монолитного app/page.tsx на 1 100 строк — собирается узконаправленный системный промпт для Cursor или Claude. Промпт задаёт жёсткие рамки и прямо запрещает модели ломать существующий интерфейс при распиле логики."
                : "Detected anomalies — say a 1,100-line monolithic app/page.tsx — are compiled into a narrowly scoped system prompt for Cursor or Claude. The prompt sets hard boundaries and explicitly forbids breaking the existing interface while splitting logic.",
              foot: ru ? "Безопасное итеративное исправление" : "Safe, verifiable iteration",
            },
          ].map((tier) => (
            <article key={tier.tier} className="bg-[var(--ink)] p-6 sm:p-8">
              <span
                className="mono text-[9.5px] font-bold tracking-[0.2em] px-2 py-1"
                style={{ background: tier.tone, color: "#05060a" }}
              >
                {tier.tier}
              </span>
              <h3 className="d3 mt-5 text-[20px] text-[var(--bone)]">{tier.title}</h3>
              <p className="mono text-[10.5px] leading-relaxed text-[var(--bone-dim)] mt-3.5">
                {tier.body}
              </p>
              <p
                className="mono text-[10px] mt-5 pt-4 border-t border-[var(--line)]"
                style={{ color: tier.tone }}
              >
                ▸ {tier.foot}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
