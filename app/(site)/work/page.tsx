import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "AI Implementation Case Studies Australia | Real Outcomes | Creative Milk",
  description:
    "See Creative Milk's AI implementation results. 60% support reduction, +35% conversion, 10× faster insights. Real systems, real numbers. Book a call.",
};

const caseStudies = [
  {
    eyebrow: "CASE STUDY 01 · CUSTOMER SUPPORT · 6 WEEKS",
    metric: "−60%",
    headline: "60% reduction in support ticket volume -- in the first month after launch.",
    brief: {
      Industry: "SaaS / Customer Support Platform",
      "Company size": "~120 staff, 3-person support team",
      Engagement: "Discovery Sprint + Build & Integrate",
      Timeline: "6 weeks build",
      "Success metric agreed": "Reduce tier-1 support volume by 40% within 60 days of launch",
      Outcome: "60% reduction in tier-1 volume -- Month 1",
    },
    problem:
      "The support team was handling approximately 800 tickets per week. Roughly 70% were tier-1 queries -- password resets, billing questions, feature how-tos -- that required no human judgement. The team was buried in work that didn't need them. Response times were blowing out. They'd tried a basic chatbot 18 months earlier. The team hated it because it gave wrong answers and created more escalations than it resolved.",
    built:
      "An intelligent triage and resolution layer that sits between the customer and the support queue. The system classifies incoming tickets by type and intent in real time and resolves tier-1 queries directly using a knowledge base we built and maintain. Queries requiring human judgement are passed to the team with a suggested response and relevant context pulled from the customer's account history.",
    integrations: "Zendesk · Stripe (billing data) · Product knowledge base · Account database",
    results: [
      "Tier-1 ticket volume: down 60% in Month 1 (target was 40%)",
      "Average response time on remaining human-handled tickets: down 34%",
      "Support team NPS: improved -- staff reported higher job satisfaction",
    ],
    different:
      "The knowledge base we built from scratch took longer than anticipated because the client's existing documentation was fragmented across four systems. We now scope a documentation consolidation phase before any knowledge-base-dependent build -- it's 3–5 days of work that saves 2–3 weeks later.",
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
      Outcome: "+35% conversion rate -- measured at 90 days",
    },
    problem:
      "The business was spending heavily on paid acquisition -- Google and Meta -- but conversion rate had plateaued at around 2.1% for 18 months. The site served the same product grid to every visitor regardless of their browse history, purchase patterns, or intent signals. Return customers -- the most valuable segment -- were getting no personalisation signal at all.",
    built:
      "A personalised recommendations engine that surfaces product content based on individual customer behaviour, purchase history, and real-time session signals. The system runs three recommendation layers: homepage (based on return-visit behaviour), product page (complementary and frequently-bought-together), and post-purchase (replenishment and adjacent category suggestions served via email trigger).",
    integrations: "Shopify · Klaviyo · Google Analytics 4 · Custom product taxonomy",
    results: [
      "Conversion rate: from 2.1% to 2.84% -- +35% lift (target was 15%)",
      "Revenue attributed to recommendations engine in first 90 days: $280K incremental",
      "Email recommendation click-through rate: 4.1× higher than previous static emails",
      "Return customer purchase rate: up 22%",
    ],
    different:
      "We built the product taxonomy ourselves because the client's existing tagging was inconsistent. In retrospect, we should have run a 2-week taxonomy sprint with the client's merchandising team before building -- their product knowledge would have improved model accuracy in the first 30 days.",
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
      Outcome: "Reporting time reduced by ~85% -- insights delivered 10× faster",
    },
    problem:
      "The analytics team spent roughly 60% of their working week generating standard reports -- weekly performance dashboards for internal stakeholders and client-facing reports for 40+ clients. The reports were valuable. The manual process of pulling, formatting, and distributing them was not. The team had the capability to do genuine analytical work. The reporting workload left almost no time for it.",
    built:
      "An automated intelligence layer that generates, formats, and distributes standard reports with no human involvement -- and surfaces anomalies and insights that previously required an analyst to spot. The system pulls from the client's data warehouse on a schedule, generates plain-English summaries of performance trends, flags statistically significant changes, and distributes formatted reports to the right stakeholder via email and Slack.",
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
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <main id="main">
        {/* Hero */}
        <section
          className="section"
          style={{
            backgroundColor: "var(--midnight-ink)",
            paddingTop: "clamp(6rem, 12vw, 9rem)",
          }}
        >
          <div className="container">
            <span className="eyebrow" style={{ marginBottom: "1.5rem" }}>The Work</span>
            <h1
              className="h-display"
              style={{
                color: "var(--warm-cream)",
                fontSize: "clamp(3rem, 7vw, 6rem)",
                maxWidth: "16ch",
                marginTop: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              The proof. Specific numbers. <em className="gold">Real systems.</em>
            </h1>
            <p
              className="body-copy"
              style={{
                maxWidth: "52ch",
                color: "rgba(245,240,232,0.65)",
              }}
            >
              Every project starts with a measurable target. Every case study below reports against that target.
              No "we improved efficiency" -- just the number we agreed, and whether we hit it.
            </p>
          </div>
        </section>

        {/* Case studies */}
        {caseStudies.map((cs, idx) => (
          <section
            key={idx}
            className="section"
            style={{
              backgroundColor: idx % 2 === 0 ? "var(--warm-cream)" : "var(--off-white)",
            }}
          >
            <div className="container">
              {/* Section header */}
              <div
                style={{
                  paddingBottom: "clamp(2rem,4vw,3.5rem)",
                  borderBottom: "1px solid var(--rule)",
                  marginBottom: "clamp(2rem,4vw,3.5rem)",
                }}
              >
                <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>{cs.eyebrow}</span>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 300,
                    fontSize: "clamp(4rem, 10vw, 8rem)",
                    lineHeight: 0.9,
                    letterSpacing: "-0.02em",
                    color: "var(--liquid-gold)",
                    margin: "1rem 0 1.25rem",
                  }}
                >
                  {cs.metric}
                </div>
                <h2
                  className="h-section"
                  style={{ color: "var(--midnight-ink)", maxWidth: "36ch", marginTop: 0 }}
                >
                  {cs.headline}
                </h2>
              </div>

              {/* Brief table */}
              <div
                style={{
                  border: "1px solid var(--rule)",
                  marginBottom: "clamp(2rem,4vw,3.5rem)",
                  overflow: "hidden",
                }}
              >
                {Object.entries(cs.brief).map(([k, v], i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(160px, 1fr) 2fr",
                      borderBottom: i < Object.entries(cs.brief).length - 1 ? "1px solid var(--rule)" : "none",
                      backgroundColor: i % 2 === 0 ? "rgba(15,21,38,0.025)" : "transparent",
                    }}
                  >
                    <div
                      className="label"
                      style={{ padding: "0.85rem 1.25rem", color: "var(--slate-mid)" }}
                    >
                      {k}
                    </div>
                    <div
                      className="body-copy"
                      style={{
                        padding: "0.85rem 1.25rem",
                        color: "var(--midnight-ink)",
                        borderLeft: "1px solid var(--rule)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>

              {/* Three columns */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
                }}
              >
                <article
                  style={{
                    padding: "clamp(2rem,3vw,3rem)",
                    borderRight: "1px solid var(--rule)",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  <h3
                    className="label"
                    style={{ color: "var(--slate-mid)", marginBottom: "1rem" }}
                  >
                    The problem
                  </h3>
                  <p className="body-copy" style={{ color: "rgba(15,21,38,0.7)" }}>{cs.problem}</p>
                </article>

                <article
                  style={{
                    padding: "clamp(2rem,3vw,3rem)",
                    borderRight: "1px solid var(--rule)",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  <h3
                    className="label"
                    style={{ color: "var(--slate-mid)", marginBottom: "1rem" }}
                  >
                    What we built
                  </h3>
                  <p className="body-copy" style={{ color: "rgba(15,21,38,0.7)", marginBottom: "1rem" }}>
                    {cs.built}
                  </p>
                  <p
                    className="label"
                    style={{ color: "var(--slate-mid)" }}
                  >
                    <span style={{ fontWeight: 600 }}>Key integrations: </span>{cs.integrations}
                  </p>
                </article>

                <article
                  style={{
                    padding: "clamp(2rem,3vw,3rem)",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  <h3
                    className="label"
                    style={{ color: "var(--slate-mid)", marginBottom: "1rem" }}
                  >
                    The result
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem" }}>
                    {cs.results.map((r, i) => (
                      <li
                        key={i}
                        className="body-copy"
                        style={{
                          color: "rgba(15,21,38,0.7)",
                          display: "flex",
                          gap: "0.75rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            width: "1.25rem",
                            height: "1.25rem",
                            backgroundColor: "var(--liquid-gold)",
                            color: "var(--midnight-ink)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            marginTop: "0.2rem",
                          }}
                        >
                          ✓
                        </span>
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div
                    style={{
                      borderTop: "1px solid var(--rule)",
                      paddingTop: "1.25rem",
                    }}
                  >
                    <h4
                      className="label"
                      style={{ color: "var(--slate-mid)", marginBottom: "0.5rem" }}
                    >
                      What we'd do differently
                    </h4>
                    <p className="body-copy" style={{ color: "rgba(15,21,38,0.6)", fontSize: "0.85rem" }}>
                      {cs.different}
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </section>
        ))}

        {/* More coming */}
        <section
          className="section-tight"
          style={{
            backgroundColor: "var(--warm-cream)",
            borderTop: "1px solid var(--rule)",
          }}
        >
          <div className="container" style={{ maxWidth: "680px" }}>
            <h2
              className="h-section"
              style={{
                color: "var(--midnight-ink)",
                fontSize: "clamp(1.5rem,3vw,2.25rem)",
                marginBottom: "1rem",
              }}
            >
              More case studies added as engagements are completed.
            </h2>
            <p
              className="body-copy"
              style={{ color: "rgba(15,21,38,0.65)", marginBottom: "1.5rem" }}
            >
              We don't publish case studies until we've measured the outcome against the metric we agreed in Phase 1.
              That's why this page grows slowly -- and why every number on it is real.
            </p>
            <a href="/contact" className="cta-link">
              Curious whether we've solved a problem like yours? Ask us directly <ArrowRight size={12} />
            </a>
          </div>
        </section>

        {/* CTA */}
        <section
          className="section"
          style={{ backgroundColor: "var(--midnight-ink)" }}
        >
          <div className="container" style={{ maxWidth: "760px", textAlign: "center" }}>
            <span className="eyebrow" style={{ marginBottom: "1.5rem", justifyContent: "center" }}>
              Next step
            </span>
            <h2
              className="h-section"
              style={{
                color: "var(--warm-cream)",
                marginTop: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              Ready to be the next case study?
            </h2>
            <p
              className="body-copy"
              style={{
                color: "rgba(245,240,232,0.65)",
                maxWidth: "52ch",
                margin: "0 auto 2.5rem",
              }}
            >
              Every engagement starts the same way: we agree the metric that defines success before we build anything.
              If we hit it, you get a result you can point to. If we don't, we stay until we do.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/contact" className="cta cta-gold">
                Book a call <ArrowRight size={14} />
              </a>
              <a href="/process" className="cta cta-outline-cream">
                See our process
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
