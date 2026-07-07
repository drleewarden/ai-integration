/**
 * Lightweight in-memory, per-IP rate limiter for API routes.
 *
 * Scope & limitations (deliberate):
 * - State lives in module memory, so limits apply per serverless instance.
 *   On Vercel this still blunts bursts (a bot hammering one region tends to
 *   hit warm instances), but it is NOT a distributed limiter. If abuse
 *   becomes real, swap the store for @upstash/ratelimit -- the call sites
 *   won't need to change.
 * - Fixed-window counting: simple, allocation-light, good enough for
 *   low-traffic marketing endpoints.
 *
 * Usage in a route handler:
 *
 *   const limited = checkRateLimit("send-email", req, { limit: 5, windowMs: 10 * 60_000 });
 *   if (limited) return limited; // NextResponse 429 with Retry-After
 */

import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

// One bucket map per named limiter, keyed by client IP.
const stores = new Map<string, Map<string, Bucket>>();

// Cap total tracked IPs per limiter to bound memory on long-lived instances.
const MAX_TRACKED_IPS = 5000;

export interface RateLimitOptions {
  /** Max requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

/**
 * Best-effort client IP extraction. On Vercel, `x-forwarded-for` is set by
 * the platform and the first entry is the client. Falls back to a shared
 * bucket ("unknown") so the limiter still bounds total throughput when no
 * IP header is present.
 */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function purgeExpired(buckets: Map<string, Bucket>, now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Core limiter. Returns `{ ok, retryAfterSeconds }`.
 */
export function rateLimit(
  name: string,
  ip: string,
  opts: RateLimitOptions,
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  let buckets = stores.get(name);
  if (!buckets) {
    buckets = new Map();
    stores.set(name, buckets);
  }

  let bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    // New window. Opportunistically purge if the map is getting large.
    if (buckets.size >= MAX_TRACKED_IPS) purgeExpired(buckets, now);
    bucket = { count: 0, resetAt: now + opts.windowMs };
    buckets.set(ip, bucket);
  }

  bucket.count += 1;
  const ok = bucket.count <= opts.limit;
  return {
    ok,
    retryAfterSeconds: ok ? 0 : Math.ceil((bucket.resetAt - now) / 1000),
  };
}

/**
 * Convenience wrapper for route handlers: returns a ready-to-send 429
 * NextResponse when the caller is over the limit, or null when allowed.
 */
export function checkRateLimit(
  name: string,
  req: Request,
  opts: RateLimitOptions,
): NextResponse | null {
  const { ok, retryAfterSeconds } = rateLimit(name, getClientIp(req), opts);
  if (ok) return null;
  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}

/**
 * Test-only helper: clears all limiter state so unit tests that fire many
 * requests from the same (mock) IP don't trip the limiter.
 */
export function resetRateLimits(): void {
  stores.clear();
}

/**
 * Honeypot / timing check for public forms.
 *
 * Forms include:
 *  - a visually hidden `website` field (bots fill it, humans never see it)
 *  - `formStartedAt`: epoch ms when the form mounted
 *
 * Returns true when the submission looks automated. Callers should respond
 * with a *success-shaped* response and skip side effects, so bots learn
 * nothing.
 */
export function isLikelyBot(body: {
  website?: unknown;
  formStartedAt?: unknown;
}): boolean {
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return true;
  }
  if (typeof body.formStartedAt === "number") {
    const elapsed = Date.now() - body.formStartedAt;
    // Humans don't complete a contact form in under 3 seconds.
    if (elapsed >= 0 && elapsed < 3000) return true;
  }
  return false;
}
