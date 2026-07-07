/**
 * POST /api/readiness/submit
 *
 * Accepts a completed set of assessment answers, scores them server-side,
 * persists the assessment, logs an activity, and returns the assessment id.
 *
 * The client never scores. Never trust the client's score. The full result
 * is fetched from /api/readiness/result/[id] after redirect.
 *
 * Request body:
 *   {
 *     answers: { q1: 0..3, q2: 0..3, ..., q15: 0..3 },
 *     // optional context, captured for analytics:
 *     referrer?: string
 *   }
 *
 * Response:
 *   200 { id: "uuid", overallScore: number, band: string }
 *   400 { error: string }
 *   500 { error: string }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { scoreAnswers } from '@/lib/readiness/scoring';
import { getServiceSupabase } from '@/lib/supabase/server';
import type { Answers } from '@/lib/readiness/types';

// ── Constants ────────────────────────────────────────────────────────────────

// Reject anything bigger than this -- assessment payload is tiny (~300 bytes),
// 4KB is generous. Cheap protection against accidental/malicious large bodies.
const MAX_BODY_BYTES = 4 * 1024;

// Allowed referer host(s) for soft origin checking. Allows local dev + prod.
// This is not security (referer is forgeable) -- it's noise filtering for
// telemetry. Real abuse protection happens at scoring validation.
const ALLOWED_REFERRER_HOSTS = new Set<string>([
  'www.creative-milk.com.au',
  'creative-milk.com.au',
  'localhost:3000',
  'localhost',
]);

// ── Helpers ─────────────────────────────────────────────────────────────────

function clientErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Extract reader country from Vercel's `x-vercel-ip-country` header if set,
 * or fall back to undefined. Never store the raw IP address.
 */
function getIpCountry(req: NextRequest): string | undefined {
  const c = req.headers.get('x-vercel-ip-country');
  if (c && /^[A-Z]{2}$/.test(c)) return c;
  return undefined;
}

/**
 * Extract a sanitised referrer host. Drops query strings, fragments, paths.
 */
function getRefererHost(req: NextRequest): string | undefined {
  const ref = req.headers.get('referer');
  if (!ref) return undefined;
  try {
    return new URL(ref).host;
  } catch {
    return undefined;
  }
}

/**
 * Validate the incoming body has the shape `{ answers: { q1..q15: 0..3 } }`.
 * Returns the validated Answers object or throws a 400-shaped error.
 *
 * Note: scoreAnswers() also validates, but doing it here means we can return
 * a clearer 400 with a stable error code before touching the scoring engine.
 */
function parseAndValidateBody(body: unknown): Answers {
  if (typeof body !== 'object' || body === null) {
    throw new ClientError('Body must be a JSON object');
  }
  const b = body as Record<string, unknown>;
  if (typeof b.answers !== 'object' || b.answers === null || Array.isArray(b.answers)) {
    throw new ClientError('Body must include an `answers` object');
  }

  const answers = b.answers as Record<string, unknown>;
  const out: Answers = {};
  for (let i = 1; i <= 15; i++) {
    const key = `q${i}`;
    const v = answers[key];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 3) {
      throw new ClientError(`Invalid or missing answer for ${key}`);
    }
    out[key] = v;
  }
  // Reject any unexpected extra keys to keep payload tight
  for (const k of Object.keys(answers)) {
    if (!/^q([1-9]|1[0-5])$/.test(k)) {
      throw new ClientError(`Unexpected answer key: ${k}`);
    }
  }
  return out;
}

class ClientError extends Error {}

// ── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limit: 10 assessment submissions per hour per IP
  const limited = checkRateLimit('readiness-submit', req, {
    limit: 10,
    windowMs: 60 * 60_000,
  });
  if (limited) return limited;

  // Body size guard
  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (contentLength > MAX_BODY_BYTES) {
    return clientErrorResponse('Body too large', 413);
  }

  // Parse JSON
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return clientErrorResponse('Invalid JSON');
  }

  // Validate body shape
  let answers: Answers;
  try {
    answers = parseAndValidateBody(raw);
  } catch (err) {
    if (err instanceof ClientError) return clientErrorResponse(err.message);
    throw err;
  }

  // Score
  let result;
  try {
    result = scoreAnswers(answers);
  } catch (err) {
    // scoring should never fail after our validation, but be defensive
    return clientErrorResponse(
      err instanceof Error ? err.message : 'Scoring failed'
    );
  }

  // Persist
  const supabase = getServiceSupabase();
  const ipCountry = getIpCountry(req);
  const userAgent = req.headers.get('user-agent') ?? undefined;
  const refererHost = getRefererHost(req);
  const referrer = refererHost ?? undefined;

  // Soft-warn on unexpected referrers -- useful for spam detection in logs,
  // doesn't block the request (referers can be empty or stripped legitimately).
  if (refererHost && !ALLOWED_REFERRER_HOSTS.has(refererHost)) {
    console.warn(
      `[readiness/submit] unusual referrer: ${refererHost}`
    );
  }

  const { data, error } = await supabase
    .from('readiness_assessments')
    .insert({
      completed_at: new Date().toISOString(),
      answers,
      pillar_scores: result.pillarScores,
      overall_score: result.overallScore,
      band: result.band.key,
      focus_areas: result.focusAreas,
      weakness_patterns: result.weaknessPatterns,
      strongest_pillar: result.strongestPillar,
      pillar_tiers: result.pillarTiers,
      user_agent: userAgent ? userAgent.slice(0, 500) : null,
      referrer: referrer ? referrer.slice(0, 200) : null,
      ip_country: ipCountry ?? null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[readiness/submit] insert failed:', error);
    return NextResponse.json(
      { error: 'Failed to persist assessment' },
      { status: 500 }
    );
  }

  // Log activity (fire-and-forget -- log the error but don't fail the request
  // if activity logging fails; the assessment itself is the canonical record).
  void supabase
    .from('activities')
    .insert({
      assessment_id: data.id,
      type: 'assessment_completed',
      description: `Reader completed assessment. Overall ${result.overallScore} / ${result.band.label}.`,
      data: {
        overall_score: result.overallScore,
        band: result.band.key,
        focus_areas: result.focusAreas,
      },
    })
    .then(({ error: actErr }) => {
      if (actErr) {
        console.error('[readiness/submit] activity log failed:', actErr);
      }
    });

  return NextResponse.json({
    id: data.id,
    overallScore: result.overallScore,
    band: result.band.key,
  });
}

// Reject any other method
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
