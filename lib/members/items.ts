/**
 * Single source of truth for members-area content.
 *
 * Each item lives in content/members/<slug>.ts. Adding an item: create the
 * file, import it below, add to the array. The /members index, the [slug]
 * route, and the download API all derive from this list.
 *
 * Files for `download` items are uploaded to the private `member-files`
 * Supabase Storage bucket at the item's storagePath.
 */

import aiPolicyTemplate from "@/content/members/ai-policy-template";
import roiQuickCheck from "@/content/members/roi-quick-check";
import automationPlaybook from "@/content/members/automation-playbook";
import websiteHealthCheck from "@/content/members/website-health-check";

export type MemberTier = "free" | "pro";
export type MemberItemType = "download" | "tool" | "guide";

interface MemberItemBase {
  slug: string;
  title: string;
  description: string;
  tier: MemberTier;
  /** ISO date (YYYY-MM-DD) the item was added. */
  dateAdded: string;
}

export interface DownloadItem extends MemberItemBase {
  type: "download";
  /** Object path inside the member-files bucket. */
  storagePath: string;
  /** Filename suggested to the browser. */
  fileName: string;
}

/** Keys map to entries in TOOL_COMPONENTS (app/components/members/tools). */
export const TOOL_COMPONENT_KEYS = [
  "roi-quick-check",
  "website-health-check",
] as const;
export type ToolComponentKey = (typeof TOOL_COMPONENT_KEYS)[number];

export interface ToolItem extends MemberItemBase {
  type: "tool";
  componentKey: ToolComponentKey;
}

export interface GuideItem extends MemberItemBase {
  type: "guide";
  /** Pre-rendered article body HTML (same convention as Insights). */
  html: string;
}

export type MemberItem = DownloadItem | ToolItem | GuideItem;

export const items: MemberItem[] = [
  aiPolicyTemplate,
  roiQuickCheck,
  automationPlaybook,
  websiteHealthCheck,
].sort((a, b) => (a.dateAdded < b.dateAdded ? 1 : -1));

export function itemBySlug(slug: string): MemberItem | undefined {
  return items.find((i) => i.slug === slug);
}
