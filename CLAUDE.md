# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 (App Router, TypeScript) marketing and lead-generation site for Creative Milk, an AI consulting business. What began as a single-page site is now a 20+ page application with a Supabase-backed AI Readiness assessment, an opportunity-cost calculator, a blog, transactional email via Resend, and PDF playbook generation.

## Development Commands

```bash
npm run dev          # Dev server on http://localhost:3000
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint
npm test             # Jest (watch mode: npm run test:watch)
```

Node 22.x required (`.nvmrc`, `package.json` engines).

## Architecture

### Routing

- `app/page.tsx` — homepage, composes section components from `app/components/`
- `app/(site)/(main)/` — standard pages (about, clients, contact, insights index, pricing, process, services, what-we-build, work). **Shared chrome (skip link, Nav, `<main>`, Footer) lives in `app/(site)/(main)/layout.tsx` — pages render sections only.**
- `app/(site)/(dark-nav)/` — same chrome but `<Nav forceDark />` (solid nav from the top): blog posts (`insights/[slug]`), events/workshop
- `app/(site)/ai-readiness/` and `app/(site)/opportunity-cost/` — manage their own Nav/Footer inside client components (multi-step flows); intentionally outside the layout groups
- `app/for/professional-services` — industry vertical landing page
- `app/pricingdata` — hidden machine-readable pricing page (not in sitemap)
- `app/sitemap.ts`, `app/robots.ts` — sitemap derives blog URLs from the insights registry

### Insights (blog)

- Content: one JSON file per post in `content/insights/<slug>.json` (metadata + pre-rendered article HTML)
- Registry: `lib/insights/posts.ts` — imports all post JSONs and exports `posts`, `postBySlug`, `displayTitle`. **Adding a post: add the JSON file, import it in the registry, done.** The `[slug]` route, `/insights` index cards, and sitemap all derive from the registry.
- Route: `app/(site)/(dark-nav)/insights/[slug]/page.tsx` (static via `generateStaticParams`; shared article stylesheet `post.css` alongside it)

### AI Readiness assessment (primary lead-gen flow)

- Scoring pipeline in `lib/readiness/`: `questions.ts` (15 questions) → `scoring.ts` (server-side scoring; never trust client scores) → `pillars.ts` / `bands.ts` / `content-library.ts` (recommendation copy) → `composer.ts` + `playbook-pdf.tsx` (PDF via @react-pdf/renderer)
- Data: Supabase Postgres (`readiness_assessments`, `activities`, `contacts`, opportunities). Server client in `lib/supabase/server.ts` uses the **service-role key — server-side only, never import in client components.**
- Result pages are noindex and the result API deliberately projects only non-PII fields.

### API routes (`app/api/`)

| Route | Purpose |
|---|---|
| `send-email` | Contact form → Resend |
| `workshop-signup` | Workshop registration → Resend |
| `readiness/submit` | Score + persist assessment |
| `readiness/book-call` | Qualification form → contact/opportunity upsert |
| `readiness/email-playbook` | Generate PDF playbook + email it |
| `readiness/result/[id]` | Fetch sanitised result (CDN-cached 1h) |

Conventions all routes follow:
- **Rate limiting** via `lib/rate-limit.ts` (`checkRateLimit(name, req, {limit, windowMs})`) — in-memory per-instance; swap store for Upstash if abuse becomes real
- **Honeypot**: public forms send a hidden `website` field + `formStartedAt`; routes call `isLikelyBot()` and return a success-shaped response without side effects
- Body-size guards, strict validation (UUID/email regex, enums), generic client-facing error messages (detail goes to `console.error` only)

### Styling

Tailwind CSS v4 (alpha) + design system in `app/globals.css` (CSS custom properties: `--midnight-ink`, `--liquid-gold`, `--warm-cream`; utilities: `.eyebrow`, `.h-display`, `.cta`, `.section`). Components prefer inline styles using CSS custom properties. Fonts via next/font: Cormorant Garamond (display), Syne (sans), DM Mono.

Long marketing pages keep copy/data arrays in a sibling `data.ts` (see services/pricing/process). Shared FAQ section: `app/components/FAQ.tsx` (also emits FAQPage JSON-LD).

### Email & analytics

- Resend for all outbound email; HTML templates inline in the route files
- GTM with Consent Mode v2 (defaults denied before GTM loads); `ConsentBanner.tsx` + `app/lib/gtm.ts` (`pushEvent`, `EVENTS`)
- Structured data in `app/components/Schema.tsx` (Organisation/Website in root layout; Pricing/Service/Breadcrumb used per page)

### WebGL background

`WebGLBackground.tsx`: vanilla WebGL2 domain-warped FBM shader (no Three.js). Falls back to CSS gradient for reduced-motion/unsupported browsers; pauses off-screen via IntersectionObserver.

## Environment Variables

- `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO` — email
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — database (service key is server-only)

`.env.local` is gitignored; never commit keys.

## Testing

Jest + React Testing Library. Existing suites: `lib/readiness/__tests__/scoring.test.ts` (scoring algorithm — keep green, it's the crown jewel), `__tests__/api/send-email.test.ts`, `__tests__/utils/email-utils.test.ts`. Coverage is thin — add tests when touching API routes or scoring.

## Code Patterns

- Path alias `@/*` → project root; prefer it over deep relative imports
- Server Components by default; `"use client"` only for forms, nav, WebGL, calculators
- Accessibility: semantic landmarks, skip link (in the layout groups), ARIA on nav/forms, `prefers-reduced-motion` respected, 44px touch targets
- Deployed on Vercel; Australian English in all copy
