# Creative Milk — Improvement Plan

**Audit date:** 26 May 2026
**Stack reviewed:** Next.js 15.5, React 19.2, Tailwind v4 alpha, vanilla WebGL2, Supabase, Resend
**Focus areas (per brief):** Content for small-to-medium businesses, Performance & SEO, Design & UX polish, Code quality & maintainability

---

## Executive summary

The site is well-designed, type-safe, and has strong narrative bones — the case studies, the `/for/professional-services` vertical, and the published pricing are all credible, peer-to-peer assets that SMB buyers respond to. The two big gaps are:

1. **The homepage doesn't earn the SMB conversion the inner pages are built for.** The hero positions broadly ("AI Solutions for Businesses"), client logos signal enterprise (IAG, AGL, BOM, Myer), and the strongest SMB asset (`/for/professional-services` with the $7,500 pilot) is hidden in the footer. A first-time visitor from a 20-person firm sees an enterprise consultancy and bounces before the SMB-friendly proof appears.
2. **Performance and SEO foundations are leaking value.** Google Fonts are loaded twice (`next/font` and a manual `<link>` in the same `<head>`), analytics runs both gtag and GTM, there is no `sitemap.ts` / `robots.ts` / structured data, the entire hero is a Client Component because of a decorative shader, and there are no security headers.

Both are highly fixable. The Severity 1 list below is roughly two days of focused work; the full plan covers about a fortnight at a sensible pace.

---

## Severity legend

- **S1 — Ship this week.** High impact, low risk, mostly mechanical.
- **S2 — Ship this sprint.** Real lift required; clear ROI.
- **S3 — Plan and schedule.** Larger or strategic; worth doing but not urgent.
- **S4 — Nice to have.** Polish; defer unless capacity allows.

---

## 1. Content & SMB positioning

The brief is to attract small-to-medium businesses. SMB buyers (sub-50 staff, sub-$10M turnover) are skeptical, time-poor, price-conscious, and trust peer evidence over enterprise logos. The current home page is built for an enterprise audience; the SMB-fit assets exist but aren't surfaced.

### S1 — Move the SMB-fit pitch onto the homepage

The `/for/professional-services` page is excellent: it names the buyer ("accounting, legal, consulting, construction"), names the pain ("billable hours leaking into admin"), publishes a $7,500 pilot, offers a no-pay-on-failure guarantee, and addresses privilege and the ATO. None of that is visible on the homepage.

- Add a "Who this is for" section above `Services` with the four named verticals and a 1-line CTA to `/for/professional-services`.
- Add the $7,500 / 30-day pilot offer to the Hero stats strip or as a dedicated band below the Marquee — it's the single strongest SMB unlock-the-budget signal you have.
- Surface the "you don't pay if we miss the outcome" promise on the homepage, not just on the vertical page.

### S1 — Re-frame the client logos for SMB credibility

The Clients section lists IAG, AGL, AIA, Bureau of Meteorology, Myer, Australian Unity — enterprise references. To an SMB buyer this signals "too big / too expensive for us" and contradicts the SMB-pilot pitch underneath.

Two ways to fix it without losing the credibility:

- **Reframe the headline.** Change "Brands We've worked with" to "Senior experience from" or "Teams we've shipped with" — it tells the visitor these are the past careers / project histories of Creative Milk's people, not current Creative Milk clients. (Reads honest if true; reads aspirational if not. Use whichever is accurate.)
- **Add a second tier below.** A row of three to six SMB clients with first names, firm size, and city — even anonymised ("Sydney accounting firm, 14 staff"). This is the row SMB visitors actually scan for.

### S1 — Replace the home-page eyebrow

"AI Solutions for Businesses" is exactly the kind of generic copy the rest of the site is built to push back against. Try one of:

- "AI for Australian SMBs"
- "AI built for 10–50 person firms"
- "AI that pays back in months, not years"

### S2 — Add testimonials with names and faces

The three case studies on Work are anonymised ("Sydney mid-tier firm"). SMB buyers expect named quotes from peers their size. Add at least one quotable testimonial with the person's first name, role, and firm size near the Work section. If permissions are an issue, a short LinkedIn-style quote with first name + initial + role is enough.

### S2 — Add a homepage FAQ band targeting SMB objections

Pull the three best from the pricing page FAQ ("What if it doesn't hit the metric?", "Are we too small?", "Can we start with a smaller engagement?") and put them above Contact. SMB buyers won't navigate to Pricing to find them.

### S2 — Sharpen the Marquee items

"Specific outcomes" and "No buzzwords" are themselves buzzwords. Replace with concrete artefacts:

- "BAS prep in a long lunch"
- "Onboarding in under a day"
- "8–15% billable recovery"
- "$7,500 fixed pilot"
- "Pay only if it ships"
- "Built to your stack"

### S2 — Qualify earlier in the contact form

The contact form is short (name / email / company / message). For SMB qualification, add an optional "How many people in your team?" field and an optional "What's the workflow that's costing you the most time?" prompt below the textarea (as helper text, not a new field). Both shorten the discovery call and improve lead quality.

### S2 — Stand the stats up with a footnote

"50+ engagements · 95% outcome rate · $2M+ revenue lifted · 6–8 weeks to ship" is strong but unverified — a thoughtful SMB buyer reads "95% outcome rate" and assumes marketing. Add a one-line footnote under the strip: "Defined as engagements that hit the success metric agreed in Phase 1, FY24–FY26."

### S3 — Build a comparison band

SMB buyers compare AI consultancies to (a) hiring another staff member, (b) buying off-the-shelf SaaS, and (c) doing nothing. A small "vs hiring / vs SaaS / vs DIY" comparison reframes the $7,500 pilot as cheaper and faster than the alternatives they're really weighing.

### S3 — Add insights linking to the homepage

The `/insights` blog has six posts including "Why AI fails", "AI costs and returns", "AI for accounting firms" — all SMB-targeted. None of them are linked from the homepage. A "Recent thinking" three-card band above the footer would lift session depth and SEO.

### S4 — Fix small copy issues

- Footer: "Brands We've worked with." — drop the capital W mid-sentence.
- Hero stats: "Revenue lifted" reads ambiguous; "Client revenue uplift" is clearer.
- Contact promises list uses arrows "→" — fine for one or two but feels CLI-ish at three. Mix in a checkmark or remove the arrows.

---

## 2. Performance & SEO

### S1 — Stop loading Google Fonts twice

`app/layout.tsx` uses `next/font/google` for Cormorant Garamond, Syne, and DM Mono (which self-hosts and is the right approach), **and** ships a manual `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` for the same three families. The manual link is dead weight and is render-blocking from a third-party origin — it's almost certainly your worst LCP contributor.

**Fix:** Delete the `<link rel="preconnect">` and `<link rel="stylesheet">` font tags from `layout.tsx`. Keep only the `next/font` calls. The `next/font/google` import already handles preconnect, preload, and CSS injection.

### S1 — Pick one analytics, not both

Layout runs both Google Analytics (`gtag` directly) and Google Tag Manager. GTM should fire GA — running both means double-counting and double the JS payload.

**Fix:** Keep GTM, configure GA inside the GTM container, and delete the standalone `gtag` script block.

### S1 — Add `sitemap.ts` and `robots.ts`

Neither exists. For an Australia-targeted site competing on local search terms ("AI consulting Melbourne", "AI for accounting firms Australia"), this is the cheapest SEO fix available.

**Fix:** Add `app/sitemap.ts` enumerating the home, vertical, pricing, services, process, about, work, clients, ai-readiness, and all six insights routes. Add `app/robots.ts` referencing the sitemap.

### S1 — Reconcile the canonical domain

`layout.tsx` uses `metadataBase: new URL("https://creativemilk.ai")`. `app/(site)/ai-readiness/page.tsx` uses `https://www.creative-milk.com.au` in OG/canonical. Pick one and apply it everywhere — having two canonical domains splits SEO and breaks OG previews.

### S1 — Add per-page canonical URLs

Only the AI Readiness page sets `alternates.canonical`. Pricing, Services, What We Build, About, Process, Clients, Work, Contact, and the Professional Services vertical all need `alternates.canonical` set. This protects against duplicate-content penalties from utm-tagged inbound links.

### S2 — Add JSON-LD structured data

Three high-value schemas to add:

- **Organization** in `layout.tsx` (name, URL, sameAs links, logo) — eligible for the Knowledge Graph panel on brand searches.
- **Service** on each services / what-we-build / vertical page — eligible for service rich results.
- **FAQPage** on the Pricing page (already has six FAQs in structured form — trivial to mark up) — high CTR lift in search.

### S2 — Stop making the hero a Client Component

`app/components/Hero.tsx` is `"use client"` solely because it renders `WebGLBackground`. The hero text, stats, and CTAs are static and could render server-side. Right now your LCP candidate (the H1) is part of a client bundle.

**Fix:** Make `Hero` a Server Component. Move the `"use client"` boundary down to a small `WebGLBackground` wrapper that the server component renders. Same visual, smaller client JS, better LCP.

### S2 — Defer the WebGL shader off the critical path

The WebGL canvas mounts as soon as the hero mounts and immediately runs a 5-octave domain-warped FBM at up to 1.75× DPR full-screen. On mid-range mobile this hurts INP and TBT.

Options, in order of preference:
- Mount the canvas behind a `requestIdleCallback` / dynamic import so the static fallback paints first.
- Drop the inner DPR cap from 1.75 to 1.25 on devices reporting `navigator.connection?.saveData` or `effectiveType === '3g'`.
- Lower the FBM iteration count from 5 to 4 — the visual difference is imperceptible at this contrast range.
- Reduce the inner shader frequency multipliers from `2.0` to `1.6` — same look, fewer texture-fetch-equivalent ops.

### S2 — Add an Open Graph image

`metadataBase` is set, the OG titles and descriptions are set, but there is no actual OG image. Social shares get fallback Slack/LinkedIn previews. Generate one `opengraph-image.tsx` or static `opengraph-image.png` at root and per major page.

### S3 — Set security and caching headers

`next.config.ts` is empty. Add a `headers()` function for:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- A starter `Content-Security-Policy` allowing self + Google Tag Manager + fonts.googleapis.com / fonts.gstatic.com (you'll iterate this in dev).

### S3 — Audit unused JS

You're importing `lucide-react` icons in many components. Lucide tree-shakes by named import, which you're doing — good — but spot-check the production bundle via `next build && next start` and the Network tab. The current `package.json` also pulls `whatwg-fetch` as a devDependency, which is jsdom polyfill territory; verify it isn't leaking into production.

### S4 — Tighten the page title format

Current pattern is `Creative Milk -- Intelligence that actually works`. Google sometimes rewrites titles with double-dashes. Standard convention is pipe-separated: `Intelligence that actually works | Creative Milk`. Cosmetic, but the convention is the convention.

---

## 3. Design & UX

### S1 — Fix the hero stats grid on narrow screens

`Hero.tsx` line 110 hard-codes `gridTemplateColumns: "repeat(4, minmax(0, 1fr))"`. On a 360px viewport, four columns become four cramped slivers with the labels wrapping awkwardly.

**Fix:** Drop to two columns below 640px:
```tsx
gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))"
```
Or use a media query that flips to 2×2 below `--bp-sm`.

### S1 — The "Discuss this →" service-card arrow is a dead link

In `Services.tsx`, each service card ends with `<span className="svc-arrow">Discuss this <ArrowRight /></span>`. It looks like a link, animates like a link on hover, but it isn't a link. Either:

- Make it a real `<a href="/#contact">` (or `/for/professional-services` for the right card), or
- Drop the arrow entirely and make the card's hover state purely a colour shift, not an affordance.

### S1 — The newsletter form does nothing

`NewsletterForm.tsx` accepts an email, sets `submitted=true`, and shows a thank-you message — but never posts anywhere. If it's surfaced anywhere user-visible, you're collecting consent without delivering on it. Either wire it to Resend / Klaviyo or remove the component until it's real.

### S2 — Add a focus trap to the mobile nav

`Nav.tsx` opens a full-screen overlay but doesn't trap focus inside it. A keyboard user can tab past the close button and into the page behind. Add `inert` to the page content while the menu is open, or use a focus-trap utility.

### S2 — Add rate-limiting / honeypot on the contact form

`/api/send-email` has no rate limiting, no honeypot, no CAPTCHA. The form is a public POST that triggers an outbound email. Bots will find it. Lowest-friction fix:

- Add an invisible honeypot field (`<input name="website" tabIndex={-1} aria-hidden style={{display:'none'}} />`) — reject if filled.
- Add a `lastSubmitAt` cookie or Upstash Redis token-bucket — one submission per minute per IP.

### S2 — Surface message length on the contact textarea

The server enforces a 5,000-character cap, but the UI doesn't show it. Add a small character counter below the textarea ("0 / 5,000").

### S2 — Visible "Currently taking N projects this quarter" cue

Pricing page mentions limited capacity. SMB buyers respond to scarcity framing. Add a small "Currently taking 2 projects for Q3 2026" indicator on the contact section.

### S3 — Reduce the nav from 8 items

The desktop nav has eight links (What We Build, AI Readiness, Work, Clients, Process, Pricing, Insights, About) plus a Book a call CTA. That's a lot for SMB visitors and dilutes the funnel. Consider folding "Clients" into "Work", folding "Process" into "What We Build", and putting "About" + "Insights" behind a "More" disclosure.

### S3 — Section-aware theme colour

`viewport.themeColor` is fixed to `#0F1526` (midnight). The site alternates dark and light sections; on mobile browsers like iOS Safari, the chrome stays midnight against off-white sections. Consider switching to a per-section approach, or removing the override so the browser picks based on `prefers-color-scheme`.

### S4 — Replace inline hover handlers in Nav

`Nav.tsx` uses `onMouseEnter` / `onMouseLeave` to swap colour. CSS `:hover` would be smaller, more accessible (works without JS), and consistent with the rest of the codebase.

### S4 — BackToTop only renders on mobile (`className="show-md"`)

This may be deliberate (desktop has good scroll-to-anchor coverage) — worth verifying. If it's accidental, the button should show on desktop too past 400px scroll.

---

## 4. Code quality & maintainability

### S1 — Decide between Tailwind and inline styles

Tailwind v4 alpha is installed and imported in `globals.css`, but components hardly use it — they're built almost entirely with inline `style={}` objects. The result is verbose components, harder-to-find design tokens, and no responsive variants without writing media queries by hand. Pick one:

- **Stay with inline styles** (which suit the heavily themed visual style) and remove the Tailwind dependency, postcss config, and import.
- **Move to Tailwind utility classes** (which would dramatically shrink components like `Contact.tsx`, where ~50% of lines are inline `style`).

Either choice is fine, but the current dual setup is the worst of both worlds: bundle cost without payoff.

### S1 — Update `next.config.ts`

It's a stub. At minimum add:

- `headers()` for the security headers listed above.
- `images.remotePatterns` if you start serving images from Supabase / a CDN.
- `experimental.optimizePackageImports: ['lucide-react']` to make lucide tree-shake more aggressively in dev.

### S2 — The CLAUDE.md is stale

`CLAUDE.md` describes "a single-page layout" with components composed in `app/page.tsx`. The actual project is a multi-page App Router site with routes for `(site)/pricing`, `(site)/insights/blog-*`, `(site)/ai-readiness`, `for/professional-services`, plus Supabase persistence and a real assessment flow. Update CLAUDE.md so future agents start from accurate context — and add the SMB positioning rules from this audit to it.

### S2 — Extract repeated section styling into reusable primitives

There are at least five places that render essentially the same `<div>` pattern: eyebrow → h-section heading → body-copy paragraph in a 1.2fr / 1fr grid (Services, Process, Work, Clients, Professional Services). Extract a `<SectionHeader eyebrow title body />` component. Saves ~30 lines per section and makes future copy changes one-touch.

### S2 — Move the email HTML template into a `react-email` component

`@react-email/components` is already in `devDependencies` but not used. The contact-form email is built by hand-concatenating HTML strings — fragile, hard to preview, and an XSS surface (you're already escaping, but `react-email` handles this structurally).

### S2 — Add tests for the contact form and the API route

`__tests__/` exists with Jest configured but the contact form's validation logic and the API's body-validation logic are both untested. Two small tests:

- Form rejects invalid email client-side.
- API returns 400 on missing fields, 413 on body too large, 200 on happy path (with Resend mocked).

### S3 — Split the WebGL shader into its own module

`WebGLBackground.tsx` is 334 lines, half of which is the GLSL source as a tagged string. Extract the shader source into `app/components/webgl/fragment.glsl.ts` (just the export) so the component focuses on the lifecycle and not the shader code. Makes the shader independently swappable.

### S3 — Move static config (clients, case studies, services, marquee items) into `content/`

`content/` exists at the project root. Right now case-study data lives inline in `Work.tsx`, clients in `Clients.tsx`, services in `Services.tsx`, marquee items in `Marquee.tsx`. Moving them into `content/work.ts`, `content/clients.ts` etc. makes content updates trivial without touching component code — important if a non-engineer ever needs to add a case study.

### S3 — `eslint.config.mjs` disables a rule that's currently catching a real bug

`@next/next/no-page-custom-font` is set to `off` because of the deliberate `<link>` font load. Once the manual font tag is removed (S1 above), turn this rule back on — it's exactly the rule that would have caught the duplicate font load.

### S4 — Hardcoded fallback email is a personal Gmail

`/api/send-email` defaults `RESEND_TO` to `drleewarden@gmail.com`. Fine as a dev fallback, but worth swapping for a Creative Milk address (or making the fallback a hard 503) so an env misconfiguration in prod doesn't deliver client enquiries to a personal inbox.

---

## Sequenced action plan

If you ship the S1 list first (roughly 1.5–2 days):

1. Remove duplicate Google Fonts `<link>` from `layout.tsx`.
2. Consolidate analytics to GTM-only.
3. Add `app/sitemap.ts` and `app/robots.ts`.
4. Reconcile the canonical domain (creativemilk.ai vs creative-milk.com.au).
5. Add `alternates.canonical` to every page's metadata.
6. Add the "Who this is for" band and the `$7,500 pilot` callout to the homepage above Services.
7. Reframe the client logos section ("Senior experience from" + add an SMB-tier row).
8. Replace the home-page eyebrow with an SMB-specific line.
9. Fix the hero stats grid for narrow viewports.
10. Make the service-card arrow either a real link or remove it.
11. Either wire up the newsletter form or remove it.
12. Strip the empty `next.config.ts` stub — add headers and image config.

Then in the following sprint (S2):

13. Add JSON-LD Organization / Service / FAQPage.
14. Move the hero off `"use client"` boundary.
15. Defer the shader, drop one octave and the DPR cap on slow connections.
16. Add an OG image.
17. Add a homepage FAQ band.
18. Sharpen the Marquee items.
19. Add the qualification fields to the contact form.
20. Footnote the stats.
21. Add focus trap + honeypot to nav and contact form.
22. Add named testimonials.
23. Decide Tailwind vs inline-styles and converge.
24. Extract the section-header primitive.
25. Move email render to `react-email`.
26. Add tests for the form and the API.
27. Update CLAUDE.md.

S3 / S4 work then becomes the backlog and can run alongside feature work.

---

## What I'd do first if you only had four hours

1. Remove the duplicate `<link>` font load (15 mins, biggest single perf win).
2. Add sitemap + robots (30 mins).
3. Reconcile the canonical domain (30 mins).
4. Add the "Who this is for" band linking to `/for/professional-services` and surface the `$7,500 pilot` (90 mins).
5. Reframe the client logos headline (10 mins).
6. Fix the hero stats grid for narrow screens (30 mins).
7. Make the service-card arrow a real link or remove it (15 mins).

That's most of the SMB conversion lift and most of the Lighthouse lift, in an afternoon.
