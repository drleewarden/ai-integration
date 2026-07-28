/**
 * Marks a workshop payment paid and sends the two post-payment emails.
 * Called only by the Stripe webhook AFTER signature verification -- the
 * session object is trusted because it came from a verified event.
 *
 * Idempotent by design: the paid UPDATE is itself the idempotency gate
 * (conditional on status != "paid", observed via .select()), so concurrent
 * or retried deliveries can never send duplicate emails.
 *
 * The return value is a retry instruction for the webhook, not a success
 * flag:
 *   true  -- handled/terminal. The webhook must NOT trigger a Stripe retry.
 *            Covers: no metadata id, payment not actually "paid" yet, the
 *            row not existing, the row already paid (by this call or a
 *            concurrent one), and email send failures (logged, but a retry
 *            of the same event can't fix a broken outbound email).
 *   false -- transient failure (a DB read/write that might succeed on
 *            retry). The webhook should return a non-2xx status so Stripe
 *            retries the event; fulfilment is idempotent, so retrying is
 *            always safe.
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
}): Promise<boolean> {
  const { session, supabase, sendEmail, from, internalTo } = opts;

  const paymentId = session.metadata?.workshop_payment_id;
  if (typeof paymentId !== "string" || paymentId.length === 0) return true;

  // Delayed-notification payment methods (e.g. BECS direct debit) can fire
  // checkout.session.completed before funds actually clear, leaving
  // payment_status "unpaid" rather than "paid". Checkout is pinned to
  // card-only (app/api/pay/checkout/route.ts) specifically to avoid this,
  // but guard it here too: a retry of the same event can never change this
  // outcome, so it's terminal (true), not transient.
  if (session.payment_status !== "paid") {
    console.error(
      `[payments/fulfil] session ${session.id} completed with payment_status=` +
        `${session.payment_status} (expected "paid") for id=${paymentId}`,
    );
    return true;
  }

  const { data: row, error } = await supabase
    .from("workshop_payments")
    .select("id, name, email, amount_cents, currency, description, status")
    .eq("id", paymentId)
    .maybeSingle();
  if (error) {
    // Could be transient (network blip, connection pool exhaustion) --
    // false tells the webhook to 500 so Stripe retries the event.
    console.error(`[payments/fulfil] lookup failed for id=${paymentId}`, error);
    return false;
  }
  if (!row) {
    // No row will ever appear for this id -- retrying can't fix that.
    console.error(
      `[payments/fulfil] no workshop_payments row for id=${paymentId}`,
    );
    return true;
  }
  // Cheap pre-check; the conditional UPDATE below is the real idempotency
  // gate that also covers concurrent deliveries racing each other.
  if (row.status === "paid") return true;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  // Money has been taken even if the link was voided post-checkout-creation,
  // so any non-paid status transitions to paid here. `.neq("status", "paid")`
  // makes this UPDATE atomic-and-observed: if two deliveries race, only one
  // matches a row and gets it back from .select() -- the loser sees zero
  // rows and must not send emails.
  const { data: updated, error: updateError } = await supabase
    .from("workshop_payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: session.id,
    })
    .eq("id", paymentId)
    .neq("status", "paid")
    .select("id");
  if (updateError) {
    // The silent-money-loss path: card charged, row still pending. False
    // makes the webhook 500 so Stripe retries -- safe, since this UPDATE
    // is idempotent.
    console.error("[payments/fulfil] paid update failed:", updateError);
    return false;
  }
  if (!updated || updated.length === 0) {
    // A concurrent delivery already flipped this row to paid (and is
    // sending, or has sent, the emails) -- don't send them again.
    return true;
  }

  const amount = formatAmount(row.amount_cents, row.currency);

  // Each send is individually caught: a THROWN failure (network/SDK) after
  // the paid UPDATE would otherwise abort fulfilment, and because the row is
  // now paid, every webhook retry exits early -- the notifications would be
  // lost permanently. Thrown and returned errors get identical treatment:
  // log, carry on.
  const confirmation = renderPaymentConfirmationEmail({
    name: row.name,
    description: row.description,
    amount,
    reference: paymentIntentId ?? session.id,
  });
  try {
    const { error: confirmError } = await sendEmail({
      from,
      to: row.email,
      replyTo: internalTo,
      subject: confirmation.subject,
      html: confirmation.html,
    });
    if (confirmError) {
      console.error(
        "[payments/fulfil] confirmation email failed:",
        confirmError,
      );
    }
  } catch (err) {
    console.error("[payments/fulfil] confirmation email threw:", err);
  }

  const alert = renderPaymentAlertEmail({
    name: row.name,
    email: row.email,
    description: row.description,
    amount,
  });
  try {
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
  } catch (err) {
    console.error("[payments/fulfil] alert email threw:", err);
  }

  // Email failures are logged but never cause a retry -- the row is already
  // paid, so retrying the event would just be an idempotent no-op UPDATE.
  return true;
}
