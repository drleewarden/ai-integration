import type { Metadata } from "next";
import Link from "next/link";
import { items } from "@/lib/members/items";
import { canAccess } from "@/lib/members/access";
import { getMemberProfile } from "@/lib/supabase/auth-server";
import ItemCard from "@/app/components/members/ItemCard";

export const metadata: Metadata = {
  title: "Members Library | Creative Milk",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const member = await getMemberProfile();
  // Middleware guarantees a session, but belt-and-braces:
  const tier = member?.profile.tier ?? null;

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
          Members
        </p>
        <h1
          className="h-display"
          style={{
            fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
            marginBottom: "1rem",
          }}
        >
          Your library
        </h1>
        {tier === "free" && (
          <p style={{ color: "var(--slate-mid)", maxWidth: "48ch" }}>
            You're on the free plan.{" "}
            <Link href="/members/upgrade">Upgrade to Pro</Link> to unlock
            everything.
          </p>
        )}
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            marginTop: "3rem",
          }}
        >
          {items.map((item) => (
            <ItemCard
              key={item.slug}
              item={item}
              locked={!canAccess(item.tier, tier)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
