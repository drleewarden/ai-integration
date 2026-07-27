/**
 * ADMIN_EMAILS allowlist for the payment-links admin surface. Auth model:
 * existing Supabase members login proves identity; this allowlist decides
 * authorisation. An unset/empty ADMIN_EMAILS means NOBODY is admin --
 * fail closed, never open.
 */

export function parseAdminEmails(raw: string | undefined | null): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(
  email: string | null | undefined,
  allowlist: Set<string>,
): boolean {
  if (!email || allowlist.size === 0) return false;
  return allowlist.has(email.trim().toLowerCase());
}
