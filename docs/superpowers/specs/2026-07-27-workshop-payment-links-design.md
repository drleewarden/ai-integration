# Workshop Payment Links — Design

**Date:** 2026-07-27
**Status:** Approved by Darryn (brainstorming session)

## Purpose

Let Creative Milk charge workshop attendees a **custom amount per person** via
Stripe. Darryn creates a payment link from a protected admin page; the invitee
receives a branded email with a link that opens a payment page showing their
exact amount; payment happens on Stripe-hosted Checkout. Records live in
Supabase so paid/unpaid status is visible without digging through Stripe.

## Decisions made during brainstorming

| Question | Decision |
|---|---|
| How are amounts set? | Custom amount per person (bespoke/negotiated pricing) |
| Link creation workflow | Admin page generates the record **and** emails the invitee via Resend |
| Admin page protection | Existing Supabase members login + `ADMIN_EMAILS` env allowlist |
| Architecture | Approach A: DB-backed record → branded `/pay/<id>` page → Stripe Checkout |
| On payment | Webhook marks record paid, emails Darryn an alert **and** sends the payer a branded Creative Milk confirmation (in addition to Stripe's receipt) |

### Why Approach A (rejected alternatives)

- **Stripe Payment Links via API** — less code but unbranded recipient
  experience, per-link Price objects clutter Stripe, paid/unpaid tracking
  lives only in the Stripe dashboard.
- **HMAC-signed amount in the URL** — no DB table, but no ledger, no void
  capability, ugly long URLs.
- **Plain `?amount=` query param** — rejected outright: trivially tampered.

The chosen design means **the amount never crosses a trust boundary**: the
emailed URL carries only an unguessable UUID; the server reads the amount from
Supabase when creating the Checkout session. Checkout sessions expire within
24 h, so they are created on demand at pay time, never at email time — the
emailed link itself never expires (unless voided).

## Data model

New migration `supabase/migrations/0004_workshop_payments.sql`:

```
workshop_payments
  id                          uuid pk default gen_random_uuid()
  created_at                  timestamptz default now()
  name                        text not null
  email                       text not null
  amount_cents                integer not null check (amount_cents > 0 and amount_cents <= 1000000)
  currency                    text not null default 'aud'
  description                 text not null        -- e.g. "AI Workshop — Fri 7 Aug"
  status                      text not null default 'pending'
                              check (status in ('pending','paid','void'))
  stripe_checkout_session_id  text
  stripe_payment_intent_id    text
  paid_at                     timestamptz
  created_by                  text not null        -- admin email
```

RLS enabled with **no policies** — service-role access only (same pattern as
the readiness tables). Amounts are entered in dollars on the admin form,
stored as integer cents. Treated as GST-inclusive; no tax logic.

## Components

### Admin page — `app/(site)/(members)/members/admin/payment-links/page.tsx`

- Server component gate: `getSessionUser()` + email must appear in
  `ADMIN_EMAILS` (comma-separated env var, case-insensitive compare).
  Non-admins get `notFound()` — the page's existence is not advertised.
  Members middleware already forces login for `/members/*`.
- Client form: name, email, amount (dollars), description. Submits to
  `POST /api/admin/payment-links`.
- Below the form: list of recent payment links (name, email, amount, status,
  created date) with a **Void** button on pending rows and a copy-link button.

### Public pay page — `app/(site)/pay/[id]/page.tsx`

- Outside the layout route groups; renders its own Nav/Footer (same pattern
  as `ai-readiness`). `noindex` via metadata robots.
- Server component fetches the row via the service client and projects only
  what the page needs: first name, amount, currency, description, status.
- States: `pending` → summary + **Pay now** button; `paid` → "already paid";
  `void` → "this link is no longer active"; unknown id → `notFound()`.
- Returning from Checkout with `?success=1` shows a "payment received"
  state optimistically (the webhook may lag by seconds).
- Pay button calls `POST /api/pay/checkout` and redirects the browser to the
  returned Stripe URL.

### API routes

**`POST /api/admin/payment-links`**
- Auth: session user via `getAuthServerSupabase()`, email in `ADMIN_EMAILS`.
  401/404 otherwise — checked server-side; the page gate alone is not trusted.
- Validates: name/email/description required, email regex, amount integer
  cents within (0, 1_000_000].
- Voiding: `PATCH /api/admin/payment-links` with `{ id }`, same auth checks;
  only `pending → void` transitions allowed (paid rows are immutable).
- Inserts row with service client, sends the payment-request email via
  Resend (dark branded template matching `workshop-signup`), returns the
  link URL so the admin can also copy it.
- Rate limited (`checkRateLimit`), body-size guard. No honeypot (not a
  public form).

**`POST /api/pay/checkout`**
- Body: `{ id }` only. UUID regex validation, body-size guard, rate limit.
- Row must exist with status `pending`. Creates a Stripe Checkout session:
  `mode: "payment"`, `line_items` with inline `price_data` from the DB row,
  `customer_email` from the row, `metadata.workshop_payment_id = id`,
  `success_url: /pay/<id>?success=1`, `cancel_url: /pay/<id>`.
- Stores the session id on the row, returns `{ url }`.
- Generic client errors; details to `console.error`.

**`app/api/stripe/webhook/route.ts` (extended)**
- In `checkout.session.completed`: if `session.metadata.workshop_payment_id`
  is present, this is a workshop payment — mark the row
  `paid` (+ `paid_at`, payment-intent id), send the payer the branded
  confirmation email, send the internal alert email to `RESEND_TO`, `break`.
  Otherwise fall through to the existing subscription logic unchanged.
- Idempotent: a row already `paid` is not re-processed and no duplicate
  emails are sent (Stripe retries deliveries).
- Email failures after a successful DB update are logged, never fail the
  webhook response (Stripe retries non-2xx, which would double-send).

### Emails (Resend, matching existing dark template style)

1. **Payment request** → invitee: greeting, description, amount, prominent
   button to `/pay/<id>`, reply-to `RESEND_TO`.
2. **Payment confirmation** → payer (sent by webhook): branded receipt-style
   summary with workshop details. Stripe's own card receipt is additional.
3. **Payment alert** → `RESEND_TO` (sent by webhook): who paid, how much.

Base URL for links: same mechanism the site already uses for absolute URLs
(sitemap/base-url constant) — reuse, don't invent a new env var if one exists.

## Security notes

- Card data never touches the app — Stripe-hosted Checkout only (no PCI scope).
- Amount is server-authoritative from Supabase; URL carries only a UUIDv4.
- Admin allowlist enforced in the API route, not just the page.
- Service-role Supabase client stays server-side only (repo rule).
- Stores invitee name + email (PII) in Supabase — same exposure class as the
  existing contacts/readiness tables; acknowledged during design.

## Testing

- Jest units: webhook branch selection (workshop payment vs subscription),
  `ADMIN_EMAILS` parsing/matching, amount validation edge cases (0, negative,
  non-integer, > cap), pending→void transition rules.
- Manual E2E in Stripe test mode with `stripe listen` forwarding to the local
  webhook; verify paid status, both emails, and the already-paid page state.

## Environment variables

- `ADMIN_EMAILS` — new; comma-separated admin account emails.
- Existing: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`,
  `RESEND_FROM`, `RESEND_TO`, Supabase keys.

## Out of scope

- Refunds (handled in the Stripe dashboard).
- Quantities/multiple seats per link (one link = one payment).
- Tax/GST calculation, invoices, discount codes.
- Reminder/chaser emails for unpaid links.
