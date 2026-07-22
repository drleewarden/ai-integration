# Members Dashboard — Design

**Date:** 2026-07-21
**Status:** Approved
**Branch:** `feat/members-dashboard` (builds on `feat/security-headers-audit`)

## Goal

Give signed-in members a personalised home at `/members`: a greeting, plan
status, genuine recent activity, and what's new in the library. The current
library grid moves to `/members/library`.

## Decisions made during brainstorming

1. **Scope:** personalised home (greeting, plan, recent activity, quick
   links), not an account/billing panel and not a stats-only strip.
2. **Activity data:** persist tool runs now in a new Supabase table so the
   feed is real from day one.
3. **Routing:** the dashboard *becomes* `/members`; the library moves to
   `/members/library`.
4. **Recording approach:** server-recorded events only. No new write
   endpoint; no client-reported data. Client-side calculators produce no
   activity in this version.

## Routing

- `app/(site)/(members)/members/page.tsx` → new dashboard page.
- Existing library page moves unchanged to
  `app/(site)/(members)/members/library/page.tsx` (title stays
  "Your library").
- Middleware needs no change: its matcher already covers `/members/*`, so
  `/members/library` is auth-gated automatically.
- Post-login and post-checkout redirects already target `/members`; landing
  on the dashboard is the desired behaviour. Audit internal links and point
  the ones that mean "browse the library" at `/members/library`.
- Both pages: `robots: { index: false, follow: false }`,
  `export const dynamic = "force-dynamic"`.

## Data: `member_activity` table

```sql
create table member_activity (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users (id) on delete cascade,
  item_slug text not null,
  kind text not null check (kind in ('tool_run', 'download')),
  summary jsonb,
  created_at timestamptz not null default now()
);
create index member_activity_member_created_idx
  on member_activity (member_id, created_at desc);
```

- **RLS enabled.** Policies: members may `select` and `insert` only rows
  where `member_id = auth.uid()`. No update/delete policies.
- Inserts go through the existing cookie-based anon-key server client
  (`lib/supabase/auth-server.ts`). The service-role client stays reserved
  for webhooks/signed URLs — least privilege, matching the existing split.
- `summary` stays minimal and non-sensitive: `{ "score": 78, "host":
  "example.com" }` for audits (hostname only, never the full URL),
  omitted/empty for downloads.
- Ships in **both** a new migration `supabase/migrations/0003_member_activity.sql`
  **and** appended to `supabase/members_only_bootstrap.sql`, since the
  bootstrap file is what actually runs on the fresh Supabase project
  (migration 0001 fails there due to missing base CRM tables).

## Recording

New helper `lib/members/activity.ts`:

```ts
recordActivity(supabase, userId, { slug, kind, summary }): Promise<void>
```

- Strictly best-effort: insert failure is logged via `console.error` and
  never fails or delays the member's request beyond the awaited insert.
- Call sites (the only places the server witnesses member events):
  - `app/api/members/tools/health-check/route.ts` — after a successful run,
    with `{ score, host }`.
  - `app/api/members/tools/security-headers/route.ts` — same.
  - `app/api/members/download/[slug]/route.ts` — after issuing the signed
    URL, kind `download`.

## Dashboard page

Server component composing existing design-system primitives (eyebrow,
`h-display`, CSS custom properties, inline styles — consistent with the
current members pages):

1. **Greeting** — "Welcome back, {display_name}" falling back to the email
   local part; plan line beneath: free members get an upgrade CTA to
   `/members/upgrade`, Pro members get a quiet link to `/members/account`.
2. **Recent activity** — latest 5 `member_activity` rows for the member.
   Titles resolved via `itemBySlug`; rows whose slug is no longer in the
   registry are skipped. Relative timestamps ("2 hours ago"). Score shown
   when present in `summary`. Empty state: short copy plus links to the two
   audit tools ("Run a check and your results will show up here").
3. **New in the library** — 3 newest items by `dateAdded` from the registry,
   rendered with the existing `ItemCard` (existing lock logic applies).
4. **Browse link** — prominent link to `/members/library`.

Formatting logic (relative time, activity-row shaping/filtering) lives in a
pure function module so it is unit-testable, e.g.
`lib/members/dashboard.ts`.

## Error handling

- Activity fetch failure on the dashboard: log server-side, render the page
  without the activity list (show the empty state); never 500 the page.
- Activity insert failure in API routes: log and continue; the tool/download
  response is unaffected.
- Signed-in user with no profile row: existing `getMemberProfile` fallback
  (free tier, auth email) already covers the dashboard.

## Security notes (OWASP pass)

- No new endpoints; no client-supplied activity data (A01/A03 surface
  unchanged).
- New table is RLS-protected; access only via `auth.uid()`-scoped policies;
  service-role key not introduced into any request path (A01, least
  privilege).
- Stored summaries contain no payment data, credentials, or full URLs. The
  audited hostname is member-entered business data, displayed only to that
  member on a noindex page.
- Rate limiting on the tool routes is unchanged.

## Testing

Jest + RTL, following existing suite patterns:

- `lib/members/__tests__/activity.test.ts` — helper inserts the right
  payload; insert failure is swallowed and logged.
- Extend the audit-route tests: route still returns 200 with a valid report
  when the activity insert throws.
- `lib/members/__tests__/dashboard.test.ts` — relative-time formatting,
  unknown-slug filtering, 5-row cap.

## Out of scope

- Activity from client-side calculators (would need a write endpoint —
  revisit later).
- Trends/history charts ("scored 62 last week, 78 now").
- Any billing/invoice UI beyond the existing account page.
