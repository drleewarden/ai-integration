/**
 * Data for the admin Signups page (/members/admin/signups).
 *
 * All three lists contain PII (names, emails) and are read with the
 * service-role client, so these loaders must only ever run server-side,
 * AFTER the caller has checked the ADMIN_EMAILS allowlist.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const SIGNUP_TYPES = ["seminar", "workshop", "general"] as const;
export type SignupType = (typeof SIGNUP_TYPES)[number];

export const SIGNUP_TYPE_LABELS: Record<SignupType, string> = {
  seminar: "Seminar signups",
  workshop: "Workshop signups",
  general: "General signups",
};

// Cap per list so a large table can't blow up the page render.
export const SIGNUP_LIST_LIMIT = 500;

/** Untrusted ?type= query value -> a known type (defaults to seminar). */
export function parseSignupType(raw: string | string[] | undefined): SignupType {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return SIGNUP_TYPES.includes(value as SignupType)
    ? (value as SignupType)
    : "seminar";
}

export interface SeminarSignupRow {
  id: string;
  created_at: string;
  event_code: string;
  name: string;
  email: string;
  marketing_opt_in: boolean;
  member_id: string | null;
  granted_at: string | null;
}

export interface WorkshopSignupRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  business_type: string | null;
  workflows: string | null;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "void";
  paid_at: string | null;
}

export interface GeneralSignupRow {
  id: string;
  created_at: string;
  email: string;
  display_name: string | null;
  tier: "free" | "pro";
  subscription_status: string | null;
  complimentary_pro_until: string | null;
}

export type SignupsResult<T> =
  | { ok: true; rows: T[]; notice?: string }
  | { ok: false; rows: []; message: string };

function logLoadError(scope: string, error: { code?: string; message?: string }) {
  // Detail stays in server logs; the page only shows a generic message.
  console.warn(`[admin/signups] ${scope} failed:`, {
    code: error.code,
    message: error.message,
  });
}

export async function loadSeminarSignups(
  service: SupabaseClient,
): Promise<SignupsResult<SeminarSignupRow>> {
  const { data, error } = await service
    .from("seminar_signups")
    .select("id, created_at, event_code, name, email, marketing_opt_in, member_id, granted_at")
    .order("created_at", { ascending: false })
    .limit(SIGNUP_LIST_LIMIT);
  if (error) {
    logLoadError("seminar list", error);
    return { ok: false, rows: [], message: "Check that migration 0006 has been applied." };
  }
  return { ok: true, rows: (data ?? []) as SeminarSignupRow[] };
}

export async function loadWorkshopSignups(
  service: SupabaseClient,
): Promise<SignupsResult<WorkshopSignupRow>> {
  const detailed = await service
    .from("workshop_payments")
    .select(
      "id, created_at, name, email, business_type, workflows, amount_cents, currency, status, paid_at",
    )
    .eq("created_by", "workshop-signup")
    .order("created_at", { ascending: false })
    .limit(SIGNUP_LIST_LIMIT);

  if (!detailed.error) {
    return { ok: true, rows: (detailed.data ?? []) as WorkshopSignupRow[] };
  }

  // 42703 = undefined column: migration 0005 not applied yet. Fall back to
  // the columns that exist so payment status is still visible.
  if (detailed.error.code !== "42703") {
    logLoadError("workshop list", detailed.error);
    return { ok: false, rows: [], message: "Check that migration 0005 has been applied." };
  }

  const fallback = await service
    .from("workshop_payments")
    .select("id, created_at, name, email, amount_cents, currency, status, paid_at")
    .eq("created_by", "workshop-signup")
    .order("created_at", { ascending: false })
    .limit(SIGNUP_LIST_LIMIT);
  if (fallback.error) {
    logLoadError("workshop fallback list", fallback.error);
    return { ok: false, rows: [], message: "Check that migration 0005 has been applied." };
  }
  return {
    ok: true,
    rows: (fallback.data ?? []).map((row) => ({
      ...row,
      business_type: null,
      workflows: null,
    })) as WorkshopSignupRow[],
    notice: "Apply migration 0005 to capture business type and workflow notes.",
  };
}

/**
 * Member accounts that did NOT come in through a seminar QR sign-up, so the
 * General list doesn't double up people already shown under Seminar.
 */
export function excludeSeminarMembers(
  members: GeneralSignupRow[],
  seminarEmails: Iterable<string>,
): GeneralSignupRow[] {
  const seminar = new Set(Array.from(seminarEmails, (e) => e.trim().toLowerCase()));
  return members.filter((m) => !seminar.has(m.email.trim().toLowerCase()));
}

export async function loadGeneralSignups(
  service: SupabaseClient,
): Promise<SignupsResult<GeneralSignupRow>> {
  const [members, seminar] = await Promise.all([
    service
      .from("member_profiles")
      .select(
        "id, created_at, email, display_name, tier, subscription_status, complimentary_pro_until",
      )
      .order("created_at", { ascending: false })
      .limit(SIGNUP_LIST_LIMIT),
    service.from("seminar_signups").select("email").limit(5000),
  ]);

  if (members.error) {
    logLoadError("general list", members.error);
    return { ok: false, rows: [], message: "Member profiles could not be loaded." };
  }
  // If the seminar table is missing, still show every member rather than fail.
  if (seminar.error) logLoadError("seminar emails", seminar.error);

  const rows = excludeSeminarMembers(
    (members.data ?? []) as GeneralSignupRow[],
    (seminar.data ?? []).map((r: { email: string }) => r.email),
  );
  return { ok: true, rows };
}
