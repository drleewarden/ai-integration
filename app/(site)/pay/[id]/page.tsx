/**
 * /pay/[id] -- public payment page for a workshop payment link.
 *
 * The id is an unguessable UUID; the page projects only what a payer needs
 * to see (first name, amount, description, status) and never exposes the
 * full row. noindex: these are private, emailed links.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import { getServiceSupabase } from "@/lib/supabase/server";
import { UUID_RE } from "@/lib/payments/validate";
import { formatAmount } from "@/lib/payments/emails";
import PayButton from "./PayButton";

export const metadata: Metadata = {
  title: "Workshop payment | Creative Milk",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  if (!UUID_RE.test(id)) notFound();

  const { data: row, error } = await getServiceSupabase()
    .from("workshop_payments")
    .select("id, name, amount_cents, currency, description, status")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("[pay] lookup failed:", error);
  if (!row) notFound();

  const firstName = row.name.split(" ")[0] || row.name;
  const amount = formatAmount(row.amount_cents, row.currency);
  // Checkout redirects back with ?success=1 before the webhook lands, so
  // treat that as paid for display purposes -- but never let the (user-
  // editable) query param mask a voided link's real state.
  const state: "pending" | "paid" | "void" =
    row.status === "void"
      ? "void"
      : row.status === "paid" || success === "1"
        ? "paid"
        : "pending";

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav forceDark />
      <main id="main">
        <section className="section">
          <div className="container">
            <div style={{ maxWidth: 640, marginInline: "auto" }}>
              <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
                Workshop payment
              </p>

              {state === "paid" && (
                <>
                  <h1
                    className="h-display"
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                      marginBottom: "2rem",
                    }}
                  >
                    Payment received
                  </h1>
                  <p style={{ fontSize: "1.125rem", lineHeight: 1.6 }}>
                    Thanks {firstName} — you&rsquo;re all set. A confirmation
                    email is on its way, and Stripe will send your card
                    receipt separately.
                  </p>
                </>
              )}

              {state === "void" && (
                <>
                  <h1
                    className="h-display"
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                      marginBottom: "2rem",
                    }}
                  >
                    This link is no longer active
                  </h1>
                  <p style={{ fontSize: "1.125rem", lineHeight: 1.6 }}>
                    This payment link has been cancelled. If you think
                    that&rsquo;s a mistake, email us at{" "}
                    <a href="mailto:contact@creative-milk.com.au">
                      contact@creative-milk.com.au
                    </a>{" "}
                    and we&rsquo;ll sort it out.
                  </p>
                </>
              )}

              {state === "pending" && (
                <>
                  <h1
                    className="h-display"
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                      marginBottom: "2rem",
                    }}
                  >
                    Hi {firstName}, here&rsquo;s your payment
                  </h1>
                  <dl
                    style={{
                      margin: "0 0 2.5rem",
                      padding: "1.5rem",
                      background: "rgba(245,240,232,0.04)",
                      borderLeft: "2px solid var(--liquid-gold)",
                    }}
                  >
                    <dt
                      className="eyebrow no-rule"
                      style={{ marginBottom: "0.35rem" }}
                    >
                      What you&rsquo;re paying for
                    </dt>
                    <dd
                      style={{ margin: "0 0 1.5rem", fontSize: "1.125rem" }}
                    >
                      {row.description}
                    </dd>
                    <dt
                      className="eyebrow no-rule"
                      style={{ marginBottom: "0.35rem" }}
                    >
                      Amount
                    </dt>
                    <dd style={{ margin: 0, fontSize: "1.5rem" }}>{amount}</dd>
                  </dl>
                  <PayButton paymentId={row.id} />
                  <p
                    style={{
                      marginTop: "1.5rem",
                      fontSize: "0.875rem",
                      opacity: 0.7,
                    }}
                  >
                    Payment is handled securely by Stripe — your card details
                    never touch our servers.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
