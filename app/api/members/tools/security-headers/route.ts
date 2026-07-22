/**
 * POST /api/members/tools/security-headers  { url: string }
 *
 * Members-only HTTP security-header audit. Fetches the target server-side
 * via the shared SSRF-defended fetch (lib/members/tools/audit-fetch) and
 * scores the response headers. The response body is never read.
 */
import { NextResponse } from "next/server";
import { fetchAuditTarget } from "@/lib/members/tools/audit-fetch";
import { runSecurityChecks } from "@/lib/members/tools/security-headers";
import {
  getAuthServerSupabase,
  getMemberProfile,
} from "@/lib/supabase/auth-server";
import { recordActivity } from "@/lib/members/activity";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 4_096;

export async function POST(req: Request) {
  const limited = checkRateLimit("members-security-headers", req, {
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
  // JSON.parse can return null or a primitive — optional chaining keeps
  // malformed bodies on the generic 400 path instead of a thrown 500.
  if (typeof body?.url !== "string") {
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

  // Headers are all we need — release the connection without reading the
  // body. Guarded: the polyfilled Response in tests has no stream body.
  try {
    if (result.response.body && typeof result.response.body.cancel === "function") {
      await result.response.body.cancel();
    }
  } catch {
    // Releasing the unused body is best-effort only.
  }

  const report = runSecurityChecks(result.response.headers);

  // Best-effort dashboard activity; anon-key client so RLS applies, and the
  // summary stores the hostname only — never the full audited URL.
  await recordActivity(await getAuthServerSupabase(), member.user.id, {
    slug: "security-headers-audit",
    kind: "tool_run",
    summary: { score: report.score, host: new URL(result.finalUrl).hostname },
  });

  return NextResponse.json({ finalUrl: result.finalUrl, ...report });
}
