/**
 * Fixed terms for the self-serve workshop signup.
 *
 * The price lives here, server-side, and is NEVER read from the request --
 * the public signup route creates a payment row on behalf of an anonymous
 * caller, so letting the client influence the amount would be a trivial
 * price-tampering hole. The admin route keeps its own operator-supplied
 * amount; this constant only governs auto-created rows.
 */

/**
 * Single fixed seat price -- no early-bird tiering. Must match SEAT_PRICE in
 * the workshop landing page and the Event schema offer; a mismatch means we
 * advertise one price and charge another.
 */
export const WORKSHOP_SEAT_CENTS = 3500;

export const WORKSHOP_CURRENCY = "aud";

export const WORKSHOP_DESCRIPTION =
  "AI Automation Workshop - Friday 7 August 2026";

/** Marks rows the signup form created, as opposed to an admin's email. */
export const WORKSHOP_SIGNUP_CREATED_BY = "workshop-signup";
