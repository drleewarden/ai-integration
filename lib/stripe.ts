/**
 * Cached Stripe server client. Server-side only -- STRIPE_SECRET_KEY must
 * never reach the browser. No apiVersion is passed, so the SDK's bundled
 * default API version is used -- the effective Stripe API version moves
 * whenever the "stripe" package is upgraded, rather than being pinned here.
 */
import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your environment (Vercel + .env.local).",
    );
  }
  cached = new Stripe(key);
  return cached;
}
