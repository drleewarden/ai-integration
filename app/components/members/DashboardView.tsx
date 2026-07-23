import Link from "next/link";
import type { MemberItem, MemberTier } from "@/lib/members/items";
import type { ActivityFeedItem } from "@/lib/members/dashboard";
import ItemCard from "@/app/components/members/ItemCard";
import DashboardFlow from "@/app/components/members/DashboardFlow";

export interface DashboardViewProps {
  name: string;
  /** Vetted https URL (see avatarFromMetadata) or null for the monogram. */
  avatarUrl: string | null;
  tier: MemberTier | null;
  feed: ActivityFeedItem[];
  checksRun: number;
  downloads: number;
  libraryCount: number;
  newest: { item: MemberItem; locked: boolean }[];
}

/**
 * Pure presentation for the members dashboard — liquid-glass panels over
 * an aurora field, mobile-first. All data arrives via props so the page
 * owns fetching and this stays renderable anywhere.
 */
export default function DashboardView({
  name,
  avatarUrl,
  tier,
  feed,
  checksRun,
  downloads,
  libraryCount,
  newest,
}: DashboardViewProps) {
  const monogram = name.trim().charAt(0).toUpperCase() || "M";

  return (
    <section className="section members-dash">
      <div className="dash-aurora" aria-hidden="true">
        <span className="aurora-blob b1" />
        <span className="aurora-blob b2" />
        <span className="aurora-blob b3" />
        <DashboardFlow />
      </div>
      <div className="container" style={{ position: "relative" }}>
        <div
          className="glass-hero member-card-enter"
          style={{ "--stagger-i": 0 } as React.CSSProperties}
        >
          <div className="glass-hero-id">
            {avatarUrl ? (
              // Plain <img>: Google avatar hosts aren't in next/image
              // remotePatterns, and no-referrer avoids their hotlink 403s.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="glass-avatar"
                src={avatarUrl}
                alt=""
                width={76}
                height={76}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="glass-avatar glass-monogram" aria-hidden="true">
                {monogram}
              </span>
            )}
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>
                Members
              </p>
              <h1 className="h-display glass-hero-title">
                Welcome back, {name}
              </h1>
              <div className="glass-hero-meta">
                {tier === "pro" ? (
                  <>
                    <span className="glass-plan-pill pro">Pro plan</span>
                    <Link href="/members/account" className="glass-hero-link">
                      Manage account
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="glass-plan-pill">Free plan</span>
                    <Link href="/members/upgrade" className="glass-hero-link">
                      Upgrade to Pro
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="glass-stats">
            <div className="glass-stat">
              <span className="glass-stat-num">{checksRun}</span>
              <span className="glass-stat-label">Checks run</span>
            </div>
            <div className="glass-stat">
              <span className="glass-stat-num">{downloads}</span>
              <span className="glass-stat-label">Downloads</span>
            </div>
            <div className="glass-stat">
              <span className="glass-stat-num">{libraryCount}</span>
              <span className="glass-stat-label">In the library</span>
            </div>
          </div>
        </div>

        <p className="eyebrow" style={{ margin: "3rem 0 1.25rem" }}>
          Quick actions
        </p>
        <nav className="glass-chip-row" aria-label="Quick actions">
          <Link href="/members/website-health-check" className="glass-chip">
            Website Health Check <span className="mc-arrow">→</span>
          </Link>
          <Link href="/members/security-headers-audit" className="glass-chip">
            Security Headers Audit <span className="mc-arrow">→</span>
          </Link>
          <Link href="/members/library" className="glass-chip">
            Browse the library <span className="mc-arrow">→</span>
          </Link>
        </nav>

        <p className="eyebrow" style={{ margin: "3.5rem 0 1.25rem" }}>
          Recent activity
        </p>
        <div className="glass-panel glass-activity" style={{ maxWidth: "68ch" }}>
          {feed.length > 0 ? (
            <ul>
              {feed.map((entry) => (
                <li key={entry.id}>
                  <span>
                    <Link href={`/members/${entry.slug}`}>{entry.title}</Link>
                    {entry.kind === "download" && (
                      <span style={{ color: "var(--slate-mid)" }}>
                        {" "}
                        — downloaded
                      </span>
                    )}
                    {entry.score !== null && (
                      <span style={{ color: "var(--slate-mid)" }}>
                        {" "}
                        — scored {entry.score}
                        {entry.host ? ` for ${entry.host}` : ""}
                      </span>
                    )}
                  </span>
                  <span
                    style={{ color: "var(--slate-mid)", whiteSpace: "nowrap" }}
                  >
                    {entry.when}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "var(--slate-mid)", margin: 0 }}>
              Run a check and your results will show up here. Try the{" "}
              <Link href="/members/website-health-check">
                Website Health Check
              </Link>{" "}
              or the{" "}
              <Link href="/members/security-headers-audit">
                Security Headers Audit
              </Link>
              .
            </p>
          )}
        </div>

        <p className="eyebrow" style={{ margin: "3.5rem 0 0" }}>
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
          {newest.map(({ item, locked }, i) => (
            <ItemCard key={item.slug} item={item} locked={locked} index={i} />
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
