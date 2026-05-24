/**
 * Creative Milk -- AI Readiness Assessment types
 *
 * These types are the contract between the assessment UI, the scoring engine,
 * the playbook composition engine, and persistence (Supabase). Changing any of
 * these shapes ripples through the whole tool -- change deliberately.
 */

// ── Pillars ──────────────────────────────────────────────────────────────────

export const PILLAR_KEYS = [
  'strategy',
  'data',
  'culture',
  'technology',
  'governance',
] as const;

export type PillarKey = (typeof PILLAR_KEYS)[number];

export interface Pillar {
  id: PillarKey;
  label: string;
  shortLabel: string;
  description: string;
}

// ── Questions ────────────────────────────────────────────────────────────────

/**
 * A single assessment question. Each question has 4 options indexed 0–3.
 * The raw score for an answer is (optionIndex + 1), giving a 1–4 scale per
 * question. See scoring.ts for how raw scores roll up to pillar scores.
 */
export interface Question {
  id: string;            // e.g. 'q1'
  pillar: PillarKey;
  text: string;
  options: [string, string, string, string];  // exactly 4
}

/**
 * The reader's answer set. Keys are question ids; values are the option index
 * they selected (0–3). A partial set is allowed during the assessment flow;
 * scoring requires all 15 to be present.
 */
export type Answers = Record<string, number>;

// ── Bands ────────────────────────────────────────────────────────────────────

export const BAND_KEYS = [
  'starting_out',
  'foundational',
  'developing',
  'ai_ready',
  'ai_leader',
] as const;

export type BandKey = (typeof BAND_KEYS)[number];

export interface Band {
  key: BandKey;
  label: string;
  min: number;        // inclusive
  max: number;        // inclusive
  description: string; // shown on result page; playbook uses fuller copy from content library
}

// ── Scoring output ───────────────────────────────────────────────────────────

export type PillarScores = Record<PillarKey, number>;

/**
 * Severity tier for a pillar. Drives which diagnostic copy gets shown on
 * page 3 of the playbook (the pillar map) and influences focus-area copy.
 *
 * Note: pillar scores can never go below 25 due to the 25-point floor in
 * scoring. 'deep_gap' covers the realistic floor up to 45.
 */
export type PillarTier = 'deep_gap' | 'moderate_gap' | 'strong';

export type PillarTiers = Record<PillarKey, PillarTier>;

/**
 * Within a pillar, which of its 3 questions scored lowest. Drives sub-selection
 * of focus-area content (the "what you're getting wrong" variants).
 *
 * 'composite' means multiple questions tied at the lowest score -- the reader
 * is across-the-board weak on this pillar, gets the composite variant.
 *
 * ─── v1.1 EXPANSION PATH ────────────────────────────────────────────────
 *
 * v1.0 ships with 4 patterns: q1_low, q2_low, q3_low, composite.
 * v1.1 will add 3 pair patterns (when exactly 2 of 3 questions are tied at the
 * minimum): q1q2_low, q1q3_low, q2q3_low.
 *
 * To enable in v1.1:
 *   1. Add the three pair keys to this union type.
 *   2. In scoring.ts → classifyWeaknessPattern(), replace the "tiedAtMin >= 2"
 *      composite shortcut with branching:
 *        - tiedAtMin === 3                    → 'composite'
 *        - tiedAtMin === 2 (questions A, B)   → `q${A+1}q${B+1}_low`
 *        - tiedAtMin === 1                    → existing single-pattern logic
 *   3. Write pair-variant content for the 2–3 most commonly observed pairs
 *      per pillar (driven by real reader data once the tool has been live
 *      long enough to surface patterns -- likely 50+ completions).
 *   4. Update the composer's content lookup to handle the new keys with
 *      graceful fallback to 'composite' when a specific pair variant
 *      hasn't been written yet. This means we can ship pair variants
 *      pillar-by-pillar without breaking the system.
 *   5. Bump CONTENT_SCHEMA_VERSION in lib/readiness/content/index.ts.
 *
 * Until then: callers must treat any "two questions tied at floor" case as
 * 'composite'. Persisting the weakness pattern in the database means we can
 * retroactively classify older assessments once v1.1 logic ships.
 * ────────────────────────────────────────────────────────────────────────
 */
export type WeaknessPattern = 'q1_low' | 'q2_low' | 'q3_low' | 'composite';

/**
 * Per-pillar weakness pattern. Keyed by pillar; value identifies which of
 * that pillar's 3 questions drove the lowest score, or 'composite' if all
 * three are low.
 */
export type WeaknessPatterns = Record<PillarKey, WeaknessPattern>;

/**
 * The full result of scoring a complete answer set. This is what gets
 * persisted to readiness_assessments.* and consumed by the result page,
 * the email, and the playbook composer.
 */
export interface AssessmentResult {
  overallScore: number;          // 25–100
  pillarScores: PillarScores;    // each 25–100
  pillarTiers: PillarTiers;      // derived from pillarScores
  band: Band;                    // derived from overallScore
  focusAreas: PillarKey[];       // length 3, ordered lowest-first
  strongestPillar: PillarKey;    // highest-scoring pillar (for traps page)
  weaknessPatterns: WeaknessPatterns; // per-pillar weakness sub-selection
}
