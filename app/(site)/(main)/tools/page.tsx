import type { Metadata } from "next";
import Link from "next/link";
import { items, AUDIT_SLUGS } from "@/lib/members/items";
import PublicAuditCard from "@/app/components/PublicAuditCard";

export const metadata: Metadata = {
  title: "Free Business Audits | Creative Milk",
  description:
    "Four free self-audits for Australian small businesses: find out what slow replies, stale reviews, overdue invoices and slow quotes are actually costing you.",
};

export default function ToolsPage() {
  const audits = AUDIT_SLUGS.map(
    (slug) => items.find((item) => item.slug === slug)!,
  );

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
          Free tools
        </p>
        <h1
          className="h-display"
          style={{
            fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
            maxWidth: "16ch",
            marginBottom: "1rem",
          }}
        >
          Find out what your business is leaking
        </h1>
        <p style={{ color: "var(--slate-mid)", maxWidth: "52ch" }}>
          Four quick self-audits — each one takes about two minutes and puts a
          dollar figure on a leak most small businesses never measure. Free
          with a members account, no card required.
        </p>

        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            marginTop: "3rem",
          }}
        >
          {audits.map((item) => (
            <PublicAuditCard
              key={item.slug}
              slug={item.slug}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

        <p style={{ marginTop: "3rem", color: "var(--slate-mid)" }}>
          Plus guides, prompt packs, templates and more in the free members
          library — <Link href="/signup">create your account</Link>.
        </p>
      </div>
    </section>
  );
}
