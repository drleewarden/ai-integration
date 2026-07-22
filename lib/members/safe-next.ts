/**
 * Sanitise a post-auth redirect target. Only same-site relative paths
 * survive; anything else falls back to /members.
 *
 * String-prefix checks alone are NOT safe: WHATWG URL parsing treats "\"
 * as "/" in special schemes and strips tabs/newlines, so "/\evil.com" or
 * "/\tevil.com" would escape a startsWith("/")/!startsWith("//") guard.
 * We reject backslashes and control characters outright, then verify the
 * resolved URL stays on the given origin.
 */
export function safeNext(next: string | null | undefined, base: string): string {
  const fallback = "/members";
  if (!next) return fallback;
  if (/[\\\x00-\x1f\x7f]/.test(next)) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  try {
    const baseUrl = new URL(base);
    const resolved = new URL(next, baseUrl);
    if (resolved.origin !== baseUrl.origin) return fallback;
    return resolved.pathname + resolved.search;
  } catch {
    return fallback;
  }
}
