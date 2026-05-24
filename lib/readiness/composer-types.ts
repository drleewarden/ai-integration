/**
 * Creative Milk -- Playbook composer types.
 *
 * The composer takes an AssessmentResult and produces a PlaybookComposition:
 * a flat, structured description of every content slot in the playbook and
 * which key to look up in the content library for each.
 *
 * The PDF template (built with @react-pdf/renderer) reads this composition
 * and the content library, and renders the PDF. The composer and the
 * template are decoupled -- the composer doesn't care how the PDF is
 * rendered; the template doesn't care how the keys were chosen.
 *
 * Content keys are deterministic strings. Same inputs → same composition.
 * No randomness, no LLM calls, fully reproducible.
 */

import type {
  BandKey,
  PillarKey,
  PillarTier,
  WeaknessPattern,
} from './types';

// ── Per-page composition descriptors ─────────────────────────────────────

/** Page 1 -- cover. Data only, no library lookup. */
export interface CoverComposition {
  scoreNumber: number;
  bandLabel: string;
  bandKey: BandKey;
  generatedAtIso: string;
  readerName?: string;     // "Jane Smith" or undefined
  companyName?: string;    // "Acme Co" or undefined
}

/** Page 2 -- the honest read + tomorrow morning callout. */
export interface HonestReadComposition {
  honestReadKey: string;        // e.g. 'honest_read:foundational'
  tomorrowMorningKey: string;   // e.g. 'tomorrow:data:q1_low'
  // benchmark slot (v1.1) -- reserved
  benchmarkText?: string;       // empty in v1.0
}

/** Page 3 -- pillar map. One diagnostic block per pillar. */
export interface PillarMapComposition {
  diagnostics: Record<PillarKey, {
    score: number;
    tier: PillarTier;
    contentKey: string;          // e.g. 'pillar_diag:data:deep_gap'
  }>;
}

/** Pages 4–6 -- focus areas. One entry per focus pillar, in order. */
export interface FocusAreaComposition {
  pillar: PillarKey;
  pillarScore: number;
  pillarTier: PillarTier;
  weaknessPattern: WeaknessPattern;
  // The three content blocks on this page -- each maps to a library key
  whatWrongKey: string;          // e.g. 'focus:data:wrong:q1_low'
  minimumFixKey: string;         // e.g. 'focus:data:fix:q1_low'
  goodAtScaleKey: string;        // e.g. 'focus:data:scale:foundational'
  // Cited claim metadata (productivity vs governance framing)
  citedClaimKey: string;         // e.g. 'cited:productivity' | 'cited:governance'
}

/** Page 7 -- 30-day starting kit. 5 actions, week-by-week. */
export interface StartingKitComposition {
  weeks: Array<{
    weekNumber: 1 | 2 | 3 | 4;
    pillar: PillarKey;
    contentKey: string;          // e.g. 'kit:data:q1_low'
    isPrimary: boolean;          // true for weeks anchored to a focus area
  }>;
}

/** Page 8 -- common traps. 4 traps total, mix of band + strongest-pillar. */
export interface TrapsComposition {
  bandKey: BandKey;
  strongestPillar: PillarKey;
  trapKeys: string[];            // length 4, deduplicated
}

/** Page 9 -- where this usually goes next. 3 paths, band-modulated. */
export interface PathFramingComposition {
  selfImplementKey: string;      // e.g. 'path:foundational:self'
  hireInternalKey: string;       // e.g. 'path:foundational:hire'
  bringPartnerKey: string;       // e.g. 'path:foundational:partner'
}

/** Page 10 -- about. Fixed content. */
export interface AboutComposition {
  aboutKey: 'about:creative_milk';
}

/** Page 11 -- next step + share mechanism. Band-modulated CTA. */
export interface NextStepComposition {
  ctaKey: string;                // e.g. 'cta:foundational'
  shareMechanism: {
    shareText: string;           // pre-written, e.g. "Just did the Creative Milk..."
    shareUrl: string;            // public result URL
  };
}

// ── Full composition ─────────────────────────────────────────────────────

/**
 * The full playbook composition. Everything the PDF template needs to know
 * about which content to render and where, derived deterministically from
 * the AssessmentResult.
 */
export interface PlaybookComposition {
  // metadata
  schemaVersion: number;         // bumped when composition shape changes
  generatedAtIso: string;
  assessmentId?: string;         // populated when persisted

  // page-by-page
  cover: CoverComposition;
  honestRead: HonestReadComposition;
  pillarMap: PillarMapComposition;
  focusAreas: FocusAreaComposition[]; // length 3
  startingKit: StartingKitComposition;
  traps: TrapsComposition;
  pathFraming: PathFramingComposition;
  about: AboutComposition;
  nextStep: NextStepComposition;
}

/**
 * Inputs to compose() beyond the scored result.
 * Kept separate so the result object doesn't drift toward UI concerns.
 */
export interface CompositionContext {
  assessmentId?: string;
  readerName?: string;
  companyName?: string;
  resultUrl?: string;             // full public URL for sharing
  generatedAt?: Date;
}
