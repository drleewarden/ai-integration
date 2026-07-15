/**
 * Pure redirect decision for the members area, kept out of middleware.ts so
 * it is unit-testable without NextRequest plumbing.
 *
 * /members/upgrade is deliberately public: it is the Pro marketing page.
 * Its checkout action still requires auth (enforced by the API route).
 */
const PUBLIC_MEMBER_PATHS = new Set(["/members/upgrade"]);

export function membersRedirectPath(
  pathname: string,
  isAuthenticated: boolean,
): string | null {
  if (!pathname.startsWith("/members")) return null;
  if (isAuthenticated) return null;
  if (PUBLIC_MEMBER_PATHS.has(pathname)) return null;
  return `/login?next=${encodeURIComponent(pathname)}`;
}
