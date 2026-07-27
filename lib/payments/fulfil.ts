/**
 * Marks a workshop payment paid and sends the two post-payment emails.
 * Called only by the Stripe webhook AFTER signature verification -- the
 * session object is trusted because it came from a verified event.
 *
 * Idempotent by design: Stripe retries webhook deliveries, so an
 * already-paid row is a no-op (no duplicate emails). Email failures are
 * logged but never thrown -- the webhook must still 200 to stop retries.
 */
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatAmount,
  renderPaymentAlertEmail,
  renderPaymentConfirmationEmail,
} from "./emails";

export type SendEmailFn = (msg: {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
}) => Promise<{ error: unknown }>;

export async function fulfilWorkshopPayment(opts: {
  session: Stripe.Checkout.Session;
  supabase: SupabaseClient;
  sendEmail: SendEmailFn;
  from: string;
  internalTo: string;
}): Promise<void> {
  const { session, supabase, sendEmail, from, internalTo } = opts;

  const paymentId = session.metadata?.workshop_payment_id;
  if (typeof paymentId !== "string" || paymentId.length === 0) return;

  const { data: row, error } = await supabase
    .from("workshop_payments")
    .select("id, name, email, amount_cents, currency, description, status")
    .eq("id", paymentId)
    .maybeSingle();
  if (error || !row) {
    console.error(
      `[payments/fulfil] no workshop_payments row for id=${paymentId}`,
      error,
    );
    return;
  }
  // Stripe retries deliveries; a paid row means we've already processed this.
  if (row.status === "paid") return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  // Money has been taken even if the link was voided post-checkout-creation,
  // so any non-paid status transitions to paid here.
  const { error: updateError } = await supabase
    .from("workshop_payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: session.id,
    })
    .eq("id", paymentId);
  if (updateError) {
    // Don't email if the DB didn't record the payment -- the Stripe retry
    // will land back here with the row still pending.
    console.error("[payments/fulfil] paid update failed:", updateError);
    return;
  }

  const amount = formatAmount(row.amount_cents, row.currency);

  const confirmation = renderPaymentConfirmationEmail({
    name: row.name,
    description: row.description,
    amount,
  });
  const { error: confirmError } = await sendEmail({
    from,
    to: row.email,
    replyTo: internalTo,
    subject: confirmation.subject,
    html: confirmation.html,
  });
  if (confirmError) {
    console.error("[payments/fulfil] confirmation email failed:", confirmError);
  }

  const alert = renderPaymentAlertEmail({
    name: row.name,
    email: row.email,
    description: row.description,
    amount,
  });
  const { error: alertError } = await sendEmail({
    from,
    to: internalTo,
    replyTo: row.email,
    subject: alert.subject,
    html: alert.html,
  });
  if (alertError) {
    console.error("[payments/fulfil] alert email failed:", alertError);
  }
}
