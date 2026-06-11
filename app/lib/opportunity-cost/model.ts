/**
 * Opportunity Cost of Inaction — calculation engine.
 *
 * A "Cost of Delay" model: it quantifies the value a business forgoes for each
 * month it delays adopting effective AI tools and strategies. The headline is
 * deliberately framed as *cost of inaction* rather than ROI, because the brief
 * is to help prospects feel the price of standing still.
 *
 * Design principles:
 *   1. Every user input is a number a business owner already knows
 *      (revenue, headcount, rough salary, how repetitive the work is).
 *   2. Industry benchmarks — not the user — supply the improvement percentages,
 *      so the output stays defensible and consistent across business types.
 *   3. The model is deliberately conservative: a realisation factor and a net
 *      implementation-cost haircut are applied before any number is shown, so
 *      the figures survive scrutiny from a sceptical CFO.
 *
 * Three value levers (annual, gross):
 *   - Productivity reclaimed  — time given back on automatable work
 *   - Revenue uplift          — freed capacity, faster response, better conversion
 *   - Error & rework reduction — value of work that no longer has to be redone
 *
 * These are intentionally distinct categories to avoid double-counting:
 *   productivity = doing existing work faster; rework = not having to redo it.
 *
 * NOTE: Benchmarks are illustrative industry averages drawn from published AI
 * adoption studies. They are starting points for a conversation, not a
 * guarantee — the UI says as much.
 */

export type IndustryKey =
  | 'professional-services'
  | 'retail-ecommerce'
  | 'finance-insurance'
  | 'healthcare'
  | 'manufacturing'
  | 'construction-trades'
  | 'hospitality'
  | 'technology'
  | 'other';

export interface IndustryBenchmark {
  key: IndustryKey;
  label: string;
  /** Default share of working time spent on repetitive / automatable tasks. */
  automatablePct: number;
  /** Share of that automatable time AI realistically reclaims. */
  efficiencyGain: number;
  /** Conservative annual revenue uplift from AI-enabled capacity/speed/conversion. */
  revenueUpliftPct: number;
  /** Share of labour cost lost to errors & rework today. */
  reworkPct: number;
  /** Share of that rework that automation removes. */
  reworkReduction: number;
}

/**
 * Industry benchmarks. Kept conservative on purpose. `automatablePct` is only a
 * *default* slider position — the user can override it — whereas the other
 * factors are fixed per industry so the maths stays consistent.
 */
export const INDUSTRY_BENCHMARKS: Record<IndustryKey, IndustryBenchmark> = {
  'professional-services': {
    key: 'professional-services',
    label: 'Professional services (consulting, legal, accounting, agencies)',
    automatablePct: 0.3,
    efficiencyGain: 0.38,
    revenueUpliftPct: 0.04,
    reworkPct: 0.06,
    reworkReduction: 0.4,
  },
  'retail-ecommerce': {
    key: 'retail-ecommerce',
    label: 'Retail & e-commerce',
    automatablePct: 0.26,
    efficiencyGain: 0.34,
    revenueUpliftPct: 0.05,
    reworkPct: 0.05,
    reworkReduction: 0.38,
  },
  'finance-insurance': {
    key: 'finance-insurance',
    label: 'Finance & insurance',
    automatablePct: 0.32,
    efficiencyGain: 0.36,
    revenueUpliftPct: 0.03,
    reworkPct: 0.07,
    reworkReduction: 0.45,
  },
  healthcare: {
    key: 'healthcare',
    label: 'Healthcare & allied health',
    automatablePct: 0.24,
    efficiencyGain: 0.32,
    revenueUpliftPct: 0.03,
    reworkPct: 0.06,
    reworkReduction: 0.4,
  },
  manufacturing: {
    key: 'manufacturing',
    label: 'Manufacturing & logistics',
    automatablePct: 0.28,
    efficiencyGain: 0.33,
    revenueUpliftPct: 0.03,
    reworkPct: 0.07,
    reworkReduction: 0.42,
  },
  'construction-trades': {
    key: 'construction-trades',
    label: 'Construction & trades',
    automatablePct: 0.22,
    efficiencyGain: 0.3,
    revenueUpliftPct: 0.03,
    reworkPct: 0.06,
    reworkReduction: 0.38,
  },
  hospitality: {
    key: 'hospitality',
    label: 'Hospitality & tourism',
    automatablePct: 0.2,
    efficiencyGain: 0.3,
    revenueUpliftPct: 0.04,
    reworkPct: 0.05,
    reworkReduction: 0.35,
  },
  technology: {
    key: 'technology',
    label: 'Technology & SaaS',
    automatablePct: 0.3,
    efficiencyGain: 0.4,
    revenueUpliftPct: 0.05,
    reworkPct: 0.06,
    reworkReduction: 0.45,
  },
  other: {
    key: 'other',
    label: 'Other / mixed',
    automatablePct: 0.25,
    efficiencyGain: 0.33,
    revenueUpliftPct: 0.035,
    reworkPct: 0.05,
    reworkReduction: 0.38,
  },
};

// ── Model constants ──────────────────────────────────────────────────────────

/** Productive working hours per FTE per year (after leave, admin, downtime). */
export const PRODUCTIVE_HOURS_PER_YEAR = 1800;
/** We only count this share of the theoretical value — not everything lands. */
export const REALISATION_FACTOR = 0.7;
/** Net haircut for tooling, delivery and internal change-management effort. */
export const IMPLEMENTATION_COST_FRACTION = 0.2;
/** Competitive gap widens ~0.5%/month while you wait and rivals adopt. */
export const MONTHLY_EROSION_RATE = 0.005;
/** Months to ramp from go-live to full run-rate value. */
export const RAMP_MONTHS = 4;
/** Average working days per month. */
export const WORKING_DAYS_PER_MONTH = 21;
/** Horizon for the cumulative projection chart, in months. */
export const PROJECTION_MONTHS = 60;
/** Sensible default for a fully-loaded annual salary (AUD). */
export const DEFAULT_LOADED_SALARY = 95000;

export const DELAY_OPTIONS = [3, 6, 12, 24] as const;

export interface CalculatorInputs {
  annualRevenue: number;
  employees: number;
  avgSalary: number;
  /** 0..1 — share of working time on automatable tasks. */
  automatablePct: number;
  industry: IndustryKey;
  delayMonths: number;
}

export interface ProjectionPoint {
  month: number;
  /** Cumulative net value captured if you act now. */
  actNow: number;
  /** Cumulative net value captured if you delay. */
  delayed: number;
}

export interface CalculatorResult {
  // Annual gross levers
  productivityValue: number;
  revenueValue: number;
  reworkValue: number;
  grossAnnualValue: number;
  // Net of realisation + implementation cost
  netAnnualValue: number;
  netMonthlyValue: number;
  // Cost of delay
  costOfDelay: number;
  costPerWorkingDay: number;
  hoursReclaimedPerYear: number;
  // Five-year cumulative projection
  projection: ProjectionPoint[];
  fiveYearActNow: number;
  fiveYearDelayed: number;
  fiveYearGap: number;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function getBenchmark(industry: IndustryKey): IndustryBenchmark {
  return INDUSTRY_BENCHMARKS[industry] ?? INDUSTRY_BENCHMARKS.other;
}

/** Monthly value scaled by a linear adoption ramp. */
function rampedMonthly(monthly: number, monthIndex: number, ramp: number): number {
  const factor = ramp > 0 ? Math.min(1, monthIndex / ramp) : 1;
  return monthly * factor;
}

/**
 * Run the full Cost of Delay model. Pure and deterministic — safe to call on
 * every keystroke for a live-updating UI.
 */
export function calculate(inputs: CalculatorInputs): CalculatorResult {
  const benchmark = getBenchmark(inputs.industry);

  const employees = Math.max(0, inputs.employees || 0);
  const avgSalary = Math.max(0, inputs.avgSalary || 0);
  const revenue = Math.max(0, inputs.annualRevenue || 0);
  const automatable = clamp(inputs.automatablePct, 0, 0.9);
  const delayMonths = Math.max(0, Math.round(inputs.delayMonths || 0));

  const laborBase = employees * avgSalary;

  // Lever 1 — productivity reclaimed on automatable work.
  const productivityValue = laborBase * automatable * benchmark.efficiencyGain;
  // Lever 2 — revenue uplift from freed capacity / faster response / conversion.
  const revenueValue = revenue * benchmark.revenueUpliftPct;
  // Lever 3 — reduced errors & rework.
  const reworkValue = laborBase * benchmark.reworkPct * benchmark.reworkReduction;

  const grossAnnualValue = productivityValue + revenueValue + reworkValue;

  // Conservative net: take a realisation haircut, then net implementation cost.
  const netAnnualValue =
    grossAnnualValue * REALISATION_FACTOR * (1 - IMPLEMENTATION_COST_FRACTION);
  const netMonthlyValue = netAnnualValue / 12;

  // Cost of delay — cumulative net benefit forgone across the delay window,
  // amplified slightly each month as competitors pull ahead.
  let costOfDelay = 0;
  for (let m = 0; m < delayMonths; m++) {
    costOfDelay += netMonthlyValue * Math.pow(1 + MONTHLY_EROSION_RATE, m);
  }

  const costPerWorkingDay =
    delayMonths > 0 ? costOfDelay / (delayMonths * WORKING_DAYS_PER_MONTH) : 0;

  const hoursReclaimedPerYear =
    employees * PRODUCTIVE_HOURS_PER_YEAR * automatable * benchmark.efficiencyGain;

  // Five-year cumulative projection. "Delayed" starts accruing delayMonths
  // later, so it is permanently behind — the gap is the lasting cost.
  const projection: ProjectionPoint[] = [];
  let actNowCum = 0;
  let delayedCum = 0;
  for (let month = 1; month <= PROJECTION_MONTHS; month++) {
    actNowCum += rampedMonthly(netMonthlyValue, month, RAMP_MONTHS);
    const delayedMonth = month - delayMonths;
    delayedCum +=
      delayedMonth > 0 ? rampedMonthly(netMonthlyValue, delayedMonth, RAMP_MONTHS) : 0;
    projection.push({ month, actNow: actNowCum, delayed: delayedCum });
  }

  return {
    productivityValue,
    revenueValue,
    reworkValue,
    grossAnnualValue,
    netAnnualValue,
    netMonthlyValue,
    costOfDelay,
    costPerWorkingDay,
    hoursReclaimedPerYear,
    projection,
    fiveYearActNow: actNowCum,
    fiveYearDelayed: delayedCum,
    fiveYearGap: actNowCum - delayedCum,
  };
}

// ── Formatting helpers ───────────────────────────────────────────────────────

const AUD = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

/** Full currency, e.g. "$128,400". */
export function formatCurrency(value: number): string {
  return AUD.format(Math.round(value || 0));
}

/** Compact currency for big headline numbers, e.g. "$1.2M". */
export function formatCompact(value: number): string {
  const n = Math.round(value || 0);
  if (Math.abs(n) >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `$${Math.round(n / 1_000)}k`;
  }
  return `$${n}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-AU', { maximumFractionDigits: 0 }).format(
    Math.round(value || 0),
  );
}
