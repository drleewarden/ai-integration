import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/auth-server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { isAdminEmail, parseAdminEmails } from "@/lib/payments/admin";
import { formatAmount } from "@/lib/payments/emails";
import "./workshop-signups.css";

export const metadata: Metadata = {
  title: "Workshop signups | Creative Milk Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface WorkshopSignupRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  business_type: string | null;
  workflows: string | null;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "void";
  paid_at: string | null;
}

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Australia/Melbourne",
});

export default async function WorkshopSignupsAdminPage() {
  const user = await getSessionUser();
  const allowlist = parseAdminEmails(process.env.ADMIN_EMAILS);
  if (!isAdminEmail(user?.email, allowlist)) notFound();

  const service = getServiceSupabase();
  const detailedResult = await service
    .from("workshop_payments")
    .select(
      "id, created_at, name, email, business_type, workflows, amount_cents, currency, status, paid_at",
    )
    .eq("created_by", "workshop-signup")
    .order("created_at", { ascending: false })
    .limit(100);

  const migrationPending = detailedResult.error?.code === "42703";
  let loadError = migrationPending ? null : detailedResult.error;
  let rows = (detailedResult.data ?? []) as WorkshopSignupRow[];

  if (migrationPending) {
    const fallbackResult = await service
      .from("workshop_payments")
      .select(
        "id, created_at, name, email, amount_cents, currency, status, paid_at",
      )
      .eq("created_by", "workshop-signup")
      .order("created_at", { ascending: false })
      .limit(100);

    loadError = fallbackResult.error;
    rows = (fallbackResult.data ?? []).map((row) => ({
      ...row,
      business_type: null,
      workflows: null,
    })) as WorkshopSignupRow[];
  }

  if (loadError) {
    const { code, message, details, hint } = loadError;
    console.warn("[admin/workshop-signups] list failed:", {
      code,
      message,
      details,
      hint,
    });
  }

  return (
    <section className="section workshop-signups-admin">
      <div className="container">
        <header className="workshop-signups-header">
          <div>
            <h1 className="h-display">Workshop signups</h1>
            <p>
              Attendee details, workflow interests and payment status from the
              public Elwood workshop form.
            </p>
          </div>
          <Link href="/members/admin/payment-links" className="cta">
            Payment links
          </Link>
        </header>

        {migrationPending && !loadError && (
          <div className="workshop-signups-notice" role="status">
            <strong>Database update required.</strong> Existing signup and
            payment details are shown below. Apply migration 0005 to start
            capturing business type and workflow notes.
          </div>
        )}

        {loadError ? (
          <div className="workshop-signups-empty" role="alert">
            <h2>Signup details are unavailable</h2>
            <p>
              Check that migration 0005 has been applied, then reload this
              page.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="workshop-signups-empty">
            <h2>No workshop signups yet</h2>
            <p>New public workshop registrations will appear here.</p>
          </div>
        ) : (
          <ol className="workshop-signups-list">
            {rows.map((row) => (
              <li key={row.id} className="workshop-signup-record">
                <div className="workshop-signup-summary">
                  <div>
                    <h2>{row.name}</h2>
                    <a href={`mailto:${row.email}`}>{row.email}</a>
                  </div>
                  <span className={`workshop-signup-status ${row.status}`}>
                    {row.status}
                  </span>
                </div>

                <dl className="workshop-signup-facts">
                  <div>
                    <dt>Signed up</dt>
                    <dd>{dateFormatter.format(new Date(row.created_at))}</dd>
                  </div>
                  <div>
                    <dt>Business</dt>
                    <dd>{row.business_type || "Not supplied"}</dd>
                  </div>
                  <div>
                    <dt>Payment</dt>
                    <dd>
                      {formatAmount(row.amount_cents, row.currency)}
                      {row.paid_at
                        ? `, paid ${dateFormatter.format(new Date(row.paid_at))}`
                        : ""}
                    </dd>
                  </div>
                </dl>

                <div className="workshop-signup-workflow">
                  <h3>What they want to automate</h3>
                  <p>{row.workflows || "No workflow notes supplied."}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
