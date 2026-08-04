/**
 * Fixed terms for the self-serve workshop signup.
 *
 * The price lives here, server-side, and is NEVER read from the request --
 * the public signup route creates a payment row on behalf of an anonymous
 * caller, so letting the client influence the amount would be a trivial
 * price-tampering hole. The admin route keeps its own operator-supplied
 * amount; this constant only governs auto-created rows.
 */

/** Early-bird rate charged to everyone who signs up through the public form. */
export const WORKSHOP_EARLY_BIRD_CENTS = 2500;

export const WORKSHOP_CURRENCY = "aud";

export const WORKSHOP_DESCRIPTION =
  "AI Automation Workshop - Friday 7 August 2026 (early bird)";

/** Marks rows the signup form created, as opposed to an admin's email. */
export const WORKSHOP_SIGNUP_CREATED_BY = "workshop-signup";
