/**
 * Admin-only: every signup in one place, split into Seminar, Workshop and
 * General sections chosen from a dropdown (?type=).
 * Gate: middleware forces a members login for /members/*; this page then
 * 404s anyone not on the ADMIN_EMAILS allowlist so its existence is not
 * advertised. Data is read with the service-role client (PII), server-side.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/auth-server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { isAdminEmail, parseAdminEmails } from "@/lib/payments/admin";
import { formatAmount } from "@/lib/payments/emails";
import {
  SIGNUP_TYPE_LABELS,
  loadGeneralSignups,
  loadSeminarSignups,
  loadWorkshopSignups,
  parseSignupType,
  type GeneralSignupRow,
  type SeminarSignupRow,
  type SignupType,
  type SignupsResult,
  type WorkshopSignupRow,
} from "@/lib/admin/signups";
import SignupTypeSelect from "./SignupTypeSelect";
import "./signups.css";

export const metadata: Metadata = {
  title: "Signups | Creative Milk Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Australia/Melbourne",
});

function formatDate(iso: string | null): string {
  return iso ? dateFormatter.format(new Date(iso)) : "Not yet";
}

const DESCRIPTIONS: Record<SignupType, string> = {
  seminar: "People who scanned the seminar QR code and filled in the form.",
  workshop: "Registrations and payment status from the public workshop form.",
  general:
    "Member accounts created on the site, excluding people already listed under seminar signups.",
};

export default async function SignupsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const user = await getSessionUser();
  const allowlist = parseAdminEmails(process.env.ADMIN_EMAILS);
  if (!isAdminEmail(user?.email, allowlist)) notFound();

  const type = parseSignupType((await searchParams).type);
  const service = getServiceSupabase();

  // Load all three so the dropdown can show a count for each section.
  const [seminar, workshop, general] = await Promise.all([
    loadSeminarSignups(service),
    loadWorkshopSignups(service),
    loadGeneralSignups(service),
  ]);
  const results = { seminar, workshop, general };

  const labels = Object.fromEntries(
    Object.entries(results).map(([key, result]) => [
      key,
      `${SIGNUP_TYPE_LABELS[key as SignupType]} (${result.ok ? result.rows.length : "!"})`,
    ]),
  ) as Record<SignupType, string>;

  const active = results[type];

  return (
    <section className="section signups-admin">
      <div className="container">
        <header className="signups-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="h-display">Signups</h1>
            <p>{DESCRIPTIONS[type]}</p>
          </div>
          <Link href="/members/admin/payment-links" className="cta">
            Payment links
          </Link>
        </header>

        <div className="signups-toolbar">
          <SignupTypeSelect value={type} labels={labels} />
          {active.ok && (
            <span className="signups-count">
              {active.rows.length} {active.rows.length === 1 ? "person" : "people"}
            </span>
          )}
        </div>

        {active.ok && active.notice && (
          <div className="signups-notice" role="status">
            {active.notice}
          </div>
        )}

        <SignupList type={type} result={active} />
      </div>
    </section>
  );
}

function SignupList({
  type,
  result,
}: {
  type: SignupType;
  result: SignupsResult<SeminarSignupRow | WorkshopSignupRow | GeneralSignupRow>;
}) {
  if (!result.ok) {
    return (
      <div className="signups-empty" role="alert">
        <h2>These signups are unavailable</h2>
        <p>{result.message}</p>
      </div>
    );
  }
  if (result.rows.length === 0) {
    return (
      <div className="signups-empty">
        <h2>No {SIGNUP_TYPE_LABELS[type].toLowerCase()} yet</h2>
        <p>New signups will appear here.</p>
      </div>
    );
  }

  return (
    <ol className="signups-list">
      {result.rows.map((row) => (
        <li key={row.id}>
          {type === "seminar" && <SeminarRecord row={row as SeminarSignupRow} />}
          {type === "workshop" && <WorkshopRecord row={row as WorkshopSignupRow} />}
          {type === "general" && <GeneralRecord row={row as GeneralSignupRow} />}
        </li>
      ))}
    </ol>
  );
}

function Record({
  name,
  email,
  createdAt,
  status,
  statusClass,
  children,
}: {
  name: string;
  email: string;
  createdAt: string;
  status: string;
  statusClass?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="signup-record">
      <summary>
        <span className="signup-who">
          <strong>{name}</strong>
          <span>{email}</span>
        </span>
        <span className="signup-date">{formatDate(createdAt)}</span>
        <span className={`signup-status ${statusClass ?? ""}`}>{status}</span>
      </summary>
      <div className="signup-detail">
        <dl className="signup-facts">{children}</dl>
        <a className="signup-mail" href={`mailto:${email}`}>
          Email {name}
        </a>
      </div>
    </details>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function SeminarRecord({ row }: { row: SeminarSignupRow }) {
  const activated = Boolean(row.granted_at);
  return (
    <Record
      name={row.name}
      email={row.email}
      createdAt={row.created_at}
      status={activated ? "Activated" : "Not activated"}
      statusClass={activated ? "good" : undefined}
    >
      <Fact label="Signed up">{formatDate(row.created_at)}</Fact>
      <Fact label="Event code">{row.event_code}</Fact>
      <Fact label="Marketing consent">{row.marketing_opt_in ? "Yes" : "No"}</Fact>
      <Fact label="Pro access granted">{formatDate(row.granted_at)}</Fact>
    </Record>
  );
}

function WorkshopRecord({ row }: { row: WorkshopSignupRow }) {
  return (
    <Record
      name={row.name}
      email={row.email}
      createdAt={row.created_at}
      status={row.status}
      statusClass={row.status === "paid" ? "good" : row.status === "void" ? "muted" : undefined}
    >
      <Fact label="Signed up">{formatDate(row.created_at)}</Fact>
      <Fact label="Business">{row.business_type || "Not supplied"}</Fact>
      <Fact label="Payment">
        {formatAmount(row.amount_cents, row.currency)}
        {row.paid_at ? `, paid ${formatDate(row.paid_at)}` : ""}
      </Fact>
      <Fact label="What they want to automate">
        <span className="signup-notes">{row.workflows || "No workflow notes supplied."}</span>
      </Fact>
    </Record>
  );
}

function GeneralRecord({ row }: { row: GeneralSignupRow }) {
  const compPro =
    row.complimentary_pro_until && new Date(row.complimentary_pro_until) > new Date();
  const plan = row.tier === "pro" ? "Pro" : compPro ? "Pro (complimentary)" : "Free";
  return (
    <Record
      name={row.display_name || row.email}
      email={row.email}
      createdAt={row.created_at}
      status={plan}
      statusClass={plan === "Free" ? undefined : "good"}
    >
      <Fact label="Joined">{formatDate(row.created_at)}</Fact>
      <Fact label="Plan">{plan}</Fact>
      <Fact label="Subscription">{row.subscription_status || "None"}</Fact>
      <Fact label="Complimentary Pro until">
        {row.complimentary_pro_until ? formatDate(row.complimentary_pro_until) : "None"}
      </Fact>
    </Record>
  );
}
