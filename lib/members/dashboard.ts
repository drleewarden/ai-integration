/**
 * Pure shaping logic for the members dashboard. No I/O, no registry import —
 * the title lookup is injected — so everything here is unit-testable.
 */

export const ACTIVITY_FEED_LIMIT = 5;

export interface ActivityRow {
  id: string;
  item_slug: string;
  kind: "tool_run" | "download";
  summary: { score?: unknown; host?: unknown } | null;
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  slug: string;
  title: string;
  kind: "tool_run" | "download";
  score: number | null;
  host: string | null;
  when: string;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const AU_DATE = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  // Future timestamps (clock skew) clamp to zero rather than going negative.
  const diff = Math.max(0, now.getTime() - then);
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE);
    return m === 1 ? "1 minute ago" : `${m} minutes ago`;
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return h === 1 ? "1 hour ago" : `${h} hours ago`;
  }
  if (diff < 30 * DAY) {
    const d = Math.floor(diff / DAY);
    return d === 1 ? "1 day ago" : `${d} days ago`;
  }
  return AU_DATE.format(new Date(iso));
}

export function buildActivityFeed(
  rows: ActivityRow[],
  resolveTitle: (slug: string) => string | undefined,
  now: Date = new Date(),
): ActivityFeedItem[] {
  const feed: ActivityFeedItem[] = [];
  for (const row of rows) {
    if (feed.length >= ACTIVITY_FEED_LIMIT) break;
    const title = resolveTitle(row.item_slug);
    // Items removed from the registry are silently skipped.
    if (!title) continue;
    feed.push({
      id: row.id,
      slug: row.item_slug,
      title,
      kind: row.kind,
      score: typeof row.summary?.score === "number" ? row.summary.score : null,
      host: typeof row.summary?.host === "string" ? row.summary.host : null,
      when: formatRelativeTime(row.created_at, now),
    });
  }
  return feed;
}

/**
 * OAuth profile photo from Supabase `user_metadata` (Google sign-in sets
 * both `avatar_url` and `picture`). Metadata is user-influenced input, so
 * only https URLs are accepted — never let javascript:/data: values reach
 * an <img src>.
 */
export function avatarFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  for (const key of ["avatar_url", "picture"]) {
    const value = metadata?.[key];
    if (typeof value === "string" && /^https:\/\/\S+$/i.test(value.trim())) {
      return value.trim();
    }
  }
  return null;
}

export function greetingName(
  displayName: string | null,
  email: string,
): string {
  const name = displayName?.trim();
  if (name) return name;
  const local = email.split("@")[0]?.trim();
  return local || "there";
}
