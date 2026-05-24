/**
 * Creative Milk -- AI Readiness scoring engine.
 *
 * Pure function. Given a complete set of answers, produces the full
 * AssessmentResult -- overall score, pillar scores, tiers, band, focus areas,
 * strongest pillar, and per-pillar weakness patterns. Everything downstream
 * (result page, playbook composer, email) is driven from this output.
 *
 * Scoring is identical to v5 demo by design -- see scoring.test.ts for the
 * reconciliation cases.
 *
 * Constants:
 *   FLOOR = 25      -- minimum possible score on any pillar or overall
 *   CEILING = 100   -- maximum
 *
 *   Raw answer values are (optionIndex + 1), so each question contributes
 *   1–4 points. With 3 questions per pillar, raw pillar totals run 3–12.
 *   We normalise to 0–1, then scale to FLOOR–CEILING.
 *
 *   Overall score = mean of the five pillar scores (rounded). This guarantees
 *   the pillar bars and the headline number always reconcile.
 */

import type {
  Answers,
  AssessmentResult,
  PillarKey,
  PillarScores,
  PillarTier,
  PillarTiers,
  WeaknessPattern,
  WeaknessPatterns,
} from './types';
import { PILLAR_KEYS } from './types';
import { QUESTIONS, QUESTIONS_BY_PILLAR } from './questions';
import { bandForScore } from './bands';

export const SCORE_FLOOR = 25;
export const SCORE_CEILING = 100;

/**
 * Tier thresholds for the pillar map (page 3 of the playbook).
 *
 * Deep gap: 25–45 -- substantial work needed, this is a focus area
 * Moderate gap: 46–70 -- basics in place, room to grow
 * Strong: 71–100 -- solid, protect and extend
 *
 * These align with the band thresholds without being identical -- band is
 * about the whole business, tier is about an individual pillar.
 */
export const TIER_DEEP_GAP_MAX = 45;
export const TIER_MODERATE_GAP_MAX = 70;

/**
 * Classify a pillar score into a tier.
 */
export function tierForPillarScore(score: number): PillarTier {
  if (score <= TIER_DEEP_GAP_MAX) return 'deep_gap';
  if (score <= TIER_MODERATE_GAP_MAX) return 'moderate_gap';
  return 'strong';
}

/**
 * Validate a set of answers is complete and well-formed for scoring.
 * Throws if invalid -- callers should catch and convert to a 400 response.
 */
export function validateAnswers(answers: Answers): void {
  for (const q of QUESTIONS) {
    const v = answers[q.id];
    if (typeof v !== 'number') {
      throw new Error(`Missing or non-numeric answer for ${q.id}`);
    }
    if (!Number.isInteger(v) || v < 0 || v > 3) {
      throw new Error(`Invalid answer for ${q.id}: ${v} (must be integer 0–3)`);
    }
  }
}

/**
 * Determine which of a pillar's 3 questions drove the lowest score.
 *
 * v1.0 logic: returns one of 'q1_low' | 'q2_low' | 'q3_low' | 'composite'.
 * See WeaknessPattern in types.ts for the documented v1.1 expansion path
 * (adds pair patterns q1q2_low, q1q3_low, q2q3_low).
 *
 * Returns:
 *   'q1_low' -- the first question in this pillar scored lowest (and is the
 *               unique low)
 *   'q2_low' -- second question scored lowest
 *   'q3_low' -- third question scored lowest
 *   'composite' -- multiple questions tied at the lowest score, or every
 *                  question is at level 2+ (no meaningful weak spot)
 *
 * Note: q1/q2/q3 here refers to the position within the pillar (1st, 2nd, 3rd
 * question of this pillar), not the global q1–q15 ids. So for Data, q1_low
 * means q4 was lowest; for Culture, q1_low means q7 was lowest.
 */
function classifyWeaknessPattern(
  pillar: PillarKey,
  answers: Answers
): WeaknessPattern {
  const questionIds = QUESTIONS_BY_PILLAR[pillar];
  const values = questionIds.map((id) => answers[id]);
  const minValue = Math.min(...values);

  // If the minimum is 2 or 3 (i.e. the reader is doing well across this
  // pillar), classify as composite -- there's no single weak spot to anchor
  // the focus-area copy on. In practice this is rare because we only generate
  // focus-area pages for the lowest 3 pillars, which by definition are weak.
  if (minValue >= 2) return 'composite';

  // Count how many questions hit the minimum
  const tiedAtMin = values.filter((v) => v === minValue).length;

  // v1.0: 2+ tied → composite. v1.1 will branch here to return pair patterns
  // when tiedAtMin === 2. See WeaknessPattern docs in types.ts for the spec.
  if (tiedAtMin >= 2) return 'composite';

  // Unique minimum -- identify which question position it was in
  const minIndex = values.indexOf(minValue);
  return (`q${minIndex + 1}_low`) as WeaknessPattern;
}

/**
 * Order pillars by their score, ascending. Stable ordering when tied:
 * pillars earlier in PILLAR_KEYS come first. The first 3 entries are the
 * focus areas; the last is the strongest pillar.
 */
function orderPillarsAscending(scores: PillarScores): PillarKey[] {
  return [...PILLAR_KEYS].sort((a, b) => {
    if (scores[a] !== scores[b]) return scores[a] - scores[b];
    // tie-break by stable PILLAR_KEYS order
    return PILLAR_KEYS.indexOf(a) - PILLAR_KEYS.indexOf(b);
  });
}

/**
 * Score a complete set of answers.
 *
 * Throws if `answers` is missing or malformed.
 */
export function scoreAnswers(answers: Answers): AssessmentResult {
  validateAnswers(answers);

  // Per-pillar raw totals (3–12)
  const pillarRaw: Record<PillarKey, number> = {
    strategy: 0,
    data: 0,
    culture: 0,
    technology: 0,
    governance: 0,
  };
  const pillarCount: Record<PillarKey, number> = {
    strategy: 0,
    data: 0,
    culture: 0,
    technology: 0,
    governance: 0,
  };

  for (const q of QUESTIONS) {
    const ans = answers[q.id];
    pillarRaw[q.pillar] += ans + 1; // 0–3 → 1–4
    pillarCount[q.pillar] += 1;
  }

  // Normalise to 25–100 per pillar
  const pillarScores: PillarScores = {} as PillarScores;
  for (const p of PILLAR_KEYS) {
    const minRaw = pillarCount[p] * 1;
    const maxRaw = pillarCount[p] * 4;
    const normalised =
      pillarCount[p] === 0 ? 0 : (pillarRaw[p] - minRaw) / (maxRaw - minRaw);
    pillarScores[p] = Math.round(
      SCORE_FLOOR + normalised * (SCORE_CEILING - SCORE_FLOOR)
    );
  }

  // Overall = mean of pillar scores (rounded). Guarantees reconciliation.
  const pillarValues = Object.values(pillarScores);
  const overallScore = Math.round(
    pillarValues.reduce((a, b) => a + b, 0) / pillarValues.length
  );

  // Tiers per pillar
  const pillarTiers: PillarTiers = {} as PillarTiers;
  for (const p of PILLAR_KEYS) {
    pillarTiers[p] = tierForPillarScore(pillarScores[p]);
  }

  // Focus areas = 3 lowest pillars; strongest = highest pillar
  const ordered = orderPillarsAscending(pillarScores);
  const focusAreas = ordered.slice(0, 3);
  const strongestPillar = ordered[ordered.length - 1];

  // Per-pillar weakness patterns
  const weaknessPatterns: WeaknessPatterns = {} as WeaknessPatterns;
  for (const p of PILLAR_KEYS) {
    weaknessPatterns[p] = classifyWeaknessPattern(p, answers);
  }

  return {
    overallScore,
    pillarScores,
    pillarTiers,
    band: bandForScore(overallScore),
    focusAreas,
    strongestPillar,
    weaknessPatterns,
  };
}
