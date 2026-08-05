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
 * One fixed seat price, no early-bird tiering. Keep in sync by hand with
 * SEAT_PRICE in app/(site)/(dark-nav)/events/workshop-melbourne/page.tsx and
 * the Event schema offer price in app/components/Schema.tsx. Charging an
 * amount the page doesn't advertise is the failure mode to avoid here.
 */
export const WORKSHOP_SEAT_PRICE_CENTS = 3500;

export const WORKSHOP_CURRENCY = "aud";

/** Shown as "What you're paying for" in the payment request email. */
export const WORKSHOP_DESCRIPTION = "AI Workshop Elwood";

/** Marks rows the signup form created, as opposed to an admin's email. */
export const WORKSHOP_SIGNUP_CREATED_BY = "workshop-signup";
