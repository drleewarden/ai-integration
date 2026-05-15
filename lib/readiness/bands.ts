/**
 * Creative Milk — AI Readiness score bands.
 *
 * Score thresholds and short band descriptions used on the result page.
 * Longer band-level copy (page 2 "honest read" of the playbook, etc.) lives
 * in the playbook content library, not here.
 *
 * Bands and thresholds are LOCKED. Don't tweak without re-validating the
 * scoring against the v5 demo's known answer sets.
 */

import type { Band, BandKey } from './types';

export const BANDS: readonly Band[] = [
  {
    key: 'starting_out',
    label: 'Starting Out',
    min: 0,
    max: 35,
    description:
      'You\u2019re at the beginning. That\u2019s a position, not a verdict — and it\u2019s the position with the most upside if you act on it.',
  },
  {
    key: 'foundational',
    label: 'Foundational',
    min: 36,
    max: 55,
    description:
      'You have working knowledge but no system. The next move is converting scattered AI usage into a deliberate operating approach.',
  },
  {
    key: 'developing',
    label: 'Developing',
    min: 56,
    max: 70,
    description:
      'You\u2019re past the basics. Your gap now is operationalising what you know across the rest of your team and your day-to-day workflow.',
  },
  {
    key: 'ai_ready',
    label: 'AI Ready',
    min: 71,
    max: 85,
    description:
      'Strong fundamentals. The leverage now is scale — turning individual capability into team capability and codifying what works.',
  },
  {
    key: 'ai_leader',
    label: 'AI Leader',
    min: 86,
    max: 100,
    description:
      'You\u2019re operating at a level most businesses aspire to. Focus on governance maturity, measurement, and enabling others.',
  },
] as const;

/**
 * Return the band containing the given score.
 *
 * Scores are clamped to the bands' range — anything below 0 falls into
 * Starting Out, anything above 100 falls into AI Leader. In practice the
 * scoring engine enforces a 25–100 range, so the clamp is belt-and-braces.
 */
export function bandForScore(score: number): Band {
  for (const band of BANDS) {
    if (score >= band.min && score <= band.max) {
      return band;
    }
  }
  // Should be unreachable for valid inputs; fall back to nearest extreme.
  return score < BANDS[0].min ? BANDS[0] : BANDS[BANDS.length - 1];
}

/**
 * Lookup band by key.
 */
export function bandByKey(key: BandKey): Band {
  const found = BANDS.find((b) => b.key === key);
  if (!found) throw new Error(`Unknown band key: ${key}`);
  return found;
}
