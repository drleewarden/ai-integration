# Google Tag Manager — Implementation Plan

**Container:** `GTM-Z7VVQ67K` · **GA4:** `G-0JX1S9YZ2G` · **Domain:** `creativemilk.ai`

This document covers both the code-side wiring inside this Next.js repo and the container-side configuration that lives inside tagmanager.google.com. The two halves are designed to ship together — code without a container fires events into the void, container without code never receives them.

---

## Part 1 — Code side (this repo)

### Problem

`app/layout.tsx` currently loads three things in `<head>`:

1. `gtag/js?id=G-0JX1S9YZ2G` loader.
2. Inline `google-analytics` script calling `gtag('config', 'G-0JX1S9YZ2G')`.
3. Inline `google-tag-manager` snippet for `GTM-Z7VVQ67K`.

This means GA4 fires twice per page load — once via the standalone `gtag.js`, once via the GA4 Configuration tag the GTM container is supposed to own. The fix is to delete the standalone GA4 loader and configure GA4 inside the GTM container only.

### Step 1 — Strip duplicate GA4 loading from `layout.tsx`

Delete the `gtag/js` loader Script and the inline `google-analytics` Script. Keep the GTM loader (parameterised) and the `<noscript>` iframe (in `<body>`, not `<head>`).

### Step 2 — Dedicated `app/components/Analytics.tsx` Client Component

Moves the GTM loader out of the Server layout, reads `process.env.NEXT_PUBLIC_GTM_ID`, returns `null` when unset so previews and local dev don't ping prod. Uses `strategy="afterInteractive"` — the Next.js-recommended strategy for GTM. `beforeInteractive` is reserved for Consent Mode defaults only.

Supports `NEXT_PUBLIC_GTM_AUTH` + `NEXT_PUBLIC_GTM_PREVIEW` so Vercel Preview deploys can point at the GTM Preview environment without touching Live.

### Step 3 — Env vars

Add to `.env.example` and Vercel:

- `NEXT_PUBLIC_GTM_ID` — production: `GTM-Z7VVQ67K`. Preview/local: leave blank for no-op.
- `NEXT_PUBLIC_GTM_AUTH` / `NEXT_PUBLIC_GTM_PREVIEW` — optional, scoped to Vercel Preview environment, point at the GTM Preview environment snippet.

`NEXT_PUBLIC_*` is inlined at build time. Changes require a redeploy.

### Step 4 — Typed dataLayer helper at `app/lib/gtm.ts`

Exports:

- `pushEvent(name, payload?)` — guards `typeof window !== "undefined"`, ensures `window.dataLayer` exists, pushes `{ event, ...payload }`.
- `EVENTS` — string constants (`CONTACT_FORM_SUBMIT`, `CONTACT_FORM_ERROR`, `CTA_CLICK`) so GTM Custom Event triggers stay stable.
- `grantConsent()` / `denyConsent()` — `gtag('consent', 'update', {...})` helpers for a future banner.
- `Window.dataLayer` type augmentation.

### Step 5 — Consent Mode v2 defaults

Set defaults to `denied` for all storage types **before** GTM loads, using a `beforeInteractive` Script in `layout.tsx`. The default must be on the page before `gtm.js` fires or it is ignored. A future cookie banner calls `grantConsent()` to update.

### Step 6 — Wire the two events that matter

- **`Contact.tsx`** — fire `pushEvent('contact_form_submit', { form_id: 'contact', has_company })` on success. No PII (`name` / `email` / `message` are never in the payload — GA4 ToS). Optional `contact_form_error` on the failure paths with `{ reason: 'api' | 'network' }`.
- **`Hero.tsx`** — fire `pushEvent('cta_click', { cta_label, cta_location: 'hero' })` on the Book-a-call and See-the-work CTAs. Fire-and-forget; do not prevent default.

### Step 7 — Verification

1. `npm run build` clean.
2. GTM Preview connected to prod — exactly one container ID in the Network tab, no standalone `gtag/js` request.
3. GA4 DebugView shows `lead` and `cta_click` events with the expected params and no `email` / `name` keys.
4. Lighthouse re-run: expect TBT improvement.
5. `npm run build` with `NEXT_PUBLIC_GTM_ID` unset — site renders with zero analytics network calls.

---

## Part 2 — Container side (tagmanager.google.com)

The code pushes the dataLayer events; the container is what turns them into GA4 / HubSpot / Klaviyo / LinkedIn / Meta hits. Everything below is built inside `GTM-Z7VVQ67K`.

### Workspaces & Environments

- **Workspaces:** long-lived `Default Workspace` as integration branch; short-lived per-change workspaces (`feat/ga4-migration`, `feat/linkedin-insight`) that resolve back. Avoid permanent per-engineer workspaces — they drift.
- **Environments:** `Live` (prod only), `Staging` (pre-publish smoke tests), `Preview` (Vercel Preview deploys via `NEXT_PUBLIC_GTM_AUTH` + `NEXT_PUBLIC_GTM_PREVIEW`).

### Variables

**Built-ins to enable:** Page URL, Page Path, Page Hostname, Referrer, Click Element, Click URL, Click Text, Click Classes, Click ID, Form ID, Form Classes, Form Element, Scroll Depth Threshold, Percent Visible.

**User-defined:**

- `const_GA4_MEASUREMENT_ID` (Constant) = `G-0JX1S9YZ2G`
- `dlv_form_id`, `dlv_has_company`, `dlv_cta_label`, `dlv_cta_location` (Data Layer Variables, version 2, default `(not set)`)
- `js_consent_analytics` (Custom JS reading `google_tag_data.ics.entries.analytics_storage.default` — debug)
- `cookie_consent_choice` (1st-Party Cookie — placeholder for banner ticket)
- `lookup_environment` (Lookup Table on `{{Page Hostname}}` → `prod` / `preview` / `local`)

### Triggers

- `Trigger - All Pages` — built-in Page View.
- `Trigger - Contact Form Submit` — Custom Event, event name equals `contact_form_submit` (case-sensitive).
- `Trigger - CTA Click` — Custom Event, event name equals `cta_click`.
- `Trigger - Scroll Depth` — 25 / 50 / 75 / 90, All Pages.
- `Trigger - Outbound Link` — Just Links, Click URL does not contain `creativemilk.ai`, Wait For Tags ON.
- `Trigger - Element Visibility - Pricing CTA` — CSS selector for primary pricing CTA, once per page.

### Tags (build order)

1. `GA4 - Config - All Pages` — Google Tag, Measurement ID `{{const_GA4_MEASUREMENT_ID}}`, `send_page_view = true`, trigger All Pages. Replaces the deleted gtag.js loader.
2. `GA4 - Event - lead` — event name `lead` (GA4 recommended event, eligible as Key Event), params `form_id={{dlv_form_id}}`, `has_company={{dlv_has_company}}`, trigger Contact Form Submit.
3. `GA4 - Event - cta_click` — event name `cta_click`, params `cta_label`, `cta_location`, trigger CTA Click.
4. `HubSpot - Tracking - All Pages` — Community Template "HubSpot All-in-One" with Hub ID, All Pages.
5. `Klaviyo - Web Tracking` — Custom HTML wrapping Klaviyo's onsite snippet in a consent check. Prefer Klaviyo's native install; only use GTM if marketing insists on central control.
6. `LinkedIn - Insight Tag` — Community Template, Partner ID TBD, All Pages.
7. `Meta - Pixel - Base` — Community Template, Pixel ID TBD, All Pages.
8. `LinkedIn - Conversion - lead` — Contact Form Submit trigger, LinkedIn conversion ID.
9. `Meta - Lead - lead` — Contact Form Submit trigger, event `Lead`, no PII.

### Consent Mode v2 wiring

Per tag → Consent Settings → "Require additional consent":

- GA4 Config, GA4 Events, HubSpot, Klaviyo → require `analytics_storage`.
- LinkedIn Insight, LinkedIn Conversion, Meta Pixel, Meta Lead → require `ad_storage`, `ad_user_data`, `ad_personalization`.

Built-in Consent Checks stay at "Not set" — the explicit "Require additional consent" check is what blocks the fire until `grantConsent()` runs in code.

### Naming & folders

Folders: `Analytics`, `Ads`, `Marketing Automation`, `Utilities`.

Patterns:

- Tags: `<Platform> - <Type> - <event/purpose>` — e.g. `GA4 - Event - lead`, `LinkedIn - Conversion - lead`.
- Triggers: `Trigger - <Event Name or Description>`.
- Variables: `const_*`, `dlv_*`, `js_*`, `cookie_*`, `lookup_*`.

### Versioning & publishing

Engineers create workspaces and submit a Version (not publish). Matt reviews diff and publishes to **Live**. Version note template: `[scope] what changed | why | verified in Preview env-N | linked PR/ticket`. Unverified work stays in Staging, never Live.

### Access & governance

- **Publish:** Matt only.
- **Approve:** Matt + senior engineer.
- **Edit:** engineers.
- **Read:** marketers, contractors.

2FA mandatory on the Google account owning the container. Rotate container ownership off any personal account to a `gtm@creativemilk.ai` group-owned account.

### Migration order

1. Build all tags/triggers/variables in workspace `feat/ga4-migration`, leave unpublished.
2. Submit Version, request review — do **not** publish yet.
3. Merge code PR (gtag.js loader removed, dataLayer events live) to `main`, deploy to Vercel production.
4. Same deploy window: publish the GTM Version to **Live**.
5. Smoke test on prod (submit contact form, check GA4 Realtime + DebugView for `lead`).
6. GA4 Admin → Events → mark `lead` as a **Key Event / Conversion**.
7. Connect GA4 to LinkedIn / Meta as conversion source after 48h of clean data.

---

## Three silent-killer items

1. **GA4 Configuration tag must use `{{const_GA4_MEASUREMENT_ID}}`** — a hardcoded ID typo orphans every downstream GA4 event and zeroes attribution silently.
2. **Consent Settings on every tag must require the correct storage type** — missing `analytics_storage` on GA4 = Consent Mode v2 / AU Privacy Act exposure; missing `ad_storage` on ad tags = LinkedIn/Meta reject conversions as non-consented and modeled conversions collapse.
3. **Custom Event triggers are case-sensitive** — a typo on `contact_form_submit` means the `lead` conversion never fires while page views look healthy. The funnel data the business actually cares about reads zero. This is the silent killer.

---

## Critical files

- `app/layout.tsx`
- `app/components/Analytics.tsx` (new)
- `app/lib/gtm.ts` (new)
- `app/components/Contact.tsx`
- `app/components/Hero.tsx`
- `.env.example`
- Vercel project env (Production scope: `NEXT_PUBLIC_GTM_ID`; Preview scope: `NEXT_PUBLIC_GTM_AUTH`, `NEXT_PUBLIC_GTM_PREVIEW`)
