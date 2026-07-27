/**
 * Absolute site origin for links we generate server-side (emailed pay links,
 * Stripe success/cancel URLs). Production always uses the canonical domain;
 * previews and local dev use the request's own origin.
 */
import type { NextRequest } from "next/server";

const SITE_URL = "https://www.creative-milk.com.au";

export function baseUrl(req: NextRequest): string {
  const isProduction = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";
  return isProduction ? SITE_URL : req.nextUrl.origin;
}
