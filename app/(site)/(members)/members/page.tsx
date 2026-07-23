import type { Metadata } from "next";
import { items, itemBySlug } from "@/lib/members/items";
import { canAccess } from "@/lib/members/access";
import {
  getAuthServerSupabase,
  getMemberProfile,
} from "@/lib/supabase/auth-server";
import {
  avatarFromMetadata,
  buildActivityFeed,
  greetingName,
  type ActivityFeedItem,
  type ActivityRow,
} from "@/lib/members/dashboard";
import DashboardView from "@/app/components/members/DashboardView";

export const metadata: Metadata = {
  title: "Members | Creative Milk",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface DashboardData {
  feed: ActivityFeedItem[];
  checksRun: number;
  downloads: number;
}

/**
 * Feed + lifetime counters for the signed-in member. Best-effort: any
 * failure logs server-side and renders as the empty state — never a 500.
 * The feed fetches more rows than it shows so registry-removed slugs can
 * be skipped without shortening the list; the counters are head-only
 * count queries so they stay accurate past the fetch cap.
 */
/**
 * PostgrestError's fields are non-enumerable across the dev-overlay
 * boundary, so logging the object prints "{}". Pull the fields out
 * explicitly — code/message are what identify e.g. a missing table.
 */
function logSupabaseError(context: string, error: {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}) {
  const { code, message, details, hint } = error;
  console.error(`[members] ${context}:`, { code, message, details, hint });
}

async function fetchDashboardData(memberId: string): Promise<DashboardData> {
  const empty: DashboardData = { feed: [], checksRun: 0, downloads: 0 };
  try {
    const supabase = await getAuthServerSupabase();
    // Anon-key client: RLS already scopes rows to auth.uid(); the eq() is
    // explicit belt-and-braces.
    const [feedRes, checksRes, downloadsRes] = await Promise.all([
      supabase
        .from("member_activity")
        .select("id, item_slug, kind, summary, created_at")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })
        .limit(15),
      supabase
        .from("member_activity")
        .select("id", { count: "exact", head: true })
        .eq("member_id", memberId)
        .eq("kind", "tool_run"),
      supabase
        .from("member_activity")
        .select("id", { count: "exact", head: true })
        .eq("member_id", memberId)
        .eq("kind", "download"),
    ]);
    if (feedRes.error) {
      logSupabaseError("activity fetch failed", feedRes.error);
      return empty;
    }
    if (checksRes.error) logSupabaseError("checks count failed", checksRes.error);
    if (downloadsRes.error)
      logSupabaseError("downloads count failed", downloadsRes.error);
    return {
      feed: buildActivityFeed(
        (feedRes.data ?? []) as ActivityRow[],
        (slug) => itemBySlug(slug)?.title,
      ),
      checksRun: checksRes.error ? 0 : (checksRes.count ?? 0),
      downloads: downloadsRes.error ? 0 : (downloadsRes.count ?? 0),
    };
  } catch (err) {
    console.error("[members] activity fetch failed:", err);
    return empty;
  }
}

export default async function MembersDashboardPage() {
  const member = await getMemberProfile();
  // Middleware guarantees a session, but belt-and-braces:
  const tier = member?.profile.tier ?? null;
  const { feed, checksRun, downloads } = member
    ? await fetchDashboardData(member.user.id)
    : { feed: [], checksRun: 0, downloads: 0 };

  return (
    <DashboardView
      name={greetingName(
        member?.profile.display_name ?? null,
        member?.profile.email ?? "",
      )}
      // Google OAuth photo; avatarFromMetadata only passes vetted https URLs.
      avatarUrl={avatarFromMetadata(member?.user.user_metadata)}
      tier={tier}
      feed={feed}
      checksRun={checksRun}
      downloads={downloads}
      libraryCount={items.length}
      newest={items.slice(0, 3).map((item) => ({
        item,
        locked: !canAccess(item.tier, tier),
      }))}
    />
  );
}
