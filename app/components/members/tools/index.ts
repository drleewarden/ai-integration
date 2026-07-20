import type { ComponentType } from "react";
import type { ToolComponentKey } from "@/lib/members/items";
import RoiQuickCheck from "./RoiQuickCheck";
import WebsiteHealthCheck from "./WebsiteHealthCheck";
import OpportunityFinder from "./OpportunityFinder";
import ToolStackPicker from "./ToolStackPicker";
import EmailTimeAudit from "./EmailTimeAudit";
import CostBenefitWorkbench from "./CostBenefitWorkbench";
import SecurityHeadersAudit from "./SecurityHeadersAudit";
import {
  LeadLeakAudit,
  ReviewHealthCheck,
  GettingPaidAudit,
  QuoteTurnaroundAudit,
} from "./audits";

/**
 * Maps registry componentKey -> client component. Adding a tool item:
 * create the component here and add its key to TOOL_COMPONENT_KEYS in
 * lib/members/items.ts (the type system then forces this map to cover it).
 */
export const TOOL_COMPONENTS: Record<ToolComponentKey, ComponentType> = {
  "roi-quick-check": RoiQuickCheck,
  "website-health-check": WebsiteHealthCheck,
  "opportunity-finder": OpportunityFinder,
  "tool-stack-picker": ToolStackPicker,
  "email-time-audit": EmailTimeAudit,
  "cost-benefit-workbench": CostBenefitWorkbench,
  "lead-leak-audit": LeadLeakAudit,
  "review-health-check": ReviewHealthCheck,
  "getting-paid-audit": GettingPaidAudit,
  "quote-turnaround-audit": QuoteTurnaroundAudit,
  "security-headers-audit": SecurityHeadersAudit,
};
