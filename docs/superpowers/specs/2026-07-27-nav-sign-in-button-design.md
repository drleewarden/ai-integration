# Nav Sign-in Button — Design

**Date:** 2026-07-27
**Status:** Approved by Darryn (brainstorming session)

## Purpose

Give members a visible way into the members sign-in page from every page:
a "Sign in" item in the top nav linking to `/login`. Today the only route
in is the "Members" item buried in the Resources dropdown.

## Decisions

| Question | Decision |
|---|---|
| Auth-aware (swap label when signed in)? | No — static link always showing "Sign in". No session check in the nav. |
| Destination | `/login` (existing members sign-in page, unchanged) |
| Visual weight | Quieter than the gold "Book a call" CTA, which stays the single loud action |

## Change

**One file: `app/components/Nav.tsx`.** Purely additive.

- **Desktop:** a "Sign in" anchor between the nav groups and the
  "Book a call" gold CTA, styled with the existing `navLinkStyle`
  (mono, uppercase, hover gold — matching the flat "About" link's hover
  handlers). Fires the existing GTM event on click:
  `pushEvent(EVENTS.CTA_CLICK, { cta_label: "sign_in", cta_location: "nav_desktop" })`.
- **Mobile menu:** a full-width `.cta` (default bordered variant, NOT
  `cta-gold`) "Sign in" button immediately below the existing
  "Book a call" button. Closes the menu on tap (`setMobileOpen(false)`)
  and fires the same GTM event with `cta_location: "nav_mobile"`.

## Out of scope

- Auth-aware label swapping (revisit if members complain about seeing
  "Sign in" while signed in).
- Login-page changes (it does not auto-redirect already-signed-in
  visitors; pre-existing behaviour).
- Removing the "Members" item from the Resources dropdown.

## Verification

No unit tests exist for Nav and this adds none. Verify with
`npx tsc --noEmit`, `npm run build`, and a browser check of the dev
server: desktop nav shows Sign in before Book a call and navigates to
`/login`; mobile (375px) menu shows the bordered Sign in button below
Book a call, 44px touch target, menu closes on tap.
