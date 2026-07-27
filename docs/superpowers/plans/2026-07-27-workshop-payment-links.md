# Workshop Payment Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Custom-amount workshop payment links: an admin page creates a Supabase-backed payment record and emails the invitee a branded `/pay/<uuid>` link; that page creates a Stripe Checkout session on demand; the existing webhook marks it paid and sends confirmation + alert emails.

**Architecture:** New `workshop_payments` table (service-role only). Pure logic lives in `lib/payments/` (allowlist parsing, amount validation, email rendering, payment fulfilment) so it is unit-testable; thin API routes and pages call into it. The amount never crosses a trust boundary — URLs carry only a UUID; the server reads the amount from the DB.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (service-role client), Stripe Checkout (`stripe` npm pkg via `lib/stripe.ts`), Resend, Jest.

**Spec:** `docs/superpowers/specs/2026-07-27-workshop-payment-links-design.md`

## Global Constraints

- **Node PATH:** non-interactive shells get Node 16 which breaks Jest/tsc. Prefix EVERY npm/npx/node command with: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && `
- **Branch:** all work on `feat/workshop-payment-links`. This checkout is shared by parallel sessions — run `git branch --show-current` before EVERY commit and abort if it isn't `feat/workshop-payment-links`. Never bare `git stash`/`git stash pop`.
- Amount cap: `amount_cents` in `(0, 1_000_000]` (i.e. $0.01–$10,000 AUD), enforced in DB check constraint AND server validation.
- Currency: `aud` everywhere; amounts GST-inclusive; no tax logic.
- `lib/supabase/server.ts` (service role) is server-side only — never import from a client component.
- Client-facing error messages are generic; detail goes to `console.error` only.
- Australian English in all copy ("personalise", "organise").
- Path alias `@/*` → project root; use it instead of deep relative imports.
- All new POST/PATCH API routes call `checkRateLimit(name, req, opts)` from `@/lib/rate-limit` first.
- New env var: `ADMIN_EMAILS` (comma-separated admin account emails). Existing: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO`.
- Test run command shape: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest <path> --watchAll=false`

---

### Task 1: Branch + migration

**Files:**
- Create: `supabase/migrations/0004_workshop_payments.sql`

**Interfaces:**
- Produces: table `workshop_payments` with columns `id (uuid)`, `created_at`, `name`, `email`, `amount_cents (int)`, `currency (default 'aud')`, `description`, `status ('pending'|'paid'|'void', default 'pending')`, `stripe_checkout_session_id`, `stripe_payment_intent_id`, `paid_at`, `created_by`. All later tasks read/write it via the service-role client.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b feat/workshop-payment-links
git branch --show-current   # expect: feat/workshop-payment-links
```

- [ ] **Step 2: Write the migration**

Create `supabase/migrations/0004_workshop_payments.sql` (style matches `0003_member_activity.sql`):

```sql
-- ============================================================================
-- 0004: workshop_payments — per-person workshop payment links with a custom
-- amount. The emailed link is /pay/<id>; the amount is read server-side from
-- this table when Checkout starts, so the URL never carries a price.
--
-- Access model: RLS enabled with NO policies — service-role only. The admin
-- page/API, pay page, checkout API, and Stripe webhook all use the server-side
-- service client (same pattern as the readiness tables).
-- ============================================================================

create table workshop_payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  amount_cents integer not null
    check (amount_cents > 0 and amount_cents <= 1000000),
  currency text not null default 'aud',
  description text not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'void')),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  created_by text not null
);

create index workshop_payments_created_idx
  on workshop_payments (created_at desc);

alter table workshop_payments enable row level security;
```

- [ ] **Step 3: Commit**

```bash
git branch --show-current   # must be feat/workshop-payment-links
git add supabase/migrations/0004_workshop_payments.sql
git commit -m "feat: workshop_payments migration"
```

**MANUAL STEP (flag to Darryn at the end, not blocking):** the migration must be run by hand in the Supabase SQL editor of the live project — there is no migration runner in this repo.

---

### Task 2: `lib/payments/validate.ts` (amount + format regexes)

**Files:**
- Create: `lib/payments/validate.ts`
- Test: `lib/payments/__tests__/validate.test.ts`

**Interfaces:**
- Produces:
  - `MAX_AMOUNT_CENTS: number` (= 1_000_000)
  - `EMAIL_RE: RegExp`, `UUID_RE: RegExp`
  - `parseDollarsToCents(input: string): number | null` — accepts `"450"`, `"450.1"`, `"$1,200.50"`; null for anything invalid, zero, negative, >2dp, or > $10,000.

- [ ] **Step 1: Write the failing test**

Create `lib/payments/__tests__/validate.test.ts`:

```ts
import {
  parseDollarsToCents,
  MAX_AMOUNT_CENTS,
  EMAIL_RE,
  UUID_RE,
} from "../validate";

describe("parseDollarsToCents", () => {
  it("parses whole dollars", () => {
    expect(parseDollarsToCents("450")).toBe(45000);
  });
  it("parses one and two decimal places", () => {
    expect(parseDollarsToCents("450.1")).toBe(45010);
    expect(parseDollarsToCents("450.15")).toBe(45015);
  });
  it("accepts a leading $ and thousands commas", () => {
    expect(parseDollarsToCents("$1,200.50")).toBe(120050);
  });
  it("rejects zero, negatives and three decimal places", () => {
    expect(parseDollarsToCents("0")).toBeNull();
    expect(parseDollarsToCents("0.00")).toBeNull();
    expect(parseDollarsToCents("-5")).toBeNull();
    expect(parseDollarsToCents("450.105")).toBeNull();
  });
  it("rejects non-numeric input and empty strings", () => {
    expect(parseDollarsToCents("abc")).toBeNull();
    expect(parseDollarsToCents("")).toBeNull();
    expect(parseDollarsToCents("45.0.0")).toBeNull();
  });
  it("rejects amounts over the cap", () => {
    expect(parseDollarsToCents("10000")).toBe(MAX_AMOUNT_CENTS);
    expect(parseDollarsToCents("10000.01")).toBeNull();
    expect(parseDollarsToCents("999999999999")).toBeNull();
  });
});

describe("regexes", () => {
  it("EMAIL_RE accepts a plain address and rejects garbage", () => {
    expect(EMAIL_RE.test("jane@example.com")).toBe(true);
    expect(EMAIL_RE.test("not-an-email")).toBe(false);
  });
  it("UUID_RE matches uuids case-insensitively", () => {
    expect(UUID_RE.test("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(true);
    expect(UUID_RE.test("6BA7B810-9DAD-11D1-80B4-00C04FD430C8")).toBe(true);
    expect(UUID_RE.test("nope")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest lib/payments/__tests__/validate.test.ts --watchAll=false`
Expected: FAIL — cannot find module `../validate`

- [ ] **Step 3: Write the implementation**

Create `lib/payments/validate.ts`:

```ts
/**
 * Validation primitives for the workshop payment-links feature. The dollars
 * parser is the ONLY place an admin-supplied amount is converted to cents --
 * every route trusts its output, so the cap and 2dp rule live here.
 */

/** $10,000 sanity cap (in cents). Mirrors the DB check constraint. */
export const MAX_AMOUNT_CENTS = 1_000_000;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parse a dollars string ("450", "450.10", "$1,200.50") into integer cents.
 * Returns null unless the result is 0 < cents <= MAX_AMOUNT_CENTS with at
 * most two decimal places. String-based (no parseFloat) to avoid float error.
 */
export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > MAX_AMOUNT_CENTS) {
    return null;
  }
  return cents;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest lib/payments/__tests__/validate.test.ts --watchAll=false`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git branch --show-current   # must be feat/workshop-payment-links
git add lib/payments/validate.ts lib/payments/__tests__/validate.test.ts
git commit -m "feat: payment amount/format validation helpers"
```

---

### Task 3: `lib/payments/admin.ts` (ADMIN_EMAILS allowlist)

**Files:**
- Create: `lib/payments/admin.ts`
- Test: `lib/payments/__tests__/admin.test.ts`

**Interfaces:**
- Produces:
  - `parseAdminEmails(raw: string | undefined | null): Set<string>` — lowercased, trimmed, empties dropped.
  - `isAdminEmail(email: string | null | undefined, allowlist: Set<string>): boolean` — false when the allowlist is empty (unset env var must never mean "everyone is admin").

- [ ] **Step 1: Write the failing test**

Create `lib/payments/__tests__/admin.test.ts`:

```ts
import { parseAdminEmails, isAdminEmail } from "../admin";

describe("parseAdminEmails", () => {
  it("splits, trims, lowercases and drops empties", () => {
    const set = parseAdminEmails(" Darryn@Example.com , ,b@c.com,");
    expect(set).toEqual(new Set(["darryn@example.com", "b@c.com"]));
  });
  it("returns an empty set for undefined/null/empty", () => {
    expect(parseAdminEmails(undefined).size).toBe(0);
    expect(parseAdminEmails(null).size).toBe(0);
    expect(parseAdminEmails("").size).toBe(0);
  });
});

describe("isAdminEmail", () => {
  const allow = parseAdminEmails("darryn@example.com");
  it("matches case-insensitively", () => {
    expect(isAdminEmail("DARRYN@example.COM", allow)).toBe(true);
  });
  it("rejects non-listed, null and undefined emails", () => {
    expect(isAdminEmail("other@example.com", allow)).toBe(false);
    expect(isAdminEmail(null, allow)).toBe(false);
    expect(isAdminEmail(undefined, allow)).toBe(false);
  });
  it("rejects everyone when the allowlist is empty", () => {
    expect(isAdminEmail("darryn@example.com", new Set())).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest lib/payments/__tests__/admin.test.ts --watchAll=false`
Expected: FAIL — cannot find module `../admin`

- [ ] **Step 3: Write the implementation**

Create `lib/payments/admin.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest lib/payments/__tests__/admin.test.ts --watchAll=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git branch --show-current   # must be feat/workshop-payment-links
git add lib/payments/admin.ts lib/payments/__tests__/admin.test.ts
git commit -m "feat: ADMIN_EMAILS allowlist helpers"
```

---

### Task 4: `lib/payments/emails.ts` (three branded emails)

**Files:**
- Create: `lib/payments/emails.ts`
- Test: `lib/payments/__tests__/emails.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `formatAmount(amountCents: number, currency: string): string` — e.g. `formatAmount(45000, "aud")` → `"$450.00 AUD"`.
  - `renderPaymentRequestEmail(f: { name: string; description: string; amount: string; payUrl: string }): { subject: string; html: string }`
  - `renderPaymentConfirmationEmail(f: { name: string; description: string; amount: string }): { subject: string; html: string }`
  - `renderPaymentAlertEmail(f: { name: string; email: string; description: string; amount: string }): { subject: string; html: string }`
  - All user-supplied fields are HTML-escaped inside the render functions — callers pass raw strings.

- [ ] **Step 1: Write the failing test**

Create `lib/payments/__tests__/emails.test.ts`:

```ts
import {
  formatAmount,
  renderPaymentRequestEmail,
  renderPaymentConfirmationEmail,
  renderPaymentAlertEmail,
} from "../emails";

describe("formatAmount", () => {
  it("formats cents as dollars with currency code", () => {
    expect(formatAmount(45000, "aud")).toBe("$450.00 AUD");
    expect(formatAmount(45010, "aud")).toBe("$450.10 AUD");
    expect(formatAmount(99, "aud")).toBe("$0.99 AUD");
  });
});

describe("renderPaymentRequestEmail", () => {
  const msg = renderPaymentRequestEmail({
    name: 'Jane <script>alert("x")</script>',
    description: "AI Workshop — Fri 7 Aug",
    amount: "$450.00 AUD",
    payUrl: "https://www.creative-milk.com.au/pay/abc-123",
  });
  it("escapes HTML in user-supplied fields", () => {
    expect(msg.html).not.toContain("<script>");
    expect(msg.html).toContain("&lt;script&gt;");
  });
  it("links to the pay URL and shows the amount", () => {
    expect(msg.html).toContain("https://www.creative-milk.com.au/pay/abc-123");
    expect(msg.html).toContain("$450.00 AUD");
    expect(msg.subject).toContain("$450.00 AUD");
  });
});

describe("renderPaymentConfirmationEmail", () => {
  it("includes the amount and description", () => {
    const msg = renderPaymentConfirmationEmail({
      name: "Jane Doe",
      description: "AI Workshop — Fri 7 Aug",
      amount: "$450.00 AUD",
    });
    expect(msg.html).toContain("$450.00 AUD");
    expect(msg.html).toContain("AI Workshop — Fri 7 Aug");
    expect(msg.html).toContain("Jane");
  });
});

describe("renderPaymentAlertEmail", () => {
  it("includes payer identity and amount", () => {
    const msg = renderPaymentAlertEmail({
      name: "Jane Doe",
      email: "jane@example.com",
      description: "AI Workshop — Fri 7 Aug",
      amount: "$450.00 AUD",
    });
    expect(msg.subject).toContain("Jane Doe");
    expect(msg.html).toContain("jane@example.com");
    expect(msg.html).toContain("$450.00 AUD");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest lib/payments/__tests__/emails.test.ts --watchAll=false`
Expected: FAIL — cannot find module `../emails`

- [ ] **Step 3: Write the implementation**

Create `lib/payments/emails.ts`. The visual shell copies the existing dark template in `app/api/workshop-signup/route.ts` (midnight `#0F1526`, gold `#C9A84C`, cream `#F5F0E8`):

```ts
/**
 * Email templates for the workshop payment-links flow. All user-supplied
 * fields are escaped HERE (input handling) -- callers pass raw strings and
 * must not pre-escape. Rendering is pure so it unit-tests without Resend.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatAmount(amountCents: number, currency: string): string {
  return `$${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

/** Shared dark shell matching the workshop-signup emails. */
function emailShell(eyebrow: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Creative Milk</title></head>
<body style="margin:0;background:#0F1526;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#F5F0E8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F1526;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0F1526;border:1px solid rgba(245,240,232,0.08);">
        <tr><td style="padding:32px 40px;border-bottom:1px solid rgba(245,240,232,0.08);">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;">-- ${eyebrow}</div>
          <div style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#F5F0E8;letter-spacing:-0.01em;line-height:1.05;">
            Creative <em style="color:#C9A84C;font-style:italic;">Milk</em>
          </div>
        </td></tr>
        <tr><td style="padding:32px 40px;">${inner}</td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid rgba(245,240,232,0.08);font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;color:rgba(245,240,232,0.32);">
          Creative Milk &middot; contact@creative-milk.com.au
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<div style="margin-bottom:18px;">
    <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:4px;">${label}</div>
    <div style="font-size:15px;color:#F5F0E8;">${value}</div>
  </div>`;
}

const PARA =
  'style="font-size:16px;line-height:1.6;color:rgba(245,240,232,0.85);margin:0 0 20px;"';

/** Sent by the admin route when a payment link is created. */
export function renderPaymentRequestEmail(f: {
  name: string;
  description: string;
  amount: string;
  payUrl: string;
}): { subject: string; html: string } {
  const name = escapeHtml(f.name);
  const firstName = name.split(" ")[0] || name;
  const description = escapeHtml(f.description);
  const amount = escapeHtml(f.amount);
  const inner = `
    <p ${PARA}>Hi ${firstName},</p>
    <p ${PARA}>Here's your payment link for the workshop. The amount is set for you — just click through and pay securely with Stripe.</p>
    <div style="margin:28px 0;padding:20px 24px;background:rgba(245,240,232,0.04);border-left:2px solid #C9A84C;">
      ${detailRow("What you're paying for", description)}
      ${detailRow("Amount", amount)}
    </div>
    <div style="margin:32px 0;">
      <a href="${f.payUrl}" style="display:inline-block;background:#C9A84C;color:#0F1526;font-size:15px;font-weight:600;letter-spacing:0.04em;text-decoration:none;padding:14px 32px;">Pay securely &rarr;</a>
    </div>
    <p ${PARA}>The link doesn't expire, and payment is handled end-to-end by Stripe — we never see your card details. Any questions, just hit reply.</p>
    <p ${PARA}><span style="color:#F5F0E8;">-- The Creative Milk team</span></p>`;
  return {
    subject: `Your workshop payment link — ${f.amount}`,
    html: emailShell("Payment link", inner),
  };
}

/** Sent by the Stripe webhook to the payer once payment lands. */
export function renderPaymentConfirmationEmail(f: {
  name: string;
  description: string;
  amount: string;
}): { subject: string; html: string } {
  const name = escapeHtml(f.name);
  const firstName = name.split(" ")[0] || name;
  const description = escapeHtml(f.description);
  const amount = escapeHtml(f.amount);
  const inner = `
    <p ${PARA}>Hi ${firstName},</p>
    <p ${PARA}>Payment received — you're all set. Here's what you've paid for:</p>
    <div style="margin:28px 0;padding:20px 24px;background:rgba(245,240,232,0.04);border-left:2px solid #C9A84C;">
      ${detailRow("Item", description)}
      ${detailRow("Amount paid", amount)}
    </div>
    <p ${PARA}>Stripe will send you a separate card receipt. We'll be in touch with joining details closer to the day — anything in the meantime, just hit reply.</p>
    <p ${PARA}>Looking forward to having you in the room.<br><span style="color:#F5F0E8;">-- The Creative Milk team</span></p>`;
  return {
    subject: "Payment received — Creative Milk Workshop",
    html: emailShell("Payment received", inner),
  };
}

/** Sent by the Stripe webhook to RESEND_TO (internal alert). */
export function renderPaymentAlertEmail(f: {
  name: string;
  email: string;
  description: string;
  amount: string;
}): { subject: string; html: string } {
  const name = escapeHtml(f.name);
  const email = escapeHtml(f.email);
  const description = escapeHtml(f.description);
  const amount = escapeHtml(f.amount);
  const inner = `
    ${detailRow("Name", name)}
    ${detailRow("Email", `<a href="mailto:${email}" style="color:#C9A84C;text-decoration:none;border-bottom:1px solid rgba(201,168,76,0.35);">${email}</a>`)}
    ${detailRow("Paid for", description)}
    ${detailRow("Amount", amount)}`;
  return {
    subject: `Workshop payment received — ${f.name} (${f.amount})`,
    html: emailShell("Workshop payment", inner),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest lib/payments/__tests__/emails.test.ts --watchAll=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git branch --show-current   # must be feat/workshop-payment-links
git add lib/payments/emails.ts lib/payments/__tests__/emails.test.ts
git commit -m "feat: payment link email templates"
```

---

### Task 5: `lib/payments/fulfil.ts` (webhook fulfilment logic)

**Files:**
- Create: `lib/payments/fulfil.ts`
- Test: `lib/payments/__tests__/fulfil.test.ts`

**Interfaces:**
- Consumes: `formatAmount`, `renderPaymentConfirmationEmail`, `renderPaymentAlertEmail` from `@/lib/payments/emails` (Task 4 signatures).
- Produces:
  - `type SendEmailFn = (msg: { from: string; to: string; replyTo?: string; subject: string; html: string }) => Promise<{ error: unknown }>`
  - `fulfilWorkshopPayment(opts: { session: Stripe.Checkout.Session; supabase: SupabaseClient; sendEmail: SendEmailFn; from: string; internalTo: string }): Promise<void>` — idempotent; called by the webhook (Task 6).

- [ ] **Step 1: Write the failing test**

Create `lib/payments/__tests__/fulfil.test.ts`:

```ts
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fulfilWorkshopPayment } from "../fulfil";

const ROW = {
  id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  name: "Jane Doe",
  email: "jane@example.com",
  amount_cents: 45000,
  currency: "aud",
  description: "AI Workshop — Fri 7 Aug",
  status: "pending",
};

function makeSession(paymentId: string | undefined): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    payment_intent: "pi_test_456",
    metadata: paymentId ? { workshop_payment_id: paymentId } : {},
  } as unknown as Stripe.Checkout.Session;
}

/** Minimal fake of the two supabase call chains fulfil uses. */
function makeSupabase(row: typeof ROW | null) {
  const update = jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ error: null }),
  });
  const supabase = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: row, error: null }),
        }),
      }),
      update,
    }),
  };
  return { supabase: supabase as unknown as SupabaseClient, update };
}

describe("fulfilWorkshopPayment", () => {
  const from = "Creative Milk <hello@creative-milk.com.au>";
  const internalTo = "contact@creative-milk.com.au";

  it("marks the row paid and sends confirmation + alert emails", async () => {
    const { supabase, update } = makeSupabase({ ...ROW });
    const sendEmail = jest.fn().mockResolvedValue({ error: null });
    await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "paid",
        stripe_payment_intent_id: "pi_test_456",
        stripe_checkout_session_id: "cs_test_123",
      }),
    );
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "jane@example.com" }),
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: internalTo }),
    );
  });

  it("is idempotent: an already-paid row sends nothing", async () => {
    const { supabase, update } = makeSupabase({ ...ROW, status: "paid" });
    const sendEmail = jest.fn();
    await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(update).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does nothing when metadata has no workshop_payment_id", async () => {
    const { supabase } = makeSupabase({ ...ROW });
    const sendEmail = jest.fn();
    await fulfilWorkshopPayment({
      session: makeSession(undefined),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does nothing when the row is missing", async () => {
    const { supabase, update } = makeSupabase(null);
    const sendEmail = jest.fn();
    await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(update).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest lib/payments/__tests__/fulfil.test.ts --watchAll=false`
Expected: FAIL — cannot find module `../fulfil`

- [ ] **Step 3: Write the implementation**

Create `lib/payments/fulfil.ts`:

```ts
/**
 * Marks a workshop payment paid and sends the two post-payment emails.
 * Called only by the Stripe webhook AFTER signature verification -- the
 * session object is trusted because it came from a verified event.
 *
 * Idempotent by design: Stripe retries webhook deliveries, so an
 * already-paid row is a no-op (no duplicate emails). Email failures are
 * logged but never thrown -- the webhook must still 200 to stop retries.
 */
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatAmount,
  renderPaymentAlertEmail,
  renderPaymentConfirmationEmail,
} from "./emails";

export type SendEmailFn = (msg: {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
}) => Promise<{ error: unknown }>;

export async function fulfilWorkshopPayment(opts: {
  session: Stripe.Checkout.Session;
  supabase: SupabaseClient;
  sendEmail: SendEmailFn;
  from: string;
  internalTo: string;
}): Promise<void> {
  const { session, supabase, sendEmail, from, internalTo } = opts;

  const paymentId = session.metadata?.workshop_payment_id;
  if (typeof paymentId !== "string" || paymentId.length === 0) return;

  const { data: row, error } = await supabase
    .from("workshop_payments")
    .select("id, name, email, amount_cents, currency, description, status")
    .eq("id", paymentId)
    .maybeSingle();
  if (error || !row) {
    console.error(
      `[payments/fulfil] no workshop_payments row for id=${paymentId}`,
      error,
    );
    return;
  }
  // Stripe retries deliveries; a paid row means we've already processed this.
  if (row.status === "paid") return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  // Money has been taken even if the link was voided post-checkout-creation,
  // so any non-paid status transitions to paid here.
  const { error: updateError } = await supabase
    .from("workshop_payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: session.id,
    })
    .eq("id", paymentId);
  if (updateError) {
    // Don't email if the DB didn't record the payment -- the Stripe retry
    // will land back here with the row still pending.
    console.error("[payments/fulfil] paid update failed:", updateError);
    return;
  }

  const amount = formatAmount(row.amount_cents, row.currency);

  const confirmation = renderPaymentConfirmationEmail({
    name: row.name,
    description: row.description,
    amount,
  });
  const { error: confirmError } = await sendEmail({
    from,
    to: row.email,
    replyTo: internalTo,
    subject: confirmation.subject,
    html: confirmation.html,
  });
  if (confirmError) {
    console.error("[payments/fulfil] confirmation email failed:", confirmError);
  }

  const alert = renderPaymentAlertEmail({
    name: row.name,
    email: row.email,
    description: row.description,
    amount,
  });
  const { error: alertError } = await sendEmail({
    from,
    to: internalTo,
    replyTo: row.email,
    subject: alert.subject,
    html: alert.html,
  });
  if (alertError) {
    console.error("[payments/fulfil] alert email failed:", alertError);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest lib/payments/__tests__/fulfil.test.ts --watchAll=false`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git branch --show-current   # must be feat/workshop-payment-links
git add lib/payments/fulfil.ts lib/payments/__tests__/fulfil.test.ts
git commit -m "feat: workshop payment fulfilment (webhook logic)"
```

---

### Task 6: Wire fulfilment into the Stripe webhook

**Files:**
- Modify: `app/api/stripe/webhook/route.ts` (imports at ~line 18-22; `checkout.session.completed` case at ~line 55)

**Interfaces:**
- Consumes: `fulfilWorkshopPayment` from `@/lib/payments/fulfil` (Task 5 signature).
- Produces: webhook behaviour — sessions with `metadata.workshop_payment_id` are fulfilled as workshop payments; everything else falls through to the existing subscription logic UNCHANGED.

- [ ] **Step 1: Add imports and a Resend instance**

In `app/api/stripe/webhook/route.ts`, after the existing imports (`getServiceSupabase` import ends ~line 22), add:

```ts
import { Resend } from "resend";
import { fulfilWorkshopPayment } from "@/lib/payments/fulfil";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
```

- [ ] **Step 2: Branch on workshop payments at the top of `checkout.session.completed`**

The case currently starts:

```ts
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
```

Insert the workshop branch between the `session` declaration and the `userId` line, so it reads:

```ts
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Workshop payment links (one-off payment mode) carry their row id in
        // metadata; everything else is the Pro subscription flow below.
        if (session.metadata?.workshop_payment_id) {
          if (!resend) {
            console.error(
              "[stripe/webhook] RESEND_API_KEY not set -- payment will be recorded without emails",
            );
          }
          await fulfilWorkshopPayment({
            session,
            supabase,
            sendEmail: resend
              ? (msg) => resend.emails.send(msg)
              : async () => ({ error: null }),
            from:
              process.env.RESEND_FROM ??
              "Creative Milk <onboarding@resend.dev>",
            internalTo: process.env.RESEND_TO ?? "contact@creative-milk.com.au",
          });
          break;
        }

        const userId = session.metadata?.supabase_user_id;
```

Nothing else in the file changes.

- [ ] **Step 3: Type-check and run the full suite**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx tsc --noEmit && npx jest --watchAll=false`
Expected: tsc clean; all suites PASS (fulfil tests cover the new logic; existing webhook behaviour untouched)

- [ ] **Step 4: Commit**

```bash
git branch --show-current   # must be feat/workshop-payment-links
git add app/api/stripe/webhook/route.ts
git commit -m "feat: handle workshop payments in stripe webhook"
```

---

### Task 7: `POST` + `PATCH /api/admin/payment-links`

**Files:**
- Create: `app/api/admin/payment-links/route.ts`
- Test: `__tests__/api/admin-payment-links.test.ts`

**Interfaces:**
- Consumes: `parseAdminEmails`/`isAdminEmail` (Task 3), `parseDollarsToCents`/`EMAIL_RE`/`UUID_RE` (Task 2), `renderPaymentRequestEmail`/`formatAmount` (Task 4), `getSessionUser` from `@/lib/supabase/auth-server`, `getServiceSupabase` from `@/lib/supabase/server`, `checkRateLimit` from `@/lib/rate-limit`.
- Produces:
  - `POST` body `{ name, email, amount, description }` (amount is a dollars **string**) → `200 { id, url, emailSent }` | `400` | `401` | `500`.
  - `PATCH` body `{ id }` → voids a pending link → `200 { success: true }` | `400` | `401` | `409` (not pending) | `500`.
  - The admin UI (Task 10) calls both.

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/admin-payment-links.test.ts` (mock style follows `__tests__/api/send-email.test.ts`):

```ts
import { NextRequest } from "next/server";

let mockSend: jest.Mock;
jest.mock("resend", () => {
  const sendMock = jest.fn();
  const MockResend = jest.fn().mockImplementation(function (this: any) {
    this.emails = { send: sendMock };
    return this;
  });
  (MockResend as any)._mockSend = sendMock;
  return { Resend: MockResend };
});

const mockGetSessionUser = jest.fn();
jest.mock("@/lib/supabase/auth-server", () => ({
  getSessionUser: () => mockGetSessionUser(),
}));

// Chainable service-client fake. Tests set the resolved values.
const mockSingle = jest.fn();
const mockUpdateResult = jest.fn();
const mockFrom = jest.fn().mockImplementation(() => ({
  insert: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({ single: mockSingle }),
  }),
  update: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({ select: mockUpdateResult }),
    }),
  }),
}));
jest.mock("@/lib/supabase/server", () => ({
  getServiceSupabase: () => ({ from: mockFrom }),
}));

process.env.RESEND_API_KEY = "test-api-key";
process.env.ADMIN_EMAILS = "admin@creative-milk.com.au";

import { POST, PATCH } from "../../app/api/admin/payment-links/route";
import { Resend } from "resend";
import { resetRateLimits } from "../../lib/rate-limit";

mockSend = (Resend as any)._mockSend;

const VALID_UUID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function makeRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    nextUrl: { origin: "http://localhost:3000" },
  } as unknown as NextRequest;
}

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  amount: "450",
  description: "AI Workshop — Fri 7 Aug",
};

describe("POST /api/admin/payment-links", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimits();
    mockGetSessionUser.mockResolvedValue({
      email: "admin@creative-milk.com.au",
    });
    mockSingle.mockResolvedValue({ data: { id: VALID_UUID }, error: null });
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  it("rejects a signed-out caller with 401", async () => {
    mockGetSessionUser.mockResolvedValue(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("rejects a non-admin member with 401", async () => {
    mockGetSessionUser.mockResolvedValue({ email: "member@example.com" });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("rejects an invalid amount with 400", async () => {
    const res = await POST(makeRequest({ ...validBody, amount: "0" }));
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email with 400", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "nope" }));
    expect(res.status).toBe(400);
  });

  it("creates the row and sends the payment-request email", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(VALID_UUID);
    expect(json.url).toContain(`/pay/${VALID_UUID}`);
    expect(json.emailSent).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "jane@example.com" }),
    );
  });

  it("still returns the link when the email send fails", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "nope" } });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.emailSent).toBe(false);
  });
});

describe("PATCH /api/admin/payment-links (void)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimits();
    mockGetSessionUser.mockResolvedValue({
      email: "admin@creative-milk.com.au",
    });
  });

  it("rejects non-admins with 401", async () => {
    mockGetSessionUser.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(401);
  });

  it("rejects a malformed id with 400", async () => {
    const res = await PATCH(makeRequest({ id: "not-a-uuid" }));
    expect(res.status).toBe(400);
  });

  it("voids a pending link", async () => {
    mockUpdateResult.mockResolvedValue({
      data: [{ id: VALID_UUID }],
      error: null,
    });
    const res = await PATCH(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(200);
  });

  it("returns 409 when the link is not pending", async () => {
    mockUpdateResult.mockResolvedValue({ data: [], error: null });
    const res = await PATCH(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(409);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/api/admin-payment-links.test.ts --watchAll=false`
Expected: FAIL — cannot find module `../../app/api/admin/payment-links/route`

- [ ] **Step 3: Write the implementation**

Create `app/api/admin/payment-links/route.ts`:

```ts
/**
 * Admin-only management of workshop payment links.
 *
 * POST  { name, email, amount (dollars string), description }
 *       -> creates a workshop_payments row and emails the invitee their
 *          /pay/<id> link. 200 { id, url, emailSent }.
 * PATCH { id } -> voids a PENDING link (paid rows are immutable). 200|409.
 *
 * Auth: Supabase session cookie proves identity; the ADMIN_EMAILS allowlist
 * decides authorisation. Checked here on every call -- the admin page's own
 * gate is presentation only and is never trusted.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/supabase/auth-server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { isAdminEmail, parseAdminEmails } from "@/lib/payments/admin";
import {
  EMAIL_RE,
  UUID_RE,
  parseDollarsToCents,
} from "@/lib/payments/validate";
import { formatAmount, renderPaymentRequestEmail } from "@/lib/payments/emails";

const SITE_URL = "https://www.creative-milk.com.au";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Same production/preview split as /api/members/checkout.
function baseUrl(req: NextRequest): string {
  const isProduction = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";
  return isProduction ? SITE_URL : req.nextUrl.origin;
}

/** Returns the admin's email, or null when the caller isn't an admin. */
async function requireAdmin(): Promise<string | null> {
  const user = await getSessionUser();
  const allowlist = parseAdminEmails(process.env.ADMIN_EMAILS);
  if (!user?.email || !isAdminEmail(user.email, allowlist)) return null;
  return user.email;
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit("admin-payment-links", req, {
    limit: 30,
    windowMs: 60 * 60_000,
  });
  if (limited) return limited;

  const adminEmail = await requireAdmin();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const amountCents = parseDollarsToCents(
    typeof body.amount === "string" ? body.amount : "",
  );

  if (!name || name.length > 200) {
    return NextResponse.json(
      { error: "Name is required (max 200 characters)." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }
  if (!description || description.length > 500) {
    return NextResponse.json(
      { error: "Description is required (max 500 characters)." },
      { status: 400 },
    );
  }
  if (amountCents === null) {
    return NextResponse.json(
      { error: "Amount must be between $0.01 and $10,000.00." },
      { status: 400 },
    );
  }

  const { data: row, error } = await getServiceSupabase()
    .from("workshop_payments")
    .insert({
      name,
      email,
      amount_cents: amountCents,
      description,
      created_by: adminEmail,
    })
    .select("id")
    .single();
  if (error || !row) {
    console.error("[admin/payment-links] insert failed:", error);
    return NextResponse.json(
      { error: "Couldn't create the payment link. Please try again." },
      { status: 500 },
    );
  }

  const payUrl = `${baseUrl(req)}/pay/${row.id}`;

  let emailSent = false;
  if (resend) {
    const FROM =
      process.env.RESEND_FROM ?? "Creative Milk <onboarding@resend.dev>";
    const TO = process.env.RESEND_TO ?? "contact@creative-milk.com.au";
    const msg = renderPaymentRequestEmail({
      name,
      description,
      amount: formatAmount(amountCents, "aud"),
      payUrl,
    });
    const { error: sendError } = await resend.emails.send({
      from: FROM,
      to: email,
      replyTo: TO,
      subject: msg.subject,
      html: msg.html,
    });
    if (sendError) {
      // The link still exists -- surface emailSent:false so the admin can
      // copy it manually rather than silently believing it was delivered.
      console.error("[admin/payment-links] request email failed:", sendError);
    } else {
      emailSent = true;
    }
  } else {
    console.error("[admin/payment-links] RESEND_API_KEY not configured");
  }

  return NextResponse.json({ id: row.id, url: payUrl, emailSent });
}

export async function PATCH(req: NextRequest) {
  const limited = checkRateLimit("admin-payment-links", req, {
    limit: 30,
    windowMs: 60 * 60_000,
  });
  if (limited) return limited;

  const adminEmail = await requireAdmin();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // pending -> void is the only allowed transition; the .eq status guard
  // makes paid/void rows a no-op (0 rows matched).
  const { data, error } = await getServiceSupabase()
    .from("workshop_payments")
    .update({ status: "void" })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");
  if (error) {
    console.error("[admin/payment-links] void failed:", error);
    return NextResponse.json(
      { error: "Couldn't void the link. Please try again." },
      { status: 500 },
    );
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "Only pending links can be voided." },
      { status: 409 },
    );
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/api/admin-payment-links.test.ts --watchAll=false`
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git branch --show-current   # must be feat/workshop-payment-links
git add app/api/admin/payment-links/route.ts __tests__/api/admin-payment-links.test.ts
git commit -m "feat: admin payment-links API (create + void)"
```

---

### Task 8: `POST /api/pay/checkout`

**Files:**
- Create: `app/api/pay/checkout/route.ts`
- Test: `__tests__/api/pay-checkout.test.ts`

**Interfaces:**
- Consumes: `UUID_RE` (Task 2), `getStripe` from `@/lib/stripe`, `getServiceSupabase`, `checkRateLimit`. Reads `workshop_payments` rows (Task 1 columns).
- Produces: `POST` body `{ id }` → `200 { url }` (Stripe Checkout URL) | `400` | `404` (unknown id) | `409` (not pending) | `500`. The pay page's `PayButton` (Task 9) calls this.

- [ ] **Step 1: Write the failing test**

Create `__tests__/api/pay-checkout.test.ts`:

```ts
import { NextRequest } from "next/server";

const mockCreateSession = jest.fn();
jest.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: { sessions: { create: mockCreateSession } },
  }),
}));

const mockMaybeSingle = jest.fn();
const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
const mockFrom = jest.fn().mockImplementation(() => ({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }),
  }),
  update: jest.fn().mockReturnValue({ eq: mockUpdateEq }),
}));
jest.mock("@/lib/supabase/server", () => ({
  getServiceSupabase: () => ({ from: mockFrom }),
}));

import { POST } from "../../app/api/pay/checkout/route";
import { resetRateLimits } from "../../lib/rate-limit";

const VALID_UUID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const ROW = {
  id: VALID_UUID,
  status: "pending",
  amount_cents: 45000,
  currency: "aud",
  description: "AI Workshop — Fri 7 Aug",
  email: "jane@example.com",
};

function makeRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    nextUrl: { origin: "http://localhost:3000" },
  } as unknown as NextRequest;
}

describe("POST /api/pay/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimits();
    mockMaybeSingle.mockResolvedValue({ data: ROW, error: null });
    mockCreateSession.mockResolvedValue({
      id: "cs_test_1",
      url: "https://checkout.stripe.com/pay/cs_test_1",
    });
  });

  it("rejects a malformed id with 400", async () => {
    const res = await POST(makeRequest({ id: "nope" }));
    expect(res.status).toBe(400);
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown id", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const res = await POST(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(404);
  });

  it("returns 409 when the link is not pending", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { ...ROW, status: "paid" },
      error: null,
    });
    const res = await POST(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(409);
  });

  it("creates a payment-mode checkout session from DB values only", async () => {
    const res = await POST(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe("https://checkout.stripe.com/pay/cs_test_1");
    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        customer_email: "jane@example.com",
        metadata: { workshop_payment_id: VALID_UUID },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "aud",
              unit_amount: 45000,
              product_data: { name: "AI Workshop — Fri 7 Aug" },
            },
          },
        ],
      }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/api/pay-checkout.test.ts --watchAll=false`
Expected: FAIL — cannot find module `../../app/api/pay/checkout/route`

- [ ] **Step 3: Write the implementation**

Create `app/api/pay/checkout/route.ts`:

```ts
/**
 * POST /api/pay/checkout -- body { id }.
 *
 * Starts a Stripe Checkout session for a pending workshop payment link.
 * Input handling: the ONLY client-supplied value is the row's UUID; amount,
 * currency, description and email are all read from the database, so a
 * tampered request can never change what is charged.
 * Response: 200 { url } | 400 | 404 unknown | 409 not pending | 500.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getServiceSupabase } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { UUID_RE } from "@/lib/payments/validate";

const SITE_URL = "https://www.creative-milk.com.au";

// Same production/preview split as /api/members/checkout.
function baseUrl(req: NextRequest): string {
  const isProduction = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";
  return isProduction ? SITE_URL : req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit("pay-checkout", req, {
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data: row, error } = await supabase
    .from("workshop_payments")
    .select("id, status, amount_cents, currency, description, email")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[pay/checkout] lookup failed:", error);
    return NextResponse.json(
      { error: "Checkout unavailable. Please try again later." },
      { status: 500 },
    );
  }
  if (!row) {
    return NextResponse.json(
      { error: "Payment link not found." },
      { status: 404 },
    );
  }
  if (row.status !== "pending") {
    return NextResponse.json(
      { error: "This payment link is no longer active." },
      { status: 409 },
    );
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: row.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: row.currency,
            unit_amount: row.amount_cents,
            product_data: { name: row.description },
          },
        },
      ],
      metadata: { workshop_payment_id: row.id },
      success_url: `${baseUrl(req)}/pay/${row.id}?success=1`,
      cancel_url: `${baseUrl(req)}/pay/${row.id}`,
    });

    // Best-effort audit trail; the webhook re-writes this on completion.
    const { error: updateError } = await supabase
      .from("workshop_payments")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", row.id);
    if (updateError) {
      console.error("[pay/checkout] session id save failed:", updateError);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[pay/checkout] session create failed:", err);
    return NextResponse.json(
      { error: "Checkout unavailable. Please try again later." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/api/pay-checkout.test.ts --watchAll=false`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git branch --show-current   # must be feat/workshop-payment-links
git add app/api/pay/checkout/route.ts __tests__/api/pay-checkout.test.ts
git commit -m "feat: pay checkout API (server-authoritative amount)"
```

---

### Task 9: Public pay page `/pay/[id]`

**Files:**
- Create: `app/(site)/pay/[id]/page.tsx`
- Create: `app/(site)/pay/[id]/PayButton.tsx`

**Interfaces:**
- Consumes: `UUID_RE` (Task 2), `formatAmount` (Task 4), `getServiceSupabase`, `Nav`/`Footer` from `@/app/components/`. `PayButton` posts `{ id }` to `/api/pay/checkout` (Task 8) and redirects to the returned `url`.
- Produces: the page the emailed link opens. States: pending → summary + Pay button; paid or `?success=1` → payment received; void → no longer active; unknown/malformed id → 404.

- [ ] **Step 1: Write the PayButton client component**

Create `app/(site)/pay/[id]/PayButton.tsx`:

```tsx
"use client";

import { useState } from "react";

/**
 * Starts Stripe Checkout for this payment link. Sends ONLY the row id --
 * the server decides the amount. Redirects the whole page to Stripe.
 */
export default function PayButton({ paymentId }: { paymentId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/pay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paymentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again.",
        );
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="cta"
        onClick={startCheckout}
        disabled={busy}
        style={{ minHeight: 44, cursor: busy ? "wait" : "pointer" }}
      >
        {busy ? "Opening secure checkout…" : "Pay now"}
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--liquid-gold)", marginTop: "1rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write the page**

Create `app/(site)/pay/[id]/page.tsx`. It sits outside the layout route groups (same as `ai-readiness`), so it renders its own chrome:

```tsx
/**
 * /pay/[id] -- public payment page for a workshop payment link.
 *
 * The id is an unguessable UUID; the page projects only what a payer needs
 * to see (first name, amount, description, status) and never exposes the
 * full row. noindex: these are private, emailed links.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import { getServiceSupabase } from "@/lib/supabase/server";
import { UUID_RE } from "@/lib/payments/validate";
import { formatAmount } from "@/lib/payments/emails";
import PayButton from "./PayButton";

export const metadata: Metadata = {
  title: "Workshop payment | Creative Milk",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  if (!UUID_RE.test(id)) notFound();

  const { data: row, error } = await getServiceSupabase()
    .from("workshop_payments")
    .select("id, name, amount_cents, currency, description, status")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("[pay] lookup failed:", error);
  if (!row) notFound();

  const firstName = row.name.split(" ")[0] || row.name;
  const amount = formatAmount(row.amount_cents, row.currency);
  // Checkout redirects back with ?success=1 before the webhook lands, so
  // treat that as paid for display purposes.
  const state: "pending" | "paid" | "void" =
    row.status === "paid" || success === "1"
      ? "paid"
      : row.status === "void"
        ? "void"
        : "pending";

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav forceDark />
      <main id="main">
        <section className="section">
          <div className="container">
            <div style={{ maxWidth: 640, marginInline: "auto" }}>
              <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
                Workshop payment
              </p>

              {state === "paid" && (
                <>
                  <h1
                    className="h-display"
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                      marginBottom: "2rem",
                    }}
                  >
                    Payment received
                  </h1>
                  <p style={{ fontSize: "1.125rem", lineHeight: 1.6 }}>
                    Thanks {firstName} — you&rsquo;re all set. A confirmation
                    email is on its way, and Stripe will send your card
                    receipt separately.
                  </p>
                </>
              )}

              {state === "void" && (
                <>
                  <h1
                    className="h-display"
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                      marginBottom: "2rem",
                    }}
                  >
                    This link is no longer active
                  </h1>
                  <p style={{ fontSize: "1.125rem", lineHeight: 1.6 }}>
                    This payment link has been cancelled. If you think
                    that&rsquo;s a mistake, email us at{" "}
                    <a href="mailto:contact@creative-milk.com.au">
                      contact@creative-milk.com.au
                    </a>{" "}
                    and we&rsquo;ll sort it out.
                  </p>
                </>
              )}

              {state === "pending" && (
                <>
                  <h1
                    className="h-display"
                    style={{
                      fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                      marginBottom: "2rem",
                    }}
                  >
                    Hi {firstName}, here&rsquo;s your payment
                  </h1>
                  <dl
                    style={{
                      margin: "0 0 2.5rem",
                      padding: "1.5rem",
                      background: "rgba(245,240,232,0.04)",
                      borderLeft: "2px solid var(--liquid-gold)",
                    }}
                  >
                    <dt
                      className="eyebrow no-rule"
                      style={{ marginBottom: "0.35rem" }}
                    >
                      What you&rsquo;re paying for
                    </dt>
                    <dd
                      style={{ margin: "0 0 1.5rem", fontSize: "1.125rem" }}
                    >
                      {row.description}
                    </dd>
                    <dt
                      className="eyebrow no-rule"
                      style={{ marginBottom: "0.35rem" }}
                    >
                      Amount
                    </dt>
                    <dd style={{ margin: 0, fontSize: "1.5rem" }}>{amount}</dd>
                  </dl>
                  <PayButton paymentId={row.id} />
                  <p
                    style={{
                      marginTop: "1.5rem",
                      fontSize: "0.875rem",
                      opacity: 0.7,
                    }}
                  >
                    Payment is handled securely by Stripe — your card details
                    never touch our servers.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Type-check and build**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx tsc --noEmit && npm run build`
Expected: both clean. (`/pay/[id]` renders dynamically — it must NOT appear in the static prerender list.)

- [ ] **Step 4: Commit**

```bash
git branch --show-current   # must be feat/workshop-payment-links
git add "app/(site)/pay"
git commit -m "feat: public /pay/[id] payment page"
```

---

### Task 10: Admin page `/members/admin/payment-links`

**Files:**
- Create: `app/(site)/(members)/members/admin/payment-links/page.tsx`
- Create: `app/(site)/(members)/members/admin/payment-links/PaymentLinksClient.tsx`

**Interfaces:**
- Consumes: `parseAdminEmails`/`isAdminEmail` (Task 3), `formatAmount` (Task 4), `getSessionUser`, `getServiceSupabase`. The client component calls `POST` and `PATCH /api/admin/payment-links` (Task 7 contracts).
- Produces: the admin UI. Middleware already forces login for `/members/*`; this page additionally 404s non-admins.

- [ ] **Step 1: Write the server page**

Create `app/(site)/(members)/members/admin/payment-links/page.tsx`:

```tsx
/**
 * Admin-only: create and manage workshop payment links.
 * Gate: middleware forces a members login for /members/*; this page then
 * 404s anyone not on the ADMIN_EMAILS allowlist so the page's existence is
 * not advertised. The API route re-checks the same allowlist on every call.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/auth-server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { isAdminEmail, parseAdminEmails } from "@/lib/payments/admin";
import PaymentLinksClient, { type PaymentRow } from "./PaymentLinksClient";

export const metadata: Metadata = {
  title: "Payment links | Creative Milk Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PaymentLinksAdminPage() {
  const user = await getSessionUser();
  const allowlist = parseAdminEmails(process.env.ADMIN_EMAILS);
  if (!isAdminEmail(user?.email, allowlist)) notFound();

  const { data, error } = await getServiceSupabase()
    .from("workshop_payments")
    .select("id, created_at, name, email, amount_cents, currency, description, status")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) console.error("[admin/payment-links] list failed:", error);

  return (
    <section className="section">
      <div className="container">
        <div style={{ maxWidth: 720, marginInline: "auto" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
            Admin
          </p>
          <h1
            className="h-display"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              marginBottom: "2rem",
            }}
          >
            Workshop payment links
          </h1>
          <PaymentLinksClient initialRows={(data ?? []) as PaymentRow[]} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write the client component**

Create `app/(site)/(members)/members/admin/payment-links/PaymentLinksClient.tsx`:

```tsx
"use client";

import { useState } from "react";

export interface PaymentRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  amount_cents: number;
  currency: string;
  description: string;
  status: "pending" | "paid" | "void";
}

function formatAmount(cents: number, currency: string): string {
  return `$${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: "rgba(245,240,232,0.05)",
  border: "1px solid var(--rule)",
  color: "inherit",
  fontSize: "1rem",
  minHeight: 44,
};

export default function PaymentLinksClient({
  initialRows,
}: {
  initialRows: PaymentRow[];
}) {
  const [rows, setRows] = useState<PaymentRow[]>(initialRows);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("AI Workshop");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, amount, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Something went wrong.",
        );
        return;
      }
      setNotice(
        data.emailSent
          ? `Link created and emailed to ${email}.`
          : `Link created, but the EMAIL FAILED — copy it and send manually: ${data.url}`,
      );
      // Optimistic prepend; amount here mirrors what the server stored.
      const cents = Math.round(
        Number(amount.replace(/^\$/, "").replace(/,/g, "")) * 100,
      );
      setRows([
        {
          id: data.id,
          created_at: new Date().toISOString(),
          name,
          email,
          amount_cents: cents,
          currency: "aud",
          description,
          status: "pending",
        },
        ...rows,
      ]);
      setName("");
      setEmail("");
      setAmount("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function voidLink(id: string) {
    setError(null);
    setNotice(null);
    const res = await fetch("/api/admin/payment-links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setRows(rows.map((r) => (r.id === id ? { ...r, status: "void" } : r)));
    } else {
      const data = await res.json();
      setError(
        typeof data.error === "string" ? data.error : "Couldn't void the link.",
      );
    }
  }

  async function copyLink(id: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/pay/${id}`);
    setNotice("Link copied to clipboard.");
  }

  return (
    <>
      <form onSubmit={createLink} style={{ marginBottom: "3rem" }}>
        <div style={{ display: "grid", gap: "1rem" }}>
          <label>
            <span className="eyebrow no-rule">Name</span>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              autoComplete="off"
            />
          </label>
          <label>
            <span className="eyebrow no-rule">Email</span>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={320}
              autoComplete="off"
            />
          </label>
          <label>
            <span className="eyebrow no-rule">Amount (AUD)</span>
            <input
              style={inputStyle}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              inputMode="decimal"
              placeholder="450.00"
            />
          </label>
          <label>
            <span className="eyebrow no-rule">Description</span>
            <input
              style={inputStyle}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={500}
            />
          </label>
        </div>
        <button
          type="submit"
          className="cta"
          disabled={busy}
          style={{ marginTop: "1.5rem", minHeight: 44 }}
        >
          {busy ? "Creating…" : "Create & email link"}
        </button>
        {notice && (
          <p role="status" style={{ color: "var(--liquid-gold)", marginTop: "1rem" }}>
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" style={{ color: "var(--liquid-gold)", marginTop: "1rem" }}>
            {error}
          </p>
        )}
      </form>

      <h2 className="eyebrow" style={{ marginBottom: "1rem" }}>
        Recent links
      </h2>
      {rows.length === 0 && <p>No payment links yet.</p>}
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map((r) => (
          <li
            key={r.id}
            style={{
              padding: "1rem 0",
              borderBottom: "1px solid var(--rule)",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>{r.name}</strong>{" "}
              <span style={{ opacity: 0.7 }}>({r.email})</span>
              <br />
              {formatAmount(r.amount_cents, r.currency)} ·{" "}
              <span
                style={{
                  color:
                    r.status === "paid"
                      ? "var(--liquid-gold)"
                      : r.status === "void"
                        ? "rgba(245,240,232,0.4)"
                        : "inherit",
                }}
              >
                {r.status}
              </span>{" "}
              · {new Date(r.created_at).toLocaleDateString("en-AU")}
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => copyLink(r.id)}
                style={{ minHeight: 44, background: "none", border: "1px solid var(--rule)", color: "inherit", padding: "0 1rem", cursor: "pointer" }}
              >
                Copy link
              </button>
              {r.status === "pending" && (
                <button
                  type="button"
                  onClick={() => voidLink(r.id)}
                  style={{ minHeight: 44, background: "none", border: "1px solid var(--rule)", color: "inherit", padding: "0 1rem", cursor: "pointer" }}
                >
                  Void
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
```

- [ ] **Step 3: Type-check and build**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx tsc --noEmit && npm run build`
Expected: both clean.

- [ ] **Step 4: Commit**

```bash
git branch --show-current   # must be feat/workshop-payment-links
git add "app/(site)/(members)/members/admin"
git commit -m "feat: admin payment-links page"
```

---

### Task 11: Docs, full verification, manual E2E checklist

**Files:**
- Modify: `CLAUDE.md` (Environment Variables section + API routes table)

**Interfaces:**
- Consumes: everything above.
- Produces: documented, verified feature ready for PR.

- [ ] **Step 1: Update CLAUDE.md**

In the API routes table (after the `readiness/result/[id]` row), add:

```markdown
| `admin/payment-links` | Admin-only (ADMIN_EMAILS): create/void workshop payment links + email them |
| `pay/checkout` | Start Stripe Checkout for a payment link (amount read server-side) |
```

In the Environment Variables section, add:

```markdown
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe (server-only)
- `ADMIN_EMAILS` — comma-separated emails allowed to use `/members/admin/payment-links`
```

(Keep the existing lines; only add what's missing.)

- [ ] **Step 2: Full verification**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npm run lint && npx tsc --noEmit && npx jest --watchAll=false && npm run build`
Expected: all clean/green, including the pre-existing scoring suite.

- [ ] **Step 3: Commit**

```bash
git branch --show-current   # must be feat/workshop-payment-links
git add CLAUDE.md
git commit -m "docs: payment links routes + env vars"
```

- [ ] **Step 4: Report the manual steps to Darryn**

These cannot be automated from this repo — list them in the final summary:

1. Run `supabase/migrations/0004_workshop_payments.sql` in the Supabase SQL editor.
2. Add `ADMIN_EMAILS=<your login email>` to `.env.local` and Vercel env vars.
3. Stripe test-mode E2E: `stripe listen --forward-to localhost:3000/api/stripe/webhook` (temporarily point `STRIPE_WEBHOOK_SECRET` at the CLI's whsec), create a link from `/members/admin/payment-links`, open the emailed `/pay/<id>` link, pay with card `4242 4242 4242 4242`, then verify: row status `paid`, confirmation + alert emails arrived, pay page shows "Payment received", void button gone.
4. Confirm the production webhook endpoint in the Stripe dashboard subscribes to `checkout.session.completed` (it already does for the members flow — no change expected).
```
