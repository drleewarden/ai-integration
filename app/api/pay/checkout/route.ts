/**
 * POST /api/pay/checkout -- body { id }.
 *
 * Starts a Stripe Checkout session for a pending workshop payment link.
 * Input handling: the ONLY client-supplied value is the row's UUID; amount,
 * currency, description and email are all read from the database, so a
 * tampered request can never change what is charged.
 * Response: 200 { url } | 400 | 404 unknown | 409 not pending | 500.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getServiceSupabase } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { UUID_RE } from "@/lib/payments/validate";
import { baseUrl } from "@/lib/payments/base-url";

// Reject anything bigger than this -- the body is a single UUID (~50 bytes),
// 4KB is generous. Same convention as app/api/readiness/submit/route.ts.
const MAX_BODY_BYTES = 4 * 1024;

export async function POST(req: NextRequest) {
  const limited = checkRateLimit("pay-checkout", req, {
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;

  // Body size guard
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Body too large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  // These error strings are displayed verbatim to payers by PayButton --
  // keep them static curated copy and never interpolate internal/dynamic
  // values (e.g. raw DB errors) into them.
  const { data: row, error } = await supabase
    .from("workshop_payments")
    .select(
      "id, status, amount_cents, currency, description, email, stripe_checkout_session_id",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[pay/checkout] lookup failed:", error);
    return NextResponse.json(
      { error: "Checkout unavailable. Please try again later." },
      { status: 500 },
    );
  }
  if (!row) {
    return NextResponse.json(
      { error: "Payment link not found." },
      { status: 404 },
    );
  }
  if (row.status !== "pending") {
    return NextResponse.json(
      { error: "This payment link is no longer active." },
      { status: 409 },
    );
  }

  // Reuse an existing still-open session before creating another one.
  // Without this, every click mints a fresh payable session for the same
  // link (double-click, second device, stale tab) and two of them can BOTH
  // be paid -- the webhook stays idempotent, but the customer is charged
  // twice. Checkout sessions stay "open" for 24h; anything else (completed,
  // expired, retrieval failure) falls through to creating a new one.
  if (row.stripe_checkout_session_id) {
    try {
      const existing = await getStripe().checkout.sessions.retrieve(
        row.stripe_checkout_session_id,
      );
      if (existing.status === "open" && existing.url) {
        return NextResponse.json({ url: existing.url });
      }
    } catch (err) {
      console.error("[pay/checkout] session retrieve failed:", err);
    }
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Card-only keeps this a synchronous state machine: delayed-
      // notification methods (e.g. BECS) would fire checkout.session
      // .completed with payment_status "unpaid" before funds clear.
      // fulfilWorkshopPayment() guards this too, but pinning the method
      // here avoids ever creating that pending-forever state in practice.
      payment_method_types: ["card"],
      customer_email: row.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: row.currency,
            unit_amount: row.amount_cents,
            product_data: { name: row.description },
          },
        },
      ],
      metadata: { workshop_payment_id: row.id },
      success_url: `${baseUrl(req)}/pay/${row.id}?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl(req)}/pay/${row.id}`,
    });

    // Best-effort audit trail; the webhook re-writes this on completion.
    const { error: updateError } = await supabase
      .from("workshop_payments")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", row.id);
    if (updateError) {
      console.error("[pay/checkout] session id save failed:", updateError);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[pay/checkout] session create failed:", err);
    return NextResponse.json(
      { error: "Checkout unavailable. Please try again later." },
      { status: 500 },
    );
  }
}
