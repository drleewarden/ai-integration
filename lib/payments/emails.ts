/**
 * Email templates for the workshop payment-links flow. All user-supplied
 * fields are escaped HERE (input handling) -- callers pass raw strings and
 * must not pre-escape. Rendering is pure so it unit-tests without Resend.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatAmount(amountCents: number, currency: string): string {
  return `$${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

/** Shared dark shell matching the workshop-signup emails. */
function emailShell(eyebrow: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Creative Milk</title></head>
<body style="margin:0;background:#0F1526;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#F5F0E8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F1526;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0F1526;border:1px solid rgba(245,240,232,0.08);">
        <tr><td style="padding:32px 40px;border-bottom:1px solid rgba(245,240,232,0.08);">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;">-- ${eyebrow}</div>
          <div style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#F5F0E8;letter-spacing:-0.01em;line-height:1.05;">
            Creative <em style="color:#C9A84C;font-style:italic;">Milk</em>
          </div>
        </td></tr>
        <tr><td style="padding:32px 40px;">${inner}</td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid rgba(245,240,232,0.08);font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;color:rgba(245,240,232,0.32);">
          Creative Milk &middot; contact@creative-milk.com.au
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<div style="margin-bottom:18px;">
    <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:4px;">${label}</div>
    <div style="font-size:15px;color:#F5F0E8;">${value}</div>
  </div>`;
}

const PARA =
  'style="font-size:16px;line-height:1.6;color:rgba(245,240,232,0.85);margin:0 0 20px;"';

/** Sent by the admin route when a payment link is created. */
export function renderPaymentRequestEmail(f: {
  name: string;
  description: string;
  amount: string;
  payUrl: string;
}): { subject: string; html: string } {
  const name = escapeHtml(f.name);
  const firstName = name.split(" ")[0] || name;
  const description = escapeHtml(f.description);
  const amount = escapeHtml(f.amount);
  const inner = `
    <p ${PARA}>Hi ${firstName},</p>
    <p ${PARA}>Here's your payment link for the workshop. The amount is set for you — just click through and pay securely with Stripe.</p>
    <div style="margin:28px 0;padding:20px 24px;background:rgba(245,240,232,0.04);border-left:2px solid #C9A84C;">
      ${detailRow("For", name)}
      ${detailRow("What you're paying for", description)}
      ${detailRow("Amount", amount)}
    </div>
    <div style="margin:32px 0;">
      <a href="${f.payUrl}" style="display:inline-block;background:#C9A84C;color:#0F1526;font-size:15px;font-weight:600;letter-spacing:0.04em;text-decoration:none;padding:14px 32px;">Pay securely &rarr;</a>
    </div>
    <p ${PARA}>The link doesn't expire, and payment is handled end-to-end by Stripe — we never see your card details. Any questions, just hit reply.</p>
    <p ${PARA}><span style="color:#F5F0E8;">-- The Creative Milk team</span></p>`;
  return {
    subject: `Your workshop payment link — ${f.amount}`,
    html: emailShell("Payment link", inner),
  };
}

/** Sent by the Stripe webhook to the payer once payment lands. */
export function renderPaymentConfirmationEmail(f: {
  name: string;
  description: string;
  amount: string;
}): { subject: string; html: string } {
  const name = escapeHtml(f.name);
  const firstName = name.split(" ")[0] || name;
  const description = escapeHtml(f.description);
  const amount = escapeHtml(f.amount);
  const inner = `
    <p ${PARA}>Hi ${firstName},</p>
    <p ${PARA}>Payment received — you're all set. Here's what you've paid for:</p>
    <div style="margin:28px 0;padding:20px 24px;background:rgba(245,240,232,0.04);border-left:2px solid #C9A84C;">
      ${detailRow("Item", description)}
      ${detailRow("Amount paid", amount)}
    </div>
    <p ${PARA}>Stripe will send you a separate card receipt. We'll be in touch with joining details closer to the day — anything in the meantime, just hit reply.</p>
    <p ${PARA}>Looking forward to having you in the room.<br><span style="color:#F5F0E8;">-- The Creative Milk team</span></p>`;
  return {
    subject: "Payment received — Creative Milk Workshop",
    html: emailShell("Payment received", inner),
  };
}

/** Sent by the Stripe webhook to RESEND_TO (internal alert). */
export function renderPaymentAlertEmail(f: {
  name: string;
  email: string;
  description: string;
  amount: string;
}): { subject: string; html: string } {
  const name = escapeHtml(f.name);
  const email = escapeHtml(f.email);
  const description = escapeHtml(f.description);
  const amount = escapeHtml(f.amount);
  const inner = `
    ${detailRow("Name", name)}
    ${detailRow("Email", `<a href="mailto:${email}" style="color:#C9A84C;text-decoration:none;border-bottom:1px solid rgba(201,168,76,0.35);">${email}</a>`)}
    ${detailRow("Paid for", description)}
    ${detailRow("Amount", amount)}`;
  return {
    subject: `Workshop payment received — ${f.name} (${f.amount})`,
    html: emailShell("Workshop payment", inner),
  };
}
