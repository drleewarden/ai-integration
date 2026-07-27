# Nav Sign-in Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static "Sign in" item to the top nav (desktop + mobile) linking to `/login`.

**Architecture:** Purely additive edit to the existing `Nav.tsx` client component — one anchor in the desktop link row before the "Book a call" CTA, one full-width bordered button in the mobile menu after it. No auth-awareness, no new components.

**Tech Stack:** Next.js 15 / React client component, existing `navLinkStyle` + `.cta` styles, GTM `pushEvent`.

**Spec:** `docs/superpowers/specs/2026-07-27-nav-sign-in-button-design.md`

## Global Constraints

- **Node PATH:** non-interactive shells resolve Node 16. Prefix EVERY npm/npx command with: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && `
- **Branch:** all work on `feat/nav-sign-in` (created from `main` in Step 1). Shared checkout — run `git branch --show-current` before EVERY commit.
- Desktop item uses the existing `navLinkStyle` const and the exact hover handlers of the flat "About" link; mobile uses `className="cta"` (NOT `cta-gold` — "Book a call" stays the only gold CTA).
- GTM: `pushEvent(EVENTS.CTA_CLICK, { cta_label: "sign_in", cta_location: "nav_desktop" | "nav_mobile" })`.
- Label copy: exactly "Sign in". Destination: exactly `/login`.
- 44px touch targets (both styles already provide this — `navLinkStyle` has `minHeight: 44`, `.cta` has `min-height: 44px`).

---

### Task 1: Add the Sign in item to Nav.tsx

**Files:**
- Modify: `app/components/Nav.tsx` (desktop row ~line 313, mobile menu ~line 451)

**Interfaces:**
- Consumes: existing `navLinkStyle`, `pushEvent`/`EVENTS` (already imported in the file), `setOpenMenu`, `setMobileOpen`.
- Produces: nothing consumed elsewhere — leaf UI change.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b feat/nav-sign-in
git branch --show-current   # expect: feat/nav-sign-in
```

- [ ] **Step 2: Add the desktop link**

In `app/components/Nav.tsx`, the desktop row currently ends with (immediately after the closing `})}` of the `NAV_GROUPS.map`):

```tsx
          <a
            href="/contact"
            className="cta cta-gold"
            style={{ marginLeft: "1rem" }}
```

Insert this anchor BETWEEN the map's closing `})}` and that "Book a call" anchor:

```tsx
          <a
            href="/login"
            style={navLinkStyle}
            onMouseEnter={(e) => {
              setOpenMenu(null);
              e.currentTarget.style.color = "var(--liquid-gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(245,240,232,0.62)";
            }}
            onClick={() =>
              pushEvent(EVENTS.CTA_CLICK, {
                cta_label: "sign_in",
                cta_location: "nav_desktop",
              })
            }
          >
            Sign in
          </a>
```

- [ ] **Step 3: Add the mobile button**

In the mobile menu block, the existing "Book a call" anchor ends with:

```tsx
            Book a call
          </a>
        </div>
      )}
```

Insert this anchor between `</a>` and `</div>`:

```tsx
          <a
            href="/login"
            onClick={() => {
              pushEvent(EVENTS.CTA_CLICK, {
                cta_label: "sign_in",
                cta_location: "nav_mobile",
              });
              setMobileOpen(false);
            }}
            className="cta"
            style={{
              marginTop: "0.75rem",
              justifyContent: "center",
              width: "100%",
            }}
          >
            Sign in
          </a>
```

- [ ] **Step 4: Verify**

Run: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx tsc --noEmit && npm run build`
Expected: both clean (Nav is used by every page; the build compiling is the regression check — no unit tests exist for Nav and this plan adds none, per spec).

Then browser-check the dev server: desktop nav shows "Sign in" (mono/uppercase, gold on hover) left of "Book a call" and navigates to `/login`; at 375px the menu shows a full-width bordered "Sign in" below "Book a call" and the menu closes on tap.

- [ ] **Step 5: Commit**

```bash
git branch --show-current   # must be feat/nav-sign-in
git add app/components/Nav.tsx
git commit -m "feat: sign-in link in top nav (desktop + mobile)"
```
