# Security Headers Audit — Design Spec

**Date:** 2026-07-20
**Branch:** `feat/security-headers-audit` (based on `Craig`)
**Status:** Approved for planning
**Tier:** Free (signup-bait lead magnet, like the Website Health Check)

## Goal

A members tool where a user enters their website URL and gets a scored
(0–100) plain-English report on the site's HTTP security headers — "Is your
website protecting your customers?" Follows the Website Health Check
architecture exactly, and extracts that tool's duplicable plumbing into
shared units along the way.

## Approach (chosen)

Thin new tool on extracted shared plumbing. Rejected alternatives:
- *Straight clone of the health-check files* — ~200 lines of verbatim
  duplication that every future URL tool doubles again.
- *Fold checks into the existing health check* — loses a standalone lead
  magnet; muddles "SEO basics" with "security".

## 1. Shared plumbing (refactor, no behaviour change)

### `lib/members/tools/audit-fetch.ts`
Extract the health-check route's redirect-ladder into:

```ts
fetchAuditTarget(rawUrl: string): Promise<
  | { ok: true; response: Response; finalUrl: string }
  | { ok: false; error: string; status: number }
>
```

Same SSRF ladder, verbatim behaviour:
1. `validateAuditUrl` — https-only, no IPs/localhost/ports/credentials
2. DNS lookup — every resolved address public (`isPrivateIp`)
3. `fetch` with `redirect: "manual"` — max 3 hops, each hop re-runs 1 and 2
4. 10s timeout per hop; same user-agent string

The health-check route switches to this helper. Its behaviour, error
messages, and existing tests stay identical (tests must pass unmodified —
they are the refactor's safety net).

### `app/components/members/tools/UrlAuditTool.tsx`
Generic client component extracted from `WebsiteHealthCheck.tsx`: URL input
+ submit button, busy state, `role="alert"` error, and a report section
(`ScoreDial` + "Fix these first" top-3 + full check list) driven by the
same `Report` JSON shape. Props:

```ts
{ endpoint: string; inputLabel: string; buttonLabel: string;
  busyLabel: string; scoreLabel: (finalUrl: string) => ReactNode }
```

`WebsiteHealthCheck.tsx` becomes a thin wrapper supplying its current copy;
the new `SecurityHeadersAudit` component is another. Existing behaviour of
the health-check UI (including the ScoreDial integration from the motion
phase) is unchanged.

## 2. Scorer — `lib/members/tools/security-headers.ts`

Pure function, no I/O:

```ts
runSecurityChecks(headers: Headers): {
  score: number;            // 0-100, equal-weighted checks
  checks: Check[];          // { id, label, pass, advice }
  failed: Check[];          // checks.filter(c => !c.pass)
}
```

Eight checks, each with plain-English advice written for small-business
owners (Australian English):

| id | Label | Pass condition |
|---|---|---|
| `hsts` | Forced encryption (HSTS) | `strict-transport-security` present with `max-age` > 0 |
| `csp` | Content Security Policy | `content-security-policy` header present (any policy) |
| `clickjacking` | Clickjacking protection | `x-frame-options` present OR CSP contains `frame-ancestors` |
| `nosniff` | MIME sniffing blocked | `x-content-type-options` equals `nosniff` (case-insensitive) |
| `referrer` | Referrer privacy | `referrer-policy` present and not `unsafe-url` |
| `permissions` | Browser feature lockdown | `permissions-policy` header present |
| `cookies` | Cookie safety | no `set-cookie` header at all, or every cookie carries both `Secure` and `HttpOnly` flags |
| `disclosure` | Software version hidden | `server` header absent or contains no version digits (e.g. `Apache/2.4.41` fails, `cloudflare` passes) AND no `x-powered-by` header |

Scoring: `round(passCount / 8 * 100)` — same equal-weight model as the
health check.

Deliberate exclusion: an HTTP→HTTPS redirect probe. Probing `http://`
conflicts with the https-only SSRF rule; HSTS covers the same risk. Note
this in a code comment so nobody "adds it back".

Cookie parsing: use `headers.getSetCookie()` (Node 18.14+/22) to get all
Set-Cookie values; flag detection is a case-insensitive attribute scan per
cookie.

## 3. Route — `app/api/members/tools/security-headers/route.ts`

Mirrors the health-check route with a headers-only body:
1. `checkRateLimit("members-security-headers", req, { limit: 10, windowMs: 10 * 60_000 })`
2. Member auth via `getMemberProfile()` — 401 if absent (any tier passes)
3. Body guards: 4KB cap, JSON parse, `url` must be a string
4. `fetchAuditTarget(url)` — on error, return its `{ error, status }`
5. `runSecurityChecks(response.headers)` — the body is never read
6. `NextResponse.json({ finalUrl, ...report })`

Cancel the unread response body (`response.body?.cancel()`) so the
connection is released. Generic client-facing errors; detail via
`console.error` only.

## 4. Registry and copy

- `content/members/security-headers-audit.ts` — free tier, `type: "tool"`,
  `componentKey: "security-headers-audit"`. Working copy (final wording at
  implementer's discretion, same tone as website-health-check):
  - Title: "Security Headers Audit"
  - Description: "Enter your website address and see whether it's using
    the protections modern browsers expect — encryption enforcement,
    clickjacking defence, cookie safety and more. Score out of 100 with
    plain-English fixes."
- `lib/members/items.ts` — add `"security-headers-audit"` to
  `TOOL_COMPONENT_KEYS` and the item to the registry list (free section).
- `app/components/members/tools/index.ts` — map the key to the component.
- Public `/tools` page (`app/(site)/(main)/tools/page.tsx`) — add a card
  alongside the existing audits ("Free audit" eyebrow, sign-up CTA), same
  `PublicAuditCard` pattern if it fits, otherwise match the existing card
  markup.

## 5. Error handling

All user-facing failures return the same generic shapes the health check
uses ("That site could not be reached." etc.) — the shared helper carries
those strings so both tools stay consistent. No stack traces, hostnames, or
DNS details ever reach the client.

## 6. Testing

- **Scorer (TDD):** every check's pass and fail cases, plus boundaries —
  `max-age=0` fails HSTS; `referrer-policy: unsafe-url` fails; multiple
  Set-Cookie headers where one lacks `HttpOnly` fails; `server: cloudflare`
  passes disclosure while `server: nginx/1.18.0` fails; CSP with
  `frame-ancestors` passes clickjacking without `x-frame-options`; empty
  Headers scores the no-cookie pass but fails the presence checks.
- **Route:** mirror `__tests__/api/members-health-check.test.ts` — 401
  unauthenticated, 400 for invalid or private-address URL shapes, 413
  oversized body, happy path with mocked fetch.
- **Refactor guard:** existing health-check unit and API tests pass
  unmodified after the `audit-fetch.ts` extraction; `UrlAuditTool`
  extraction keeps the existing WebsiteHealthCheck behaviour (adjust its
  test only if it asserts internal structure).

## 7. Out of scope (YAGNI)

- HTTP→HTTPS redirect probing (see §2)
- Grading header *quality* beyond presence (e.g. CSP strictness analysis)
- Cross-Origin-Opener-Policy / COEP / CORP checks (too advanced for the
  audience)
- Persisting results, PDF export, email capture beyond the existing
  membership gate
