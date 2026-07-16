/**
 * Cached Stripe server client. Server-side only -- STRIPE_SECRET_KEY must
 * never reach the browser. API version pinned so SDK upgrades are explicit.
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
