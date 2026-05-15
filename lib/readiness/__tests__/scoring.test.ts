/**
 * Tests for the scoring engine.
 *
 * Strategy: take the v5 demo's exact algorithm (lines 149–182 of
 * CreativeMilkReadiness_v5.jsx) and assert that lib/readiness/scoring.ts
 * produces identical pillar and overall scores for representative answer
 * sets. If any of these tests fail, the extraction has introduced a
 * regression and we cannot ship.
 *
 * Run with: `npx vitest` (or `pnpm test`) once vitest is wired into the
 * Next.js project. For now this file documents the expected behaviour and
 * the verification script in /tmp/verify_scoring.mjs proves the baseline.
 */

import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../questions';
import {
  SCORE_FLOOR,
  SCORE_CEILING,
  scoreAnswers,
  tierForPillarScore,
} from '../scoring';
import { PILLAR_KEYS } from '../types';

// Helpers -----------------------------------------------------------------

const allAnswers = (value: number) =>
  Object.fromEntries(QUESTIONS.map((q) => [q.id, value]));

// Tests -------------------------------------------------------------------

describe('scoreAnswers — reconciliation against v5 demo', () => {
  it('floor: every answer at level 0 still yields 25 across the board', () => {
    const r = scoreAnswers(allAnswers(0));
    expect(r.overallScore).toBe(SCORE_FLOOR);
    for (const p of PILLAR_KEYS) {
      expect(r.pillarScores[p]).toBe(SCORE_FLOOR);
    }
    expect(r.band.key).toBe('starting_out');
  });

  it('ceiling: every answer at level 3 yields 100 across the board', () => {
    const r = scoreAnswers(allAnswers(3));
    expect(r.overallScore).toBe(SCORE_CEILING);
    for (const p of PILLAR_KEYS) {
      expect(r.pillarScores[p]).toBe(SCORE_CEILING);
    }
    expect(r.band.key).toBe('ai_leader');
  });

  it('all answers at level 1: every pillar scores 50, overall 50', () => {
    const r = scoreAnswers(allAnswers(1));
    expect(r.overallScore).toBe(50);
    for (const p of PILLAR_KEYS) {
      expect(r.pillarScores[p]).toBe(50);
    }
    expect(r.band.key).toBe('foundational');
  });

  it('all answers at level 2: every pillar scores 75, overall 75', () => {
    const r = scoreAnswers(allAnswers(2));
    expect(r.overallScore).toBe(75);
    for (const p of PILLAR_KEYS) {
      expect(r.pillarScores[p]).toBe(75);
    }
    expect(r.band.key).toBe('ai_ready');
  });

  it('mixed profile: strategy strong, governance weak', () => {
    const answers = {
      q1: 3, q2: 3, q3: 3,
      q4: 1, q5: 1, q6: 1,
      q7: 2, q8: 2, q9: 2,
      q10: 2, q11: 2, q12: 2,
      q13: 0, q14: 0, q15: 0,
    };
    const r = scoreAnswers(answers);
    expect(r.pillarScores.strategy).toBe(100);
    expect(r.pillarScores.data).toBe(50);
    expect(r.pillarScores.culture).toBe(75);
    expect(r.pillarScores.technology).toBe(75);
    expect(r.pillarScores.governance).toBe(25);
    expect(r.overallScore).toBe(65); // mean of 100,50,75,75,25 = 65
    expect(r.band.key).toBe('developing');
  });

  it('representative foundational profile', () => {
    const answers = {
      q1: 1, q2: 2, q3: 1,
      q4: 1, q5: 2, q6: 1,
      q7: 2, q8: 2, q9: 1,
      q10: 2, q11: 1, q12: 1,
      q13: 0, q14: 1, q15: 1,
    };
    const r = scoreAnswers(answers);
    expect(r.pillarScores.strategy).toBe(58);
    expect(r.pillarScores.data).toBe(58);
    expect(r.pillarScores.culture).toBe(67);
    expect(r.pillarScores.technology).toBe(58);
    expect(r.pillarScores.governance).toBe(42);
    expect(r.overallScore).toBe(57);
    expect(r.band.key).toBe('developing'); // 57 falls in Developing (56–70)
  });
});

describe('scoreAnswers — derived fields', () => {
  it('overall is exactly the mean of pillar scores (rounded)', () => {
    // Edge: pillar scores 100, 50, 75, 75, 25 → mean 65
    const answers = {
      q1: 3, q2: 3, q3: 3,
      q4: 1, q5: 1, q6: 1,
      q7: 2, q8: 2, q9: 2,
      q10: 2, q11: 2, q12: 2,
      q13: 0, q14: 0, q15: 0,
    };
    const r = scoreAnswers(answers);
    const mean =
      Math.round(
        (r.pillarScores.strategy +
          r.pillarScores.data +
          r.pillarScores.culture +
          r.pillarScores.technology +
          r.pillarScores.governance) /
          5
      );
    expect(r.overallScore).toBe(mean);
  });

  it('focusAreas are the 3 lowest pillars, ordered ascending', () => {
    const answers = {
      q1: 3, q2: 3, q3: 3,        // strategy: 100
      q4: 1, q5: 1, q6: 1,        // data: 50
      q7: 2, q8: 2, q9: 2,        // culture: 75
      q10: 2, q11: 2, q12: 2,     // tech: 75
      q13: 0, q14: 0, q15: 0,     // governance: 25
    };
    const r = scoreAnswers(answers);
    // Lowest 3: governance(25), data(50), then a tie between culture and tech
    expect(r.focusAreas[0]).toBe('governance');
    expect(r.focusAreas[1]).toBe('data');
    // Tie-break by stable PILLAR_KEYS order: culture comes before technology
    expect(r.focusAreas[2]).toBe('culture');
  });

  it('strongestPillar is the single highest', () => {
    const answers = {
      q1: 3, q2: 3, q3: 3,
      q4: 1, q5: 1, q6: 1,
      q7: 2, q8: 2, q9: 2,
      q10: 2, q11: 2, q12: 2,
      q13: 0, q14: 0, q15: 0,
    };
    const r = scoreAnswers(answers);
    expect(r.strongestPillar).toBe('strategy');
  });

  it('pillarTiers reflect TIER_DEEP_GAP_MAX / TIER_MODERATE_GAP_MAX thresholds', () => {
    expect(tierForPillarScore(25)).toBe('deep_gap');
    expect(tierForPillarScore(45)).toBe('deep_gap');
    expect(tierForPillarScore(46)).toBe('moderate_gap');
    expect(tierForPillarScore(70)).toBe('moderate_gap');
    expect(tierForPillarScore(71)).toBe('strong');
    expect(tierForPillarScore(100)).toBe('strong');
  });
});

describe('scoreAnswers — weakness patterns', () => {
  it('identifies q1_low (first question in pillar) when uniquely lowest', () => {
    // Data pillar: q4=0, q5=2, q6=2 → q1_low (q4 is position 1 in data pillar)
    const answers = {
      q1: 2, q2: 2, q3: 2,
      q4: 0, q5: 2, q6: 2,
      q7: 2, q8: 2, q9: 2,
      q10: 2, q11: 2, q12: 2,
      q13: 2, q14: 2, q15: 2,
    };
    const r = scoreAnswers(answers);
    expect(r.weaknessPatterns.data).toBe('q1_low');
  });

  it('identifies q3_low when last question in pillar is uniquely lowest', () => {
    // Governance: q13=2, q14=2, q15=0 → q3_low
    const answers = {
      q1: 2, q2: 2, q3: 2,
      q4: 2, q5: 2, q6: 2,
      q7: 2, q8: 2, q9: 2,
      q10: 2, q11: 2, q12: 2,
      q13: 2, q14: 2, q15: 0,
    };
    const r = scoreAnswers(answers);
    expect(r.weaknessPatterns.governance).toBe('q3_low');
  });

  it('returns composite when multiple questions tied at floor', () => {
    // Strategy: q1=0, q2=0, q3=2 → composite (q1 and q2 tied)
    const answers = {
      q1: 0, q2: 0, q3: 2,
      q4: 2, q5: 2, q6: 2,
      q7: 2, q8: 2, q9: 2,
      q10: 2, q11: 2, q12: 2,
      q13: 2, q14: 2, q15: 2,
    };
    const r = scoreAnswers(answers);
    expect(r.weaknessPatterns.strategy).toBe('composite');
  });

  it('returns composite when all questions in a pillar are doing well', () => {
    // Culture all at 2 or above → no single weak spot → composite
    const answers = {
      q1: 1, q2: 1, q3: 1,
      q4: 1, q5: 1, q6: 1,
      q7: 2, q8: 3, q9: 3,
      q10: 1, q11: 1, q12: 1,
      q13: 1, q14: 1, q15: 1,
    };
    const r = scoreAnswers(answers);
    expect(r.weaknessPatterns.culture).toBe('composite');
  });
});

describe('scoreAnswers — input validation', () => {
  it('throws if any answer is missing', () => {
    const partial = { ...allAnswers(2) };
    delete (partial as Record<string, number>)['q5'];
    expect(() => scoreAnswers(partial)).toThrow(/Missing.*q5/);
  });

  it('throws if any answer is out of range', () => {
    const bad = { ...allAnswers(2), q3: 5 };
    expect(() => scoreAnswers(bad)).toThrow(/Invalid answer for q3/);
  });

  it('throws if any answer is not an integer', () => {
    const bad = { ...allAnswers(2), q7: 1.5 };
    expect(() => scoreAnswers(bad)).toThrow(/Invalid answer for q7/);
  });

  it('throws if any answer is negative', () => {
    const bad = { ...allAnswers(2), q10: -1 };
    expect(() => scoreAnswers(bad)).toThrow(/Invalid answer for q10/);
  });
});
