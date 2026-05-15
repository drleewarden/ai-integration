/**
 * Creative Milk — Playbook composer.
 *
 * Pure function. Given an AssessmentResult and a CompositionContext, returns
 * a PlaybookComposition: a complete description of every content block the
 * PDF needs, with deterministic content-library keys.
 *
 * Determinism: same inputs always produce the same composition. No
 * randomness. No LLM calls. Fully reproducible — we can regenerate any
 * historical playbook by re-running the composer with the original answers.
 *
 * Where personalisation comes from:
 *   - Band (overall score) drives: honest read, path framing, CTA, traps mix
 *   - Pillar tier (per-pillar score) drives: pillar map diagnostics
 *   - Weakness pattern (within-pillar answers) drives: focus area variants,
 *     starting kit actions, tomorrow morning callout
 *   - Strongest pillar drives: half of the traps
 *
 * See the playbook outline doc for the full personalisation spec.
 */

import type { AssessmentResult, BandKey, PillarKey } from './types';
import type {
  CompositionContext,
  FocusAreaComposition,
  PlaybookComposition,
  StartingKitComposition,
} from './composer-types';
import { PILLAR_KEYS } from './types';

/**
 * Schema version for the composition shape. Bump when the structure of
 * PlaybookComposition or content-key format changes in a breaking way.
 * Persisted alongside the composition for forward-compatibility.
 */
export const COMPOSITION_SCHEMA_VERSION = 1;

// ── Helpers ───────────────────────────────────────────────────────────────

/** Map a band key to the "scale tier" used by focus-area "good at scale" copy. */
function scaleTierForBand(band: BandKey): 'early' | 'mid' | 'late' {
  switch (band) {
    case 'starting_out':
    case 'foundational':
      return 'early';
    case 'developing':
      return 'mid';
    case 'ai_ready':
    case 'ai_leader':
      return 'late';
  }
}

/** Pillars whose focus-area page uses the productivity-framed cited claim. */
const PRODUCTIVITY_PILLARS: ReadonlySet<PillarKey> = new Set([
  'strategy',
  'data',
  'culture',
  'technology',
]);

/** Which cited claim key to use on a focus area page. */
function citedClaimKeyForPillar(pillar: PillarKey): string {
  return PRODUCTIVITY_PILLARS.has(pillar)
    ? 'cited:productivity'
    : 'cited:governance';
}

/**
 * Build the share text used on page 11.
 * Voice: matches brand mini-doc — direct, specific, no exclamation marks.
 */
function buildShareText(score: number, url: string): string {
  return `Just did the Creative Milk AI Readiness assessment. We scored ${score}/100. Worth a read — ${url}`;
}

// ── Page composers ────────────────────────────────────────────────────────

function composeCover(
  result: AssessmentResult,
  ctx: CompositionContext,
  generatedAtIso: string
) {
  return {
    scoreNumber: result.overallScore,
    bandLabel: result.band.label,
    bandKey: result.band.key,
    generatedAtIso,
    readerName: ctx.readerName,
    companyName: ctx.companyName,
  };
}

function composeHonestRead(result: AssessmentResult) {
  // Tomorrow morning callout: pulled from the reader's WEAKEST pillar
  // (focusAreas[0]), using its weakness pattern.
  const weakestPillar = result.focusAreas[0];
  const pattern = result.weaknessPatterns[weakestPillar];

  return {
    honestReadKey: `honest_read:${result.band.key}`,
    tomorrowMorningKey: `tomorrow:${weakestPillar}:${pattern}`,
    benchmarkText: undefined, // reserved for v1.1
  };
}

function composePillarMap(result: AssessmentResult): PlaybookComposition['pillarMap'] {
  const diagnostics = {} as PlaybookComposition['pillarMap']['diagnostics'];
  for (const p of PILLAR_KEYS) {
    diagnostics[p] = {
      score: result.pillarScores[p],
      tier: result.pillarTiers[p],
      contentKey: `pillar_diag:${p}:${result.pillarTiers[p]}`,
    };
  }
  return { diagnostics };
}

function composeFocusAreas(result: AssessmentResult): FocusAreaComposition[] {
  const scaleTier = scaleTierForBand(result.band.key);
  return result.focusAreas.map((pillar) => {
    const pattern = result.weaknessPatterns[pillar];
    return {
      pillar,
      pillarScore: result.pillarScores[pillar],
      pillarTier: result.pillarTiers[pillar],
      weaknessPattern: pattern,
      whatWrongKey:    `focus:${pillar}:wrong:${pattern}`,
      minimumFixKey:   `focus:${pillar}:fix:${pattern}`,
      goodAtScaleKey:  `focus:${pillar}:scale:${scaleTier}`,
      citedClaimKey:   citedClaimKeyForPillar(pillar),
    };
  });
}

/**
 * Starting kit: weeks 1–3 anchored to the 3 focus areas (lowest pillars
 * first), weeks 3–4 anchored to the 2 strongest pillars (lighter touch).
 *
 * Note that weeks 3 has TWO actions in our spec — we resolve this by
 * giving week 3 the third focus area and week 4 the two strongest pillars
 * as a paired "reinforce" action. Adjusting to the cleanest weekly layout:
 *   W1 = focus area #1 (lowest)
 *   W2 = focus area #2
 *   W3 = focus area #3
 *   W4 = strongest pillar (lighter touch)
 *
 * This gives 4 weeks, 4 actions, each from a distinct pillar (3 focus +
 * 1 strongest). The 5th pillar (the "second strongest") doesn't get a
 * dedicated week to avoid overloading; its action is rolled into the
 * playbook closing on page 11. We keep 4 weeks to stay disciplined.
 *
 * If you prefer 5 actions across 4 weeks (W3 doubles up), say the word
 * and I'll switch to that layout — the keys are independent of the
 * week layout.
 */
function composeStartingKit(result: AssessmentResult): StartingKitComposition {
  const weeks: StartingKitComposition['weeks'] = [
    {
      weekNumber: 1,
      pillar: result.focusAreas[0],
      contentKey: `kit:${result.focusAreas[0]}:${result.weaknessPatterns[result.focusAreas[0]]}`,
      isPrimary: true,
    },
    {
      weekNumber: 2,
      pillar: result.focusAreas[1],
      contentKey: `kit:${result.focusAreas[1]}:${result.weaknessPatterns[result.focusAreas[1]]}`,
      isPrimary: true,
    },
    {
      weekNumber: 3,
      pillar: result.focusAreas[2],
      contentKey: `kit:${result.focusAreas[2]}:${result.weaknessPatterns[result.focusAreas[2]]}`,
      isPrimary: true,
    },
    {
      weekNumber: 4,
      pillar: result.strongestPillar,
      // For strongest pillar we use a "reinforce" variant rather than a
      // pattern-specific one — they're doing well, the action is about
      // protecting and extending, not fixing.
      contentKey: `kit:${result.strongestPillar}:reinforce`,
      isPrimary: false,
    },
  ];
  return { weeks };
}

function composeTraps(result: AssessmentResult) {
  return {
    bandKey: result.band.key,
    strongestPillar: result.strongestPillar,
    // Composer doesn't pick the trap keys directly — the content library
    // exposes a function that picks 2 from the band library and 2 from the
    // strongest-pillar library, with deduplication. This keeps the composer
    // pure of content concerns. Stored here is the *selection input*; the
    // actual key resolution happens at render time against the library.
    trapKeys: [
      `trap:band:${result.band.key}:0`,
      `trap:band:${result.band.key}:1`,
      `trap:pillar:${result.strongestPillar}:0`,
      `trap:pillar:${result.strongestPillar}:1`,
    ],
  };
}

function composePathFraming(result: AssessmentResult) {
  return {
    selfImplementKey: `path:${result.band.key}:self`,
    hireInternalKey:  `path:${result.band.key}:hire`,
    bringPartnerKey:  `path:${result.band.key}:partner`,
  };
}

function composeAbout() {
  return { aboutKey: 'about:creative_milk' as const };
}

function composeNextStep(
  result: AssessmentResult,
  ctx: CompositionContext
) {
  const resultUrl = ctx.resultUrl ?? '';
  return {
    ctaKey: `cta:${result.band.key}`,
    shareMechanism: {
      shareText: buildShareText(result.overallScore, resultUrl),
      shareUrl: resultUrl,
    },
  };
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Compose a playbook from an assessment result.
 *
 * @param result - the scored assessment
 * @param ctx    - reader/company name, share URL, etc.
 * @returns      a deterministic, fully-keyed composition ready for the PDF
 *               template to render against the content library.
 */
export function composePlaybook(
  result: AssessmentResult,
  ctx: CompositionContext = {}
): PlaybookComposition {
  const generatedAt = ctx.generatedAt ?? new Date();
  const generatedAtIso = generatedAt.toISOString();

  return {
    schemaVersion: COMPOSITION_SCHEMA_VERSION,
    generatedAtIso,
    assessmentId: ctx.assessmentId,

    cover: composeCover(result, ctx, generatedAtIso),
    honestRead: composeHonestRead(result),
    pillarMap: composePillarMap(result),
    focusAreas: composeFocusAreas(result),
    startingKit: composeStartingKit(result),
    traps: composeTraps(result),
    pathFraming: composePathFraming(result),
    about: composeAbout(),
    nextStep: composeNextStep(result, ctx),
  };
}

/**
 * Enumerate every content key referenced by a composition. Useful for
 * library completeness checks: at content-writing time, we can verify that
 * every key the composer can possibly emit has a written entry.
 */
export function keysReferencedBy(composition: PlaybookComposition): string[] {
  const keys: string[] = [];
  keys.push(composition.honestRead.honestReadKey);
  keys.push(composition.honestRead.tomorrowMorningKey);
  for (const p of PILLAR_KEYS) {
    keys.push(composition.pillarMap.diagnostics[p].contentKey);
  }
  for (const fa of composition.focusAreas) {
    keys.push(fa.whatWrongKey, fa.minimumFixKey, fa.goodAtScaleKey, fa.citedClaimKey);
  }
  for (const w of composition.startingKit.weeks) {
    keys.push(w.contentKey);
  }
  keys.push(...composition.traps.trapKeys);
  keys.push(
    composition.pathFraming.selfImplementKey,
    composition.pathFraming.hireInternalKey,
    composition.pathFraming.bringPartnerKey
  );
  keys.push(composition.about.aboutKey);
  keys.push(composition.nextStep.ctaKey);
  return keys;
}
