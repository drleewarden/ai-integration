# Business Audit Tools — Design

**Date:** 2026-07-19
**Status:** Approved direction, pending spec review
**Goal:** Grow free member signups ("signup bait") with four self-audit tools that quantify a
business pain in dollars, plus a public showcase page that advertises them. The audits live
behind the free login wall; the public page sells the click-through to signup.

## Background

- Members-area content is registry-driven: one file per item in `content/members/<slug>.ts`,
  imported into `lib/members/items.ts`. Tools are client components registered in
  `TOOL_COMPONENTS` (`app/components/members/tools/index.ts`) and keyed by
  `TOOL_COMPONENT_KEYS` in the registry.
- Existing tools (RoiQuickCheck, OpportunityFinder, …) are lightweight client components:
  sliders/selects in, instant verdict out. Pure scoring logic lives in `lib/members/tools/`
  with Jest tests in `lib/members/tools/__tests__/`.
- Gating decision (user): audit **titles/descriptions are public; running an audit requires a
  free account**. No result-gating in v1.
- Idea source: the diagnostic → findings → remediation-roadmap pattern. Every audit ends with
  a quantified finding plus a link to the guide that fixes it.

## Architecture

One config-driven engine component, four audit configs, four thin registry entries, one
public page.

```
lib/members/tools/audits/
  types.ts                 # AuditConfig / AuditQuestion / AuditResult
  lead-leak.ts             # config + pure score() per audit
  review-health.ts
  getting-paid.ts
  quote-turnaround.ts
  __tests__/               # Jest tests for each score()
app/components/members/tools/
  AuditTool.tsx            # generic engine (client component)
  index.ts                 # + four wrapper entries in TOOL_COMPONENTS
content/members/
  lead-leak-audit.ts       # registry items (type: "tool", tier: "free")
  review-health-check.ts
  getting-paid-audit.ts
  quote-turnaround-audit.ts
app/(site)/(main)/tools/page.tsx   # public showcase page
```

### Audit engine (`AuditTool.tsx`)

Client component taking an `AuditConfig` prop. Renders the question list (range sliders and
select pills, ≥44px touch targets, labelled inputs — same conventions as `RoiQuickCheck`),
recomputes the result on every change (no submit button), and renders:

1. **Headline finding** — a formatted number with a short label, e.g.
   "≈ $3,400/month leaking".
2. **Verdict copy** — one of three bands (`low` / `medium` / `high`).
3. **Remediation block** — 1–2 sentences plus a link to the fixing members item. When the
   target is a Pro item, the block says so (the link goes to the item page, which already
   renders `LockedPreview` + upgrade CTA for free members).
4. **Assumptions fine print** — the model's constants stated in one small-print sentence, so
   the number is credible ("assumes a 25% win rate on answered enquiries…").

### Config type (`types.ts`)

```ts
export interface AuditQuestion {
  id: string;
  label: string;
  kind: "slider" | "select";
  // slider
  min?: number; max?: number; step?: number; prefix?: string; // "$"
  defaultValue: number;                  // select: index into options
  options?: string[];                    // select only
}

export interface AuditResult {
  headlineValue: string;   // pre-formatted, e.g. "$3,400"
  headlineLabel: string;   // "potential revenue leaking per month"
  band: "low" | "medium" | "high";
  verdict: string;
  assumptions: string;
}

export interface AuditConfig {
  slug: string;
  intro: string;
  questions: AuditQuestion[];
  score(answers: Record<string, number>): AuditResult;
  remediation: { copy: string; slug: string; isPro: boolean };
}
```

Answers are `Record<questionId, number>` (slider value, or option index for selects).
`score()` is pure — no React, no I/O — so it is directly unit-testable.

## The four audits

Model constants are heuristics, declared once per config and surfaced in the assumptions
line. Exact copy may be tuned during implementation; the shapes below are the contract.

### 1. Lead Leak Audit — `lead-leak-audit`

Inputs: enquiries/week (slider 1–50), typical response time (select: under an hour / same
day / next day / two-plus days), after-hours handling (select: answered or same-day
callback / next business day / often missed), follow-up habit (select: none / one / two or
more), average job value (slider $100–$10,000).

Model: base leak rate by response time (5% / 15% / 30% / 45%), plus after-hours penalty
(0 / +5pp / +15pp), minus follow-up credit (−0 / −10pp / −20pp), floored at 2%. Leaked
enquiries/month = enquiries × 4.3 × rate. Headline $ = leaked × job value × 25% assumed
win rate. Bands: < $1k low, $1k–$5k medium, > $5k high.
Remediation: **Never Lose a Lead: Follow-Up Automation Starter** (`lead-follow-up-starter`, free).

### 2. Review & Reputation Health Check — `review-health-check`

Inputs: Google review count (slider 0–300), most recent review (select: this week / this
month / three-plus months / can't remember), average rating (slider 3.0–5.0, step 0.1),
owner response rate (select: all / some / never), asking habit (select: every job /
sometimes / never).

Model: weighted score out of 100 — count 0–25 (log-ish scale, 25 at ≥100), recency 0–20,
rating 0–25 (linear 3.0→5.0), response rate 0–15, asking habit 0–15. Bands: ≥80 low
(strong), 55–79 medium, <55 high (losing work). Headline is the score itself.
Remediation: **The Review Request Machine** (`review-request-machine`, **Pro**).

### 3. Getting-Paid Audit — `getting-paid-audit`

Inputs: invoices/month (slider 1–100), average invoice value (slider $100–$20,000), when
you invoice (select: same day / within the week / when I get to it), share of invoices
that go overdue (slider 0–80%), reminder habit (select: automated / manual when I
remember / never).

Model: cash locked up = invoices × value × overdue% × collection-drag multiplier
(automated 0.5 / manual 1.0 / never 1.5), plus invoicing-delay factor (same day 1.0 /
week 1.15 / when-I-get-to-it 1.35). Bands: < $2k low, $2k–$10k medium, > $10k high.
Remediation: **The Polite Invoice Reminder Sequence** (`invoice-reminder-sequence`, free).

### 4. Quote Turnaround Audit — `quote-turnaround-audit`

Inputs: quotes/month (slider 1–50), average quote value (slider $200–$50,000), typical
turnaround (select: same day / two-three days / a week or more), current win rate
(slider 10–90%).

Model: relative win-rate decay by turnaround (0% / 15% / 35%). Lost revenue/month =
quotes × value × current win rate × decay ÷ (1 − decay), i.e. the uplift available by
quoting same-day. Bands: < $2k low, $2k–$8k medium, > $8k high.
Remediation: **The Small Business Automation Playbook** (`automation-playbook`, **Pro**).

## Registry entries

Four `content/members/<slug>.ts` files, `type: "tool"`, `tier: "free"`, `dateAdded`
set on the day they merge. Four new keys appended to `TOOL_COMPONENT_KEYS` and
`TOOL_COMPONENTS` (thin wrappers: `() => <AuditTool config={leadLeakConfig} />`).
They appear in the members library automatically (free grid, above Pro).

## Public showcase page — `/tools`

`app/(site)/(main)/tools/page.tsx` (server component, standard `(main)` chrome).

- **Content:** eyebrow "Free tools", display heading ("Find out what your business is
  leaking"), one-line pitch, then the four audit cards. Cards reuse the `.member-card`
  CSS treatment; title/description come from the items registry (single source of truth).
  Card footer reads "Sign up free to run it →" and links to
  `/signup?next=/members/<slug>` — after account creation the member lands inside the
  audit they clicked (the `next` param already threads through `AuthForm` and
  `/auth/callback`).
- Below the grid: one line linking to the wider free library ("Plus guides, templates and
  more in the free members library") pointing at `/signup`.
- **SEO:** indexable (unlike `/members`). Added to `app/sitemap.ts` (priority 0.8,
  monthly) and to the Resources dropdown in `Nav.tsx` as "Free business audits".
- **Analytics:** one GTM event via the existing `pushEvent`/`EVENTS` helper —
  `audit_card_click` with the audit slug. The showcase card is a small client component
  (`PublicAuditCard`) that renders the `.member-card` markup and fires the event in the
  link's `onClick`; the page itself stays a server component.

## Error handling

None beyond the type system: no network calls, no persistence, no user-entered free text.
Sliders/selects constrain the input domain, so `score()` is total over its inputs.

## Testing

One Jest suite per audit in `lib/members/tools/audits/__tests__/`, following the existing
tool-test conventions:

- Band boundaries: answers engineered to land just inside each band.
- Monotonicity: worsening one answer (slower response, fewer follow-ups) never improves
  the result.
- Defaults: the default answer set produces a sensible mid-band result (guards against
  config drift making the tool open on a scary or trivial number).

## Out of scope (v1)

- Result persistence, emailed roadmap/PDF, per-member audit history.
- Result-gating (audit public, roadmap behind signup) — revisit if title-gating converts
  poorly; the engine design doesn't preclude it.
- A combined "10-minute business check-up" umbrella audit.

## Rollout

Single PR on `feature/members-tools` (or a follow-up branch): engine + four configs +
tests + registry entries + `/tools` page + nav/sitemap. Verify in the browser: public
page renders logged-out, card click → signup → lands in the clicked audit, all four
audits interactive, remediation links resolve, Pro remediations show the locked preview.
