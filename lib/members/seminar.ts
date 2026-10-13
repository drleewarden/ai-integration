/**
 * Seminar QR sign-up: config and pure decision helpers.
 *
 * No env setup by design: the code printed in the QR is built in and the
 * link never closes. It is unlisted (noindex) and the worst case if it
 * spreads is someone getting 90 days of Pro content, which is accepted.
 * For a new event, change SEMINAR_CODE here and regenerate the QR.
 */
import { timingSafeEqual } from "node:crypto";
import type { MemberTier } from "@/lib/members/items";

export { GOOGLE_REVIEW_URL, SEMINAR_CONSENT_TEXT } from "@/lib/members/seminar-copy";

/** Matches the QR on the Growth Club deck: /seminar?c=growth4-nldutam */
export const SEMINAR_CODE = "growth4-nldutam";
export const SEMINAR_PRO_DAYS = 90;

/** True when the submitted code matches the one in the QR. */
export function isSeminarCodeValid(
  submitted: string | null | undefined,
  code: string = SEMINAR_CODE,
): boolean {
  if (!submitted) return false;
  // Constant-time compare so the code can't be guessed byte by byte.
  const a = Buffer.from(submitted);
  const b = Buffer.from(code);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * New complimentary end date. Never shortens an existing grant, so a
 * re-scan can't cut someone's access short.
 */
export function complimentaryUntil(
  existing: string | null,
  proDays: number,
  now: Date = new Date(),
): Date {
  const fresh = new Date(now.getTime() + proDays * 86_400_000);
  const current = existing ? new Date(existing) : null;
  return current && current.getTime() > fresh.getTime() ? current : fresh;
}

/** Paid Pro, or an unexpired complimentary grant. */
export function effectiveTier(
  tier: MemberTier,
  compUntil: string | null,
  now: Date = new Date(),
): MemberTier {
  if (tier === "pro") return "pro";
  if (compUntil && new Date(compUntil).getTime() > now.getTime()) return "pro";
  return "free";
}
