/**
 * Admin-only: create and manage workshop payment links.
 * Gate: middleware forces a members login for /members/*; this page then
 * 404s anyone not on the ADMIN_EMAILS allowlist so the page's existence is
 * not advertised. The API route re-checks the same allowlist on every call.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/auth-server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { isAdminEmail, parseAdminEmails } from "@/lib/payments/admin";
import PaymentLinksClient, { type PaymentRow } from "./PaymentLinksClient";

export const metadata: Metadata = {
  title: "Payment links | Creative Milk Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PaymentLinksAdminPage() {
  const user = await getSessionUser();
  const allowlist = parseAdminEmails(process.env.ADMIN_EMAILS);
  if (!isAdminEmail(user?.email, allowlist)) notFound();

  const { data, error } = await getServiceSupabase()
    .from("workshop_payments")
    .select("id, created_at, name, email, amount_cents, currency, description, status")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) console.error("[admin/payment-links] list failed:", error);

  return (
    <section className="section">
      <div className="container">
        <div style={{ maxWidth: 720, marginInline: "auto" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
            Admin
          </p>
          <h1
            className="h-display"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              marginBottom: "2rem",
            }}
          >
            Workshop payment links
          </h1>
          <PaymentLinksClient initialRows={(data ?? []) as PaymentRow[]} />
        </div>
      </div>
    </section>
  );
}
