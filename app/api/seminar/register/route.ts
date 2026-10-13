/**
 * POST /api/seminar/register
 *
 * Saves a seminar attendee (name, email, marketing consent) BEFORE the
 * magic link goes out, so the attendee list survives even if the email
 * link is never clicked. The client sends the magic link itself after a
 * 200 from here; access is granted later on /seminar/welcome.
 *
 * Gate: the QR code (?c=...) must match the seminar code (see
 * lib/members/seminar.ts). Rate limited per IP plus honeypot/timing bot check.
 * Writes with the service role; seminar_signups has no RLS policies.
 */
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, isLikelyBot } from "@/lib/rate-limit";
import { getServiceSupabase } from "@/lib/supabase/server";
import {
  SEMINAR_CODE,
  SEMINAR_CONSENT_TEXT,
  isSeminarCodeValid,
} from "@/lib/members/seminar";

interface Body {
  code?: string;
  name?: string;
  email?: string;
  marketingOptIn?: boolean;
  website?: string;
  formStartedAt?: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // A room of people on one venue Wi-Fi share an IP, so this is generous.
  const limited = checkRateLimit("seminar-register", request, {
    limit: 60,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Bots get a success-shaped reply and nothing is stored.
  if (isLikelyBot(body)) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  if (!isSeminarCodeValid(body.code)) {
    return NextResponse.json(
      { error: "This seminar sign-up link has expired or is not valid." },
      { status: 403 },
    );
  }

  // Validate and cap every field that reaches the database.
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!name || name.length > 200) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  const marketingOptIn = body.marketingOptIn === true;

  const { error } = await getServiceSupabase()
    .from("seminar_signups")
    .upsert(
      {
        event_code: SEMINAR_CODE,
        name,
        email,
        marketing_opt_in: marketingOptIn,
        consent_text: marketingOptIn ? SEMINAR_CONSENT_TEXT : null,
      },
      { onConflict: "event_code,email" },
    );

  if (error) {
    // Logged without the request body so PII stays out of the logs.
    console.error("[seminar/register] insert failed:", error.code, error.message);
    return NextResponse.json(
      { error: "Couldn't save your details. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
