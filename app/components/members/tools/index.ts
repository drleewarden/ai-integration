import type { ComponentType } from "react";
import type { ToolComponentKey } from "@/lib/members/items";
import RoiQuickCheck from "./RoiQuickCheck";
import WebsiteHealthCheck from "./WebsiteHealthCheck";

/**
 * Maps registry componentKey -> client component. Adding a tool item:
 * create the component here and add its key to TOOL_COMPONENT_KEYS in
 * lib/members/items.ts (the type system then forces this map to cover it).
 */
export const TOOL_COMPONENTS: Record<ToolComponentKey, ComponentType> = {
  "roi-quick-check": RoiQuickCheck,
  "website-health-check": WebsiteHealthCheck,
};
