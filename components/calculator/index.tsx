"use client";

import Link from "next/link";
import { CheckIcon, CopyIcon, ZapIcon, AlertTriangleIcon, ShieldAlertIcon } from "@/components/icons";
import { SectionHead } from "@/components/ui/panel";
import { Channel } from "./channel";
import { TaxProjection, CostBars } from "./projection";
import { Schedule } from "./schedule";
import { PRESETS, type DebtModel } from "@/lib/debt-model";
import { money, moneyCompact, group } from "@/lib/format";
import type { Lang } from "@/lib/types";
import type { DebtCalculatorStore } from "@/lib/use-debt-calculator";

/* ------------------------------------------------------------------------- */
/*  Verdict                                                                  */
/* ------------------------------------------------------------------------- */

const BANDS: Record<
  DebtModel["band"],
  {
    color: string;
    ru: string;
    en: string;
    noteRu: string;
    noteEn: string;
  }
> = {
  acid: {
    color: "var(--acid)",
    ru: "КОНТРОЛИРУЕМЫЙ",
    en: "CONTAINED",
    noteRu:
      "Долг заметен, но ещё не управляет решениями команды. Плановый рефакторинг раз в квартал удержит его на месте, а тесты сделают ремонт предсказуемым.",
    noteEn:
      "The debt is visible but does not yet drive the team's decisions. A planned refactor each quarter keeps it in place, and tests make the repair predictable.",
  },
  amber: {
    color: "#ffc42e",
    ru: "ПОВЫШЕННЫЙ",
    en: "ELEVATED",
    noteRu:
      "Долг уже отбирает часть каждого спринта и растёт быстрее, чем команда его закрывает. Если ничего не менять, порог остановки доставки будет достигнут в пределах горизонта.",
    noteEn:
      "The debt already eats part of every sprint and grows faster than the team retires it. Without intervention the delivery stall threshold falls inside the horizon.",
  },
  rot: {
    color: "var(--rot)",
    ru: "КРИТИЧЕСКИЙ",
    en: "CRITICAL",
    noteRu:
      "Команда тратит на обслуживание долга больше, чем на продукт. Экономика полного рерайта становится сопоставимой — это последнее окно, когда рефакторинг ещё дешевле.",
    noteEn:
      "The team spends more on servicing the debt than on the product. Full-rewrite economics are becoming competitive — this is the last window where a refactor is still cheaper.",
  },
};

/* ------------------------------------------------------------------------- */
/*  Readout row                                                              */
/* ------------------------------------------------------------------------- */

function Readout({
  label,
  value,
  unit,
  sub,
  tone = "var(--bone)",
  size = "md",
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  tone?: string;
  size?: "md" | "lg";
}) {
  return (
    <div className="py-4 border-b border-[var(--line)] last:border-b-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="lbl">{label}</span>
        <span
          className={`mono font-semibold tabular-nums leading-none ${
            size === "lg" ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
          }`}
          style={{ color: tone }}
        >
          {value}
          {unit ? (
            <span className="text-[0.5em] font-normal ml-1.5 text-[var(--bone-dim)]">
              {unit}
            </span>
          ) : null}
        </span>
      </div>
      {sub ? (
        <p className="mono text-[10px] text-[var(--bone-dim)] mt-2 leading-relaxed">{sub}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/*  Calculator                                                               */
/* ------------------------------------------------------------------------- */

export function Calculator({
  store,
  lang,
}: {
  store: DebtCalculatorStore;
  lang: Lang;
}) {
  const ru = lang === "ru";
  const { params, model, setParam, applyPreset, reset, copyShareLink, copied, activePreset } =
    store;
  const band = BANDS[model.band];

  const months = (n: number) => (ru ? `${n} мес` : `${n} mo`);

  const stallValue =
    model.stallMonth === null ? `> ${model.series.length}` : months(model.stallMonth);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative z-10">
        <div className="shell pt-[112px] sm:pt-[132px]">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-[var(--line)] py-2.5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              <span className="lbl lbl-acid">
                {ru ? "ИНСТРУМЕНТ 02 · СЛОЖНЫЙ ПРОЦЕНТ" : "TOOL 02 · COMPOUND INTEREST"}
              </span>
              <span className="hidden sm:block w-px h-3 bg-[var(--line-2)]" />
              <span className="lbl">
                {ru ? "10 КАНАЛОВ · ГОРИЗОНТ 36 МЕС" : "10 CHANNELS · 36-MONTH HORIZON"}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className="led"
                style={model.band === "acid" ? undefined : { background: band.color, boxShadow: `0 0 8px ${band.color}` }}
                aria-hidden="true"
              />
              <span className="lbl" style={{ color: band.color }}>
                {ru ? band.ru : band.en}
              </span>
            </div>
          </div>

          <div className="reveal-lines mt-8 sm:mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-8">
                <h1>
                  <span className="sr-only">
                    {ru
                      ? "Долговой калькулятор: сложный процент на технический долг"
                      : "Debt calculator: compound interest on technical debt"}
                  </span>
                  <span aria-hidden="true" className="block uppercase">
                    <span
                      className="mask-line d1"
                      style={{ fontSize: "clamp(2.1rem, 6.4vw, 6.6rem)", lineHeight: 0.86 }}
                    >
                      <span style={{ transitionDelay: "60ms" }}>
                        {ru ? "ТЕХДОЛГ — ЭТО КРЕДИТ" : "TECH DEBT IS A LOAN"}
                      </span>
                    </span>
                    <span
                      className="mask-line d1 outline-type"
                      style={{ fontSize: "clamp(2.1rem, 6.4vw, 6.6rem)", lineHeight: 0.86 }}
                    >
                      <span style={{ transitionDelay: "180ms" }}>
                        {ru ? "ПОД СЛОЖНЫЙ ПРОЦЕНТ" : "AT COMPOUND INTEREST"}
                      </span>
                    </span>
                  </span>
                </h1>
              </div>

              <div className="lg:col-span-4">
                <p className="lede">
                  {ru
                    ? "Он не прощает, отсрочки и не ждёт конца квартала. Задай десять параметров своего проекта и посмотри, сколько он берёт с тебя каждый месяц — и когда стоимость бездействия обгонит полный рерайт."
                    : "It grants no deferral and it does not wait for the end of the quarter. Set ten parameters of your project and see what it charges you every month — and when the cost of doing nothing outruns a full rewrite."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRESETS ================= */}
      <section className="band relative z-10">
        <div className="shell py-8 sm:py-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="lbl mr-1">{ru ? "ПРОФИЛЬ" : "PROFILE"}:</span>
            {PRESETS.map((p) => {
              const active = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  aria-pressed={active}
                  title={ru ? p.note.ru : p.note.en}
                  className="mono text-[10px] tracking-[0.16em] uppercase px-3 py-2 border transition cursor-pointer"
                  style={
                    active
                      ? {
                          borderColor: "var(--acid)",
                          background: "var(--acid)",
                          color: "#05060a",
                          fontWeight: 700,
                        }
                      : { borderColor: "var(--line-2)", color: "var(--bone-dim)" }
                  }
                >
                  {ru ? p.ru : p.en}
                </button>
              );
            })}

            <button
              type="button"
              onClick={reset}
              className="mono text-[10px] tracking-[0.16em] uppercase px-3 py-2 border border-[var(--line-2)] text-[var(--bone-dim)] hover:text-[var(--rot)] hover:border-[var(--rot)] transition cursor-pointer ml-auto"
            >
              {ru ? "СБРОС" : "RESET"}
            </button>
          </div>

          {activePreset ? (
            <p className="mono text-[10.5px] text-[var(--bone-dim)] mt-3">
              {ru
                ? PRESETS.find((p) => p.id === activePreset)?.note.ru
                : PRESETS.find((p) => p.id === activePreset)?.note.en}
            </p>
          ) : (
            <p className="mono text-[10.5px] text-[var(--bone-dim)] mt-3">
              {ru
                ? "Профиль изменён вручную — параметры ниже больше не совпадают с готовым сценарием."
                : "Profile edited by hand — the parameters below no longer match a preset."}
            </p>
          )}
        </div>
      </section>

      {/* ================= CONTROLS + READOUTS ================= */}
      <section className="band relative z-10">
        <div className="shell py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* ---- channel bank ---- */}
            <div className="lg:col-span-7 space-y-4">
              {[
                {
                  title: ru ? "СОСТАВ КОДА" : "CODE COMPOSITION",
                  channels: [
                    {
                      idx: "01",
                      label: ru ? "Всего строк кода в проекте" : "Total lines of code",
                      hint: ru
                        ? "Чем больше поверхность, тем дороже каждый процент долга на ней."
                        : "The larger the surface, the more each percent of debt costs.",
                      key: "loc" as const,
                      min: 200,
                      max: 400000,
                      step: 100,
                      readout: group(params.loc),
                      unit: ru ? "строк" : "LOC",
                      scale: [
                        ["1 200", ru ? "ПРОТОТИП" : "PROTOTYPE"],
                        ["26 000", ru ? "ПРОДУКТ" : "PRODUCT"],
                        ["400 000", ru ? "ПЛАТФОРМА" : "PLATFORM"],
                      ],
                    },
                    {
                      idx: "02",
                      label: ru ? "Доля кода, написанного ИИ" : "Share of code written by AI",
                      hint: ru
                        ? "Непрочитанный сгенерированный код держит в себе решения, которых никто не помнит."
                        : "Un-reviewed generated code holds decisions nobody remembers making.",
                      key: "aiShare" as const,
                      min: 0,
                      max: 100,
                      step: 1,
                      readout: String(params.aiShare),
                      unit: "%",
                      scale: [
                        ["0", ru ? "РУКАМИ" : "BY HAND"],
                        ["50", ru ? "ПОПОЛАМ" : "HALF"],
                        ["100", ru ? "ПОЛНОСТЬЮ" : "FULLY"],
                      ],
                    },
                    {
                      idx: "03",
                      label: ru ? "Возраст проекта" : "Project age",
                      hint: ru
                        ? "Старый код скрывает недокументированные связи: каждая правка требует больше времени."
                        : "Older code hides undocumented coupling, so every change takes longer.",
                      key: "ageMonths" as const,
                      min: 1,
                      max: 120,
                      step: 1,
                      readout: String(params.ageMonths),
                      unit: ru ? "мес" : "mo",
                      scale: [
                        ["1", ru ? "НОВЫЙ" : "NEW"],
                        ["36", ru ? "ЗРЕЛЫЙ" : "MATURE"],
                        ["120", ru ? "ДРЕВНИЙ" : "ANCIENT"],
                      ],
                    },
                  ],
                },
                {
                  title: ru ? "КОМАНДА И ДЕНЬГИ" : "TEAM & MONEY",
                  channels: [
                    {
                      idx: "04",
                      label: ru ? "Инженеров в команде" : "Engineers on the team",
                      hint: ru
                        ? "Определяет пропускную способность: сколько часов в месяц команда может отдать ремонту."
                        : "Sets throughput: how many hours a month the team can give to repair.",
                      key: "devs" as const,
                      min: 1,
                      max: 40,
                      step: 1,
                      readout: String(params.devs),
                      unit: ru ? "чел" : "devs",
                      scale: [
                        ["1", ru ? "СОЛО" : "SOLO"],
                        ["8", ru ? "РАУНД" : "FUNDED"],
                        ["40", ru ? "ДЕПАРТАМЕНТ" : "DEPT"],
                      ],
                    },
                    {
                      idx: "05",
                      label: ru ? "Стоимость часа инженера" : "Engineer cost per hour",
                      hint: ru
                        ? "Полная стоимость часа: оклад, налоги, оборудование. Не ставка на руки."
                        : "Fully loaded cost per hour: salary, taxes, tooling. Not take-home pay.",
                      key: "rate" as const,
                      min: 5,
                      max: 300,
                      step: 1,
                      readout: `$${group(params.rate)}`,
                      unit: "/ч",
                      scale: [
                        ["5", ru ? "АУТСОРС" : "OUTSOURCE"],
                        ["45", ru ? "ИНДИ" : "INDIE"],
                        ["300", ru ? "SENIOR" : "SENIOR"],
                      ],
                    },
                    {
                      idx: "06",
                      label: ru ? "Длина спринта" : "Sprint length",
                      hint: ru
                        ? "Налог на скорость измеряется в спринтах — так команда его и чувствует."
                        : "The velocity tax is measured per sprint, which is how teams feel it.",
                      key: "sprintWeeks" as const,
                      min: 1,
                      max: 4,
                      step: 1,
                      readout: String(params.sprintWeeks),
                      unit: ru ? "нед" : "wk",
                      scale: [
                        ["1", ru ? "НЕДЕЛЯ" : "WEEKLY"],
                        ["2", ru ? "СТАНДАРТ" : "STANDARD"],
                        ["4", ru ? "МЕСЯЦ" : "MONTHLY"],
                      ],
                    },
                  ],
                },
                {
                  title: ru ? "СТРУКТУРА" : "STRUCTURE",
                  channels: [
                    {
                      idx: "07",
                      label: ru ? "Файлов длиннее 500 строк" : "Files longer than 500 lines",
                      hint: ru
                        ? "Каждый такой файл модель воспринимает уже не целиком — и начинает затирать соседнюю логику."
                        : "Each one already exceeds the model's working context, so it starts overwriting adjacent logic.",
                      key: "godFiles" as const,
                      min: 0,
                      max: 60,
                      step: 1,
                      readout: String(params.godFiles),
                      unit: ru ? "файлов" : "files",
                      scale: [
                        ["0", ru ? "МОДУЛЬНО" : "MODULAR"],
                        ["7", ru ? "ТРЕВОГА" : "ALARMING"],
                        ["60", ru ? "МОНОЛИТ" : "MONOLITH"],
                      ],
                    },
                    {
                      idx: "08",
                      label: ru ? "Покрытие автотестами" : "Automated test coverage",
                      hint: ru
                        ? "Самый сильный рычаг: без тестов стоимость любой правки умножается почти вдвое."
                        : "The strongest lever here: with no tests the cost of any change roughly doubles.",
                      key: "coverage" as const,
                      min: 0,
                      max: 100,
                      step: 5,
                      readout: String(params.coverage),
                      unit: "%",
                      scale: [
                        ["0", ru ? "НИЧЕГО" : "NONE"],
                        ["45", ru ? "ЧАСТИЧНО" : "PARTIAL"],
                        ["100", ru ? "ЩИТ" : "SHIELD"],
                      ],
                    },
                  ],
                },
                {
                  title: ru ? "ПРОИЗВОДСТВО" : "PRODUCTION",
                  channels: [
                    {
                      idx: "09",
                      label: ru ? "Инцидентов на проде в месяц" : "Production incidents per month",
                      hint: ru
                        ? "Каждый инцидент — это часы всей команды, а не только дежурного."
                        : "Each incident costs the whole team hours, not just the on-call engineer.",
                      key: "incidents" as const,
                      min: 0,
                      max: 30,
                      step: 1,
                      readout: String(params.incidents),
                      unit: ru ? "/мес" : "/mo",
                      scale: [
                        ["0", ru ? "ТИХО" : "QUIET"],
                        ["6", ru ? "ЕЖЕНЕДЕЛЬНО" : "WEEKLY"],
                        ["30", ru ? "ЕЖЕДНЕВНО" : "DAILY"],
                      ],
                    },
                    {
                      idx: "10",
                      label: ru ? "Среднее время восстановления" : "Mean time to restore",
                      hint: ru
                        ? "Знаменитая авария Replit заняла часы: агент снёс боевую базу без ограничений прав."
                        : "The famous Replit outage ran for hours: the agent dropped production with no guardrails.",
                      key: "mttr" as const,
                      min: 0.5,
                      max: 48,
                      step: 0.5,
                      readout: params.mttr.toFixed(1),
                      unit: ru ? "ч" : "h",
                      scale: [
                        ["0.5", ru ? "БЫСТРО" : "FAST"],
                        ["6", ru ? "СКВОЗЬ ПАЛЬЦЫ" : "FUMBLING"],
                        ["48", ru ? "ДВОЕ СУТОК" : "TWO DAYS"],
                      ],
                    },
                  ],
                },
              ].map((group_) => (
                <div key={group_.title} className="panel">
                  <div className="flex items-center justify-between border-b border-[var(--line-2)] px-4 py-2.5">
                    <span className="lbl">{group_.title}</span>
                    <span className="mono text-[9.5px] text-[var(--bone-dim)] tabular-nums">
                      {group_.channels.length} {ru ? "КАНАЛА" : "CHANNELS"}
                    </span>
                  </div>
                  <div className="p-4 sm:p-5 space-y-7">
                    {group_.channels.map((ch) => (
                      <Channel
                        key={ch.idx}
                        idx={ch.idx}
                        label={ch.label}
                        hint={ch.hint}
                        value={params[ch.key]}
                        min={ch.min}
                        max={ch.max}
                        step={ch.step}
                        onChange={(v) => setParam(ch.key, v)}
                        readout={ch.readout}
                        unit={ch.unit}
                        scale={ch.scale}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ---- live readouts ---- */}
            <div className="lg:col-span-5 lg:sticky lg:top-[86px] space-y-4">
              <div className="panel-solid bracket bracket-rot">
                <div className="flex items-center justify-between border-b border-[var(--line-2)] px-4 py-2.5">
                  <span className="lbl">{ru ? "ВЕРДИКТ" : "VERDICT"}</span>
                  <span className="flex items-center gap-2">
                    <span className="led led-rot" aria-hidden="true" />
                    <span className="mono text-[9.5px] tracking-[0.18em] text-[var(--bone-dim)]">
                      LIVE
                    </span>
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  {/* severity meter */}
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <span className="lbl">{ru ? "ТЯЖЕСТЬ ДОЛГА" : "DEBT SEVERITY"}</span>
                      <div
                        className="d1 leading-none mt-3 tabular-nums"
                        style={{ fontSize: "clamp(3rem, 7vw, 4.6rem)", color: band.color }}
                      >
                        {Math.round(model.severity)}
                        <span className="text-[0.3em] align-top ml-1">/100</span>
                      </div>
                    </div>
                    <span
                      className="mono text-[9.5px] font-bold tracking-[0.2em] px-2 py-1 mb-1 shrink-0"
                      style={{ background: band.color, color: "#05060a" }}
                    >
                      {ru ? band.ru : band.en}
                    </span>
                  </div>

                  <div className="mt-5 flex gap-[3px] h-4" role="meter" aria-valuenow={Math.round(model.severity)} aria-valuemin={0} aria-valuemax={100} aria-label={ru ? "Тяжесть долга" : "Debt severity"}>
                    {Array.from({ length: 34 }, (_, i) => {
                      const lit = i < Math.round((model.severity / 100) * 34);
                      return (
                        <span
                          key={i}
                          className="flex-1 min-w-0"
                          style={{
                            background: lit ? band.color : "rgba(237,234,227,.07)",
                            boxShadow: lit ? `0 0 7px ${band.color}55` : "none",
                            transition: `background .3s ease ${i * 10}ms`,
                          }}
                        />
                      );
                    })}
                  </div>

                  <p className="mono text-[10.5px] leading-relaxed text-[var(--bone-dim)] mt-5">
                    {ru ? band.noteRu : band.noteEn}
                  </p>
                </div>
              </div>

              {/* the six numbers */}
              <div className="panel">
                <div className="flex items-center justify-between border-b border-[var(--line-2)] px-4 py-2.5">
                  <span className="lbl">{ru ? "ПОКАЗАНИЯ" : "READOUTS"}</span>
                  <span className="mono text-[9.5px] text-[var(--bone-dim)]">USD · H</span>
                </div>

                <div className="px-4 sm:px-5">
                  <Readout
                    label={ru ? "Основной долг" : "Principal"}
                    value={group(model.principalHours)}
                    unit={ru ? "ч" : "h"}
                    tone="var(--bone)"
                    size="lg"
                    sub={
                      ru
                        ? `${money(model.principalCost)} на расчистку сегодня. Множители: монолиты ×${model.godFactor.toFixed(2)}, тесты ×${model.testFactor.toFixed(2)}, ИИ ×${model.aiFactor.toFixed(2)}, возраст ×${model.ageFactor.toFixed(2)}.`
                        : `${money(model.principalCost)} to clear today. Multipliers: monoliths ×${model.godFactor.toFixed(2)}, tests ×${model.testFactor.toFixed(2)}, AI ×${model.aiFactor.toFixed(2)}, age ×${model.ageFactor.toFixed(2)}.`
                    }
                  />

                  <Readout
                    label={ru ? "Процентная ставка" : "Interest rate"}
                    value={`${(model.monthlyInterest * 100).toFixed(2)}`}
                    unit={ru ? "% / мес" : "% / mo"}
                    tone="var(--rot)"
                    sub={
                      ru
                        ? `${model.annualInterestPct.toFixed(1)}% годовых на стоимость ремонта. Плюс рост самой кодовой базы ${(model.codeGrowth * 100).toFixed(2)}% в месяц — итоговое начисление ${(model.compoundingRate * 100).toFixed(2)}%.`
                        : `${model.annualInterestPct.toFixed(1)}% annualised on remediation cost. Plus codebase growth of ${(model.codeGrowth * 100).toFixed(2)}% a month — total accrual ${(model.compoundingRate * 100).toFixed(2)}%.`
                    }
                  />

                  <Readout
                    label={ru ? "Налог на скорость" : "Velocity tax"}
                    value={model.taxNow.toFixed(1)}
                    unit="%"
                    tone={model.taxNow >= 35 ? "var(--rot)" : "#ffc42e"}
                    size="lg"
                    sub={
                      ru
                        ? `Через 12 месяцев бездействия — ${model.taxIn12.toFixed(1)}% каждого спринта. Долг эквивалентен ${model.burdenMonths.toFixed(2)} месяца работы всей команды.`
                        : `In 12 months of inaction — ${model.taxIn12.toFixed(1)}% of every sprint. The debt equals ${model.burdenMonths.toFixed(2)} months of whole-team capacity.`
                    }
                  />

                  <Readout
                    label={ru ? "Ежемесячная утечка" : "Monthly bleed"}
                    value={money(model.bleedNow)}
                    tone="var(--rot)"
                    size="lg"
                    sub={
                      ru
                        ? `${money(model.wasteCostNow)} потерянной продуктивности плюс ${money(model.incidentCost)} на инциденты. Через год — ${money(model.bleedIn12)}/мес.`
                        : `${money(model.wasteCostNow)} of lost productivity plus ${money(model.incidentCost)} on incidents. A year from now: ${money(model.bleedIn12)}/mo.`
                    }
                  />

                  <Readout
                    label={ru ? "Срок окупаемости ремонта" : "Repair payback"}
                    value={model.paybackWeeks === Infinity ? "∞" : model.paybackWeeks.toFixed(1)}
                    unit={ru ? "нед" : "wk"}
                    tone="var(--acid)"
                    sub={
                      ru
                        ? "Столько времени утечка должна идти, чтобы превысить полную стоимость расчистки долга."
                        : "How long the bleed must run to exceed the full cost of clearing the debt."
                    }
                  />

                  <Readout
                    label={ru ? "Горизонт остановки доставки" : "Delivery stall horizon"}
                    value={stallValue}
                    tone={model.stallMonth === null ? "var(--acid)" : "var(--rot)"}
                    sub={
                      ru
                        ? model.stallMonth === null
                          ? `При текущей динамике налог на скорость не достигает 35% в пределах ${model.series.length} месяцев.`
                          : `Месяц, когда налог на скорость перешагнёт 35%: команда начнёт тратить на долг больше трети каждого спринта.`
                        : model.stallMonth === null
                        ? `At the current trajectory the velocity tax never reaches 35% within ${model.series.length} months.`
                        : `The month the velocity tax crosses 35%: the team starts spending more than a third of every sprint on debt.`
                    }
                  />

                  <Readout
                    label={ru ? "Долг под планом ремонта" : "Debt under the repair plan"}
                    value={
                      model.monthsToClear === null
                        ? ru
                          ? `> ${model.series.length}`
                          : `> ${model.series.length}`
                        : String(model.monthsToClear)
                    }
                    unit={ru ? "мес" : "mo"}
                    tone="var(--acid)"
                    sub={
                      ru
                        ? "Срок полной расчистки, если направлять 20% мощности команды в ремонт долга вместо новых фич."
                        : "Time to clear everything if 20% of team capacity goes into debt repayment instead of new features."
                    }
                  />
                </div>
              </div>

              {/* share */}
              <div className="panel">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <span className="lbl block">{ru ? "ССЫЛКА НА РАСЧЁТ" : "LINK TO THIS RUN"}</span>
                    <code className="mono text-[9.5px] text-[var(--bone-dim)] block mt-2 truncate">
                      {store.shareUrl.slice(0, 58)}…
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="btn btn-acid !py-2.5 !px-4 shrink-0"
                  >
                    {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                    {copied
                      ? ru
                        ? "СКОПИРОВАНО"
                        : "COPIED"
                      : ru
                      ? "КОПИРОВАТЬ"
                      : "COPY"}
                  </button>
                </div>
                <p className="mono text-[9.5px] text-[var(--bone-dim)] px-4 pb-4 leading-relaxed">
                  {ru
                    ? "Все десять параметров закодированы в адресе страницы — ссылку можно отправить команде или инвестору."
                    : "All ten parameters are encoded in the page address — send the link to your team or your investor."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROJECTION ================= */}
      <section className="band relative z-10">
        <div className="shell py-12 sm:py-16">
          <SectionHead
            index="01"
            label={ru ? "ПРОГНОЗ" : "PROJECTION"}
            title={ru ? "Куда ведёт кривая" : "Where the curve leads"}
            lede={
              ru
                ? "Красная линия — то, что произойдёт само. Зелёная — что произойдёт, если сознательно отдать долгу пятую часть мощности. Точка пересечения с порогом остановки и есть та дата, ради которой всё это считается."
                : "The red line is what happens on its own. The green one is what happens if you deliberately hand a fifth of your capacity to the debt. The point where the red line meets the stall threshold is the date all of this is really about."
            }
            tone="rot"
          />

          <div className="mt-10 space-y-4">
            <TaxProjection model={model} lang={lang} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5">
                <CostBars model={model} lang={lang} />
              </div>

              <div className="lg:col-span-7 panel bracket">
                <div className="flex items-center gap-3 border-b border-[var(--line-2)] px-4 py-2.5">
                  <ShieldAlertIcon size={13} className="text-[var(--acid)]" />
                  <span className="lbl">{ru ? "КАК ЭТО ЧИТАТЬ" : "HOW TO READ THIS"}</span>
                </div>
                <div className="p-5 sm:p-6 space-y-5">
                  <p className="mono text-[11px] leading-relaxed text-[var(--bone)]">
                    {ru
                      ? `Долг сегодня — ${group(model.principalHours)} часов, или ${money(model.principalCost)}. Он не стоит на месте: пока команда пишет новые фичи, стоимость его расчистки растёт на ${(model.compoundingRate * 100).toFixed(2)}% каждый месяц.`
                      : `The debt today is ${group(model.principalHours)} hours, or ${money(model.principalCost)}. It does not sit still: while the team ships features, the price of clearing it grows ${(model.compoundingRate * 100).toFixed(2)}% a month.`}
                  </p>

                  <p className="mono text-[11px] leading-relaxed text-[var(--bone)]">
                    {ru
                      ? `Каждый месяц он дополнительно берёт ${money(model.bleedNow)} — это ${model.taxNow.toFixed(1)}% времени команды, потраченного не на продукт. За год таких списаний набегает ${moneyCompact(model.costOfDelay12)}. Для сравнения: полный рерайт с нуля обошёлся бы в ${moneyCompact(model.rewriteCost)}.`
                      : `Every month it additionally charges ${money(model.bleedNow)} — that is ${model.taxNow.toFixed(1)}% of team time not spent on the product. Over a year those charges total ${moneyCompact(model.costOfDelay12)}. For reference, a full rewrite from scratch would cost ${moneyCompact(model.rewriteCost)}.`}
                  </p>

                  <p className="mono text-[11px] leading-relaxed text-[var(--bone)]">
                    {ru
                      ? model.monthsToClear === null
                        ? `При 20% мощности, направленной в ремонт, долг не закрывается в пределах ${model.series.length} месяцев — но налог на скорость перестаёт расти уже с первого месяца.`
                        : `Если направлять 20% мощности в ремонт, долг закрывается за ${model.monthsToClear} мес., а налог на скорость падает с ${model.taxNow.toFixed(1)}% до структурного минимума.`
                      : model.monthsToClear === null
                      ? `With 20% of capacity allocated to repair the debt is not cleared within ${model.series.length} months — but the velocity tax stops climbing from the very first month.`
                      : `Allocating 20% of capacity to repair clears the debt in ${model.monthsToClear} months and takes the velocity tax from ${model.taxNow.toFixed(1)}% down to its structural floor.`}
                  </p>

                  <div className="pt-4 border-t border-[var(--line)] flex items-start gap-3">
                    <AlertTriangleIcon size={14} className="text-[#ffc42e] shrink-0 mt-0.5" />
                    <p className="mono text-[10px] leading-relaxed text-[var(--bone-dim)]">
                      {ru
                        ? "Это модель, а не приговор. Она считает в часах и деньгах и не знает про удачу, удачных новых разработчиков, удачный рефакторинг и удачное «а зачем мы это вообще написали». Ценность модели — в порядке величин и в направлении движения, а не в третьем знаке после запятой."
                        : "This is a model, not a verdict. It counts in hours and dollars and knows nothing about luck, a good new hire, a well-aimed refactor, or the lucky realisation that a feature never had to exist. Its value is in the orders of magnitude and the direction of travel, not the third decimal place."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Schedule model={model} lang={lang} />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="band relative z-10 overflow-hidden">
        <div className="hazard" aria-hidden="true" />
        <div className="shell py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h2 className="d2 text-[var(--bone)]">
                {ru ? "Теперь посчитай по-настоящему" : "Now measure the real thing"}
              </h2>
              <p className="lede mt-5 max-w-2xl">
                {ru
                  ? "Этот калькулятор работает на твоих догадках о собственном проекте — а люди обычно недооценивают и объём, и количество God-файлов. Аудитор прочитает реальное дерево репозитория, посчитает всё за тебя и соберёт план ремонта."
                  : "This calculator runs on your own guesses about your own project — and people reliably underestimate both the volume and the number of god files. The auditor reads the real file tree, does the counting for you, and assembles the repair plan."}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link href="/#audit-tool" className="btn btn-acid !py-3.5 w-full" data-cursor="SCAN">
                <ZapIcon size={13} />
                {ru ? "Просканировать репозиторий" : "Scan a repository"}
              </Link>
              <Link href="/" className="btn !py-3.5 w-full" data-cursor="HOME">
                {ru ? "Вернуться на главную" : "Back to the landing page"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
