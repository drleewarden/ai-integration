/**
 * URL validation for the Website Health Check.
 *
 * Security: the API route fetches user-supplied URLs from the server, which
 * is an SSRF vector. Defence layers:
 *  1. validateAuditUrl — https only, no credentials, no custom port, no IP
 *     literals, no localhost/.local/.internal hostnames.
 *  2. isPrivateIp — the route resolves DNS and rejects hosts whose records
 *     point at private/link-local ranges before fetching.
 */

const BLOCKED_HOSTNAME = /(^|\.)(localhost|local|internal|home|lan)$/i;
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

export type UrlValidation =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

export function validateAuditUrl(raw: string): UrlValidation {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2048) {
    return { ok: false, reason: "Please enter a valid URL." };
  }

  let url: URL;
  try {
    // Assume https for bare domains ("example.com.au").
    url = new URL(
      /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
  } catch {
    return { ok: false, reason: "Please enter a valid URL." };
  }

  if (url.protocol !== "https:") {
    return { ok: false, reason: "Only https URLs can be checked." };
  }
  if (url.username || url.password) {
    return { ok: false, reason: "URLs with credentials are not supported." };
  }
  if (url.port && url.port !== "443") {
    return { ok: false, reason: "Custom ports are not supported." };
  }

  const host = url.hostname;
  // IP literals (v4 or bracketed v6) are rejected outright — public sites
  // have hostnames, and this closes the direct-IP SSRF path.
  if (IPV4_RE.test(host) || host.includes(":")) {
    return {
      ok: false,
      reason: "Please use a domain name, not an IP address.",
    };
  }
  if (!host.includes(".") || BLOCKED_HOSTNAME.test(host)) {
    return { ok: false, reason: "That hostname cannot be checked." };
  }

  return { ok: true, url };
}

/** True for loopback, RFC1918, link-local, CGNAT, and their IPv6 analogues. */
export function isPrivateIp(ip: string): boolean {
  // Normalise IPv4-mapped IPv6 (::ffff:192.168.1.1).
  const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;

  if (IPV4_RE.test(v4)) {
    const [a, b] = v4.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }

  const lower = ip.toLowerCase();
  if (lower === "::" || lower === "::1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7
  if (
    lower.startsWith("fe8") ||
    lower.startsWith("fe9") ||
    lower.startsWith("fea") ||
    lower.startsWith("feb")
  ) {
    return true; // fe80::/10
  }
  return false;
}
