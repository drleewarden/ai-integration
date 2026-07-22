/**
 * POST /api/members/portal
 *
 * Opens the Stripe customer portal (card updates, cancellation). Requires a
 * signed-in member who already has a Stripe customer.
 * Response: 200 { url } | 401 | 404 no billing yet | 500
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getMemberProfile } from "@/lib/supabase/auth-server";
import { checkRateLimit } from "@/lib/rate-limit";

const SITE_URL = "https://www.creative-milk.com.au";

function baseUrl(req: NextRequest): string {
  const isProduction = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";
  return isProduction ? SITE_URL : req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit("members-portal", req, {
    limit: 5,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const member = await getMemberProfile();
  if (!member) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!member.profile.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing profile yet" },
      { status: 404 },
    );
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: member.profile.stripe_customer_id,
      return_url: `${baseUrl(req)}/members/account`,
    });
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("[members/portal] failed:", err);
    return NextResponse.json(
      { error: "Billing portal unavailable. Please try again later." },
      { status: 500 },
    );
  }
}
