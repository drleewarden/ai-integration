/**
 * Validation primitives for the workshop payment-links feature. The dollars
 * parser is the ONLY place an admin-supplied amount is converted to cents --
 * every route trusts its output, so the cap and 2dp rule live here.
 */

/** $10,000 sanity cap (in cents). Mirrors the DB check constraint. */
export const MAX_AMOUNT_CENTS = 1_000_000;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parse a dollars string ("450", "450.10", "$1,200.50") into integer cents.
 * Returns null unless the result is 0 < cents <= MAX_AMOUNT_CENTS with at
 * most two decimal places. String-based (no parseFloat) to avoid float error.
 */
export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > MAX_AMOUNT_CENTS) {
    return null;
  }
  return cents;
}
