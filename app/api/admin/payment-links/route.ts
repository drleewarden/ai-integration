/**
 * Admin-only management of workshop payment links.
 *
 * POST  { name, email, amount (dollars string), description }
 *       -> creates a workshop_payments row and emails the invitee their
 *          /pay/<id> link. 200 { id, url, emailSent }.
 * PATCH { id } -> voids a PENDING link (paid rows are immutable). 200|409.
 *
 * Auth: Supabase session cookie proves identity; the ADMIN_EMAILS allowlist
 * decides authorisation. Checked here on every call -- the admin page's own
 * gate is presentation only and is never trusted.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/supabase/auth-server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { isAdminEmail, parseAdminEmails } from "@/lib/payments/admin";
import {
  EMAIL_RE,
  UUID_RE,
  parseDollarsToCents,
} from "@/lib/payments/validate";
import { formatAmount, renderPaymentRequestEmail } from "@/lib/payments/emails";
import { baseUrl } from "@/lib/payments/base-url";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/** Returns the admin's email, or null when the caller isn't an admin. */
async function requireAdmin(): Promise<string | null> {
  const user = await getSessionUser();
  const allowlist = parseAdminEmails(process.env.ADMIN_EMAILS);
  if (!user?.email || !isAdminEmail(user.email, allowlist)) return null;
  return user.email;
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit("admin-payment-links", req, {
    limit: 30,
    windowMs: 60 * 60_000,
  });
  if (limited) return limited;

  const adminEmail = await requireAdmin();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const amountCents = parseDollarsToCents(
    typeof body.amount === "string" ? body.amount : "",
  );

  if (!name || name.length > 200) {
    return NextResponse.json(
      { error: "Name is required (max 200 characters)." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }
  if (!description || description.length > 500) {
    return NextResponse.json(
      { error: "Description is required (max 500 characters)." },
      { status: 400 },
    );
  }
  if (amountCents === null) {
    return NextResponse.json(
      { error: "Amount must be between $0.01 and $10,000.00." },
      { status: 400 },
    );
  }

  const { data: row, error } = await getServiceSupabase()
    .from("workshop_payments")
    .insert({
      name,
      email,
      amount_cents: amountCents,
      description,
      created_by: adminEmail,
    })
    .select("id")
    .single();
  if (error || !row) {
    console.error("[admin/payment-links] insert failed:", error);
    return NextResponse.json(
      { error: "Couldn't create the payment link. Please try again." },
      { status: 500 },
    );
  }

  const payUrl = `${baseUrl(req)}/pay/${row.id}`;

  let emailSent = false;
  if (resend) {
    const FROM =
      process.env.RESEND_FROM ?? "Creative Milk <onboarding@resend.dev>";
    const TO = process.env.RESEND_TO ?? "contact@creative-milk.com.au";
    const msg = renderPaymentRequestEmail({
      name,
      description,
      amount: formatAmount(amountCents, "aud"),
      payUrl,
    });
    const { error: sendError } = await resend.emails.send({
      from: FROM,
      to: email,
      replyTo: TO,
      subject: msg.subject,
      html: msg.html,
    });
    if (sendError) {
      // The link still exists -- surface emailSent:false so the admin can
      // copy it manually rather than silently believing it was delivered.
      console.error("[admin/payment-links] request email failed:", sendError);
    } else {
      emailSent = true;
    }
  } else {
    console.error("[admin/payment-links] RESEND_API_KEY not configured");
  }

  return NextResponse.json({ id: row.id, url: payUrl, emailSent });
}

export async function PATCH(req: NextRequest) {
  const limited = checkRateLimit("admin-payment-links", req, {
    limit: 30,
    windowMs: 60 * 60_000,
  });
  if (limited) return limited;

  const adminEmail = await requireAdmin();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
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

  // pending -> void is the only allowed transition; the .eq status guard
  // makes paid/void rows a no-op (0 rows matched).
  const { data, error } = await getServiceSupabase()
    .from("workshop_payments")
    .update({ status: "void" })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");
  if (error) {
    console.error("[admin/payment-links] void failed:", error);
    return NextResponse.json(
      { error: "Couldn't void the link. Please try again." },
      { status: 500 },
    );
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "Only pending links can be voided." },
      { status: 409 },
    );
  }
  return NextResponse.json({ success: true });
}
