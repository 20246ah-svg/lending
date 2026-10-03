/**
 * DEBT INTEREST MODEL
 * ===================
 * Pure, framework-free maths for the debt calculator. Everything here is a
 * plain function of `DebtParams` so it can be unit-tested, shared with the
 * server, and reasoned about without reading a single component.
 *
 * The central premise: technical debt behaves like a loan.
 *
 *   • It has a PRINCIPAL  — the hours needed to clear it today.
 *   • It has an INTEREST RATE — the speed at which it grows, because the
 *     codebase keeps expanding while the debt sits there unrepaid.
 *   • It charges a VELOCITY TAX — a share of every sprint lost to it.
 *   • It BLEEDS cash monthly through wasted hours and production incidents.
 *   • And it COMPOUNDS, which is what makes "later" more expensive than "now".
 */

export interface DebtParams {
  /** Total lines of code in the project. */
  loc: number;
  /** Share of the codebase written by an AI assistant, 0–100. */
  aiShare: number;
  /** Engineers on the team. */
  devs: number;
  /** Blended hourly cost of an engineer, USD. */
  rate: number;
  /** Sprint length in weeks. */
  sprintWeeks: number;
  /** Files longer than 500 lines. */
  godFiles: number;
  /** Automated test coverage, 0–100. */
  coverage: number;
  /** Age of the project in months. */
  ageMonths: number;
  /** Production incidents per month. */
  incidents: number;
  /** Mean time to restore service after an incident, hours. */
  mttr: number;
}

/** Productive engineering hours per person per month (~37 h/week). */
export const CAPACITY_PER_DEV_MONTH = 160;
/** Horizon of the projection, in months. */
export const HORIZON = 36;
/** Share of capacity the repair plan commits to debt removal. */
export const REPAIR_ALLOCATION = 0.2;
/** Velocity tax at which feature delivery effectively stalls. */
export const STALL_TAX = 35;

export const DEFAULT_PARAMS: DebtParams = {
  loc: 5500,
  aiShare: 72,
  devs: 2,
  rate: 45,
  sprintWeeks: 2,
  godFiles: 3,
  coverage: 0,
  ageMonths: 8,
  incidents: 2,
  mttr: 6,
};

export interface Preset {
  id: string;
  ru: string;
  en: string;
  note: { ru: string; en: string };
  params: DebtParams;
}

export const PRESETS: Preset[] = [
  {
    id: "weekend",
    ru: "Прототип на выходные",
    en: "Weekend prototype",
    note: {
      ru: "Один разработчик, аккуратные модули, есть базовые тесты",
      en: "One developer, tidy modules, a basic test suite",
    },
    params: {
      loc: 1200,
      aiShare: 88,
      devs: 1,
      rate: 30,
      sprintWeeks: 1,
      godFiles: 0,
      coverage: 45,
      ageMonths: 1,
      incidents: 0,
      mttr: 2,
    },
  },
  {
    id: "vibe",
    ru: "Инди-SaaS на Cursor",
    en: "Cursor indie SaaS",
    note: {
      ru: "Два фаундера, ноль тестов, три God-файла, живёт на проде",
      en: "Two founders, zero tests, three god files, already live",
    },
    params: DEFAULT_PARAMS,
  },
  {
    id: "funded",
    ru: "Проект с инвесторами",
    en: "Funded team",
    note: {
      ru: "Восемь инженеров, раунд закрыт, долг копится быстрее выручки",
      en: "Eight engineers, round closed, debt compounding faster than revenue",
    },
    params: {
      loc: 26000,
      aiShare: 60,
      devs: 8,
      rate: 80,
      sprintWeeks: 2,
      godFiles: 7,
      coverage: 45,
      ageMonths: 14,
      incidents: 3,
      mttr: 5,
    },
  },
  {
    id: "legacy",
    ru: "Выросший legacy",
    en: "Bloated legacy",
    note: {
      ru: "Пять лет эволюции, монолиты, инциденты каждую неделю",
      en: "Five years of evolution, monoliths, weekly incidents",
    },
    params: {
      loc: 48000,
      aiShare: 35,
      devs: 5,
      rate: 65,
      sprintWeeks: 2,
      godFiles: 14,
      coverage: 22,
      ageMonths: 30,
      incidents: 6,
      mttr: 9,
    },
  },
];

/* ------------------------------------------------------------------------- */
/*  Helpers                                                                  */
/* ------------------------------------------------------------------------- */

export const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export interface SeriesPoint {
  month: number;
  /** Remediation effort still outstanding, in hours. */
  debtHours: number;
  /** Cost of clearing that debt, in today's money. */
  debtCost: number;
  /** Share of sprint capacity lost to debt, %. */
  tax: number;
  /** Cash burned this month, USD. */
  bleed: number;
  /** Cash burned since month zero, USD. */
  cumulative: number;
  /** Outstanding debt under the 20 %-capacity repair plan, hours. */
  planHours: number;
  /** Velocity tax under that repair plan, %. */
  planTax: number;
  /** True once the debt line crosses the stall threshold. */
  stalled: boolean;
  /** True once cumulative bleed exceeds the cost of a full rewrite. */
  pastRewrite: boolean;
}

export interface DebtModel {
  /* Principal */
  principalHours: number;
  principalCost: number;
  /* Multipliers, exposed so the UI can explain where the number came from */
  godFactor: number;
  testFactor: number;
  aiFactor: number;
  ageFactor: number;
  /* Interest */
  monthlyInterest: number; // fraction, e.g. 0.0251
  codeGrowth: number; // fraction
  compoundingRate: number; // fraction
  annualInterestPct: number;
  /* Velocity */
  taxNow: number;
  taxIn12: number;
  burdenMonths: number; // months of whole-team capacity to clear the debt
  /* Cash */
  bleedNow: number;
  bleedIn12: number;
  wasteCostNow: number;
  incidentCost: number;
  costOfDelay12: number;
  /* Benchmarks */
  fixCost: number;
  rewriteCost: number;
  paybackWeeks: number;
  /* Horizons */
  stallMonth: number | null;
  rewriteMonth: number | null;
  monthsToClear: number | null;
  /* Verdict */
  severity: number;
  band: "acid" | "amber" | "rot";
  series: SeriesPoint[];
}

/* ------------------------------------------------------------------------- */
/*  The model                                                                */
/* ------------------------------------------------------------------------- */

export function computeDebtModel(p: DebtParams): DebtModel {
  const missing = clamp((100 - p.coverage) / 100, 0, 1);
  const capacity = Math.max(1, p.devs * CAPACITY_PER_DEV_MONTH);

  /* ---- 1. PRINCIPAL — hours of remediation outstanding today ---------- */

  const rawPrincipal = p.loc / 250; // a senior clears ~250 LOC/h of legacy
  const godFactor = 1 + p.godFiles * 0.06; // monoliths inflate the work
  const testFactor = 1 + missing * 0.9; // no tests ⇒ every change is risky
  const aiFactor = 1 + (p.aiShare / 100) * 0.35; // un-reviewed AI code is opaque
  // Older codebases hide more undocumented coupling, so each line takes longer.
  const ageFactor = 1 + Math.min(1, p.ageMonths / 36) * 0.45;
  const principalHours =
    rawPrincipal * godFactor * testFactor * aiFactor * ageFactor;
  const principalCost = principalHours * p.rate;

  /* ---- 2. INTEREST — how fast the debt inflates ----------------------- */

  const monthlyInterest = clamp(
    0.006 + // baseline drift
      p.godFiles * 0.0012 +
      missing * 0.0105 +
      (p.aiShare / 100) * 0.0055 +
      p.incidents * 0.0005,
    0,
    0.06
  );

  // The codebase itself keeps growing, which is the other half of the loan.
  const codeGrowth = clamp(
    0.012 + (p.aiShare / 100) * 0.022 + p.devs * 0.002,
    0,
    0.08
  );

  const compoundingRate = monthlyInterest + codeGrowth;
  const annualInterestPct = (Math.pow(1 + monthlyInterest, 12) - 1) * 100;

  /* ---- 3. VELOCITY TAX — share of every sprint lost ------------------- */

  const burdenMonths = principalHours / capacity;
  const taxBase = clamp(
    2.5 + missing * 7.5 + p.godFiles * 0.45 + burdenMonths * 5,
    2,
    55
  );

  /** Tax grows as the debt compounds; structural drag is the floor. */
  const taxAt = (debtHours: number) =>
    clamp(
      taxBase * (1 + (debtHours / principalHours - 1) * 0.5),
      taxBase,
      58
    );

  /* ---- 4. CASH — what it costs per month ------------------------------ */

  const incidentCost = p.incidents * p.mttr * p.rate * 2.5;
  const bleedAt = (tax: number) => (capacity * tax) / 100 * p.rate + incidentCost;

  /* ---- 5. BENCHMARKS ------------------------------------------------- */

  const fixCost = principalCost;
  // A full rewrite costs more than the fix: every product decision is re-made
  // and every fixed bug is re-introduced.
  const rewriteHours =
    (p.loc / 45) * (1 + (p.aiShare / 100) * 0.5) * (1 + p.godFiles * 0.03);
  const rewriteCost = rewriteHours * p.rate;

  /* ---- 6. PROJECTION ------------------------------------------------- */

  const series: SeriesPoint[] = [];
  let cumulative = 0;
  let planHours = principalHours;

  let stallMonth: number | null = null;
  let rewriteMonth: number | null = null;
  let monthsToClear: number | null = null;

  const repairHours = capacity * REPAIR_ALLOCATION;

  for (let m = 0; m < HORIZON; m++) {
    const debtHours = principalHours * Math.pow(1 + compoundingRate, m);
    const debtCost = debtHours * p.rate;
    const tax = taxAt(debtHours);
    const bleed = bleedAt(tax);
    cumulative += bleed;

    const planTax = taxAt(planHours);
    const stalled = tax >= STALL_TAX;
    const pastRewrite = cumulative >= rewriteCost;

    if (stalled && stallMonth === null) stallMonth = m;
    if (pastRewrite && rewriteMonth === null) rewriteMonth = m;

    series.push({
      month: m,
      debtHours,
      debtCost,
      tax,
      bleed,
      cumulative,
      planHours,
      planTax,
      stalled,
      pastRewrite,
    });

    // Advance the repair plan: pay down, then let interest work on the rest.
    if (monthsToClear === null) {
      planHours = planHours * (1 + compoundingRate) - repairHours;
      if (planHours <= 0) {
        planHours = 0;
        monthsToClear = m + 1;
      }
    }
  }

  const taxNow = series[0].tax;
  const taxIn12 = series[Math.min(12, HORIZON - 1)].tax;
  const bleedNow = series[0].bleed;
  const bleedIn12 = series[Math.min(12, HORIZON - 1)].bleed;
  const costOfDelay12 = series[Math.min(11, HORIZON - 1)].cumulative;

  const paybackWeeks = bleedNow > 0 ? fixCost / (bleedNow / 4.33) : Infinity;

  /* ---- 7. VERDICT ---------------------------------------------------- */

  const severity = clamp(
    Math.min(1, taxNow / 30) * 50 +
      Math.min(1, burdenMonths / 0.8) * 20 +
      Math.min(1, monthlyInterest / 0.04) * 18 +
      Math.min(1, p.incidents / 5) * 12,
    0,
    100
  );

  const band: DebtModel["band"] =
    severity >= 62 ? "rot" : severity >= 32 ? "amber" : "acid";

  return {
    principalHours,
    principalCost,
    godFactor,
    testFactor,
    aiFactor,
    ageFactor,
    monthlyInterest,
    codeGrowth,
    compoundingRate,
    annualInterestPct,
    taxNow,
    taxIn12,
    burdenMonths,
    bleedNow,
    bleedIn12,
    wasteCostNow: bleedNow - incidentCost,
    incidentCost,
    costOfDelay12,
    fixCost,
    rewriteCost,
    paybackWeeks,
    stallMonth,
    rewriteMonth,
    monthsToClear,
    severity,
    band,
    series,
  };
}

/* ------------------------------------------------------------------------- */
/*  URL serialisation — makes every calculation a shareable link              */
/* ------------------------------------------------------------------------- */

const KEYS: Array<[keyof DebtParams, string, number, number]> = [
  ["loc", "loc", 200, 400000],
  ["aiShare", "ai", 0, 100],
  ["devs", "dev", 1, 40],
  ["rate", "rate", 5, 300],
  ["sprintWeeks", "spr", 1, 4],
  ["godFiles", "god", 0, 60],
  ["coverage", "cov", 0, 100],
  ["ageMonths", "age", 1, 120],
  ["incidents", "inc", 0, 30],
  ["mttr", "mttr", 0.5, 48],
];

export function paramsToQuery(p: DebtParams): string {
  const sp = new URLSearchParams();
  for (const [field, key] of KEYS) sp.set(key, String(p[field]));
  return sp.toString();
}

/** Reads a URLSearchParams into params, ignoring anything malformed. */
export function queryToParams(sp: URLSearchParams): Partial<DebtParams> {
  const patch: Partial<DebtParams> = {};
  for (const [field, key, lo, hi] of KEYS) {
    const raw = sp.get(key);
    if (raw === null) continue;
    const n = Number(raw);
    if (!Number.isFinite(n)) continue;
    patch[field] = clamp(n, lo, hi);
  }
  return patch;
}

export { KEYS as PARAM_KEYS };
