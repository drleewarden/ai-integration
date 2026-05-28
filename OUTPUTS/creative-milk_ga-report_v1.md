# Creative Milk — GA4 30-Day Report

**Period:** 28 Apr 2026 – 27 May 2026 (vs prior 30 days)
**Property:** ai-integration (GA4)
**Pulled:** 28 May 2026 via Supermetrics

---

## Headline

| Metric | Last 30d | Prior 30d | Δ |
|---|---:|---:|---:|
| Sessions | 115 | 14 | +721% |
| Total users | 30 | 8 | +275% |
| New users | 24 | 7 | +243% |
| Engaged sessions | 54 | 9 | +500% |
| Views | 335 | 29 | +1,055% |
| Engagement rate | 46.96% | 64.29% | −17.3 pts |
| Avg session duration | 6m 03s | 11m 05s | −45% |
| Bounce rate | 53.04% | 35.71% | +17.3 pts |
| Conversions | 0 | 0 | — |

Volume is up dramatically, quality is down. Read that as: site is being seen, but new visitors aren't staying as long as the small early base did.

## Channel mix

| Channel | Sessions | Users | Engaged |
|---|---:|---:|---:|
| Direct | 84 | 27 | 43 |
| Referral | 28 | 3 | 11 |
| Organic Search | 2 | 1 | 0 |
| Unassigned | 1 | 1 | 0 |

## Source / medium

| Source / medium | Sessions | Users |
|---|---:|---:|
| (direct) / (none) | 84 | 27 |
| vercel.com / referral | 28 | 3 |
| google / organic | 2 | 1 |
| (not set) | 1 | 1 |

**Caveat:** 28 of those "referral" sessions are from vercel.com — almost certainly Vercel deploy-preview traffic, not real visitors. Real human traffic is closer to **~87 sessions / 27 users**.

## Top landing pages

| Page | Sessions | Users | Engagement |
|---|---:|---:|---:|
| / | 77 | 26 | 49.4% |
| (not set) | 16 | 11 | 6.3% |
| /ai-readiness | 11 | 6 | 54.6% |
| /about | 2 | 1 | 0% |
| /clients | 2 | 1 | 100% |
| /what-we-build | 2 | 2 | 100% |
| /work | 2 | 2 | 100% |
| /pricing | 1 | 1 | 100% |
| /ai-readiness/result/* | 2 | 2 | 100% |

## Geography

| Country | Sessions | Users |
|---|---:|---:|
| Australia | 107 | 24 |
| United States | 6 | 6 |
| New Zealand | 2 | 2 |

---

## Read

1. **Conversion tracking is empty.** Zero conversions in 30 days, prior period also zero. Either no GA4 conversion events are configured, or the form/CTA events aren't firing. Worth a 30-min audit — without this, nothing else here translates to pipeline.
2. **The AI Readiness tool is the standout.** /ai-readiness has the highest engagement rate of any non-home landing, and at least two users completed the assessment (result pages). That's the asset to lean into.
3. **Strip Vercel preview traffic.** Real visitor count is ~87 sessions. Either set up a filter in GA4 to exclude vercel.com referrals, or use a property filter on the dev domain.
4. **Organic is dead.** 2 organic sessions in 30 days. No SEO presence. If pipeline depends on inbound, this needs deliberate content.
5. **6 US sessions, 6 US users** — small but a real signal pre-US expansion.

## Next moves

- Audit GA4 conversion events (form submit, AI readiness completion, contact CTA)
- Add Vercel referral filter
- Double down on /ai-readiness — it's pulling the highest quality engagement
- Set a weekly schedule to auto-pull this brief
