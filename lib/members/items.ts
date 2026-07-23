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

import aiNativeReadiness from "@/content/members/ai-native-readiness";
import aiPolicyTemplate from "@/content/members/ai-policy-template";
import roiQuickCheck from "@/content/members/roi-quick-check";
import automationPlaybook from "@/content/members/automation-playbook";
import websiteHealthCheck from "@/content/members/website-health-check";
import opportunityFinder from "@/content/members/opportunity-finder";
import guideLeadFollowUp from "@/content/members/guide-lead-follow-up";
import guideInvoiceReminders from "@/content/members/guide-invoice-reminders";
import guideReviewRequests from "@/content/members/guide-review-requests";
import promptPackMarketing from "@/content/members/prompt-pack-marketing";
import toolStackPicker from "@/content/members/tool-stack-picker";
import guideMeetingActions from "@/content/members/guide-meeting-actions";
import dataSafetyChecklist from "@/content/members/data-safety-checklist";
import emailTimeAudit from "@/content/members/email-time-audit";
import promptPackCustomerService from "@/content/members/prompt-pack-customer-service";
import clientOnboardingKit from "@/content/members/client-onboarding-kit";
import aiImplementationRoadmap from "@/content/members/ai-implementation-roadmap";
import promptPackSales from "@/content/members/prompt-pack-sales";
import costBenefitWorkbench from "@/content/members/cost-benefit-workbench";
import monthlyAiBriefing from "@/content/members/monthly-ai-briefing";
import leadLeakAudit from "@/content/members/lead-leak-audit";
import reviewHealthCheck from "@/content/members/review-health-check";
import gettingPaidAudit from "@/content/members/getting-paid-audit";
import quoteTurnaroundAudit from "@/content/members/quote-turnaround-audit";
import securityHeadersAudit from "@/content/members/security-headers-audit";

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
  "opportunity-finder",
  "tool-stack-picker",
  "email-time-audit",
  "cost-benefit-workbench",
  "lead-leak-audit",
  "review-health-check",
  "getting-paid-audit",
  "quote-turnaround-audit",
  "security-headers-audit",
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
  aiNativeReadiness,
  aiPolicyTemplate,
  roiQuickCheck,
  automationPlaybook,
  websiteHealthCheck,
  opportunityFinder,
  guideLeadFollowUp,
  guideInvoiceReminders,
  guideReviewRequests,
  promptPackMarketing,
  toolStackPicker,
  guideMeetingActions,
  dataSafetyChecklist,
  emailTimeAudit,
  promptPackCustomerService,
  clientOnboardingKit,
  aiImplementationRoadmap,
  promptPackSales,
  costBenefitWorkbench,
  monthlyAiBriefing,
  leadLeakAudit,
  reviewHealthCheck,
  gettingPaidAudit,
  quoteTurnaroundAudit,
  securityHeadersAudit,
].sort((a, b) => (a.dateAdded < b.dateAdded ? 1 : -1));

/** The four public-facing self-audits advertised on /tools. */
export const AUDIT_SLUGS = [
  "lead-leak-audit",
  "review-health-check",
  "getting-paid-audit",
  "quote-turnaround-audit",
] as const;

export function itemBySlug(slug: string): MemberItem | undefined {
  return items.find((i) => i.slug === slug);
}
