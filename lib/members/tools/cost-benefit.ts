/**
 * Evaluation engine for the Automation Cost-Benefit Workbench. Pure and
 * deterministic, same conventions as the other tool engines: 46 working
 * weeks a year. First-year view includes setup cost; payback is months
 * of net monthly saving needed to recoup setup.
 */

const WORKING_WEEKS = 46;

export interface Scenario {
  id: string;
  name: string;
  setupCost: number;
  monthlyCost: number;
  hoursSavedPerWeek: number;
  hourlyValue: number;
}

export interface ScenarioResult extends Scenario {
  annualSaving: number;
  annualRunningCost: number;
  firstYearNet: number;
  ongoingYearNet: number;
  paybackMonths: number | null;
  verdict: string;
}

export function evaluateScenario(s: Scenario): ScenarioResult {
  const annualSaving = Math.round(s.hoursSavedPerWeek * s.hourlyValue * WORKING_WEEKS);
  const annualRunningCost = Math.round(s.monthlyCost * 12);
  const firstYearNet = annualSaving - annualRunningCost - s.setupCost;
  const ongoingYearNet = annualSaving - annualRunningCost;

  const monthlyNet = (annualSaving - annualRunningCost) / 12;
  const paybackMonths =
    s.setupCost <= 0
      ? 0
      : monthlyNet > 0
        ? Math.ceil(s.setupCost / monthlyNet)
        : null;

  const verdict =
    paybackMonths === null
      ? "Never pays back at these numbers — the running cost eats the saving."
      : paybackMonths <= 3
        ? "Strong: pays for itself within a quarter."
        : paybackMonths <= 12
          ? "Solid: pays back inside the first year."
          : "Slow: only worth it if the strategic upside outweighs the wait.";

  return {
    ...s,
    annualSaving,
    annualRunningCost,
    firstYearNet,
    ongoingYearNet,
    paybackMonths,
    verdict,
  };
}

/** Evaluate and rank scenarios, best first-year net first. */
export function evaluateScenarios(scenarios: Scenario[]): ScenarioResult[] {
  return scenarios
    .map(evaluateScenario)
    .sort((a, b) => b.firstYearNet - a.firstYearNet);
}
