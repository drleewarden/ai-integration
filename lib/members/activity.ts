/**
 * Best-effort member activity recording for the dashboard feed.
 *
 * Inserts go through the caller-supplied cookie/anon-key client so RLS
 * (member_id = auth.uid()) applies — the service-role client must never be
 * handed to this helper from a request path. Failures are logged and
 * swallowed: activity is a nice-to-have and must never break the member's
 * tool run or download.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivityKind = "tool_run" | "download";

export interface ActivityEvent {
  slug: string;
  kind: ActivityKind;
  /** Minimal, non-sensitive facts only, e.g. { score: 78, host: "example.com" }. */
  summary?: Record<string, unknown>;
}

export async function recordActivity(
  supabase: SupabaseClient,
  userId: string,
  event: ActivityEvent,
): Promise<void> {
  try {
    const { error } = await supabase.from("member_activity").insert({
      member_id: userId,
      item_slug: event.slug,
      kind: event.kind,
      summary: event.summary ?? null,
    });
    if (error) console.error("[members] activity insert failed:", error);
  } catch (err) {
    console.error("[members] activity insert failed:", err);
  }
}
