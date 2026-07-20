/**
 * POST /api/members/tools/health-check  { url: string }
 *
 * Members-only single-page website audit. Fetches the page server-side via
 * the shared SSRF-defended fetch (lib/members/tools/audit-fetch) and runs
 * lib/members/tools/health-check over it.
 */
import { NextResponse } from "next/server";
import { fetchAuditTarget } from "@/lib/members/tools/audit-fetch";
import { runHealthChecks } from "@/lib/members/tools/health-check";
import { getMemberProfile } from "@/lib/supabase/auth-server";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 4_096;
const MAX_HTML_BYTES = 2_000_000;

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

  const result = await fetchAuditTarget(body.url);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  const { html, bytes } = await readCapped(result.response);
  const report = runHealthChecks(html, bytes);

  return NextResponse.json({ finalUrl: result.finalUrl, ...report });
}
