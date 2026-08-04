import { Resend } from "resend";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, isLikelyBot } from "@/lib/rate-limit";
import { getServiceSupabase } from "@/lib/supabase/server";
import { baseUrl } from "@/lib/payments/base-url";
import {
  formatAmount,
  htmlToText,
  renderPaymentRequestEmail,
} from "@/lib/payments/emails";
import {
  WORKSHOP_CURRENCY,
  WORKSHOP_DESCRIPTION,
  WORKSHOP_SEAT_CENTS,
  WORKSHOP_SIGNUP_CREATED_BY,
} from "@/lib/payments/workshop";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface WorkshopSignupBody {
  name: string;
  email: string;
  businessType: string;
  /** Optional -- workflows/tasks the signup would like automated. */
  workflows?: string;
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

export async function POST(request: NextRequest): Promise<NextResponse> {
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
    const workflows = body?.workflows?.trim() ?? "";

    if (!name || !email || !businessType) {
      return NextResponse.json(
        { error: "Name, email, and type of business are required." },
        { status: 400 },
      );
    }
    if (!EMAIL_RE.test(email) || email.length > 320) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }
    // Length caps mirror the admin route and the workshop_payments columns --
    // these values now reach the database, not just an email body.
    if (name.length > 200) {
      return NextResponse.json(
        { error: "Name is too long -- please keep it under 200 characters." },
        { status: 400 },
      );
    }
    if (businessType.length > 200) {
      return NextResponse.json(
        {
          error:
            "Type of business is too long -- please keep it under 200 characters.",
        },
        { status: 400 },
      );
    }
    if (workflows.length > 2000) {
      return NextResponse.json(
        { error: "Workflows note is too long -- please keep it under 2,000 characters." },
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
      workflows: workflows ? escapeHtml(workflows).replace(/\n/g, "<br>") : "",
    };

    const notification = renderEmail(safe);
    const { data, error: sendError } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `New workshop signup -- ${name}`,
      html: notification,
      text: htmlToText(notification),
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

    // Auto-create this signup's payment link so the auto-reply is the same
    // email the admin section sends. The amount comes from the server-side
    // constant, never the request body, so a signup cannot set its own price.
    // A failure here is logged and the reply still goes out without the pay
    // button -- the internal notification above already succeeded, so an
    // admin can raise the link by hand from /members/admin/payment-links.
    let payUrl: string | undefined;
    try {
      const { data: row, error: rowError } = await getServiceSupabase()
        .from("workshop_payments")
        .insert({
          name,
          email,
          amount_cents: WORKSHOP_SEAT_CENTS,
          currency: WORKSHOP_CURRENCY,
          description: WORKSHOP_DESCRIPTION,
          created_by: WORKSHOP_SIGNUP_CREATED_BY,
        })
        .select("id")
        .single();
      if (rowError || !row) {
        console.error("[workshop-signup] payment row insert failed:", rowError);
      } else {
        payUrl = `${baseUrl(request)}/pay/${row.id}`;
      }
    } catch (err) {
      console.error("[workshop-signup] payment row insert threw:", err);
    }

    // Auto-reply to the person who signed up. The internal notification has
    // already succeeded, so any failure here is logged but not surfaced --
    // we don't want to tell the user the signup failed when we've got it.
    const confirmation = renderPaymentRequestEmail({
      name,
      description: WORKSHOP_DESCRIPTION,
      amount: formatAmount(WORKSHOP_SEAT_CENTS, WORKSHOP_CURRENCY),
      payUrl,
    });
    const { error: confirmError } = await resend.emails.send({
      from: FROM,
      to: email,
      replyTo: TO,
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
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
  workflows: string;
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

          <div${fields.workflows ? ' style="margin-bottom:24px;"' : ""}>
            <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:6px;">Type of business</div>
            <div style="font-size:16px;color:#F5F0E8;">${fields.businessType}</div>
          </div>

          ${
            fields.workflows
              ? `<div>
                   <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:6px;">Workflows they'd like automated</div>
                   <div style="font-size:15px;line-height:1.7;color:#F5F0E8;background:rgba(245,240,232,0.04);border-left:2px solid #C9A84C;padding:16px 20px;">${fields.workflows}</div>
                 </div>`
              : ""
          }
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
