// lib/pricing.ts
//
// Single source of truth for engagement names, prices and phase numbering.
//
// WHY THIS EXISTS
// Prices and phase counts were previously restated independently in the
// pricing page data, the Pricing JSON-LD, llms.txt and the marketing copy.
// They drifted: the $2K AI Tools Assessment was added to /pricing and to the
// structured data but never reached the "three phases" narrative, so the site
// simultaneously published a three-phase and a four-phase engagement model.
//
// RULES
// 1. Numbers and tier names live here. Import them, never retype them.
// 2. Never hardcode a phase count in copy. Use PHASE_COUNT or phaseCountWord().
// 3. Prose that happens to quote a price (FAQ answers, body copy) is still
//    written by hand in the page data files. Those are listed in
//    PROSE_WITH_PRICES below so they can be checked when a price moves.
//
// OPEN DECISION: how many phases are we selling?
// The numbering below follows /pricing, which presents four phases with the
// AI Tools Assessment as Phase 01. /services presents a coherent three-phase
// model instead (Discovery, Build, Managed) and its data file exports only
// phase1/2/3Deliverables. Process.tsx, ai-consulting-melbourne and llms.txt
// also say "three phases". Both models are internally consistent, so this is a
// positioning call, not a typo, and it is deliberately left unresolved here:
//   Option A, Assessment is Phase 01 of four. Keep this numbering, renumber the
//     /services deliverables and update the "three phases" copy to use
//     phaseCountWord().
//   Option B, Assessment is a standalone entry product and the engagement model
//     is three phases. Set its `phase` to 0 (or drop it from PRICING_PHASES and
//     export it separately) and relabel it on /pricing.
// Until that is decided, PHASE_COUNT reflects Option A and the "three phases"
// copy has been left untouched rather than guessed at.
//
// NOT the source of truth for: /pricingdata, which publishes a different offer
// entirely (30-Day Pilot / Build Engagement / AI Ops Residency) and is
// currently noindexed pending reconciliation.

/** How a tier is charged. Ranges carry both bounds so structured data can
 *  express "from X to Y" instead of presenting the lower bound as the price. */
export type PriceShape =
  | { kind: "fixed"; amount: number }
  | { kind: "range"; min: number; max: number }
  | { kind: "monthlyRange"; min: number; max: number };

export type PricingPhase = {
  /** Stable key for lookups. Safe to use in analytics and URLs. */
  id: "assessment" | "discovery" | "build" | "managed";
  /** 1-indexed position in the engagement model. */
  phase: number;
  name: string;
  price: PriceShape;
  /** Display string used on the pricing page and in cards. */
  priceDisplay: string;
  /** Duration or cadence, as shown in tier meta. */
  duration: string;
  /** Whether the tier delivers something usable without any other phase. */
  standalone: boolean;
  /** Phase that must be completed first, if any. */
  requiresPhase?: number;
  /** One-line description for JSON-LD. Kept short and factual. */
  schemaDescription: string;
};

export const PRICING_PHASES: readonly PricingPhase[] = [
  {
    id: "assessment",
    phase: 1,
    name: "AI Tools Assessment",
    price: { kind: "fixed", amount: 2000 },
    priceDisplay: "AUD $2K",
    duration: "3 days",
    standalone: true,
    schemaDescription:
      "Three-day assessment. Where your week goes, what AI takes off your plate, and the maths behind it.",
  },
  {
    id: "discovery",
    phase: 2,
    name: "Discovery Sprint",
    price: { kind: "range", min: 5000, max: 15000 },
    priceDisplay: "AUD $5K–$15K",
    duration: "1–2 weeks",
    standalone: true,
    schemaDescription:
      "Scoped AI assessment. Understand your problem, map your data, define the build.",
  },
  {
    id: "build",
    phase: 3,
    name: "Build & Integrate",
    price: { kind: "range", min: 30000, max: 120000 },
    priceDisplay: "AUD $30K–$120K",
    duration: "4–6 weeks",
    standalone: false,
    requiresPhase: 2,
    schemaDescription:
      "Custom AI system built and integrated into your existing workflows.",
  },
  {
    id: "managed",
    phase: 4,
    name: "Managed Partnership",
    price: { kind: "monthlyRange", min: 5000, max: 15000 },
    priceDisplay: "AUD $5K–$15K/mo",
    duration: "Ongoing",
    standalone: true,
    schemaDescription:
      "Monthly managed AI operations. Ongoing optimisation and support.",
  },
] as const;

/** Number of phases in the published engagement model. Derive, never retype. */
export const PHASE_COUNT = PRICING_PHASES.length;

const COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six"];

/** Phase count as a word, for copy: `${phaseCountWord()} phases`. */
export function phaseCountWord(): string {
  return COUNT_WORDS[PHASE_COUNT] ?? String(PHASE_COUNT);
}

export function pricingPhaseById(id: PricingPhase["id"]): PricingPhase {
  const phase = PRICING_PHASES.find((p) => p.id === id);
  if (!phase) {
    throw new Error(`Unknown pricing phase: ${id}`);
  }
  return phase;
}

/** Lower bound of a tier, for sorting or "from" copy. */
export function priceFrom(price: PriceShape): number {
  return price.kind === "fixed" ? price.amount : price.min;
}

/**
 * Files containing hand-written prose that quotes a price or a phase number.
 * These cannot be generated from this module without flattening the copy, so
 * grep them when any number above changes.
 */
export const PROSE_WITH_PRICES = [
  "app/(site)/(main)/pricing/data.ts",
  "app/(site)/(main)/services/data.ts",
  "app/(site)/(main)/process/data.ts",
  "app/(site)/(main)/ai-consulting-melbourne/page.tsx",
] as const;
