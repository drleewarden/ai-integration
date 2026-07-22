/**
 * Shared contract for the config-driven business audits. Each audit is a
 * plain config object: questions in, pure score() out. Keeping score()
 * free of React/I-O means every model is directly unit-testable and the
 * single AuditTool component can render all of them.
 */

export interface AuditQuestion {
  id: string;
  label: string;
  kind: "slider" | "select";
  /** slider only */
  min?: number;
  max?: number;
  step?: number;
  /** Rendered before slider values, e.g. "$". */
  prefix?: string;
  /** Slider value, or option index for selects. */
  defaultValue: number;
  /** select only */
  options?: string[];
}

export type AuditBand = "low" | "medium" | "high";

export interface AuditResult {
  /** Pre-formatted headline figure, e.g. "$3,400" or "66/100". */
  headlineValue: string;
  headlineLabel: string;
  band: AuditBand;
  verdict: string;
  /** One-sentence statement of the model's constants, shown as fine print. */
  assumptions: string;
}

export interface AuditConfig {
  slug: string;
  intro: string;
  questions: AuditQuestion[];
  score(answers: Record<string, number>): AuditResult;
  remediation: { copy: string; slug: string; isPro: boolean };
}

export function formatAud(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function defaultAnswers(config: AuditConfig): Record<string, number> {
  return Object.fromEntries(
    config.questions.map((q) => [q.id, q.defaultValue]),
  );
}
