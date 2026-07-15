/**
 * The single gating rule for members content. Every server-side access
 * decision (pages, download route) goes through canAccess so the tier
 * hierarchy lives in exactly one place.
 */
import type { MemberTier } from "@/lib/members/items";

export function canAccess(
  itemTier: MemberTier,
  memberTier: MemberTier | null,
): boolean {
  if (memberTier === null) return false;
  if (itemTier === "free") return true;
  return memberTier === "pro";
}
