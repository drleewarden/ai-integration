/**
 * POST /api/stripe/webhook
 *
 * THE ONLY WRITER OF member_profiles.tier. Signature-verified against the
 * raw body (no rate limiting, no honeypot -- Stripe is the only caller and
 * signature verification is the gate).
 *
 * Events:
 *   checkout.session.completed      -> tier pro (status from subscription)
 *   customer.subscription.updated   -> pro iff status active|trialing
 *   customer.subscription.deleted   -> tier free
 *
 * Always 200 for verified events (Stripe retries non-2xx); processing
 * errors are logged. 400 only for missing/invalid signatures.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getServiceSupabase } from "@/lib/supabase/server";

const PRO_STATUSES = new Set(["active", "trialing"]);

function tierFor(status: string): "free" | "pro" {
  return PRO_STATUSES.has(status) ? "pro" : "free";
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (!userId || !subscriptionId) break;

        const subscription = await getStripe().subscriptions.retrieve(
          subscriptionId,
        );
        const { error } = await supabase
          .from("member_profiles")
          .update({
            tier: tierFor(subscription.status),
            subscription_status: subscription.status,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId ?? null,
          })
          .eq("id", userId);
        if (error) console.error("[stripe/webhook] checkout update failed:", error);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        const { error } = await supabase
          .from("member_profiles")
          .update({
            tier: tierFor(subscription.status),
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
          })
          .eq("stripe_customer_id", customerId);
        if (error) console.error("[stripe/webhook] subscription update failed:", error);
        break;
      }

      default:
        // Unhandled event types are acknowledged and ignored.
        break;
    }
  } catch (err) {
    // Log but still 200: a transient handler bug shouldn't make Stripe
    // retry-storm us; Stripe's dashboard shows the event for replay.
    console.error("[stripe/webhook] handler error:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
