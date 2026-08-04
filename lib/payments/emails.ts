/**
 * Email templates for the workshop payment-links flow. All user-supplied
 * fields are escaped HERE (input handling) -- callers pass raw strings and
 * must not pre-escape. Rendering is pure so it unit-tests without Resend.
 */

/** Every template renders both parts -- see htmlToText for why. */
export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * First name, sanitised for use in a Subject header.
 *
 * Input handling: subject lines are headers, so CR/LF and other control
 * characters are stripped rather than escaped -- a name carrying "\r\n" must
 * never be able to start a new header line. Length is capped so a pathological
 * name cannot push the real subject out of the inbox preview. Returns "" when
 * nothing usable survives, and callers fall back to the impersonal subject.
 */
function subjectFirstName(rawName: string): string {
  const first = rawName.trim().split(/\s+/)[0] ?? "";
  return first
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim()
    .slice(0, 40);
}

export function formatAmount(amountCents: number, currency: string): string {
  return `$${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

/**
 * Plain-text alternative derived from our own generated HTML. HTML-only mail
 * is a long-standing spam-filter signal, and these are payment emails, so the
 * text/plain part matters more than usual.
 *
 * Deliberately derived rather than hand-written: a parallel text template
 * would drift out of sync with the HTML the moment either is edited. It only
 * has to handle the markup emailShell/detailRow/bulletList actually emit, not
 * arbitrary HTML.
 */
export function htmlToText(html: string): string {
  return (
    html
      // Drop the document scaffolding entirely.
      .replace(/<!DOCTYPE[^>]*>/gi, "")
      .replace(/<head[\s\S]*?<\/head>/gi, "")
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
      // Links become "label (url)" so the pay URL survives in the text part.
      .replace(
        /<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
        (_m, href: string, label: string) => {
          const text = label.replace(/<[^>]+>/g, "").trim();
          return text && text !== href ? `${text} (${href})` : href;
        },
      )
      .replace(/<li\b[^>]*>/gi, "\n- ")
      .replace(/<br\s*\/?>/gi, "\n")
      // Every remaining block-level close becomes a paragraph break.
      .replace(/<\/(p|div|h[1-6]|ul|tr|td|table)>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      // Only the entities these templates actually emit.
      .replace(/&nbsp;/g, " ")
      .replace(/&middot;/g, "·")
      .replace(/&rarr;/g, "->")
      .replace(/&ndash;/g, "-")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      // Ampersand last, so "&amp;lt;" cannot be double-decoded into a tag.
      .replace(/&amp;/g, "&")
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
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

function sectionHeading(text: string): string {
  return `<h2 style="font-family:Georgia,serif;font-size:24px;font-weight:400;line-height:1.2;color:#F5F0E8;margin:36px 0 16px;">${text}</h2>`;
}

function bulletList(items: string[]): string {
  return `<ul style="font-size:16px;line-height:1.6;color:rgba(245,240,232,0.85);margin:0 0 20px;padding-left:22px;">
    ${items.map((item) => `<li style="margin:0 0 10px;">${item}</li>`).join("\n    ")}
  </ul>`;
}

const PARA =
  'style="font-size:16px;line-height:1.6;color:rgba(245,240,232,0.85);margin:0 0 20px;"';

const WORKSHOP_CALENDAR_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=AI%20Automation%20Workshop" +
  "&dates=20260807T050000Z%2F20260807T070000Z" +
  "&details=AI%20Automation%20Workshop%20with%20Creative%20Milk.%20Bring%20a%20fully%20charged%20laptop%2C%20your%20charger%2C%20and%20an%20active%20Claude%20or%20ChatGPT%20account." +
  "&location=Elwood%20%2B%20St%20Kilda%20Neighbourhood%20Learning%20Centre";

/**
 * Sent by the admin route when a payment link is created, and by the public
 * workshop-signup route as its auto-reply.
 *
 * `payUrl` is optional so the signup route can still send the identical prep
 * email when the payment row could not be created -- the signup is already
 * recorded at that point, so silence would be worse than a link-less email.
 */
export function renderPaymentRequestEmail(f: {
  name: string;
  description: string;
  amount: string;
  payUrl?: string;
}): RenderedEmail {
  const nameWithoutEmDashes = f.name.replace(/\s*—\s*/g, " - ");
  const descriptionWithoutEmDashes = f.description.replace(/\s*—\s*/g, " - ");
  const name = escapeHtml(nameWithoutEmDashes);
  const firstName = escapeHtml(
    nameWithoutEmDashes.trim().split(/\s+/)[0] || nameWithoutEmDashes,
  );
  const description = escapeHtml(descriptionWithoutEmDashes);
  const amount = escapeHtml(f.amount);
  const payUrl = f.payUrl ? escapeHtml(f.payUrl) : null;
  const payIntro = payUrl
    ? `<p ${PARA}>To confirm your place, complete your payment securely through Stripe using the link below.</p>`
    : `<p ${PARA}>To confirm your place, we'll send your secure payment link in a separate email shortly.</p>`;
  const payButton = payUrl
    ? `<div style="margin:32px 0;">
      <a href="${payUrl}" style="display:inline-block;background:#C9A84C;color:#0F1526;font-size:15px;font-weight:600;letter-spacing:0.04em;text-decoration:none;padding:14px 32px;">Pay securely &rarr;</a>
    </div>
    <p ${PARA}>The link doesn't expire. Stripe handles the payment securely, and we never see your card details.</p>`
    : "";
  const inner = `
    <p ${PARA}>Hi ${firstName},</p>
    <p ${PARA}>Thanks for signing up for the AI Automation Workshop. We're looking forward to seeing you at the Elwood + St Kilda Neighbourhood Learning Centre on Friday 7 August, from 3:00 to 5:00 PM.</p>
    ${payIntro}
    <div style="margin:28px 0;padding:20px 24px;background:rgba(245,240,232,0.04);border-left:2px solid #C9A84C;">
      ${detailRow("For", name)}
      ${detailRow("What you're paying for", description)}
      ${detailRow("Amount", amount)}
    </div>
    ${payButton}
    <div style="margin:32px 0;">
      <a href="${WORKSHOP_CALENDAR_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;border:1px solid #C9A84C;color:#C9A84C;font-size:15px;font-weight:600;letter-spacing:0.02em;text-decoration:none;padding:13px 24px;">Add to Google Calendar</a>
    </div>
    <p ${PARA}>Here's everything you need to arrive ready and get the most out of the two-hour session.</p>

    ${sectionHeading("What we'll cover")}
    ${bulletList([
      "<strong style=\"color:#F5F0E8;\">The state of AI for small business in 2026:</strong> what's hype and what's actually moving the needle",
      "<strong style=\"color:#F5F0E8;\">AI fundamentals in plain English:</strong> what these tools really do and where they fall over",
      "<strong style=\"color:#F5F0E8;\">Finding the wins in your own workflow:</strong> a live exercise where you map your week and spot the repetitive, low-judgement tasks AI handles best",
      "<strong style=\"color:#F5F0E8;\">Building a working AI workflow live, from scratch:</strong> chosen on the day based on what the room needs most",
      "<strong style=\"color:#F5F0E8;\">Measuring impact:</strong> what to track at week 1, week 4 and week 12, so you know whether it's actually saving you time",
      "<strong style=\"color:#F5F0E8;\">Q&amp;A, plus one concrete next step</strong> to take the moment you walk out the door",
    ])}

    ${sectionHeading("What to bring")}
    ${bulletList([
      "<strong style=\"color:#F5F0E8;\">A fully charged laptop and your charger.</strong> This is a hands-on session, not a lecture.",
      "<strong style=\"color:#F5F0E8;\">An active Claude or ChatGPT account.</strong> A paid plan is ideal, at roughly AU$30–35 per month, because free plans can hit usage limits quickly during a hands-on session. You can cancel at any time.",
    ])}

    ${sectionHeading("Claude or ChatGPT: which one?")}
    <p ${PARA}>Both are excellent, and everything we build on the day will work with either. They simply have different strengths.</p>
    ${bulletList([
      "<strong style=\"color:#F5F0E8;\">Claude</strong> is the stronger choice for deep thinking, research and writing. It's particularly good at working through long documents, handling multi-step reasoning and producing drafts that sound like you, which matters for the email reply and document workflows we'll be building. The trade-off is that it doesn't generate images.",
      "<strong style=\"color:#F5F0E8;\">ChatGPT</strong> is the more general-purpose toolkit. It can generate and edit images, has voice conversation built in and connects to a broad ecosystem of apps. The trade-off is that, for careful long-form reasoning and writing tasks, we generally find Claude produces stronger results.",
    ])}
    <p ${PARA}>If you already use one of them, bring that. There's no need to buy the other. If you're starting fresh and your work is mostly words, documents and email, we'd lean towards Claude. If you know you'll want images and voice, choose ChatGPT.</p>

    ${sectionHeading("One thing to do before the workshop")}
    <p ${PARA}>Reply to this email and tell us:</p>
    ${bulletList([
      "<strong style=\"color:#F5F0E8;\">Your top three pain points</strong> in your day-to-day work, especially the repetitive tasks that eat into your week",
      "<strong style=\"color:#F5F0E8;\">Any specific AI or agentic workflows you'd like to see built,</strong> such as answering customer enquiries, summarising supplier quotes or drafting your weekly newsletter",
    ])}
    <p ${PARA}>We read every reply and use them to choose the live build on the day, so this is your chance to make the session relevant to your business.</p>
    <p ${PARA}>If you have any questions before then, just reply to this email.</p>
    <p ${PARA}>See you on the 7th,<br><span style="color:#F5F0E8;">The Creative Milk team</span><br><a href="mailto:contact@creative-milk.com.au" style="color:#C9A84C;text-decoration:none;">contact@creative-milk.com.au</a></p>`;
  const html = emailShell("Workshop payment and preparation", inner);
  // Personalised so repeat sends to one address don't share an identical
  // subject -- Gmail threads on subject plus participants and collapses the
  // duplicated body behind its "trimmed content" ellipsis. Falls back to the
  // impersonal line when the name yields nothing usable.
  const subjectName = subjectFirstName(nameWithoutEmDashes);
  const subject = subjectName
    ? `${subjectName}, your AI Automation Workshop: how to prepare (7 Aug, 3–5 PM)`
    : "Your AI Automation Workshop: how to prepare (7 Aug, 3–5 PM)";
  return {
    subject,
    html,
    text: htmlToText(html),
  };
}

/** Sent by the Stripe webhook to the payer once payment lands. */
export function renderPaymentConfirmationEmail(f: {
  name: string;
  description: string;
  amount: string;
  reference: string;
}): RenderedEmail {
  const nameWithoutEmDashes = f.name.replace(/\s*—\s*/g, " - ");
  const descriptionWithoutEmDashes = f.description.replace(/\s*—\s*/g, " - ");
  const firstName = escapeHtml(
    nameWithoutEmDashes.trim().split(/\s+/)[0] || nameWithoutEmDashes,
  );
  const description = escapeHtml(descriptionWithoutEmDashes);
  const amount = escapeHtml(f.amount);
  const reference = escapeHtml(f.reference);
  const inner = `
    <p ${PARA}>Hi ${firstName},</p>
    <p ${PARA}>Thanks, your payment has been received and your place at the AI Automation Workshop is confirmed.</p>
    <div style="margin:28px 0;padding:20px 24px;background:rgba(245,240,232,0.04);border-left:2px solid #C9A84C;">
      ${detailRow("Item", description)}
      ${detailRow("Amount paid", amount)}
      ${detailRow("Payment status", "Paid")}
      ${detailRow("Receipt reference", reference)}
    </div>
    <p ${PARA}>Please keep this email as your payment receipt. If you have any questions, reply to this email and we'll be happy to help.</p>
    <p ${PARA}>We look forward to seeing you on Friday 7 August, from 3:00 to 5:00 PM.<br><span style="color:#F5F0E8;">The Creative Milk team</span><br><a href="mailto:contact@creative-milk.com.au" style="color:#C9A84C;text-decoration:none;">contact@creative-milk.com.au</a></p>`;
  const html = emailShell("Payment receipt", inner);
  return {
    subject: "Payment receipt: AI Automation Workshop",
    html,
    text: htmlToText(html),
  };
}

/** Sent by the Stripe webhook to RESEND_TO (internal alert). */
export function renderPaymentAlertEmail(f: {
  name: string;
  email: string;
  description: string;
  amount: string;
}): RenderedEmail {
  const name = escapeHtml(f.name);
  const email = escapeHtml(f.email);
  const description = escapeHtml(f.description);
  const amount = escapeHtml(f.amount);
  const inner = `
    ${detailRow("Name", name)}
    ${detailRow("Email", `<a href="mailto:${email}" style="color:#C9A84C;text-decoration:none;border-bottom:1px solid rgba(201,168,76,0.35);">${email}</a>`)}
    ${detailRow("Paid for", description)}
    ${detailRow("Amount", amount)}`;
  const html = emailShell("Workshop payment", inner);
  return {
    subject: `Workshop payment received — ${f.name} (${f.amount})`,
    html,
    text: htmlToText(html),
  };
}
