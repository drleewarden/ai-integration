# Creative Milk — Weekly GA4 Brief

**Site:** creative-milk.com.au
**Window:** Last 7 days (21–27 May 2026) vs prior 7 days (14–20 May 2026)
**Generated:** 28 May 2026

---

## Headline KPIs (WoW)

| Metric | This Week | Prior Week | Δ |
|---|---|---|---|
| Sessions | 32 | 44 | **−27.3%** |
| Total users | 11 | 13 | −15.4% |
| New users | 7 | 7 | 0.0% |
| Engaged sessions | 19 | 28 | **−32.1%** |
| Engagement rate | 59.4% | 63.6% | −4.3 pp |
| Avg session duration | 8m 36s | 8m 35s | ~flat |
| Page views | 109 | 158 | **−31.0%** |
| Bounce rate | 40.6% | 36.4% | +4.3 pp |
| Conversions | 0 | 0 | — |

**Real traffic (ex-Vercel referral):** ~23 sessions, ~10 users. Vercel referral added 9 sessions/1 user — that's deploy-preview traffic, not visitors.

> ⚠️ **Conversions still showing 0.** GA4 conversion events aren't configured — fix this before next week's brief so contact-form submissions register.

---

## Channel Mix

| Channel | Sessions | Users | Engaged | Conv |
|---|---|---|---|---|
| Direct | 20 | 8 | 14 | 0 |
| Referral (Vercel) | 9 | 1 | 5 | 0 |
| Organic Search | 2 | 1 | 0 | 0 |
| Unassigned | 1 | 1 | 0 | 0 |

Direct is doing the heavy lifting — 87% of real sessions and 80% of users. Organic at 2 sessions is essentially zero. No paid, no social, no email.

---

## Top Landing Pages

| Page | Sessions | Users | Engagement | Conv |
|---|---|---|---|---|
| `/` (home) | 16 | 8 | 68.8% | 0 |
| `/ai-readiness` | 7 | 4 | 42.9% | 0 |
| `(not set)` | 5 | 3 | 20.0% | 0 |
| `/clients` | 2 | 1 | 100% | 0 |
| `/what-we-build` | 1 | 1 | 100% | 0 |
| `/work` | 1 | 1 | 100% | 0 |

Home is healthy. `/ai-readiness` is the second-strongest entry point but the engagement rate (42.9%) is well below home — worth a look at the fold/CTA. `(not set)` landing rows are usually bot or referrer-stripped traffic — track this if it grows.

---

## What to Do This Week

- **Fix GA4 conversion events.** This is the blocker. Mark `form_submit` (or whatever the Resend contact form fires) as a key event in GA4 Admin → Events. Until this is live, every brief reports zero and we can't measure anything that matters.
- **Investigate the WoW dip.** Sessions, engaged sessions and page views all dropped ~30%. Volume is small enough to be noise, but cross-check Search Console and any campaign pauses or content unpublishes from the prior week.
- **Drive any source other than Direct.** Organic at 2 sessions means no SEO surface and no top-of-funnel activity. Pick one channel — LinkedIn posts, a newsletter, or a single SEO page — and seed it this week.
- **Stress-test `/ai-readiness`.** It's pulling 22% of real sessions but engagement is ~26 pp below home. Either the page promise mismatches the inbound intent, or the above-the-fold isn't holding people. Quick heuristic review before any rewrite.
- **Filter Vercel referrals at the GA4 view level.** Either add a DATA filter excluding `vercel.com` as a referrer, or set up an internal-traffic rule. Reporting cleanliness compounds.

---

*Live interactive view:* the `creative-milk-ga-weekly` artifact auto-refreshes when opened — use it for charts and drill-downs.
