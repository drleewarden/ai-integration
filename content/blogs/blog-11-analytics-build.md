# Blog Article 11: How We Built a Predictive Analytics Layer That Replaced a Full-Time Analyst Role

**Category:** Behind the Build
**Cluster:** Case study extension -- SaaS analytics
**Target keyword:** AI analytics automation
**Secondary keywords:** AI business intelligence, automated reporting AI, predictive analytics implementation
**Estimated read time:** 7 min
**Status:** Priority 3
**Meta description:** The detailed story behind our SaaS analytics case study -- what we built, why we built it that way, what the 10× faster insights outcome actually means, and what we learned.

---

The headline on our work page -- "10× faster insights" -- needs context to be useful. This article is that context.

The engagement was with a B2B SaaS marketing analytics platform. 60 staff. A two-person analytics team. A reporting workflow that was consuming most of their capacity. Here's the full story.

---

## The actual problem

The two analysts on this team were producing, between them, roughly 40+ client-facing reports per month and a set of internal stakeholder dashboards on a weekly cycle. The average client report took 3–4 hours to prepare -- pulling from the data warehouse, formatting in the reporting template, writing the performance narrative, reviewing for accuracy, and distributing.

Multiply that out: 40+ reports × 3–4 hours = 120–160 analyst-hours per month on report preparation. For a two-person team working a combined 320 hours per month, that's 40–50% of their capacity gone before they'd done any analysis.

The business was growing at around 25% per year. The number of clients requiring reports was growing at the same rate. At that trajectory, they'd need to hire a third analyst within 18 months -- not for analytical capability, but to keep up with formatting work.

---

## The Discovery Sprint findings

The process mapping exercise revealed three things that shaped the build.

**Finding 1: 80% of report content was templated.** Every client report had the same structure: performance summary, channel breakdown, anomaly highlights, recommendations framework. The template was identical across clients. Only the data changed.

**Finding 2: Anomaly detection was ad hoc.** The analysts identified significant performance changes by visually scanning data in the weekly preparation process. There was no systematic approach to spotting changes that were statistically significant versus noise. Some anomalies were being missed because the analyst had other reports to finish.

**Finding 3: The "insights" the business was selling were under-delivered.** Clients were paying for a platform that generated insights. What they were receiving were reports. The analysts knew the difference -- they weren't generating insights because they didn't have time. The reporting burden was crowding out the analytical work that created the actual product value.

Success metric agreed: reduce time spent on standard reporting by 70% within 90 days.

---

## What we built

**Component 1: Automated report generation**

The system connects to the client's BigQuery data warehouse, pulls on a defined schedule, maps the data to the report template schema, and generates a formatted report in Looker Studio with all data fields populated. For the plain-English performance narrative, it generates a structured summary of movements above/below threshold, formatted in the client's standard language.

The analyst's job on a standard report is now: review the generated content, add strategic commentary, approve and distribute. From 3–4 hours to 20–30 minutes.

**Component 2: Statistical anomaly detection**

The system runs ongoing analysis on client data against defined baselines. When a metric moves beyond a statistically significant threshold (we calibrated this with the analytics team based on their professional judgement about what constituted meaningful movement), the system flags it immediately -- not at the next reporting cycle.

In the first 90 days, the system identified 7 significant performance changes that were caught and communicated to clients within hours of occurring. Previously, several of these would have been reported at the next monthly cycle -- days or weeks after the change.

**Component 3: Distribution**

Formatted reports distributed via Sendgrid to client contacts on their defined schedule. Slack notifications to the internal account team when a client report is generated or when an anomaly flag is raised. The analysts aren't managing the distribution process.

**Integrations:** BigQuery · Looker Studio · Sendgrid · Slack · Client's internal reporting database

---

## What "10× faster insights" actually means

The 3–4 day cycle from data event to client insight delivery is now same-day for anomalies and same-day for scheduled reports (the previous cycle was: analyst notices it during report prep, writes it up, sends the report, client sees it).

"10×" is conservative -- in the anomaly cases, the improvement is closer to 7–14 days to same-day, which is more than 10× for those events.

What matters more than the ratio: clients are receiving information faster, which is the core product value of the platform.

---

## The "replacing an analyst role" question

We're careful about how we describe this outcome because it's misunderstood.

The analytics team is still two people. Neither has been made redundant. What's changed is what they do all day.

Before: 40–50% of capacity on report formatting, 50–60% on actual analysis.
After: ~10% on report review and approval, ~90% on analysis, anomaly investigation, and client advisory work.

The business got a better analytics product without hiring a third person. The two analysts got more interesting work. The AI system enabled both outcomes simultaneously.

The "replacement" framing concerns us because it obscures what actually happened. The capacity didn't disappear -- it was reallocated. Whether a business chooses to reallocate that capacity to higher-value work or to reduce headcount is a business decision, not an AI outcome. We built the system. The client made the workforce decision.

---

## What we learned

The Slack integration caused unexpected issues because the client's Slack workspace had a non-standard permissions architecture from a previous IT configuration. We now do a Slack/comms infrastructure audit as standard in Discovery Sprints for any engagement involving notification systems.

The statistical threshold calibration took two iteration cycles with the analytics team. What counts as a "significant" movement is partly statistical and partly domain expertise -- the analysts had intuitions about certain metric types that weren't captured in the initial threshold model. Building in that iteration time from the start would have been more efficient.

---

*If you have a reporting or analytics workflow consuming skilled team capacity, [book a call →](/contact) to discuss what an automated intelligence layer might look like for your situation.*

---
---