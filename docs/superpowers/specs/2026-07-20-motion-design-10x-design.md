# Motion & Design 10x — Design Spec

**Date:** 2026-07-20
**Branch:** `feat/design-improvements` (based on `Craig`)
**Status:** Approved for planning

## Goal

Elevate the Creative Milk site's animation and design quality by an order of
magnitude across the landing pages and the members section: scroll-driven
parallax, richer WebGL, and consistent, high-craft motion throughout — without
sacrificing performance, accessibility, or LCP.

## Chosen stack

**GSAP (+ ScrollTrigger, SplitText) + Lenis smooth-scroll + the existing
vanilla WebGL2 shader system.** GSAP is fully free. No Three.js. Approximate
added JS: ~80 kb, lazy-loaded per route.

Rejected alternatives:
- *Framer Motion + WebGL* — weaker scroll choreography/pinning than ScrollTrigger.
- *Zero-dependency CSS scroll-driven animations* — uneven Safari support,
  complex choreography becomes hand-rolled and brittle.

## 1. Motion foundation

- `MotionProvider` client component mounted in the landing-page layout groups:
  initialises Lenis, syncs it to GSAP ScrollTrigger via a single RAF loop.
- **Motion tokens** in `app/globals.css`: shared durations and easings
  (e.g. `--ease-out-expo`, `--dur-reveal`, `--dur-micro`) used by all
  animations, CSS and GSAP alike.
- **Primitives** in `app/components/motion/`:
  - `<Reveal>` — staggered fade/slide-in on scroll (replaces ad-hoc
    IntersectionObserver code in Clients/Work/Process/Services).
  - `<Parallax speed={n}>` — element drifts at a fraction of scroll rate.
  - `<Magnetic>` — CTA buttons lean toward the cursor within a radius.
  - `<SplitTextReveal>` — per-line/word staggered headline rises.
- **Accessibility rules (hard):**
  - `prefers-reduced-motion: reduce` disables Lenis, parallax, pinning, and
    WebGL; everything degrades to the current simple fades or static state.
  - No scroll-hijacking; keyboard and assistive-tech scrolling untouched.
  - Focus states never animated away; 44 px touch targets preserved.
- GSAP plugins registered/lazy-loaded per route group so the members app and
  API-adjacent pages don't pay for landing-page animation JS.

## 2. Homepage

- **Hero:** WebGL shader becomes scroll-reactive (the `u_scroll` uniform
  already exists) — warp intensity and gold-filament bloom build as the user
  scrolls; headline uses `<SplitTextReveal>`; hero copy layers sit at
  different parallax depths over the shader; CTAs become `<Magnetic>`.
- **Marquee:** velocity-reactive — scroll speed skews and accelerates it.
- **Services / Work cards:** scroll-scrubbed image parallax, staggered
  reveals, subtle 3D tilt + gold sheen sweep on hover.
- **Process:** pinned horizontal-scroll timeline — vertical scroll drives the
  steps sliding horizontally. The signature ScrollTrigger moment.
- **Section transitions:** background theme crossfades (midnight ↔ cream)
  driven by scroll position; a gold rule that draws itself in between
  sections.
- **Footer:** parallax reveal — the page lifts to expose the footer beneath.

## 3. WebGL expansion

- Extract the shader runtime from `WebGLBackground.tsx` into `lib/webgl/`
  (context creation, program compilation, RAF + IntersectionObserver
  visibility pause, uniform management, reduced-motion/unsupported fallback).
  New effects should be ~100 lines, not 400.
- **Effect A — gold particle field:** sparse drifting particles with gentle
  mouse repulsion; used behind Contact/CTA sections and the `/tools`
  showcase hero. CSS gradient fallback.
- **Effect B — scroll-reactive hero variants:** the §2 hero upgrades plus a
  per-page hue/intensity variant so inner landing pages get distinct but
  related backgrounds.
- All effects: DPR capped at 2, pause when off-screen, context-loss recovery,
  reduced-motion fallback to static gradient.

## 4. Members section (micro-interactions, not spectacle)

The members area is a product surface — native scroll, no Lenis, no parallax.

- **Dashboard:** staggered card entrance, hover lift + gold sheen; locked
  previews get a shimmer veil that parts on hover.
- **Tools:** animated step transitions; results that perform — count-up
  numbers, an animated score dial for Website Health Check, grow-in bars for
  the audit tools.
- **Auth/upgrade:** focus-state polish, success-state micro-animations.

## 5. Performance & quality budget

- Transforms/opacity only; zero CLS from animations.
- Hero text remains server-rendered; all motion is progressive enhancement —
  LCP unaffected.
- GSAP/Lenis and WebGL components dynamically imported.
- Verified per phase in browser preview: reduced-motion mode, mobile
  viewport, console errors, scroll jank.

## 6. Rollout phases

1. **Foundation** — MotionProvider (Lenis + GSAP), motion tokens, primitives.
2. **Homepage** — hero, marquee, cards, pinned Process, section transitions,
   footer reveal.
3. **Inner landing pages** — services, pricing, process, what-we-build,
   `/for/professional-services`, `/tools` showcase.
4. **Members polish** — dashboard cards, tool result animations, auth.
5. **QA** — performance/a11y audit, reduced-motion sweep, mobile pass.

## Testing

- Jest: unit-test the reduced-motion gating hook and any animation math
  (e.g. parallax offset calculators, score-dial interpolation).
- Browser preview verification per phase (screenshots, console, mobile,
  `prefers-reduced-motion` emulation).
- Existing suites (scoring, send-email, members) must stay green.
