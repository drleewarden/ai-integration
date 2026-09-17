// lib/support.ts
//
// Post-go-live engagement terms: what we respond to and how fast, what counts
// as a defect versus a change, and who pays for model usage.
//
// WHY THIS EXISTS
// The site previously ended the process at "we stay until the outcomes are
// real, not just live", which reads well and commits to nothing. It did not
// tell a buyer who is responsible when an integration breaks during BAS week,
// how fast anyone responds, or what a fix costs. For an automation sitting
// inside a month-end process that is the question that decides the sale.
//
// Prices and support tiers live in lib/pricing.ts (SUPPORT_TIERS). These are
// the commitments those tiers buy. If this file grows much further, move
// SUPPORT_TIERS here and make lib/pricing.ts purely about money.

export type ResponseCommitment = {
  id: "system-down" | "degraded";
  severity: string;
  /** What actually qualifies, in the client's terms rather than ours. */
  definition: string;
  response: string;
};

/**
 * Deliberately business hours only.
 *
 * A two-person firm publishing 24/7 cover would be committing to something it
 * cannot hold, and the first breach during a client's month-end costs more
 * trust than the promise ever won. Honest business-hours cover is still more
 * than any comparable local firm publishes at all.
 */
export const SUPPORT_HOURS =
  "Business hours, Monday to Friday, Australian Eastern time";

export const RESPONSE_COMMITMENTS: readonly ResponseCommitment[] = [
  {
    id: "system-down",
    severity: "System down",
    definition:
      "An automation has stopped, or is producing output you cannot use, and it is blocking a business process.",
    response: "We respond within 4 business hours",
  },
  {
    id: "degraded",
    severity: "Degraded",
    definition:
      "The system runs, but slowly or with errors your team is working around.",
    response: "We respond by the next business day",
  },
] as const;

/**
 * The defect versus change distinction.
 *
 * Publishing this prevents the most common post-delivery dispute, which is an
 * argument about whether a given piece of work should have been free.
 */
export const WARRANTY = {
  windowDays: 30,
  defect: {
    label: "Defect",
    definition: "The system does not do what the specification said it would.",
    treatment:
      "We fix it at no charge inside the warranty window, regardless of support tier.",
  },
  change: {
    label: "Change",
    definition: "You want the system to do something different.",
    treatment: "We scope it and quote it before doing the work.",
  },
} as const;

/**
 * Who pays for model usage.
 *
 * Clients hold their own provider subscription, set up in their name, so usage
 * is billed to them directly by the provider at the provider's own price.
 *
 * Kept narrow on purpose. It states the commercial arrangement and nothing
 * about how any provider handles data: those are third-party security
 * properties that belong on a reviewed data-handling page with the provider's
 * own documentation cited, not asserted here as marketing copy.
 */
export const MODEL_USAGE = {
  summary:
    "You hold your own model subscription, set up in your name. Microsoft Copilot, Claude or OpenAI, depending on what suits the work.",
  billing:
    "Model and API usage is billed to you directly by the provider. We do not resell it and we do not mark it up.",
  onExit: "The subscription is yours and stays with you if we stop working together.",
} as const;
