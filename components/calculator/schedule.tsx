"use client";

import { money, moneyCompact, group } from "@/lib/format";
import { HORIZON, STALL_TAX, type DebtModel } from "@/lib/debt-model";
import type { Lang } from "@/lib/types";

interface Row {
  month: number;
  debtHours: number;
  debtCost: number;
  tax: number;
  bleed: number;
  cumulative: number;
  tag?: { text: string; color: string };
}

/**
 * The repayment schedule: what carrying the debt costs, month by month, as the
 * interest compounds. This is the part that turns an argument into arithmetic.
 */
export function Schedule({ model, lang }: { model: DebtModel; lang: Lang }) {
  const ru = lang === "ru";

  // First month whose cumulative bleed has already covered the cost of fixing.
  const paybackMonth = model.series.findIndex((s) => s.cumulative >= model.fixCost);

  const rows: Row[] = model.series.map((s) => {
    let tag: Row["tag"];
    if (s.month === 0) {
      tag = { text: ru ? "СЕЙЧАС" : "NOW", color: "var(--bone)" };
    } else if (s.month === model.stallMonth) {
      tag = { text: ru ? "ОСТАНОВКА" : "STALL", color: "var(--rot)" };
    } else if (s.month === model.rewriteMonth) {
      tag = { text: ru ? "ДОРОЖЕ РЕРАЙТА" : "COSTLIER THAN REWRITE", color: "var(--violet)" };
    } else if (s.month === paybackMonth) {
      tag = { text: ru ? "ОКУПИЛОСЬ" : "PAID BACK", color: "var(--acid)" };
    }
    return {
      month: s.month,
      debtHours: s.debtHours,
      debtCost: s.debtCost,
      tax: s.tax,
      bleed: s.bleed,
      cumulative: s.cumulative,
      tag,
    };
  });

  const th = "mono text-[9px] tracking-[0.14em] uppercase text-[var(--bone-dim)] font-medium";
  const td = "mono text-[11px] tabular-nums py-2.5 px-3 whitespace-nowrap";

  return (
    <div className="panel bracket">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-2)] px-4 py-2.5">
        <span className="lbl">
          {ru ? "ГРАФИК ОБСЛУЖИВАНИЯ ДОЛГА" : "DEBT SERVICING SCHEDULE"}
        </span>
        <span className="mono text-[10px] text-[var(--bone-dim)]">
          {ru ? "0 – 35 МЕС · ПРОКРУТКА" : "0 – 35 MO · SCROLLS"}
        </span>
      </div>

      <div className="overflow-auto max-h-[430px]">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            {ru
              ? "Помесячный расчёт роста технического долга, налога на скорость и накопленных потерь."
              : "Month-by-month projection of debt growth, velocity tax and accumulated loss."}
          </caption>

          <thead className="sticky top-0 z-10 bg-[#020306]">
            <tr className="border-b border-[var(--line-2)]">
              <th scope="col" className={`${th} text-left py-3 px-3`}>
                {ru ? "МЕС" : "MO"}
              </th>
              <th scope="col" className={`${th} text-right py-3 px-3`}>
                {ru ? "ДОЛГ, Ч" : "DEBT, H"}
              </th>
              <th scope="col" className={`${th} text-right py-3 px-3`}>
                {ru ? "ДОЛГ, $" : "DEBT, $"}
              </th>
              <th scope="col" className={`${th} text-right py-3 px-3`}>
                {ru ? "НАЛОГ" : "TAX"}
              </th>
              <th scope="col" className={`${th} text-right py-3 px-3`}>
                {ru ? "УТЕЧКА $/МЕС" : "BLEED $/MO"}
              </th>
              <th scope="col" className={`${th} text-right py-3 px-3`}>
                {ru ? "НАКОПЛЕНО $" : "CUMULATIVE $"}
              </th>
              <th scope="col" className={`${th} text-left py-3 px-3`}>
                {ru ? "СТАТУС" : "STATUS"}
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              const stalled = r.tax >= STALL_TAX;
              return (
                <tr
                  key={r.month}
                  className="border-b border-[var(--line)] last:border-b-0"
                  style={
                    r.tag
                      ? { background: `${r.tag.color}0f` }
                      : r.month % 2 === 1
                      ? { background: "rgba(237,234,227,.012)" }
                      : undefined
                  }
                >
                  <th
                    scope="row"
                    className={`${td} text-left font-normal`}
                    style={{ color: r.tag ? r.tag.color : "var(--bone)" }}
                  >
                    {String(r.month).padStart(2, "0")}
                  </th>
                  <td className={`${td} text-right text-[var(--bone-dim)]`}>
                    {group(r.debtHours)}
                  </td>
                  <td className={`${td} text-right text-[var(--bone)]`}>{money(r.debtCost)}</td>
                  <td
                    className={`${td} text-right font-semibold`}
                    style={{ color: stalled ? "var(--rot)" : "var(--bone-dim)" }}
                  >
                    {r.tax.toFixed(1)}%
                  </td>
                  <td className={`${td} text-right text-[var(--bone-dim)]`}>{money(r.bleed)}</td>
                  <td className={`${td} text-right text-[var(--bone)]`}>
                    {moneyCompact(r.cumulative)}
                  </td>
                  <td className={`${td} text-left`}>
                    {r.tag ? (
                      <span
                        className="mono text-[8.5px] font-bold tracking-[0.14em] px-1.5 py-0.5"
                        style={{ background: r.tag.color, color: "#05060a" }}
                      >
                        {r.tag.text}
                      </span>
                    ) : (
                      <span className="text-[var(--line-3)]">·</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line-2)] px-4 py-3">
        <p className="mono text-[9.5px] text-[var(--bone-dim)] leading-relaxed max-w-2xl">
          {ru
            ? "Проценты начисляются ежемесячно на остаточную стоимость ремонта: кодовая база растёт, поэтому и цена её расчистки растёт вместе с ней."
            : "Interest accrues monthly on the outstanding remediation cost: the codebase keeps growing, so the price of clearing it grows with it."}
        </p>
        <span className="mono text-[9.5px] text-[var(--bone-dim)] shrink-0">
          {HORIZON} {ru ? "МЕСЯЦЕВ" : "MONTHS"}
        </span>
      </div>
    </div>
  );
}
