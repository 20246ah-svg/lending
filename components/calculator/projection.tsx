"use client";

import { money, moneyCompact, group } from "@/lib/format";
import { HORIZON, REPAIR_ALLOCATION, STALL_TAX, type DebtModel } from "@/lib/debt-model";
import type { Lang } from "@/lib/types";

/* ------------------------------------------------------------------------- */
/*  Chart geometry                                                           */
/* ------------------------------------------------------------------------- */

const X0 = 64;
const X1 = 736;
const Y0 = 28; // top
const Y1 = 236; // baseline
const VB_W = 760;
const VB_H = 290;

const px = (month: number) => X0 + (month / (HORIZON - 1)) * (X1 - X0);

/**
 * Velocity tax across the projection horizon: what carrying the debt costs in
 * lost engineering capacity, against what it costs if 20 % of capacity is
 * redirected to repayment.
 */
export function TaxProjection({ model, lang }: { model: DebtModel; lang: Lang }) {
  const ru = lang === "ru";
  const maxTax = Math.max(...model.series.map((s) => s.tax), STALL_TAX);
  const ceiling = Math.ceil((maxTax * 1.15) / 10) * 10;

  const py = (tax: number) => Y1 - (tax / ceiling) * (Y1 - Y0);

  const debtPath = model.series
    .map((s, i) => `${i === 0 ? "M" : "L"}${px(s.month).toFixed(1)},${py(s.tax).toFixed(1)}`)
    .join(" ");

  const planPath = model.series
    .map((s, i) => `${i === 0 ? "M" : "L"}${px(s.month).toFixed(1)},${py(s.planTax).toFixed(1)}`)
    .join(" ");

  // Filled area under the debt line — the "cost of doing nothing".
  const debtArea = `${debtPath} L${px(HORIZON - 1).toFixed(1)},${Y1} L${px(0).toFixed(1)},${Y1} Z`;

  const gridTicks = [0, 1, 2, 3, 4].map((i) => Math.round((ceiling / 4) * i));
  const monthTicks = [0, 6, 12, 18, 24, 30, 36].filter((m) => m < HORIZON);

  return (
    <div className="panel bracket">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-2)] px-4 py-2.5">
        <span className="lbl">
          {ru ? "НАЛОГ НА СКОРОСТЬ ВО ВРЕМЕНИ" : "VELOCITY TAX OVER TIME"}
        </span>
        <span className="mono text-[10px] text-[var(--bone-dim)]">
          {ru ? "ГОРИЗОНТ" : "HORIZON"} {HORIZON} {ru ? "МЕС" : "MO"}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full"
          role="img"
          aria-label={
            ru
              ? `Налог на скорость растёт с ${model.taxNow.toFixed(1)}% до ${model.taxIn12.toFixed(1)}% за 12 месяцев при бездействии, и падает при выделении 20% мощности на ремонт.`
              : `Velocity tax grows from ${model.taxNow.toFixed(1)}% to ${model.taxIn12.toFixed(1)}% over 12 months if nothing is done, and falls when 20% of capacity is redirected to repair.`
          }
        >
          <defs>
            <linearGradient id="debtFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--rot)" stopOpacity="0.26" />
              <stop offset="100%" stopColor="var(--rot)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* gridlines + y labels */}
          {gridTicks.map((t) => (
            <g key={t}>
              <line x1={X0} x2={X1} y1={py(t)} y2={py(t)} stroke="var(--line)" strokeWidth="1" />
              <text
                x={X0 - 10}
                y={py(t)}
                textAnchor="end"
                dominantBaseline="middle"
                fill="var(--bone-dim)"
                style={{ fontFamily: "var(--f-mono)", fontSize: 9 }}
              >
                {t}%
              </text>
            </g>
          ))}

          {/* axes */}
          <line x1={X0} x2={X0} y1={Y0 - 8} y2={Y1} stroke="var(--line-2)" strokeWidth="1" />
          <line x1={X0} x2={X1} y1={Y1} y2={Y1} stroke="var(--line-2)" strokeWidth="1" />

          {/* stall threshold */}
          <line
            x1={X0}
            x2={X1}
            y1={py(STALL_TAX)}
            y2={py(STALL_TAX)}
            stroke="var(--rot)"
            strokeWidth="1"
            strokeDasharray="5 4"
            opacity="0.85"
          />
          <text
            x={X0 + 6}
            y={py(STALL_TAX) - 7}
            fill="var(--rot)"
            style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: "0.12em" }}
          >
            {ru ? "ПОРОГ ОСТАНОВКИ 35%" : "STALL THRESHOLD 35%"}
          </text>

          {/* do-nothing debt */}
          <path d={debtArea} fill="url(#debtFill)" />
          <path d={debtPath} fill="none" stroke="var(--rot)" strokeWidth="2.2" />

          {/* repair plan */}
          <path
            d={planPath}
            fill="none"
            stroke="var(--acid)"
            strokeWidth="2.2"
            strokeDasharray="1 0"
          />

          {/* stall marker */}
          {model.stallMonth !== null && model.stallMonth < HORIZON && (
            <>
              <line
                x1={px(model.stallMonth)}
                x2={px(model.stallMonth)}
                y1={Y0 - 6}
                y2={Y1}
                stroke="var(--rot)"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <circle cx={px(model.stallMonth)} cy={py(model.series[model.stallMonth].tax)} r="3.6" fill="var(--rot)" />
            </>
          )}

          {/* repair-complete marker */}
          {model.monthsToClear !== null && model.monthsToClear < HORIZON && (
            <>
              <line
                x1={px(model.monthsToClear)}
                x2={px(model.monthsToClear)}
                y1={Y0 - 6}
                y2={Y1}
                stroke="var(--acid)"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <circle
                cx={px(model.monthsToClear)}
                cy={py(model.series[model.monthsToClear].planTax)}
                r="3.6"
                fill="var(--acid)"
              />
            </>
          )}

          {/* starting point */}
          <circle cx={px(0)} cy={py(model.taxNow)} r="3.4" fill="var(--bone)" />

          {/* x labels */}
          {monthTicks.map((m) => (
            <text
              key={m}
              x={px(m)}
              y={Y1 + 18}
              textAnchor="middle"
              fill="var(--bone-dim)"
              style={{ fontFamily: "var(--f-mono)", fontSize: 9 }}
            >
              {m === 0 ? (ru ? "СЕЙЧАС" : "NOW") : m}
            </text>
          ))}
        </svg>

        {/* legend */}
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="mono text-[10px] text-[var(--bone-dim)] flex items-center gap-2">
            <span className="w-4 h-[2px]" style={{ background: "var(--rot)" }} />
            {ru ? "НИЧЕГО НЕ ДЕЛАТЬ" : "DO NOTHING"}
          </span>
          <span className="mono text-[10px] text-[var(--bone-dim)] flex items-center gap-2">
            <span className="w-4 h-[2px]" style={{ background: "var(--acid)" }} />
            {ru
              ? `РЕМОНТ: ${Math.round(REPAIR_ALLOCATION * 100)}% МОЩНОСТИ В ДОЛГ`
              : `REPAIR: ${Math.round(REPAIR_ALLOCATION * 100)}% OF CAPACITY INTO DEBT`}
          </span>
          <span className="mono text-[10px] text-[var(--bone-dim)] flex items-center gap-2">
            <span className="w-4 h-[2px] border-t border-dashed" style={{ borderColor: "var(--rot)" }} />
            {ru ? "ОСТАНОВКА ДОСТАВКИ" : "DELIVERY STALL"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/*  Cost comparison bars                                                     */
/* ------------------------------------------------------------------------- */

/**
 * Three numbers side by side, which is the whole pitch in one glance:
 * clearing the debt today, ignoring it for a year, or rewriting from scratch.
 */
export function CostBars({ model, lang }: { model: DebtModel; lang: Lang }) {
  const ru = lang === "ru";

  const bars = [
    {
      key: "fix",
      label: ru ? "Расчистить долг сегодня" : "Clear the debt today",
      value: model.fixCost,
      tone: "var(--acid)",
      note: ru
        ? `${group(model.principalHours)} ч работы команды`
        : `${group(model.principalHours)} h of team work`,
    },
    {
      key: "delay",
      label: ru ? "Бездействие 12 месяцев" : "Do nothing for 12 months",
      value: model.costOfDelay12,
      tone: "var(--rot)",
      note: ru
        ? `налог на скорость вырастет до ${model.taxIn12.toFixed(1)}%`
        : `velocity tax climbs to ${model.taxIn12.toFixed(1)}%`,
    },
    {
      key: "rewrite",
      label: ru ? "Полный рерайт с нуля" : "Full rewrite from scratch",
      value: model.rewriteCost,
      tone: "var(--violet)",
      note: ru
        ? "все продуктовые решения принимаются заново"
        : "every product decision re-made",
    },
  ];

  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="panel">
      <div className="flex items-center justify-between border-b border-[var(--line-2)] px-4 py-2.5">
        <span className="lbl">{ru ? "СРАВНЕНИЕ СЦЕНАРИЕВ" : "SCENARIO COMPARISON"}</span>
        <span className="mono text-[10px] text-[var(--bone-dim)]">USD</span>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {bars.map((b) => (
          <div key={b.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="mono text-[10.5px] text-[var(--bone)]">{b.label}</span>
              <span className="mono text-[13px] font-semibold tabular-nums" style={{ color: b.tone }}>
                {money(b.value)}
              </span>
            </div>

            <div className="mt-2 h-2.5 bg-[var(--line)] relative overflow-hidden">
              <span
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${Math.max(1.5, (b.value / max) * 100)}%`,
                  background: b.tone,
                  boxShadow: `0 0 14px ${b.tone}55`,
                  transition: "width .6s cubic-bezier(.16,1,.3,1)",
                }}
              />
            </div>

            <p className="mono text-[9.5px] text-[var(--bone-dim)] mt-1.5">{b.note}</p>
          </div>
        ))}

        <div className="pt-4 border-t border-[var(--line)]">
          <p className="mono text-[10.5px] leading-relaxed text-[var(--bone-dim)]">
            {model.paybackWeeks === Infinity ? (
              ru ? (
                "Долг не генерирует измеримых потерь — ремонт можно планировать в обычном режиме."
              ) : (
                "The debt produces no measurable loss — repair can be scheduled normally."
              )
            ) : (
              <>
                <span className="text-[var(--acid)] font-semibold">
                  {ru
                    ? `Ремонт окупается за ${model.paybackWeeks.toFixed(1)} нед.`
                    : `The repair pays back in ${model.paybackWeeks.toFixed(1)} weeks.`}
                </span>{" "}
                {ru
                  ? `Каждый месяц ожидания стоит ${moneyCompact(model.bleedNow)} — это дороже, чем доля ремонта, которую можно закрыть за тот же срок.`
                  : `Every month of waiting costs ${moneyCompact(model.bleedNow)} — more than the share of repair that same month could retire.`}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
