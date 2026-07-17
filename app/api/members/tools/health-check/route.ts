/**
 * POST /api/members/tools/health-check  { url: string }
 *
 * Members-only single-page website audit. Fetches the page server-side and
 * runs lib/members/tools/health-check over it.
 *
 * SSRF defences (in order):
 *  1. validateAuditUrl — https-only, no IPs/localhost/ports/credentials
 *  2. DNS lookup — every resolved address must be public (isPrivateIp)
 *  3. fetch with redirect:"manual" — each redirect hop re-runs 1 and 2
 *  4. 10s timeout, 2MB response cap
 */
import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import {
  validateAuditUrl,
  isPrivateIp,
} from "@/lib/members/tools/health-check-url";
import { runHealthChecks } from "@/lib/members/tools/health-check";
import { getMemberProfile } from "@/lib/supabase/auth-server";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 4_096;
const MAX_HTML_BYTES = 2_000_000;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;

async function assertPublicHost(hostname: string): Promise<boolean> {
  try {
    const records = await lookup(hostname, { all: true });
    return records.length > 0 && records.every((r) => !isPrivateIp(r.address));
  } catch {
    return false;
  }
}

/** Reads at most MAX_HTML_BYTES from the response body. */
async function readCapped(
  res: Response,
): Promise<{ html: string; bytes: number }> {
  // Streaming path (Node runtime). Falls back to text() where the body is
  // not a ReadableStream (e.g. polyfilled Response in tests).
  if (res.body && typeof res.body.getReader === "function") {
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_HTML_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const merged = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0));
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.byteLength;
    }
    return { html: new TextDecoder().decode(merged), bytes };
  }
  const text = await res.text();
  return {
    html: text.slice(0, MAX_HTML_BYTES),
    bytes: Math.min(text.length, MAX_HTML_BYTES),
  };
}

export async function POST(req: Request) {
  const limited = checkRateLimit("members-health-check", req, {
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;

  // Auth: members only (any tier). Checked before doing any outbound work.
  const member = await getMemberProfile();
  if (!member) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }
  let body: { url?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof body.url !== "string") {
    return NextResponse.json(
      { error: "Please enter a valid URL." },
      { status: 400 },
    );
  }

  const validated = validateAuditUrl(body.url);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.reason }, { status: 400 });
  }

  // Follow up to MAX_REDIRECTS hops manually, re-validating each target so
  // a redirect can't bounce the fetch into private address space.
  let current = validated.url;
  let response: Response | null = null;
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await assertPublicHost(current.hostname))) {
        return NextResponse.json(
          { error: "That site could not be checked." },
          { status: 400 },
        );
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(current.href, {
          redirect: "manual",
          signal: controller.signal,
          headers: {
            "user-agent":
              "CreativeMilk-HealthCheck/1.0 (+https://creativemilk.com.au)",
          },
        });
      } finally {
        clearTimeout(timer);
      }
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc || hop === MAX_REDIRECTS) {
          return NextResponse.json(
            { error: "That site redirected too many times." },
            { status: 400 },
          );
        }
        const next = validateAuditUrl(new URL(loc, current).href);
        if (!next.ok) {
          return NextResponse.json({ error: next.reason }, { status: 400 });
        }
        current = next.url;
        continue;
      }
      if (!res.ok) {
        return NextResponse.json(
          { error: `The site responded with status ${res.status}.` },
          { status: 400 },
        );
      }
      response = res;
      break;
    }
  } catch (err) {
    console.error("[members/health-check] fetch failed:", err);
    return NextResponse.json(
      { error: "That site could not be reached." },
      { status: 400 },
    );
  }

  if (!response) {
    return NextResponse.json(
      { error: "That site could not be checked." },
      { status: 400 },
    );
  }

  const { html, bytes } = await readCapped(response);
  const report = runHealthChecks(html, bytes);

  return NextResponse.json({ finalUrl: current.href, ...report });
}
