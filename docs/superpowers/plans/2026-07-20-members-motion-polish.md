# Members-Section Motion Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add high-craft micro-interactions to the members section — staggered card entrances, gold sheen hovers, shimmering locked previews, an animated score dial, band meters, count-up numbers, and auth-form polish — with zero new dependencies.

**Architecture:** CSS keyframes/transitions for everything the compositor can do (entrances, sheen, shimmer, meter), tiny rAF-driven client components for number counting and the SVG dial. All JS animation gates on a shared `useReducedMotion` hook; all CSS animation is already killed globally by the existing `prefers-reduced-motion` block in `app/globals.css`.

**Tech Stack:** Next.js 15 App Router, React 19, plain CSS in `app/globals.css`, Jest 30 + jsdom + React Testing Library. **No GSAP/Lenis in this phase** — they arrive with the landing-page phases.

**Spec:** `docs/superpowers/specs/2026-07-20-motion-design-10x-design.md` (section 4).

## Global Constraints

- Every shell command MUST be prefixed with `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" &&` — non-interactive shells default to Node 16, which breaks Jest/tsc/next.
- No new npm dependencies in this phase.
- Animate `transform` and `opacity` only (plus SVG `stroke-dashoffset` and the meter's `left`); zero layout shift.
- Reuse existing motion tokens: `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`), `--dur-fast` (180ms), `--dur-base` (240ms), `--dur-slow` (480ms). Do not add new duration/easing tokens.
- The global reduced-motion block at `app/globals.css:805` already zeroes all CSS animations/transitions — CSS additions need no extra guard. JS-driven animation (rAF) MUST check `useReducedMotion()`.
- Preserve accessibility: `role="status"`/`aria-live` regions keep announcing final values; animated digits are `aria-hidden` with an sr-only stable value; 44px touch targets; Australian English copy.
- Components stay Server Components unless they need state/effects (`"use client"` only where required).
- Path alias `@/*` for imports.
- docs/ is gitignored — commit plan/spec files with `git add -f`.

---

### Task 1: Cherry-pick the Google sign-in error fix

This branch is based on `Craig`, which does not yet contain commit `d46af94`
(Google `signInWithOAuth` error handling in `AuthForm.tsx`, open in PR #12).
Task 8 edits `AuthForm.tsx`, so pick the fix in first to avoid a merge
conflict when PR #12 lands.

**Files:**
- Modify: `app/components/members/AuthForm.tsx` (via cherry-pick, no manual edit)

- [ ] **Step 1: Cherry-pick**

```bash
git cherry-pick d46af94
```

Expected: clean pick, commit message `fix(members): surface Google sign-in errors instead of failing silently`.

- [ ] **Step 2: Verify the fix is present**

```bash
grep -n "Could not start Google sign-in" app/components/members/AuthForm.tsx
```

Expected: one match inside the `google()` function.

---

### Task 2: `useReducedMotion` hook

**Files:**
- Create: `app/components/motion/useReducedMotion.ts`
- Test: `__tests__/motion/use-reduced-motion.test.tsx`

**Interfaces:**
- Consumes: nothing (leaf utility).
- Produces: `useReducedMotion(): boolean` — `true` when the user prefers reduced motion **or** during SSR (motion is opt-in after hydration). Tasks 3 and 6 call this.

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/motion/use-reduced-motion.test.tsx
import { renderHook } from "@testing-library/react";
import { useReducedMotion } from "@/app/components/motion/useReducedMotion";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("useReducedMotion", () => {
  it("returns true when the media query matches", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("returns false when the media query does not match", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/motion/use-reduced-motion.test.tsx
```

Expected: FAIL — cannot find module `@/app/components/motion/useReducedMotion`.

- [ ] **Step 3: Implement the hook**

```ts
// app/components/motion/useReducedMotion.ts
"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * True when the user prefers reduced motion. Also true on the server
 * snapshot so JS-driven motion is opt-in after hydration (no motion flash).
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true,
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/motion/use-reduced-motion.test.tsx
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add app/components/motion/useReducedMotion.ts __tests__/motion/use-reduced-motion.test.tsx
git commit -m "feat(motion): useReducedMotion hook gating JS-driven animation"
```

---

### Task 3: Count-up maths and `<CountUp>` component

**Files:**
- Create: `lib/motion/count-up.ts`
- Create: `app/components/motion/CountUp.tsx`
- Test: `__tests__/motion/count-up.test.ts`
- Test: `__tests__/motion/count-up-component.test.tsx`

**Interfaces:**
- Consumes: `useReducedMotion()` from Task 2.
- Produces:
  - `easeOutExpo(t: number): number` — 0..1 easing.
  - `countAt(target: number, elapsedMs: number, durationMs: number): number` — integer value at a point in time.
  - `<CountUp value={number} durationMs={number?} />` — client component; animated digits `aria-hidden`, sr-only stable value. Task 6 renders it inside the dial.

- [ ] **Step 1: Write the failing maths test**

```ts
// __tests__/motion/count-up.test.ts
import { countAt, easeOutExpo } from "@/lib/motion/count-up";

describe("easeOutExpo", () => {
  it("starts at 0 and ends at 1", () => {
    expect(easeOutExpo(0)).toBeCloseTo(0, 3);
    expect(easeOutExpo(1)).toBe(1);
  });

  it("is monotonically increasing", () => {
    let prev = -1;
    for (let t = 0; t <= 1.001; t += 0.05) {
      const v = easeOutExpo(t);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe("countAt", () => {
  it("is 0 at the start and target at the end", () => {
    expect(countAt(88, 0, 900)).toBe(0);
    expect(countAt(88, 900, 900)).toBe(88);
  });

  it("clamps past the duration", () => {
    expect(countAt(88, 5000, 900)).toBe(88);
  });

  it("returns the target immediately for a non-positive duration", () => {
    expect(countAt(88, 0, 0)).toBe(88);
    expect(countAt(88, 0, -5)).toBe(88);
  });

  it("returns integers", () => {
    expect(Number.isInteger(countAt(88, 333, 900))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/motion/count-up.test.ts
```

Expected: FAIL — cannot find module `@/lib/motion/count-up`.

- [ ] **Step 3: Implement the maths**

```ts
// lib/motion/count-up.ts
/**
 * Pure timing maths for count-up number animations. Kept free of React so
 * the easing curve and clamping are unit-testable.
 */

export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function countAt(
  target: number,
  elapsedMs: number,
  durationMs: number,
): number {
  if (durationMs <= 0) return target;
  const t = Math.min(elapsedMs / durationMs, 1);
  return Math.round(target * easeOutExpo(t));
}
```

- [ ] **Step 4: Run maths test to verify it passes**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/motion/count-up.test.ts
```

Expected: all passed.

- [ ] **Step 5: Write the failing component test**

```tsx
// __tests__/motion/count-up-component.test.tsx
import { render, screen } from "@testing-library/react";
import CountUp from "@/app/components/motion/CountUp";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("CountUp", () => {
  it("shows the final value immediately under reduced motion", () => {
    mockMatchMedia(true);
    render(<CountUp value={88} />);
    // Both the visible digits and the sr-only copy carry the final value.
    const spans = screen.getAllByText("88");
    expect(spans).toHaveLength(2);
  });

  it("always exposes the stable final value to screen readers", () => {
    mockMatchMedia(false);
    const { container } = render(<CountUp value={42} />);
    const srOnly = container.querySelector(".sr-only");
    expect(srOnly).toHaveTextContent("42");
  });
});
```

- [ ] **Step 6: Run component test to verify it fails**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/motion/count-up-component.test.tsx
```

Expected: FAIL — cannot find module `@/app/components/motion/CountUp`.

- [ ] **Step 7: Implement the component**

```tsx
// app/components/motion/CountUp.tsx
"use client";

import { useEffect, useState } from "react";
import { countAt } from "@/lib/motion/count-up";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Integer count-up. The animated digits are decorative (aria-hidden); the
 * sr-only span carries the stable final value so live regions announce it
 * once instead of on every frame.
 */
export default function CountUp({
  value,
  durationMs = 900,
}: {
  value: number;
  durationMs?: number;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(() => (reduced ? value : 0));

  useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const next = countAt(value, now - start, durationMs);
      setShown(next);
      if (next !== value) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs, reduced]);

  return (
    <>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </>
  );
}
```

- [ ] **Step 8: Run both test files to verify they pass**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/motion/
```

Expected: all passed (both suites).

- [ ] **Step 9: Commit**

```bash
git add lib/motion/count-up.ts app/components/motion/CountUp.tsx __tests__/motion/count-up.test.ts __tests__/motion/count-up-component.test.tsx
git commit -m "feat(motion): count-up maths and CountUp component"
```

---

### Task 4: Dashboard card entrance stagger + gold sheen hover

**Files:**
- Modify: `app/globals.css` (after the `.member-card-pill` rule, ~line 709)
- Modify: `app/components/members/ItemCard.tsx`
- Modify: `app/(site)/(members)/members/page.tsx` (both `.map()` calls)
- Test: `__tests__/members/item-card.test.tsx`

**Interfaces:**
- Consumes: existing `.member-card` styles; `MemberItem` from `@/lib/members/items`.
- Produces: `ItemCard` gains optional prop `index?: number` (default `0`) used as the stagger slot. CSS classes `.member-card-enter` and the `.member-card::after` sheen.

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/members/item-card.test.tsx
import { render } from "@testing-library/react";
import ItemCard from "@/app/components/members/ItemCard";
import type { MemberItem } from "@/lib/members/items";

const item = {
  slug: "test-item",
  title: "Test item",
  description: "A test item.",
  type: "guide",
  tier: "free",
} as MemberItem;

describe("ItemCard entrance stagger", () => {
  it("applies the enter class and stagger index custom property", () => {
    const { container } = render(
      <ItemCard item={item} locked={false} index={3} />,
    );
    const card = container.querySelector("a.member-card")!;
    expect(card.className).toContain("member-card-enter");
    expect((card as HTMLElement).style.getPropertyValue("--stagger-i")).toBe(
      "3",
    );
  });

  it("defaults the stagger index to 0", () => {
    const { container } = render(<ItemCard item={item} locked={false} />);
    const card = container.querySelector("a.member-card") as HTMLElement;
    expect(card.style.getPropertyValue("--stagger-i")).toBe("0");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/members/item-card.test.tsx
```

Expected: FAIL — `member-card-enter` class missing / `--stagger-i` empty.

- [ ] **Step 3: Add the CSS**

In `app/globals.css`, directly after the `.member-card-pill` rule block, add:

```css
/* Card entrance: staggered rise on first paint. Stagger is capped at 8
   slots so deep grids don't wait seconds for the last row. */
@keyframes memberCardEnter {
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.member-card-enter {
  animation: memberCardEnter var(--dur-slow) var(--ease-out) both;
  animation-delay: calc(min(var(--stagger-i, 0), 8) * 60ms);
}

/* Gold sheen sweep across the card face on hover/focus. ::before is taken
   by the top gold rule, so the sheen lives on ::after. */
@keyframes sheenSweep {
  from {
    transform: translateX(-130%) skewX(-18deg);
  }
  to {
    transform: translateX(230%) skewX(-18deg);
  }
}

.member-card::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-130%) skewX(-18deg);
  background: linear-gradient(
    105deg,
    transparent 42%,
    rgba(232, 201, 106, 0.14) 50%,
    transparent 58%
  );
  pointer-events: none;
}

.member-card:hover::after,
.member-card:focus-visible::after {
  animation: sheenSweep 0.9s var(--ease-out) 1;
}
```

- [ ] **Step 4: Thread the index through the components**

Replace the full contents of `app/components/members/ItemCard.tsx` with:

```tsx
import Link from "next/link";
import type { MemberItem } from "@/lib/members/items";

const TYPE_LABEL: Record<MemberItem["type"], string> = {
  download: "Download",
  tool: "Tool",
  guide: "Guide",
};

export default function ItemCard({
  item,
  locked,
  index = 0,
}: {
  item: MemberItem;
  locked: boolean;
  index?: number;
}) {
  return (
    <Link
      href={`/members/${item.slug}`}
      className="member-card member-card-enter"
      style={{ "--stagger-i": index } as React.CSSProperties}
    >
      <p className="eyebrow" style={{ margin: 0 }}>
        {TYPE_LABEL[item.type]}
        {item.tier === "pro" && (
          <span
            className="member-card-pill"
            aria-label={locked ? "Pro — locked" : "Pro"}
          >
            {locked ? "Pro 🔒" : "Pro"}
          </span>
        )}
      </p>
      <h2>{item.title}</h2>
      <p className="member-card-desc">{item.description}</p>
      <span className="member-card-open" aria-hidden="true">
        {locked ? "Preview" : "Open"} <span className="mc-arrow">→</span>
      </span>
    </Link>
  );
}
```

In `app/(site)/(members)/members/page.tsx`, change **both** map calls to pass the index. Free grid:

```tsx
          {items
            .filter((item) => item.tier === "free")
            .map((item, i) => (
              <ItemCard
                key={item.slug}
                item={item}
                locked={!canAccess(item.tier, tier)}
                index={i}
              />
            ))}
```

Pro grid:

```tsx
          {items
            .filter((item) => item.tier === "pro")
            .map((item, i) => (
              <ItemCard
                key={item.slug}
                item={item}
                locked={!canAccess(item.tier, tier)}
                index={i}
              />
            ))}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/members/item-card.test.tsx
```

Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/components/members/ItemCard.tsx "app/(site)/(members)/members/page.tsx" __tests__/members/item-card.test.tsx
git commit -m "feat(members): staggered card entrance and gold sheen hover"
```

---

### Task 5: Locked-preview shimmer veil

**Files:**
- Modify: `app/globals.css` (after the Task 4 additions)
- Modify: `app/components/members/LockedPreview.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `.locked-preview` CSS class; `LockedPreview` keeps its exact props (`{ title: string }`).

- [ ] **Step 1: Add the CSS**

In `app/globals.css`, after the Task 4 block, add:

```css
/* Locked Pro content gate: a slow gold shimmer that parts (fades) on
   hover, hinting the content is one step away. */
@keyframes lockedShimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

.locked-preview {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--liquid-gold);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
}

.locked-preview::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 35%,
    rgba(232, 201, 106, 0.12) 50%,
    transparent 65%
  );
  background-size: 200% 100%;
  animation: lockedShimmer 3.2s linear infinite;
  transition: opacity var(--dur-base) var(--ease-out);
  pointer-events: none;
}

.locked-preview:hover::before,
.locked-preview:focus-within::before {
  opacity: 0;
}
```

- [ ] **Step 2: Move LockedPreview onto the class**

Replace the full contents of `app/components/members/LockedPreview.tsx` with:

```tsx
import Link from "next/link";

/**
 * Rendered in place of Pro content for free members. The gated content is
 * NEVER in the payload -- the server renders this instead.
 */
export default function LockedPreview({ title }: { title: string }) {
  return (
    <div className="locked-preview">
      <p className="eyebrow" style={{ color: "var(--liquid-gold)" }}>
        Pro members only
      </p>
      <h2>{title} is part of the Pro library</h2>
      <p>
        Unlock every guide, tool and download for $29/month. Cancel any time.
      </p>
      <Link
        href="/members/upgrade"
        className="cta"
        style={{ minHeight: 44, display: "inline-block" }}
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Verify the build compiles**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/components/members/LockedPreview.tsx
git commit -m "feat(members): shimmer veil on locked Pro previews"
```

---

### Task 6: Score dial for Website Health Check

**Files:**
- Create: `lib/members/tools/dial.ts`
- Create: `app/components/members/ScoreDial.tsx`
- Modify: `app/components/members/tools/WebsiteHealthCheck.tsx:88-93` (report header)
- Test: `__tests__/members/dial-math.test.ts`
- Test: `__tests__/members/score-dial.test.tsx`

**Interfaces:**
- Consumes: `<CountUp>` (Task 3), `useReducedMotion` (Task 2).
- Produces:
  - `DIAL_RADIUS: number`, `DIAL_CIRCUMFERENCE: number`
  - `dialOffset(score: number): number` — stroke-dashoffset for a 0–100 score, clamped.
  - `dialColor(score: number): string` — CSS colour: `>= 80` `var(--forest-signal)`, `>= 50` `var(--liquid-gold)`, else `#c0392b`.
  - `<ScoreDial score={number} />` — 128px animated SVG ring, `role="img"` with a full-sentence label.

- [ ] **Step 1: Write the failing maths test**

```ts
// __tests__/members/dial-math.test.ts
import {
  DIAL_CIRCUMFERENCE,
  dialColor,
  dialOffset,
} from "@/lib/members/tools/dial";

describe("dialOffset", () => {
  it("is the full circumference at 0 (empty ring)", () => {
    expect(dialOffset(0)).toBeCloseTo(DIAL_CIRCUMFERENCE, 6);
  });

  it("is 0 at 100 (full ring)", () => {
    expect(dialOffset(100)).toBeCloseTo(0, 6);
  });

  it("is half the circumference at 50", () => {
    expect(dialOffset(50)).toBeCloseTo(DIAL_CIRCUMFERENCE / 2, 6);
  });

  it("clamps out-of-range scores", () => {
    expect(dialOffset(140)).toBeCloseTo(0, 6);
    expect(dialOffset(-20)).toBeCloseTo(DIAL_CIRCUMFERENCE, 6);
  });
});

describe("dialColor", () => {
  it("uses the success colour from 80 up", () => {
    expect(dialColor(80)).toBe("var(--forest-signal)");
    expect(dialColor(100)).toBe("var(--forest-signal)");
  });

  it("uses gold from 50 to 79", () => {
    expect(dialColor(50)).toBe("var(--liquid-gold)");
    expect(dialColor(79)).toBe("var(--liquid-gold)");
  });

  it("uses the warning red below 50", () => {
    expect(dialColor(49)).toBe("#c0392b");
    expect(dialColor(0)).toBe("#c0392b");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/members/dial-math.test.ts
```

Expected: FAIL — cannot find module `@/lib/members/tools/dial`.

- [ ] **Step 3: Implement the maths**

```ts
// lib/members/tools/dial.ts
/**
 * Geometry and colour banding for the health-check score dial. Pure module
 * so the arc maths and band boundaries are unit-testable.
 */

export const DIAL_RADIUS = 52;
export const DIAL_CIRCUMFERENCE = 2 * Math.PI * DIAL_RADIUS;

export function dialOffset(score: number): number {
  const clamped = Math.min(100, Math.max(0, score));
  return DIAL_CIRCUMFERENCE * (1 - clamped / 100);
}

export function dialColor(score: number): string {
  if (score >= 80) return "var(--forest-signal)";
  if (score >= 50) return "var(--liquid-gold)";
  return "#c0392b";
}
```

- [ ] **Step 4: Run maths test to verify it passes**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/members/dial-math.test.ts
```

Expected: all passed.

- [ ] **Step 5: Write the failing component test**

```tsx
// __tests__/members/score-dial.test.tsx
import { render, screen } from "@testing-library/react";
import ScoreDial from "@/app/components/members/ScoreDial";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("ScoreDial", () => {
  it("labels the dial with the full score sentence", () => {
    mockMatchMedia(true);
    render(<ScoreDial score={72} />);
    expect(
      screen.getByRole("img", { name: "Health score 72 out of 100" }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run component test to verify it fails**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/members/score-dial.test.tsx
```

Expected: FAIL — cannot find module `@/app/components/members/ScoreDial`.

- [ ] **Step 7: Implement the component**

```tsx
// app/components/members/ScoreDial.tsx
"use client";

import { useEffect, useState } from "react";
import {
  DIAL_CIRCUMFERENCE,
  DIAL_RADIUS,
  dialColor,
  dialOffset,
} from "@/lib/members/tools/dial";
import CountUp from "@/app/components/motion/CountUp";
import { useReducedMotion } from "@/app/components/motion/useReducedMotion";

/**
 * Animated ring for a 0-100 score. The ring sweeps in via a CSS transition
 * on stroke-dashoffset while the number counts up; both settle on the same
 * final state. Everything inside is decorative -- the accessible name is
 * the role="img" label.
 */
export default function ScoreDial({ score }: { score: number }) {
  const reduced = useReducedMotion();
  const [offset, setOffset] = useState(() =>
    reduced ? dialOffset(score) : DIAL_CIRCUMFERENCE,
  );

  useEffect(() => {
    // One frame at the empty state so the transition has a start point.
    const raf = requestAnimationFrame(() => setOffset(dialOffset(score)));
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div
      role="img"
      aria-label={`Health score ${score} out of 100`}
      style={{ position: "relative", width: 128, height: 128 }}
    >
      <div aria-hidden="true">
        <svg viewBox="0 0 120 120" width={128} height={128}>
          <circle
            cx="60"
            cy="60"
            r={DIAL_RADIUS}
            fill="none"
            stroke="var(--rule)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={DIAL_RADIUS}
            fill="none"
            stroke={dialColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={DIAL_CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{
              transition: "stroke-dashoffset 1.1s var(--ease-out)",
            }}
          />
        </svg>
        <p
          className="h-display"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            margin: 0,
            fontSize: "1.9rem",
          }}
        >
          <CountUp value={score} durationMs={1100} />
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Integrate into WebsiteHealthCheck**

In `app/components/members/tools/WebsiteHealthCheck.tsx`, add the import at the top:

```tsx
import ScoreDial from "@/app/components/members/ScoreDial";
```

Then replace the score paragraph (the `<p>Health score for …</p>` block at the top of the `report && …` section) with:

```tsx
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <ScoreDial score={report.score} />
            <p style={{ margin: 0 }}>
              Health score for <strong>{report.finalUrl}</strong>
            </p>
          </div>
```

- [ ] **Step 9: Run all new tests and the type check**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/members/dial-math.test.ts __tests__/members/score-dial.test.tsx && npx tsc --noEmit
```

Expected: all tests pass; no type errors.

- [ ] **Step 10: Commit**

```bash
git add lib/members/tools/dial.ts app/components/members/ScoreDial.tsx app/components/members/tools/WebsiteHealthCheck.tsx __tests__/members/dial-math.test.ts __tests__/members/score-dial.test.tsx
git commit -m "feat(members): animated score dial for website health check"
```

---

### Task 7: Band meter + result pop for the audit tools

**Files:**
- Create: `app/components/members/tools/BandMeter.tsx`
- Modify: `app/globals.css` (after the Task 5 additions)
- Modify: `app/components/members/tools/AuditTool.tsx:79-116` (result panel)
- Test: `__tests__/members/band-meter.test.tsx`

**Interfaces:**
- Consumes: `AuditBand` type from `@/lib/members/tools/audits/types`.
- Produces: `<BandMeter band={AuditBand} />` — decorative gradient track with a marker that slides between thirds (`low` 16.67%, `medium` 50%, `high` 83.33%).

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/members/band-meter.test.tsx
import { render } from "@testing-library/react";
import BandMeter from "@/app/components/members/tools/BandMeter";

describe("BandMeter", () => {
  it.each([
    ["low", "16.67%"],
    ["medium", "50%"],
    ["high", "83.33%"],
  ] as const)("places the marker for the %s band", (band, left) => {
    const { container } = render(<BandMeter band={band} />);
    const marker = container.querySelector(
      ".band-meter-marker",
    ) as HTMLElement;
    expect(marker.style.left).toBe(left);
  });

  it("is hidden from assistive tech (band is conveyed in the result text)", () => {
    const { container } = render(<BandMeter band="high" />);
    expect(
      (container.firstChild as HTMLElement).getAttribute("aria-hidden"),
    ).toBe("true");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/members/band-meter.test.tsx
```

Expected: FAIL — cannot find module `@/app/components/members/tools/BandMeter`.

- [ ] **Step 3: Implement the component**

```tsx
// app/components/members/tools/BandMeter.tsx
import type { AuditBand } from "@/lib/members/tools/audits/types";

const POSITION: Record<AuditBand, string> = {
  low: "16.67%",
  medium: "50%",
  high: "83.33%",
};

const COLOR: Record<AuditBand, string> = {
  low: "var(--forest-signal)",
  medium: "var(--liquid-gold)",
  high: "#c0392b",
};

/**
 * Decorative severity meter under an audit result. The band itself is
 * announced through the result copy, so this is aria-hidden; the marker
 * slides between thirds via a CSS transition as answers change.
 */
export default function BandMeter({ band }: { band: AuditBand }) {
  return (
    <div aria-hidden="true" className="band-meter">
      <span
        className="band-meter-marker"
        style={{ left: POSITION[band], background: COLOR[band] }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Add the CSS**

In `app/globals.css`, after the Task 5 additions, add:

```css
/* Audit band meter: gradient severity track with a sliding marker. */
.band-meter {
  position: relative;
  height: 6px;
  margin: 1rem 0;
  border-radius: 3px;
  background: linear-gradient(
    90deg,
    var(--forest-signal),
    var(--liquid-gold),
    #c0392b
  );
  opacity: 0.9;
}

.band-meter-marker {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--milk-white);
  transform: translate(-50%, -50%);
  box-shadow: 0 1px 4px rgba(15, 21, 38, 0.25);
  transition:
    left var(--dur-base) var(--ease-out),
    background var(--dur-base) linear;
}

/* Result panel pop when the audit band changes. */
@keyframes resultPop {
  from {
    opacity: 0;
    transform: translate3d(0, 6px, 0) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.result-pop {
  animation: resultPop var(--dur-base) var(--ease-out) both;
}
```

- [ ] **Step 5: Integrate into AuditTool**

In `app/components/members/tools/AuditTool.tsx`, add the import:

```tsx
import BandMeter from "./BandMeter";
```

Then update the result panel `<div>`: add `key={result.band}` and `className="result-pop"` to its props (keeping the existing `role`, `aria-live` and `style`), and render `<BandMeter band={result.band} />` between the eyebrow label and the verdict:

```tsx
      <div
        key={result.band}
        className="result-pop"
        role="status"
        aria-live="polite"
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          border: "1px solid var(--rule)",
          borderLeft: `3px solid ${bandColor}`,
          borderRadius: 12,
          background: "var(--milk-white)",
        }}
      >
        <p
          className="h-display"
          style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", margin: 0 }}
        >
          {result.headlineValue}
        </p>
        <p className="eyebrow no-rule" style={{ margin: "0.25rem 0 1rem" }}>
          {result.headlineLabel}
        </p>
        <BandMeter band={result.band} />
        <p style={{ margin: "0 0 1rem" }}>{result.verdict}</p>
        <p style={{ margin: 0 }}>
          {config.remediation.copy}{" "}
          <Link href={`/members/${config.remediation.slug}`}>
            {config.remediation.isPro ? "See the Pro guide →" : "Open the free guide →"}
          </Link>
        </p>
        <p
          style={{
            margin: "1rem 0 0",
            fontSize: "0.8rem",
            color: "var(--slate-light)",
          }}
        >
          {result.assumptions}
        </p>
      </div>
```

The `key={result.band}` remounts the panel only when the band changes, so
the pop fires on meaningful shifts, not on every slider tick.

- [ ] **Step 6: Run tests and type check**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/members/band-meter.test.tsx && npx tsc --noEmit
```

Expected: all passed; no type errors.

- [ ] **Step 7: Commit**

```bash
git add app/components/members/tools/BandMeter.tsx app/components/members/tools/AuditTool.tsx app/globals.css __tests__/members/band-meter.test.tsx
git commit -m "feat(members): band meter and result pop for audit tools"
```

---

### Task 8: Auth form micro-interactions

**Files:**
- Modify: `app/globals.css` (after the Task 7 additions)
- Modify: `app/components/members/AuthForm.tsx`

**Interfaces:**
- Consumes: existing utility classes `animate-slideDown`, `animate-fadeInUp`; existing status state machine in `AuthForm`.
- Produces: `.btn-busy` CSS class (pulsing submit while sending).

- [ ] **Step 1: Add the CSS**

In `app/globals.css`, after the Task 7 additions, add:

```css
/* Submit-in-flight pulse for auth/checkout buttons. */
@keyframes busyPulse {
  50% {
    opacity: 0.55;
  }
}

.btn-busy {
  animation: busyPulse 1.2s ease-in-out infinite;
}
```

- [ ] **Step 2: Apply the classes in AuthForm**

Three small edits in `app/components/members/AuthForm.tsx` (which now includes the Task 1 cherry-pick):

1. The "sent" confirmation (currently `<p role="status" style={{ color: "var(--warm-cream)" }}>`) gains the fade-up:

```tsx
      <p role="status" className="animate-fadeInUp" style={{ color: "var(--warm-cream)" }}>
```

2. The error alert (currently `<p role="alert" style={{ color: "#c0392b" }}>`) gains the slide-down:

```tsx
        <p role="alert" className="animate-slideDown" style={{ color: "#c0392b" }}>
```

3. The submit button pulses while sending — change its `className` to be conditional:

```tsx
      <button
        type="submit"
        className={`cta cta-gold${status.state === "sending" ? " btn-busy" : ""}`}
        disabled={status.state === "sending"}
        style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}
      >
```

- [ ] **Step 3: Run the existing suite and type check (no new unit test — presentation-only class toggles)**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest __tests__/members/ && npx tsc --noEmit
```

Expected: all existing members suites pass; no type errors.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/components/members/AuthForm.tsx
git commit -m "feat(members): auth form status micro-interactions"
```

---

### Task 9: Full verification pass

**Files:** none created — verification only.

- [ ] **Step 1: Run the entire test suite**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npm test -- --watchAll=false
```

Expected: every suite passes, including the pre-existing scoring, send-email and members suites.

- [ ] **Step 2: Lint and build**

```bash
export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npm run lint && npm run build
```

Expected: no lint errors; production build succeeds.

- [ ] **Step 3: Visual verification in the browser preview**

Using the preview tools (dev server on port 3000):

1. `/members/login` — submit an invalid email/password: error slides down; submit button pulses while sending.
2. `/members` (requires a session — if no Supabase env is configured locally, verify the card stagger on the public `/tools` page instead, which uses the same card CSS) — cards rise in staggered order; hover shows gold sheen sweep.
3. `/members/website-health-check` — run a check; the dial sweeps and the number counts up.
4. Any audit tool page — move sliders across a band boundary; the marker slides and the panel pops.
5. Emulate `prefers-reduced-motion: reduce` — all of the above render instantly with no animation.
6. Mobile viewport (375px) — no horizontal overflow, dial and meter fit.

Expected: all six checks pass; console free of errors.

- [ ] **Step 4: Final commit if verification produced fixes**

```bash
git status
```

If clean: done. If fixes were needed, commit them with a descriptive message.
