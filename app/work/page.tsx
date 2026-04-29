import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Implementation Case Studies Australia | Real Outcomes | Creative Milk",
  description:
    "See Creative Milk's AI implementation results. 60% support reduction, +35% conversion, 10× faster insights. Real systems, real numbers. Book a call.",
};

const caseStudies = [
  {
    eyebrow: "CASE STUDY 01 · CUSTOMER SUPPORT · 6 WEEKS",
    metric: "−60%",
    headline: "60% reduction in support ticket volume — in the first month after launch.",
    brief: {
      Industry: "SaaS / Customer Support Platform",
      "Company size": "~120 staff, 3-person support team",
      Engagement: "Discovery Sprint + Build & Integrate",
      Timeline: "6 weeks build",
      "Success metric agreed": "Reduce tier-1 support volume by 40% within 60 days of launch",
      Outcome: "60% reduction in tier-1 volume — Month 1",
    },
    problem:
      "The support team was handling approximately 800 tickets per week. Roughly 70% were tier-1 queries — password resets, billing questions, feature how-tos — that required no human judgement. The team was buried in work that didn't need them. Response times were blowing out. They'd tried a basic chatbot 18 months earlier. The team hated it because it gave wrong answers and created more escalations than it resolved.",
    built:
      "An intelligent triage and resolution layer that sits between the customer and the support queue. The system classifies incoming tickets by type and intent in real time and resolves tier-1 queries directly using a knowledge base we built and maintain. Queries requiring human judgement are passed to the team with a suggested response and relevant context pulled from the customer's account history.",
    integrations: "Zendesk · Stripe (billing data) · Product knowledge base · Account database",
    results: [
      "Tier-1 ticket volume: down 60% in Month 1 (target was 40%)",
      "Average response time on remaining human-handled tickets: down 34%",
      "Support team NPS: improved — staff reported higher job satisfaction",
    ],
    different:
      "The knowledge base we built from scratch took longer than anticipated because the client's existing documentation was fragmented across four systems. We now scope a documentation consolidation phase before any knowledge-base-dependent build — it's 3–5 days of work that saves 2–3 weeks later.",
  },
  {
    eyebrow: "CASE STUDY 02 · E-COMMERCE · 7 WEEKS",
    metric: "+35%",
    headline: "+35% conversion rate from a personalised recommendations engine.",
    brief: {
      Industry: "E-Commerce (fashion/lifestyle, ~$8M annual revenue)",
      "Company size": "35 staff",
      Engagement: "Discovery Sprint + Build & Integrate",
      Timeline: "7 weeks build",
      "Success metric agreed": "Increase conversion rate by 15% within 90 days",
      Outcome: "+35% conversion rate — measured at 90 days",
    },
    problem:
      "The business was spending heavily on paid acquisition — Google and Meta — but conversion rate had plateaued at around 2.1% for 18 months. The site served the same product grid to every visitor regardless of their browse history, purchase patterns, or intent signals. Return customers — the most valuable segment — were getting no personalisation signal at all.",
    built:
      "A personalised recommendations engine that surfaces product content based on individual customer behaviour, purchase history, and real-time session signals. The system runs three recommendation layers: homepage (based on return-visit behaviour), product page (complementary and frequently-bought-together), and post-purchase (replenishment and adjacent category suggestions served via email trigger).",
    integrations: "Shopify · Klaviyo · Google Analytics 4 · Custom product taxonomy",
    results: [
      "Conversion rate: from 2.1% to 2.84% — +35% lift (target was 15%)",
      "Revenue attributed to recommendations engine in first 90 days: $280K incremental",
      "Email recommendation click-through rate: 4.1× higher than previous static emails",
      "Return customer purchase rate: up 22%",
    ],
    different:
      "We built the product taxonomy ourselves because the client's existing tagging was inconsistent. In retrospect, we should have run a 2-week taxonomy sprint with the client's merchandising team before building — their product knowledge would have improved model accuracy in the first 30 days.",
  },
  {
    eyebrow: "CASE STUDY 03 · SAAS / ANALYTICS · 5 WEEKS",
    metric: "10×",
    headline: "10× faster insights. The analyst role redirected from reporting to strategy.",
    brief: {
      Industry: "B2B SaaS (marketing analytics platform)",
      "Company size": "60 staff, 2-person data/analytics team",
      Engagement: "Discovery Sprint + Build & Integrate",
      Timeline: "5 weeks build",
      "Success metric agreed": "Reduce time spent on weekly reporting by 70%",
      Outcome: "Reporting time reduced by ~85% — insights delivered 10× faster",
    },
    problem:
      "The analytics team spent roughly 60% of their working week generating standard reports — weekly performance dashboards for internal stakeholders and client-facing reports for 40+ clients. The reports were valuable. The manual process of pulling, formatting, and distributing them was not. The team had the capability to do genuine analytical work. The reporting workload left almost no time for it.",
    built:
      "An automated intelligence layer that generates, formats, and distributes standard reports with no human involvement — and surfaces anomalies and insights that previously required an analyst to spot. The system pulls from the client's data warehouse on a schedule, generates plain-English summaries of performance trends, flags statistically significant changes, and distributes formatted reports to the right stakeholder via email and Slack.",
    integrations: "BigQuery · Looker Studio · Slack · Sendgrid · Client's proprietary data pipeline",
    results: [
      "Time spent on standard reporting: down ~85% (target was 70%)",
      "Time to insight delivery: from 3–4 days to same-day",
      "Anomalies caught in first 90 days that were previously missed: 7 significant performance issues flagged before clients noticed",
      "Analyst capacity redirected to strategic work: ~12 additional hours per analyst per week",
    ],
    different:
      "The Slack integration took longer than scoped because the client's Slack workspace had a non-standard permissions structure. We now do a Slack/comms audit as standard in the discovery phase for any engagement involving notification or distribution systems.",
  },
];

export default function Work() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--liquid-gold)" }}>
            THE WORK
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight" style={{ color: "var(--warm-cream)" }}>
            The proof. Specific numbers. Real systems.
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
            Every project starts with a measurable target. Every case study below reports against that target. No "we improved efficiency" — just the number we agreed, and whether we hit it.
          </p>
        </div>
      </section>

      {/* Case studies */}
      {caseStudies.map((cs, idx) => (
        <section
          key={idx}
          className="py-24 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: idx % 2 === 0 ? "var(--warm-cream)" : "white" }}
        >
          <div className="max-w-7xl mx-auto">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
              {cs.eyebrow}
            </p>
            <div className="text-7xl font-bold mb-4" style={{ color: "var(--midnight-ink)" }}>
              {cs.metric}
            </div>
            <h2 className="text-3xl font-bold mb-10 max-w-2xl" style={{ color: "var(--midnight-ink)" }}>
              {cs.headline}
            </h2>

            {/* Brief table */}
            <div className="mb-10 rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(15,21,38,0.1)" }}>
              {Object.entries(cs.brief).map(([k, v], i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 md:grid-cols-3 border-b last:border-b-0"
                  style={{ borderColor: "rgba(15,21,38,0.08)", backgroundColor: i % 2 === 0 ? "rgba(15,21,38,0.02)" : "transparent" }}
                >
                  <div className="px-5 py-3 text-sm font-medium" style={{ color: "rgba(15,21,38,0.5)" }}>{k}</div>
                  <div className="px-5 py-3 text-sm md:col-span-2" style={{ color: "var(--midnight-ink)" }}>{v}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: "rgba(15,21,38,0.4)" }}>The problem</h3>
                <p className="text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>{cs.problem}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: "rgba(15,21,38,0.4)" }}>What we built</h3>
                <p className="text-base leading-relaxed mb-3" style={{ color: "rgba(15,21,38,0.7)" }}>{cs.built}</p>
                <p className="text-sm font-medium" style={{ color: "rgba(15,21,38,0.5)" }}>
                  <span className="font-semibold">Key integrations: </span>{cs.integrations}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: "rgba(15,21,38,0.4)" }}>The result</h3>
                <ul className="space-y-2">
                  {cs.results.map((r, i) => (
                    <li key={i} className="text-base leading-relaxed flex gap-2" style={{ color: "rgba(15,21,38,0.7)" }}>
                      <span className="mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}>✓</span>
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: "rgba(15,21,38,0.04)" }}>
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "rgba(15,21,38,0.4)" }}>What we'd do differently</h4>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(15,21,38,0.6)" }}>{cs.different}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* More coming */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)", borderTop: "1px solid rgba(15,21,38,0.08)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--midnight-ink)" }}>
            More case studies added as engagements are completed.
          </h2>
          <p className="text-base mb-6" style={{ color: "rgba(15,21,38,0.65)" }}>
            We don't publish case studies until we've measured the outcome against the metric we agreed in Phase 1. That's why this page grows slowly — and why every number on it is real.
          </p>
          <a href="/contact" className="text-sm font-semibold underline" style={{ color: "var(--midnight-ink)" }}>
            If you're curious whether we've worked on a problem similar to yours, ask us directly →
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "var(--warm-cream)" }}>
            Ready to be the next case study?
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(245,240,232,0.65)" }}>
            Every engagement starts the same way: we agree the metric that defines success before we build anything. If we hit it, you get a result you can point to. If we don't, we stay until we do.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}
            >
              Book a call <ArrowRight size={18} />
            </a>
            <a
              href="/process"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold border transition-all hover:opacity-80"
              style={{ borderColor: "rgba(245,240,232,0.3)", color: "var(--warm-cream)" }}
            >
              See our process
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
