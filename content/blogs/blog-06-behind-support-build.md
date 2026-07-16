# Blog Article 06: How We Cut Support Ticket Volume by 60% -- A Behind-the-Scenes Look

**Category:** Behind the Build
**Cluster:** Case study extension
**Target keyword:** AI customer support automation
**Secondary keywords:** AI support ticket reduction, customer support AI Australia, reduce support volume AI
**Estimated read time:** 7 min
**Status:** Priority 2
**Meta description:** A detailed look at the AI system Creative Milk built for a SaaS customer support platform -- the architecture, the integrations, what went wrong, and the 60% ticket reduction outcome.

---

This is the longer version of a case study we summarise on our work page. We're publishing it in detail because the specifics matter -- both for businesses evaluating whether something similar could work for them, and for the record of how AI systems actually get built.

---

## The situation

A SaaS customer support platform -- about 120 staff, a three-person support team -- was handling roughly 800 tickets per week. The business was growing. The support team was not.

Around 70% of incoming tickets were tier-1 queries: password resets, billing questions, feature how-tos, integration troubleshooting that followed defined steps. None of these required the judgement of the support team. All of them were consuming their time.

They had tried a chatbot 18 months earlier. It gave incorrect answers, created escalations that shouldn't have been escalations, and the team quietly stopped routing queries to it after six weeks. When we started the Discovery Sprint, the team's confidence in AI-assisted support was near zero.

---

## What we found in the Discovery Sprint

Two things stood out from the process mapping work.

**First:** 68% of tickets in the previous 90 days were resolvable by a defined, documented answer. We categorised every ticket in their Zendesk queue for that period. Most of what the team was spending their time on was documented somewhere -- in the help centre, in internal runbooks, in previous ticket resolutions. The knowledge existed. It wasn't being used at scale.

**Second:** The previous chatbot had failed because it was a retrieval system with no understanding of intent. A customer asking "I can't log in" and a customer asking "why won't my account open" are the same question. A simple keyword-matching system treats them as different. The team had been burned by exactly this limitation.

The success metric we agreed: reduce tier-1 ticket volume by 40% within 60 days of launch.

---

## What we built

The system has three layers.

**Layer 1 -- Intent classification**
Every incoming ticket is classified by intent before anything else happens. Not by keyword, but by meaning. A ticket saying "I'm getting an error when I try to pay" and a ticket saying "the payment screen keeps crashing" are both billing/payment issues. The classification layer understands that.

We trained the classifier on 90 days of historical tickets, with their eventual resolutions as the training signal. The classifier learned what the support team learned -- that certain words, phrases, and patterns map to certain problem types.

**Layer 2 -- Resolution or escalation**
For classified tier-1 tickets, the system queries a knowledge base we built from the client's existing documentation -- help articles, internal runbooks, product documentation, and the 90-day ticket resolution archive. It generates a response, checks it against the ticket intent, and either sends it directly (high-confidence tier-1) or flags it for human review (moderate confidence or any complexity signal).

Clear escalation boundaries were defined in Phase 1 and built into the logic. The system never autonomously handles: billing disputes, account access for suspected fraud, bug reports, or any ticket where the classification confidence is below threshold.

**Layer 3 -- Human handoff with context**
When a ticket escalates, the support agent receives: the ticket, the intent classification, the knowledge base articles the system queried, and (if it exists) the customer's previous ticket history. The agent starts with context rather than starting from scratch.

**Integrations:** Zendesk (ticket ingestion and response), Stripe (billing data for account queries), internal product knowledge base, custom ticket history database.

---

## What went wrong

The knowledge base took longer than anticipated.

The client's existing documentation was fragmented across four systems: a help centre in Zendesk, internal runbooks in Notion, a legacy wiki, and ticket notes in various states of formality. Consolidating, deduplicating, and quality-checking that documentation took nearly two weeks -- we'd scoped one week.

The lesson: we now scope a documentation consolidation phase explicitly in the Discovery Sprint for any knowledge-base-dependent build. It's 3–5 days of defined work that surfaces early. We don't let it become mid-build scope creep.

The second issue: the initial intent classifier was underperforming on a specific query type -- integration troubleshooting questions that used technical jargon specific to the client's product. We hadn't included enough technical vocabulary in the training data. Two additional days of retraining resolved it, but it delayed the confidence threshold calibration.

---

## The outcome

At 60 days post-launch:
- Tier-1 ticket volume: down 60% (target was 40%)
- Average handling time on escalated tickets: down 34% (agents start with pre-populated context)
- Support team NPS: improved (the team reported higher job satisfaction -- they were handling interesting problems instead of the same ten questions)

At 90 days:
- The system had processed 3,200 tier-1 tickets autonomously
- Escalation rate from the AI: 12% (lower than expected -- the classifier was more accurate than the confidence threshold calibration suggested it would be)
- No significant accuracy complaints from customers -- the team tracked negative feedback specifically

---

## What this looks like for other businesses

Not every business has a support queue that looks like this. The model works when:
- You have a high volume of repeatable queries
- Those queries have documented answers (or you're willing to build the documentation)
- The tier-1/tier-2 distinction is clear and defensible
- Your team is willing to work with the system (not around it)

The last point matters more than most businesses account for. We spent two sessions with the support team before go-live -- not training them on the system, but listening to what they were worried about. Their main concern was that the system would give wrong answers and they'd be blamed. We built the escalation threshold specifically to address that concern: when in doubt, the system escalates. The team trusted it more because they knew it would ask for help rather than guess.

---

*If you're managing a support operation with repeatable query volume, [book a call →](/contact) and we'll tell you whether a system like this makes sense for your situation.*

---
---