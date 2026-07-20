/**
 * HTTP security-header checks for the members Security Headers Audit.
 * Pure function over a fetched response's Headers — no I/O, body never read.
 *
 * Deliberately NOT checked: an HTTP→HTTPS redirect probe. Probing http://
 * would conflict with the https-only rule in audit-fetch's SSRF ladder, and
 * HSTS covers the same downgrade risk — do not add it back.
 */

export interface SecurityCheck {
  id: string;
  label: string;
  pass: boolean;
  advice: string;
}

export interface SecurityReport {
  score: number;
  checks: SecurityCheck[];
  failed: SecurityCheck[];
}

/** Attribute names of a Set-Cookie value, lowercased, name=value pair excluded. */
function cookieAttrs(cookie: string): string[] {
  return cookie
    .split(";")
    .slice(1)
    .map((part) => part.trim().split("=")[0].trim().toLowerCase());
}

/**
 * All Set-Cookie values. Node 18.14+/22 provides Headers.getSetCookie();
 * the fallback only runs under test polyfills (whatwg-fetch) that combine
 * repeated headers — it splits on commas that start a new name=value pair.
 */
function readSetCookies(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const combined = headers.get("set-cookie");
  if (!combined) return [];
  return combined.split(/,(?=\s*[^;=\s]+=)/).map((c) => c.trim());
}

export function runSecurityChecks(headers: Headers): SecurityReport {
  const hsts = headers.get("strict-transport-security");
  const hstsMaxAge = hsts?.match(/max-age\s*=\s*(\d+)/i);
  const csp = headers.get("content-security-policy");
  const nosniff = headers.get("x-content-type-options");
  const referrer = headers.get("referrer-policy");
  const server = headers.get("server");
  const cookies = readSetCookies(headers);

  const checks: SecurityCheck[] = [
    {
      id: "hsts",
      label: "Forced encryption (HSTS)",
      pass: !!hstsMaxAge && Number(hstsMaxAge[1]) > 0,
      advice:
        "Add a Strict-Transport-Security header so browsers always use the encrypted version of your site. Without it, a visitor on public Wi-Fi can be silently downgraded to an unencrypted connection.",
    },
    {
      id: "csp",
      label: "Content Security Policy",
      pass: !!csp,
      advice:
        "Add a Content-Security-Policy header. It tells browsers exactly which scripts and resources your pages may load — the strongest single defence against malicious code injection.",
    },
    {
      id: "clickjacking",
      label: "Clickjacking protection",
      pass:
        headers.has("x-frame-options") ||
        !!(csp && /frame-ancestors/i.test(csp)),
      advice:
        "Add an X-Frame-Options header (or frame-ancestors to your Content-Security-Policy) so other sites can't embed your pages and trick visitors into clicking things they can't see.",
    },
    {
      id: "nosniff",
      label: "MIME sniffing blocked",
      pass: !!nosniff && nosniff.trim().toLowerCase() === "nosniff",
      advice:
        "Add 'X-Content-Type-Options: nosniff' so browsers never guess file types. Guessing lets a harmless-looking file be run as code.",
    },
    {
      id: "referrer",
      label: "Referrer privacy",
      pass: !!referrer && referrer.trim().toLowerCase() !== "unsafe-url",
      advice:
        "Add a Referrer-Policy header (strict-origin-when-cross-origin is a sensible default) so links leaving your site don't leak the full address of the page your visitor was on.",
    },
    {
      id: "permissions",
      label: "Browser feature lockdown",
      pass: headers.has("permissions-policy"),
      advice:
        "Add a Permissions-Policy header to switch off browser features you don't use — camera, microphone, location — so embedded content can't quietly request them.",
    },
    {
      id: "cookies",
      label: "Cookie safety",
      pass: cookies.every((c) => {
        const attrs = cookieAttrs(c);
        return attrs.includes("secure") && attrs.includes("httponly");
      }),
      advice:
        "Mark every cookie Secure and HttpOnly. Secure keeps cookies off unencrypted connections; HttpOnly keeps them away from malicious scripts running in the page.",
    },
    {
      id: "disclosure",
      label: "Software version hidden",
      pass: (!server || !/\d/.test(server)) && !headers.has("x-powered-by"),
      advice:
        "Stop your site announcing its software and version in the Server or X-Powered-By headers. A version number hands attackers a list of known vulnerabilities to try.",
    },
  ];

  const score = Math.round(
    (checks.filter((c) => c.pass).length / checks.length) * 100,
  );
  return { score, checks, failed: checks.filter((c) => !c.pass) };
}
