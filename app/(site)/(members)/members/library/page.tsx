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

export default async function MembersLibraryPage() {
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
          {items
            .filter((item) => item.tier === "free")
            .map((item, i) => (
              <ItemCard
                key={item.slug}
                item={item}
                locked={!canAccess(item.tier, tier)}
                index={i}
              />
            ))}
        </div>

        <p className="eyebrow" style={{ margin: "4rem 0 0" }}>
          Pro
        </p>
        <h2
          className="h-section"
          style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", margin: "0.5rem 0 0" }}
        >
          {tier === "pro" ? "Included in your plan" : "Unlock with Pro"}
        </h2>
        <p
          style={{
            color: "var(--slate-mid)",
            maxWidth: "48ch",
            margin: "1rem 0 0",
          }}
        >
          Practical help to turn your AI ideas into working systems.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
            maxWidth: "56rem",
            marginTop: "1.75rem",
          }}
        >
          <div style={{ borderTop: "2px solid var(--liquid-gold)", paddingTop: "1rem" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              Monthly one-on-one
            </h3>
            <p style={{ color: "var(--slate-mid)", margin: 0 }}>
              Get 30 minutes of focused, one-on-one help to build an agentic
              workflow, solve an implementation problem, or work through a
              broader AI question.
            </p>
          </div>
          <div style={{ borderTop: "2px solid var(--liquid-gold)", paddingTop: "1rem" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Online support</h3>
            <p style={{ color: "var(--slate-mid)", margin: 0 }}>
              Submit support tickets between sessions for guidance,
              troubleshooting, or a second set of eyes when you need it.
            </p>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            marginTop: "2rem",
          }}
        >
          {items
            .filter((item) => item.tier === "pro")
            .map((item, i) => (
              <ItemCard
                key={item.slug}
                item={item}
                locked={!canAccess(item.tier, tier)}
                index={i}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
