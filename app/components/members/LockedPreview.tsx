import Link from "next/link";

/**
 * Rendered in place of Pro content for free members. The gated content is
 * NEVER in the payload -- the server renders this instead.
 */
export default function LockedPreview({ title }: { title: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--liquid-gold)",
        borderRadius: 12,
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p className="eyebrow" style={{ color: "var(--liquid-gold)" }}>
        Pro members only
      </p>
      <h2>{title} is part of the Pro library</h2>
      <p>
        Unlock every guide, tool and download for $29/month. Cancel any time.
      </p>
      <Link href="/members/upgrade" className="cta" style={{ minHeight: 44, display: "inline-block" }}>
        Upgrade to Pro
      </Link>
    </div>
  );
}
