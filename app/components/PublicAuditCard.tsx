"use client";

import Link from "next/link";
import { pushEvent, EVENTS } from "@/app/lib/gtm";

/**
 * Public-facing audit card for /tools. Reuses the members .member-card
 * treatment; links into signup with a next param so the new member lands
 * directly in the audit they clicked. Client component only for the GTM
 * click event — no PII in the payload, slug only.
 */
export default function PublicAuditCard({
  slug,
  title,
  description,
}: {
  slug: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={`/signup?next=${encodeURIComponent(`/members/${slug}`)}`}
      className="member-card"
      onClick={() => pushEvent(EVENTS.AUDIT_CARD_CLICK, { audit: slug })}
    >
      <p className="eyebrow" style={{ margin: 0 }}>
        Free audit
      </p>
      <h2>{title}</h2>
      <p className="member-card-desc">{description}</p>
      <span className="member-card-open" aria-hidden="true">
        Sign up free to run it <span className="mc-arrow">→</span>
      </span>
    </Link>
  );
}
