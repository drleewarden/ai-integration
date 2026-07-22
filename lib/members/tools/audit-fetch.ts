/**
 * Shared server-side fetch for members URL-audit tools (Website Health
 * Check, Security Headers Audit).
 *
 * SSRF defences (in order):
 *  1. validateAuditUrl — https-only, no IPs/localhost/ports/credentials
 *  2. DNS lookup — every resolved address must be public (isPrivateIp)
 *  3. fetch with redirect:"manual" — max 3 hops, each hop re-runs 1 and 2
 *  4. 10s timeout per hop
 *
 * Accepted residual risk: the DNS pre-check (2) and fetch's own resolution
 * are separate lookups, so a low-TTL rebinding attacker could pass the check
 * yet have fetch connect to a private address. Accepted because the routes
 * are members-only and rate-limited, response bodies are never echoed, and
 * closing it would need connect-time IP pinning via a custom dispatcher —
 * disproportionate to this weak oracle. Revisit if responses ever get echoed.
 *
 * Error strings are user-facing and deliberately generic — no hostnames,
 * DNS details or stack traces ever reach the client. Both tools return
 * these same strings so their error copy stays consistent.
 */
import { lookup } from "node:dns/promises";
import {
  validateAuditUrl,
  isPrivateIp,
} from "@/lib/members/tools/health-check-url";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;
const USER_AGENT =
  "CreativeMilk-HealthCheck/1.0 (+https://creativemilk.com.au)";

export type AuditFetchResult =
  | { ok: true; response: Response; finalUrl: string }
  | { ok: false; error: string; status: number };

async function assertPublicHost(hostname: string): Promise<boolean> {
  try {
    const records = await lookup(hostname, { all: true });
    return records.length > 0 && records.every((r) => !isPrivateIp(r.address));
  } catch {
    return false;
  }
}

export async function fetchAuditTarget(
  rawUrl: string,
): Promise<AuditFetchResult> {
  const validated = validateAuditUrl(rawUrl);
  if (!validated.ok) {
    return { ok: false, error: validated.reason, status: 400 };
  }

  // Follow up to MAX_REDIRECTS hops manually, re-validating each target so
  // a redirect can't bounce the fetch into private address space.
  let current = validated.url;
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await assertPublicHost(current.hostname))) {
        return {
          ok: false,
          error: "That site could not be checked.",
          status: 400,
        };
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(current.href, {
          redirect: "manual",
          signal: controller.signal,
          headers: { "user-agent": USER_AGENT },
        });
      } finally {
        clearTimeout(timer);
      }
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc || hop === MAX_REDIRECTS) {
          return {
            ok: false,
            error: "That site redirected too many times.",
            status: 400,
          };
        }
        const next = validateAuditUrl(new URL(loc, current).href);
        if (!next.ok) {
          return { ok: false, error: next.reason, status: 400 };
        }
        current = next.url;
        continue;
      }
      if (!res.ok) {
        return {
          ok: false,
          error: `The site responded with status ${res.status}.`,
          status: 400,
        };
      }
      return { ok: true, response: res, finalUrl: current.href };
    }
  } catch (err) {
    console.error("[members/audit-fetch] fetch failed:", err);
    return {
      ok: false,
      error: "That site could not be reached.",
      status: 400,
    };
  }
  // Unreachable in practice (every loop path returns) — safe fallthrough.
  return { ok: false, error: "That site could not be checked.", status: 400 };
}
