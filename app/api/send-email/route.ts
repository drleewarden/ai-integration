import { Resend } from "resend";
import { NextResponse } from "next/server";

// Initialize Resend only when API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface ConsultationRequestBody {
  name: string;
  email: string;
  company?: string;
  message: string;
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
    // Check if Resend is properly configured
    if (!resend) {
      console.error("[send-email] Resend API key not configured");
      return NextResponse.json(
        { error: "Email service not configured. Please contact us directly." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as ConsultationRequestBody;
    const name = body?.name?.trim() ?? "";
    const email = body?.email?.trim() ?? "";
    const company = body?.company?.trim() ?? "";
    const message = body?.message?.trim() ?? "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 },
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }
    if (message.length > 5000) {
      return NextResponse.json(
        {
          error: "Message is too long — please keep it under 5,000 characters.",
        },
        { status: 400 },
      );
    }

    const FROM =
      process.env.RESEND_FROM ?? "Creative Milk <onboarding@resend.dev>";
    const TO = process.env.RESEND_TO ?? "drleewarden@gmail.com";

    const html = renderEmail({
      name: escapeHtml(name),
      email: escapeHtml(email),
      company: company ? escapeHtml(company) : "",
      message: escapeHtml(message).replace(/\n/g, "<br>"),
    });

    const data = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `New project enquiry — ${name}`,
      html,
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    console.error("[send-email]", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to send. Please try again or email us directly.",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

function renderEmail(fields: {
  name: string;
  email: string;
  company: string;
  message: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New project enquiry</title>
</head>
<body style="margin:0;background:#0F1526;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#F5F0E8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F1526;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0F1526;border:1px solid rgba(245,240,232,0.08);">

        <tr><td style="padding:32px 40px;border-bottom:1px solid rgba(245,240,232,0.08);">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;">— New enquiry</div>
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

          ${
            fields.company
              ? `<div style="margin-bottom:24px;">
                   <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:6px;">Company</div>
                   <div style="font-size:16px;color:#F5F0E8;">${fields.company}</div>
                 </div>`
              : ""
          }

          <div>
            <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:6px;">Message</div>
            <div style="font-size:15px;line-height:1.7;color:#F5F0E8;background:rgba(245,240,232,0.04);border-left:2px solid #C9A84C;padding:16px 20px;">
              ${fields.message}
            </div>
          </div>
        </td></tr>

        <tr><td style="padding:24px 40px;border-top:1px solid rgba(245,240,232,0.08);font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;color:rgba(245,240,232,0.32);">
          Sent from the Creative Milk contact form
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
