/**
 * POST /api/members/checkout
 *
 * Starts a Stripe Checkout session for the Pro subscription. Requires a
 * signed-in member. Creates (and persists) the Stripe customer on first
 * use so the webhook and portal can find the member again.
 * Response: 200 { url } | 401 | 409 already pro | 500
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getMemberProfile } from "@/lib/supabase/auth-server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const SITE_URL = "https://www.creative-milk.com.au";

function baseUrl(req: NextRequest): string {
  return process.env.NODE_ENV === "development"
    ? req.nextUrl.origin
    : SITE_URL;
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit("members-checkout", req, {
    limit: 5,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const member = await getMemberProfile();
  if (!member) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (member.profile.tier === "pro") {
    return NextResponse.json(
      { error: "You already have a Pro subscription" },
      { status: 409 },
    );
  }

  const priceId = process.env.STRIPE_PRICE_ID_PRO;
  if (!priceId) {
    console.error("[members/checkout] STRIPE_PRICE_ID_PRO not set");
    return NextResponse.json(
      { error: "Checkout unavailable. Please try again later." },
      { status: 500 },
    );
  }

  try {
    const stripe = getStripe();

    let customerId = member.profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: member.profile.email,
        metadata: { supabase_user_id: member.user.id },
      });
      customerId = customer.id;
      const { error } = await getServiceSupabase()
        .from("member_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", member.user.id);
      if (error) console.error("[members/checkout] customer save failed:", error);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: member.user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl(req)}/members/account?upgraded=1`,
      cancel_url: `${baseUrl(req)}/members/upgrade`,
      metadata: { supabase_user_id: member.user.id },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("[members/checkout] failed:", err);
    return NextResponse.json(
      { error: "Checkout unavailable. Please try again later." },
      { status: 500 },
    );
  }
}
