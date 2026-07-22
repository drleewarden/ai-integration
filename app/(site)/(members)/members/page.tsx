import type { Metadata } from "next";
import Link from "next/link";
import { items, itemBySlug } from "@/lib/members/items";
import { canAccess } from "@/lib/members/access";
import {
  getAuthServerSupabase,
  getMemberProfile,
} from "@/lib/supabase/auth-server";
import {
  buildActivityFeed,
  greetingName,
  type ActivityFeedItem,
  type ActivityRow,
} from "@/lib/members/dashboard";
import ItemCard from "@/app/components/members/ItemCard";

export const metadata: Metadata = {
  title: "Members | Creative Milk",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Latest activity for the signed-in member. Best-effort: any failure logs
 * server-side and renders as the empty state — never a 500. Fetches more
 * rows than the feed shows so registry-removed slugs can be skipped without
 * shortening the list.
 */
async function fetchActivityFeed(memberId: string): Promise<ActivityFeedItem[]> {
  try {
    const supabase = await getAuthServerSupabase();
    // Anon-key client: RLS already scopes rows to auth.uid(); the eq() is
    // explicit belt-and-braces.
    const { data, error } = await supabase
      .from("member_activity")
      .select("id, item_slug, kind, summary, created_at")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(15);
    if (error) {
      console.error("[members] activity fetch failed:", error);
      return [];
    }
    return buildActivityFeed(
      (data ?? []) as ActivityRow[],
      (slug) => itemBySlug(slug)?.title,
    );
  } catch (err) {
    console.error("[members] activity fetch failed:", err);
    return [];
  }
}

export default async function MembersDashboardPage() {
  const member = await getMemberProfile();
  // Middleware guarantees a session, but belt-and-braces:
  const tier = member?.profile.tier ?? null;
  const feed = member ? await fetchActivityFeed(member.user.id) : [];
  const newest = items.slice(0, 3); // registry is pre-sorted newest-first

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
          Welcome back,{" "}
          {greetingName(
            member?.profile.display_name ?? null,
            member?.profile.email ?? "",
          )}
        </h1>
        {tier === "pro" ? (
          <p style={{ color: "var(--slate-mid)", maxWidth: "48ch" }}>
            You're on the Pro plan.{" "}
            <Link href="/members/account">Manage your account</Link>
          </p>
        ) : (
          <p style={{ color: "var(--slate-mid)", maxWidth: "48ch" }}>
            You're on the free plan.{" "}
            <Link href="/members/upgrade">Upgrade to Pro</Link> to unlock
            everything.
          </p>
        )}

        <p className="eyebrow" style={{ margin: "4rem 0 0" }}>
          Recent activity
        </p>
        {feed.length > 0 ? (
          <ul
            style={{
              listStyle: "none",
              margin: "1.5rem 0 0",
              padding: 0,
              display: "grid",
              gap: "0.75rem",
              maxWidth: "60ch",
            }}
          >
            {feed.map((entry) => (
              <li
                key={entry.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  borderBottom: "1px solid rgba(74, 78, 96, 0.15)",
                  paddingBottom: "0.75rem",
                }}
              >
                <span>
                  <Link href={`/members/${entry.slug}`}>{entry.title}</Link>
                  {entry.kind === "download" && (
                    <span style={{ color: "var(--slate-mid)" }}> — downloaded</span>
                  )}
                  {entry.score !== null && (
                    <span style={{ color: "var(--slate-mid)" }}>
                      {" "}
                      — scored {entry.score}
                      {entry.host ? ` for ${entry.host}` : ""}
                    </span>
                  )}
                </span>
                <span style={{ color: "var(--slate-mid)", whiteSpace: "nowrap" }}>
                  {entry.when}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--slate-mid)", maxWidth: "48ch", marginTop: "1.5rem" }}>
            Run a check and your results will show up here. Try the{" "}
            <Link href="/members/website-health-check">Website Health Check</Link>{" "}
            or the{" "}
            <Link href="/members/security-headers-audit">
              Security Headers Audit
            </Link>
            .
          </p>
        )}

        <p className="eyebrow" style={{ margin: "4rem 0 0" }}>
          New in the library
        </p>
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            marginTop: "1.5rem",
          }}
        >
          {newest.map((item, i) => (
            <ItemCard
              key={item.slug}
              item={item}
              locked={!canAccess(item.tier, tier)}
              index={i}
            />
          ))}
        </div>

        <p style={{ marginTop: "3rem" }}>
          <Link href="/members/library" className="cta">
            Browse the full library
          </Link>
        </p>
      </div>
    </section>
  );
}
