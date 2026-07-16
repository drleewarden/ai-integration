# Creative Milk Site — Analysis & Improvement Plan

**Date:** 3 July 2026 · **Scope:** Full codebase review (architecture, API, data, SEO, performance, a11y, tooling)

## Snapshot

The site has outgrown its original design. What CLAUDE.md describes as a "single-page marketing site" is now 20+ pages, 6 API routes, a Supabase-backed AI Readiness assessment with PDF playbook generation, a blog, calculators, and consent-managed analytics. The engineering quality is generally strong — solid input validation, PII-conscious result projection, WebGL fallbacks, per-page metadata — but the growth has left structural debt.

**What's healthy:** minimal dependency surface (only Supabase + react-pdf at runtime), strict TypeScript, semantic HTML with skip links and ARIA, consent-mode-v2-before-GTM, IntersectionObserver-paused WebGL, `.env.local` correctly gitignored (never committed — verified against git history).

---

## Priority 1 — Risk reduction (do first)

### 1.1 Rate-limit the API routes
No rate limiting exists on any of the 6 routes. `/api/send-email`, `/api/workshop-signup`, and `/api/readiness/email-playbook` all trigger Resend sends — a bot can burn email quota, spam your inbox, and pollute Supabase with junk assessments. Body-size guards (4–8KB) are the only protection.

- Add per-IP rate limiting (Upstash Ratelimit on Vercel, or a lightweight in-memory limiter as a stopgap)
- Add a honeypot field + minimum-submit-time check to Contact, Newsletter, and Workshop forms
- Consider Cloudflare Turnstile on the email-playbook route (highest abuse value: free PDF generation + email send per request)

### 1.2 Tighten error responses
API routes return verbose error details to clients. Return generic messages; keep detail in server logs. Add structured logging or Sentry so production failures are actually visible (currently console-only).

### 1.3 Confirm Supabase RLS
All routes use the service-role key (bypasses RLS). Fine server-side, but verify RLS is enabled on `readiness_assessments`, `activities`, contacts/opportunities tables so the public anon key can't read anything if it ever leaks into client code.

---

## Priority 2 — Structural debt (biggest maintenance payoff)

### 2.1 Add `app/(site)/layout.tsx`
Nav and Footer are manually imported in 20+ pages. One shared layout for the `(site)` group removes ~40 imports and guarantees consistency. Half a day, mostly mechanical.

### 2.2 Rebuild the blog content model
Each post is a folder with `data.json` containing **full CSS and HTML as strings** — unmaintainable and copy-pasted 6 times. Replace with:

- One dynamic route: `app/(site)/insights/[slug]/page.tsx` with `generateStaticParams`
- Content as MDX (or markdown + one shared template/stylesheet)
- Shared category/colour maps (currently duplicated between the index and post pages)

This also fixes the sitemap, which hardcodes blog-01 through blog-06 and will silently miss post #7.

### 2.3 Break up the giant page components
Process (855 lines), Services (642), Pricing (508), Nav (472), Contact (396). Extract:

- A shared `<FAQ>` component (near-identical q/a-map pattern exists in services, pricing, and process)
- Page copy/data arrays into sibling `data.ts` files
- Nav into Desktop/Mobile/Dropdown subcomponents

### 2.4 Rewrite CLAUDE.md
It's badly stale — no mention of the `(site)` route group, the AI Readiness feature, Supabase, the 6 API routes, or the test setup. Anyone (human or AI) working from it will make wrong assumptions. Document: routing structure, data layer, the readiness scoring pipeline in `lib/readiness/`, env vars, and the test commands.

---

## Priority 3 — Quality & conversion

### 3.1 Accessibility fixes
- NewsletterForm has zero `<label>` elements; Contact has one for ~5 inputs. Placeholder-only inputs fail WCAG. Add visually-hidden labels at minimum.
- Nav dropdowns are mouse-driven — verify keyboard operability (Tab/Enter/Escape) and add key handlers if missing.
- Add an automated a11y check (jest-axe or Playwright + axe) to catch regressions.

### 3.2 SEO follow-through
- Ship the dynamic OG image for assessment results (existing TODO at `ai-readiness/result/[id]/page.tsx:82`) — these are the pages people share.
- Wire up the FAQ schema already exported from `Schema.tsx` but used nowhere; same for the Service/Pricing schemas on their pages.
- Generate the sitemap from the filesystem/content source instead of a hardcoded 23-route list.

### 3.3 Test coverage
Three test files total. The scoring algorithm is tested (good — it's the crown jewel), but no coverage for: book-call qualification logic, email-playbook generation, form validation paths, or any component. Add API route tests first (cheapest, highest value), then a Playwright smoke test for the assessment funnel — it's the primary lead-gen flow.

### 3.4 Move off Tailwind v4 alpha
`@tailwindcss/postcss@4.0.0-alpha.29` — Tailwind v4 has long since shipped stable. Upgrade to remove the pinned-alpha risk. Test the custom `globals.css` utilities carefully during the bump.

---

## Priority 4 — Nice to have

- **Font loading:** set explicit `display: "swap"` on the three `next/font` families.
- **CI:** no pipeline evident — add lint + test + build on PR (GitHub Actions or Vercel checks).
- **Inline styles:** 144 `style=` instances. CLAUDE.md sanctions inline styles with CSS custom properties, so this is policy-compliant — but repeated patterns (section padding, ink backgrounds) would be cleaner as the utility classes globals.css already defines.
- **Analytics events:** instrument the assessment funnel steps (start → complete → book-call) in GTM so drop-off is measurable.

---

## Suggested sequence

| Phase | Items | Effort |
|-------|-------|--------|
| Week 1 | 1.1 rate limiting + honeypots, 1.2 error hygiene, 1.3 RLS check | 1–2 days |
| Week 2 | 2.1 shared layout, 2.4 CLAUDE.md rewrite | 1 day |
| Week 3–4 | 2.2 blog model, 2.3 component breakup | 3–5 days |
| Ongoing | 3.1–3.4, then Priority 4 | as capacity allows |
