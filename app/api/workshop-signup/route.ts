import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface WorkshopSignupBody {
  name: string;
  email: string;
  businessType: string;
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
    if (!resend) {
      console.error("[workshop-signup] Resend API key not configured");
      return NextResponse.json(
        { error: "Signup service not configured. Please email us directly." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as WorkshopSignupBody;
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
          details: sendError.message ?? String(sendError),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    console.error("[workshop-signup]", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to sign up. Please try again or email us directly.",
        details: errorMessage,
      },
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
