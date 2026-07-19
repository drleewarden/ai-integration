"use client";

/**
 * Client wrappers binding AuditTool to each audit config. These must live
 * in a "use client" module: the configs contain score() functions, which
 * cannot cross the server->client prop boundary — binding them here keeps
 * config and component in the same client bundle.
 */
import AuditTool from "./AuditTool";
import { leadLeakConfig } from "@/lib/members/tools/audits/lead-leak";
import { reviewHealthConfig } from "@/lib/members/tools/audits/review-health";
import { gettingPaidConfig } from "@/lib/members/tools/audits/getting-paid";
import { quoteTurnaroundConfig } from "@/lib/members/tools/audits/quote-turnaround";

export function LeadLeakAudit() {
  return <AuditTool config={leadLeakConfig} />;
}
export function ReviewHealthCheck() {
  return <AuditTool config={reviewHealthConfig} />;
}
export function GettingPaidAudit() {
  return <AuditTool config={gettingPaidConfig} />;
}
export function QuoteTurnaroundAudit() {
  return <AuditTool config={quoteTurnaroundConfig} />;
}
