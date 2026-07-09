import { Resend } from "resend";
import { NextResponse } from "next/server";
import { checkRateLimit, isLikelyBot } from "@/lib/rate-limit";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface WorkshopSignupBody {
  name: string;
  email: string;
  businessType: string;
  /** Honeypot field -- humans never see it, bots fill it. */
  website?: string;
  /** Epoch ms when the form mounted; sub-3s submits are treated as bots. */
  formStartedAt?: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Rate limit: 5 signups per hour per IP
    const limited = checkRateLimit("workshop-signup", request, {
      limit: 5,
      windowMs: 60 * 60_000,
    });
    if (limited) return limited;

    if (!resend) {
      console.error("[workshop-signup] Resend API key not configured");
      return NextResponse.json(
        { error: "Signup service not configured. Please email us directly." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as WorkshopSignupBody;

    // Honeypot / timing check: respond success-shaped, send nothing.
    if (isLikelyBot(body)) {
      console.warn("[workshop-signup] honeypot triggered -- dropping submission");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const name = body?.name?.trim() ?? "";
    const email = body?.email?.trim() ?? "";
    const businessType = body?.businessType?.trim() ?? "";

    if (!name || !email || !businessType) {
      return NextResponse.json(
        { error: "Name, email, and type of business are required." },
        { status: 400 },
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const FROM =
      process.env.RESEND_FROM ?? "Creative Milk <onboarding@resend.dev>";
    const TO = process.env.RESEND_TO ?? "contact@creative-milk.com.au";

    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      businessType: escapeHtml(businessType),
    };

    const { data, error: sendError } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `New workshop signup -- ${name}`,
      html: renderEmail(safe),
    });

    if (sendError) {
      console.error("[workshop-signup] Resend rejected the send:", sendError);
      return NextResponse.json(
        {
          error:
            "Couldn't save your signup. Please email us directly at contact@creative-milk.com.au.",
        },
        { status: 502 },
      );
    }

    // Auto-reply to the person who signed up. The internal notification has
    // already succeeded, so any failure here is logged but not surfaced --
    // we don't want to tell the user the signup failed when we've got it.
    const { error: confirmError } = await resend.emails.send({
      from: FROM,
      to: email,
      replyTo: TO,
      subject: "You're on the list -- Creative Milk Workshop, Fri 7 Aug",
      html: renderConfirmationEmail({ name: safe.name }),
    });

    if (confirmError) {
      console.error(
        "[workshop-signup] confirmation email failed:",
        confirmError,
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    console.error("[workshop-signup]", error);
    return NextResponse.json(
      { error: "Failed to sign up. Please try again or email us directly." },
      { status: 500 },
    );
  }
}

function renderEmail(fields: {
  name: string;
  email: string;
  businessType: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New workshop signup</title>
</head>
<body style="margin:0;background:#0F1526;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#F5F0E8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F1526;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0F1526;border:1px solid rgba(245,240,232,0.08);">

        <tr><td style="padding:32px 40px;border-bottom:1px solid rgba(245,240,232,0.08);">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;">-- Workshop signup</div>
          <div style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#F5F0E8;letter-spacing:-0.01em;line-height:1.05;">
            Creative <em style="color:#C9A84C;font-style:italic;">Milk</em>
          </div>
        </td></tr>

        <tr><td style="padding:32px 40px;">
          <div style="margin-bottom:24px;">
            <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:6px;">Name</div>
            <div style="font-size:16px;color:#F5F0E8;">${fields.name}</div>
          </div>

          <div style="margin-bottom:24px;">
            <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:6px;">Email</div>
            <div style="font-size:16px;"><a href="mailto:${fields.email}" style="color:#C9A84C;text-decoration:none;border-bottom:1px solid rgba(201,168,76,0.35);">${fields.email}</a></div>
          </div>

          <div>
            <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:6px;">Type of business</div>
            <div style="font-size:16px;color:#F5F0E8;">${fields.businessType}</div>
          </div>
        </td></tr>

        <tr><td style="padding:24px 40px;border-top:1px solid rgba(245,240,232,0.08);font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;color:rgba(245,240,232,0.32);">
          Sent from the workshop signup form
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function renderConfirmationEmail(fields: { name: string }): string {
  const firstName = fields.name.split(" ")[0] || fields.name;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>You're on the list -- Creative Milk Workshop</title>
</head>
<body style="margin:0;background:#0F1526;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#F5F0E8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F1526;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0F1526;border:1px solid rgba(245,240,232,0.08);">

        <tr><td style="padding:32px 40px;border-bottom:1px solid rgba(245,240,232,0.08);">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;">-- You're on the list</div>
          <div style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#F5F0E8;letter-spacing:-0.01em;line-height:1.05;">
            Creative <em style="color:#C9A84C;font-style:italic;">Milk</em>
          </div>
        </td></tr>

        <tr><td style="padding:32px 40px;">
          <p style="font-size:16px;line-height:1.6;color:#F5F0E8;margin:0 0 20px;">
            Hi ${firstName},
          </p>
          <p style="font-size:16px;line-height:1.6;color:rgba(245,240,232,0.85);margin:0 0 20px;">
            Thanks for signing up to the workshop -- your seat's reserved.
            Here's what you've booked in:
          </p>

          <div style="margin:28px 0;padding:20px 24px;background:rgba(245,240,232,0.04);border-left:2px solid #C9A84C;">
            <div style="margin-bottom:18px;">
              <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:4px;">Workshop</div>
              <div style="font-size:15px;color:#F5F0E8;">Automate your business -- put time back in your pocket</div>
            </div>
            <div style="margin-bottom:18px;">
              <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:4px;">Date &amp; time</div>
              <div style="font-size:15px;color:#F5F0E8;">Friday 7 August 2026, 3:00 -- 5:00 PM</div>
            </div>
            <div style="margin-bottom:18px;">
              <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:4px;">Location</div>
              <div style="font-size:15px;color:#F5F0E8;">Elwood + St Kilda Neighbourhood Learning Centre (ESNLC)</div>
            </div>
            <div>
              <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:4px;">Price</div>
              <div style="font-size:15px;color:#F5F0E8;">$39 ($25 early bird)</div>
            </div>
          </div>

          <p style="font-size:16px;line-height:1.6;color:rgba(245,240,232,0.85);margin:0 0 20px;">
            <strong style="color:#F5F0E8;">Next step:</strong>
            we'll follow up separately with payment details and the final
            joining information closer to the day.
          </p>

          <div style="margin-top:28px;padding-top:22px;border-top:1px solid rgba(245,240,232,0.12);">
            <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;">One quick favour</div>
            <p style="font-size:16px;line-height:1.6;color:rgba(245,240,232,0.85);margin:0;">
              We want everyone to walk out with something they can actually
              use. Please reply to this email with one workflow or repetitive
              task you'd like to automate, and we'll shape the live-build
              around what the room actually needs.
            </p>
          </div>

          <p style="font-size:16px;line-height:1.6;color:rgba(245,240,232,0.85);margin:24px 0 20px;">
            If anything else changes on your end, or you have a question in
            the meantime, just hit reply.
          </p>
          <p style="font-size:16px;line-height:1.6;color:rgba(245,240,232,0.85);margin:0;">
            Looking forward to having you in the room.<br>
            <span style="color:#F5F0E8;">-- The Creative Milk team</span>
          </p>
        </td></tr>

        <tr><td style="padding:24px 40px;border-top:1px solid rgba(245,240,232,0.08);font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;color:rgba(245,240,232,0.32);">
          Creative Milk &middot; contact@creative-milk.com.au
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
