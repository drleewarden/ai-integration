// lib/service-lines.ts
//
// Attributes an enquiry to a service line based on the page it came from, so
// that "which side of the business actually drives revenue" is answerable from
// data rather than impression.
//
// Inferred rather than asked. An extra "what are you interested in?" field
// costs conversions, and visitors miscategorise themselves anyway.
//
// Shared deliberately between the client form and the API route: the route
// validates the posted value against SERVICE_LINES instead of trusting it,
// because anything a browser sends is attacker-controlled and these strings
// reach an email body.

export const SERVICE_LINES = [
  "ai-automation",
  "websites",
  "workshop",
  "tools",
  "general",
] as const;

export type ServiceLine = (typeof SERVICE_LINES)[number];

/** Human-readable label for the notification email. */
export const SERVICE_LINE_LABELS: Record<ServiceLine, string> = {
  "ai-automation": "AI automation",
  websites: "Specialised websites",
  workshop: "Workshop",
  tools: "Free tools and assessments",
  general: "General or mixed",
};

// First match wins. Pages that serve mixed intent (the homepage, /pricing,
// /process, /work, /about, /insights) deliberately have no rule and fall
// through to "general": labelling them would invent a signal that is not there.
const PATH_RULES: ReadonlyArray<readonly [string, ServiceLine]> = [
  ["/specialised-websites", "websites"],
  ["/websites", "websites"],
  ["/ai-automation-melbourne", "ai-automation"],
  ["/ai-consulting-melbourne", "ai-automation"],
  ["/what-we-build", "ai-automation"],
  ["/for/", "ai-automation"],
  ["/events/", "workshop"],
  ["/ai-readiness", "tools"],
  ["/opportunity-cost", "tools"],
  ["/tools", "tools"],
];

export function serviceLineForPath(pathname: string): ServiceLine {
  const path = pathname.toLowerCase();
  for (const [prefix, line] of PATH_RULES) {
    if (path === prefix || path.startsWith(prefix)) return line;
  }
  return "general";
}

export function isServiceLine(value: unknown): value is ServiceLine {
  return (
    typeof value === "string" &&
    (SERVICE_LINES as readonly string[]).includes(value)
  );
}

const MAX_SOURCE_PATH = 128;

/**
 * Normalises a posted source path before it is trusted or stored.
 *
 * Accepts only a site-relative path, which keeps an absolute URL or a
 * `javascript:` scheme out of the notification email, and strips the query
 * string and fragment so that tracking parameters and anything personal a
 * visitor happened to have in their URL are never captured.
 */
export function normaliseSourcePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  // Reject protocol-relative ("//evil.com") as well as absolute URLs.
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  const withoutQuery = trimmed.split(/[?#]/)[0];
  if (withoutQuery.length > MAX_SOURCE_PATH) return null;
  if (!/^[a-zA-Z0-9/_\-.]*$/.test(withoutQuery)) return null;
  return withoutQuery;
}

/**
 * Works out where an enquiry originated.
 *
 * The contact form is embedded on service pages and also stands alone at
 * /contact, where the pathname says nothing useful. In that case fall back to
 * a same-origin referrer, which is where the visitor actually came from.
 */
export function resolveEnquirySource(
  pathname: string,
  referrer: string,
  origin: string,
): { sourcePath: string; serviceLine: ServiceLine } {
  let path = pathname;

  if (serviceLineForPath(path) === "general" && referrer) {
    try {
      const ref = new URL(referrer);
      // Same-origin only: an external referrer tells us nothing about which
      // of our own service lines the visitor was reading.
      if (ref.origin === origin) {
        if (serviceLineForPath(ref.pathname) !== "general") {
          path = ref.pathname;
        }
      }
    } catch {
      // Malformed referrer. Keep the pathname we already have.
    }
  }

  return { sourcePath: path, serviceLine: serviceLineForPath(path) };
}
