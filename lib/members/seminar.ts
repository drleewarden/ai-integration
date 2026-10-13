/**
 * Seminar QR sign-up: config and pure decision helpers.
 *
 * Env (server-only, never NEXT_PUBLIC_):
 *   SEMINAR_ACCESS_CODE       code printed in the QR (?c=...). Unset = closed.
 *   SEMINAR_ACCESS_CLOSES_AT  ISO timestamp after which the code stops working.
 *   SEMINAR_PRO_DAYS          days of complimentary Pro per attendee (default 90).
 *
 * The code is a shared secret on a projected slide, so it WILL leak. The
 * closing date is what bounds the damage: set it a few days after the event.
 */
import { timingSafeEqual } from "node:crypto";
import type { MemberTier } from "@/lib/members/items";

export { GOOGLE_REVIEW_URL, SEMINAR_CONSENT_TEXT } from "@/lib/members/seminar-copy";

export interface SeminarConfig {
  code: string;
  closesAt: Date;
  proDays: number;
}

export function readSeminarConfig(
  env: Record<string, string | undefined> = process.env,
): SeminarConfig | null {
  const code = env.SEMINAR_ACCESS_CODE?.trim();
  const closesAt = new Date(env.SEMINAR_ACCESS_CLOSES_AT ?? "");
  if (!code || Number.isNaN(closesAt.getTime())) return null;
  const days = Number.parseInt(env.SEMINAR_PRO_DAYS ?? "", 10);
  return {
    code,
    closesAt,
    proDays: Number.isFinite(days) && days > 0 && days <= 365 ? days : 90,
  };
}

/** True when the submitted code matches and the window is still open. */
export function isSeminarCodeValid(
  submitted: string | null | undefined,
  config: SeminarConfig | null,
  now: Date = new Date(),
): boolean {
  if (!config || !submitted) return false;
  if (now.getTime() > config.closesAt.getTime()) return false;
  // Constant-time compare so the code can't be guessed byte by byte.
  const a = Buffer.from(submitted);
  const b = Buffer.from(config.code);
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
