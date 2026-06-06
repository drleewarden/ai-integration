import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { ServiceSchema, BreadcrumbSchema } from "../../components/Schema";

export const metadata: Metadata = {
  title: "What AI Can Do For Your Business | Use Cases & Applications | Creative Milk",
  description:
    "Practical AI applications for Australian businesses -- customer support, sales intelligence, operations automation, document processing, and more. Real systems with real outcomes. Creative Milk.",
};

const useCases = [
  {
    number: "01",
    category: "Customer Support & Triage",
    headline: "Stop your best people from answering the same question 40 times a day.",
    body: "Most support queues are 60–70% tier-1 queries -- password resets, billing questions, feature how-tos -- that follow predictable patterns and require no human judgement. AI handles these end-to-end. What's left for your team is the work that actually needs them.",
    builds: [
      "Intelligent ticket triage and auto-resolution systems",
      "AI-powered knowledge base with real-time update capability",
      "Escalation routing with pre-populated context for the support agent",
      "Multi-channel coverage: email, chat, in-app",
    ],
    outcomes: [
      "60% reduction in tier-1 ticket volume",
      "34% reduction in average handling time on escalated tickets",
      "Support team NPS improvement -- staff report higher satisfaction on complex work",
    ],
    caseStudy: "How we cut support volume 60% for a SaaS platform",
    fit: "Businesses with 500+ tickets/week and a repeating pattern in tier-1 queries",
  },
  {
    number: "02",
    category: "Sales & Revenue Intelligence",
    headline: "Stop leaving revenue in the data you already have.",
    body: "E-commerce businesses are sitting on purchase history, browse behaviour, and session data that most of them never fully use. AI turns that data into personalised product and content experiences that convert at a measurably higher rate -- without increasing ad spend.",
    builds: [
      "Personalised product recommendation engines (homepage, PDP, post-purchase)",
      "Dynamic pricing models for inventory management and margin optimisation",
      "Customer lifetime value prediction and segmentation",
      "Abandoned cart and replenishment trigger systems",
    ],
    outcomes: [
      "+35% conversion rate lift from personalisation",
      "4.1× email recommendation click-through rate",
      "22% increase in return customer purchase rate",
    ],
    caseStudy: "How we delivered +35% conversion for an e-commerce business",
    fit: "E-commerce businesses with 12+ months of transaction data and returning customers",
  },
  {
    number: "03",
    category: "Operations & Workflow Automation",
    headline: "The manual processes that eat your team's week don't have to.",
    body: "Operations work -- data entry, report generation, approval routing, document processing, scheduling -- follows rules. Rules can be automated. The question isn't whether it's possible; it's which processes are worth automating first, and in what order they compound.",
    builds: [
      "End-to-end workflow automation for approval, routing, and notification chains",
      "Data entry and form processing automation",
      "Document classification, extraction, and filing systems",
      "Scheduling and resource allocation optimisation",
    ],
    outcomes: [
      "40–60% reduction in manual data entry hours",
      "2–3 day process cycle times compressed to same-day",
      "Error rates in manual data processes reduced to near-zero",
    ],
    caseStudy: null,
    fit: "Businesses where staff spend 30%+ of their week on repeatable, rules-based tasks",
  },
  {
    number: "04",
    category: "Data & Reporting Automation",
    headline: "Stop paying your analysts to pull reports. Start paying them to think.",
    body: "Standard reporting -- weekly dashboards, client reports, performance summaries -- is valuable. The manual process of generating it is not. AI handles the data pull, the formatting, the distribution, and the anomaly detection. Your analysts focus on what the numbers mean and what to do about them.",
    builds: [
      "Automated report generation and distribution (scheduled or triggered)",
      "Anomaly detection and intelligent alerting",
      "Plain-English performance summaries generated from structured data",
      "Decision-support dashboards that surface insights, not just data",
    ],
    outcomes: [
      "85% reduction in time spent on standard reporting",
      "10× faster delivery from data event to insight",
      "Anomalies caught automatically that were previously missed for days or weeks",
    ],
    caseStudy: "How we gave a SaaS analytics team 12 hours back per week",
    fit: "Teams running 10+ regular reports and spending more than 20% of analyst time on report generation",
  },
  {
    number: "05",
    category: "Document Processing & Extraction",
    headline: "Documents are where professional services businesses lose the most time.",
    body: "Accounting firms, law firms, financial advisers, and construction businesses process enormous volumes of documents -- contracts, invoices, applications, compliance forms. Reading, classifying, extracting data from, and routing these documents is skilled but time-consuming work. AI handles the routine volume. Your team handles the judgement calls.",
    builds: [
      "Contract review and clause extraction systems",
      "Invoice and purchase order processing automation",
      "Compliance document classification and flagging",
      "Application intake processing (for financial, legal, NDIS contexts)",
    ],
    outcomes: [
      "70–80% reduction in document processing time",
      "Same-day turnaround on intake documents previously taking 2–3 days",
      "Compliance flag accuracy exceeding manual review rates",
    ],
    caseStudy: null,
    fit: "Professional services businesses processing 50+ structured documents per week",
  },
  {
    number: "06",
    category: "Knowledge Management & Search",
    headline: "What if every new team member could access the knowledge of your most experienced one?",
    body: "Growing businesses accumulate knowledge in the heads of their longest-serving people. When those people are unavailable -- or when they leave -- that knowledge walks out with them. AI knowledge systems capture, organise, and make that expertise accessible to the whole team in real time.",
    builds: [
      "Internal AI knowledge assistants trained on company documentation and processes",
      "Onboarding acceleration systems (new team members ask, the system answers)",
      "Meeting intelligence and action extraction",
      "SOPs and process documentation automation",
    ],
    outcomes: [
      "New hire time-to-productivity reduced by 30–40%",
      "Reduction in repeated questions to senior staff",
      "Documentation coverage improvement from ad hoc to systematic",
    ],
    caseStudy: null,
    fit: "Businesses growing headcount and experiencing knowledge transfer friction",
  },
];

const industries = [
  { name: "Professional Services", sub: "Accounting, legal, financial advice", problems: "Document processing, client intake, compliance, reporting" },
  { name: "Financial Services", sub: null, problems: "Document review, compliance flagging, reporting automation, client servicing" },
  { name: "Retail & E-Commerce", sub: null, problems: "Recommendations, personalisation, inventory, customer retention" },
  { name: "Healthcare & Allied Health", sub: null, problems: "Intake, scheduling, compliance documentation, care coordination" },
  { name: "Logistics & Distribution", sub: null, problems: "Scheduling, route optimisation, exception handling, reporting" },
];

export default function WhatWeBuild() {
  return (
    <>
      <ServiceSchema />
      <BreadcrumbSchema items={[
        { name: 'Home', url: '/' },
        { name: 'What We Build', url: '/what-we-build' },
      ]} />
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
            <span className="eyebrow" style={{ marginBottom: "1.5rem" }}>What We Build</span>
            <h1
              className="h-display"
              style={{
                color: "var(--warm-cream)",
                fontSize: "clamp(3rem, 7vw, 6rem)",
                maxWidth: "18ch",
                marginTop: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              Here's what AI actually does for a business <em className="gold">like yours.</em>
            </h1>
            <p
              className="body-copy"
              style={{
                maxWidth: "52ch",
                color: "rgba(245,240,232,0.65)",
                marginBottom: "1.25rem",
              }}
            >
              Not a list of tools. Not a buzzword glossary. Real systems, organised by the type of problem
              you're trying to solve. Find your situation and see what's been built for businesses in exactly
              the same position.
            </p>
            <p
              className="label"
              style={{ color: "rgba(245,240,232,0.4)" }}
            >
              We've applied AI to 50+ business problems. These are the categories where we see the most consistent, measurable impact.
            </p>
          </div>
        </section>

        {/* Use cases */}
        {useCases.map((uc, idx) => (
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
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)",
                  gap: "clamp(2rem,5vw,5rem)",
                  alignItems: "end",
                  paddingBottom: "clamp(2rem,4vw,3.5rem)",
                  borderBottom: "1px solid var(--rule)",
                  marginBottom: "clamp(2rem,4vw,3.5rem)",
                }}
              >
                <div>
                  <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                    {uc.number} -- {uc.category}
                  </span>
                  <h2
                    className="h-section"
                    style={{ color: "var(--midnight-ink)", marginTop: "1rem" }}
                  >
                    {uc.headline}
                  </h2>
                </div>
                <p
                  className="body-copy"
                  style={{ maxWidth: "44ch", justifySelf: "end" }}
                >
                  {uc.body}
                </p>
              </div>

              {/* Content grid */}
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
                  <h3 className="label" style={{ color: "var(--slate-mid)", marginBottom: "1.25rem" }}>
                    What we build
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {uc.builds.map((b, i) => (
                      <li
                        key={i}
                        className="body-copy"
                        style={{
                          color: "rgba(15,21,38,0.7)",
                          display: "flex",
                          gap: "0.75rem",
                          marginBottom: "0.65rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            color: "var(--liquid-gold)",
                            fontFamily: "var(--font-mono)",
                            fontSize: "1rem",
                            lineHeight: 1.4,
                          }}
                        >
                          --
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </article>

                <article
                  style={{
                    padding: "clamp(2rem,3vw,3rem)",
                    borderRight: "1px solid var(--rule)",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  <h3 className="label" style={{ color: "var(--slate-mid)", marginBottom: "1.25rem" }}>
                    Outcomes we've measured
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem" }}>
                    {uc.outcomes.map((o, i) => (
                      <li
                        key={i}
                        className="body-copy"
                        style={{
                          color: "rgba(15,21,38,0.7)",
                          display: "flex",
                          gap: "0.75rem",
                          marginBottom: "0.65rem",
                          fontSize: "0.875rem",
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
                        {o}
                      </li>
                    ))}
                  </ul>
                </article>

                <article
                  style={{
                    padding: "clamp(2rem,3vw,3rem)",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  <h3 className="label" style={{ color: "var(--slate-mid)", marginBottom: "1.25rem" }}>
                    Best fit
                  </h3>
                  <p
                    className="body-copy"
                    style={{
                      color: "rgba(15,21,38,0.7)",
                      fontSize: "0.875rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {uc.fit}
                  </p>
                  {uc.caseStudy && (
                    <a href="/work" className="cta-link">
                      {uc.caseStudy} <ArrowRight size={11} />
                    </a>
                  )}
                </article>
              </div>
            </div>
          </section>
        ))}

        {/* Industries */}
        <section className="section" style={{ backgroundColor: "var(--midnight-ink)" }}>
          <div className="container">
            {/* Section header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)",
                gap: "clamp(2rem,5vw,5rem)",
                alignItems: "end",
                paddingBottom: "clamp(2rem,4vw,3.5rem)",
                borderBottom: "1px solid var(--rule-cream)",
                marginBottom: "clamp(2rem,4vw,3.5rem)",
              }}
            >
              <div>
                <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>Industries</span>
                <h2
                  className="h-section"
                  style={{ color: "var(--warm-cream)", marginTop: "1rem" }}
                >
                  Every industry has different AI leverage points.{" "}
                  <em className="gold">Find yours.</em>
                </h2>
              </div>
              <p
                className="body-copy"
                style={{
                  maxWidth: "44ch",
                  justifySelf: "end",
                  color: "rgba(245,240,232,0.55)",
                }}
              >
                Industry-specific pages coming soon. In the meantime, book a call and we'll walk through
                what we'd target first in your sector.
              </p>
            </div>

            {/* Industry grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
              }}
            >
              {industries.map((ind, i) => (
                <article
                  key={i}
                  style={{
                    padding: "clamp(1.75rem,2.5vw,2.5rem)",
                    borderRight: "1px solid var(--rule-cream)",
                    borderBottom: "1px solid var(--rule-cream)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: "1.15rem",
                      color: "var(--warm-cream)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {ind.name}
                  </h3>
                  {ind.sub && (
                    <p className="label" style={{ color: "rgba(245,240,232,0.4)", marginBottom: "0.85rem" }}>
                      {ind.sub}
                    </p>
                  )}
                  <p className="body-copy" style={{ fontSize: "0.825rem", color: "rgba(245,240,232,0.5)" }}>
                    {ind.problems}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section" style={{ backgroundColor: "var(--warm-cream)" }}>
          <div className="container" style={{ maxWidth: "760px", textAlign: "center" }}>
            <span className="eyebrow" style={{ marginBottom: "1.5rem", justifyContent: "center" }}>
              Start here
            </span>
            <h2
              className="h-section"
              style={{
                color: "var(--midnight-ink)",
                marginTop: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              Tell us the problem. We'll tell you where AI fits -- <em className="gold">if it does.</em>
            </h2>
            <p
              className="body-copy"
              style={{
                maxWidth: "54ch",
                margin: "0 auto 2.5rem",
              }}
            >
              Some businesses come to us knowing exactly what they want to automate. Most don't. That's fine --
              finding the right starting point is exactly what the Discovery Sprint is for. We scope the problem,
              assess the opportunity, and give you an honest recommendation on whether AI is the right answer.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/contact" className="cta cta-ink">
                Book a call <ArrowRight size={14} />
              </a>
              <a href="/process" className="cta cta-outline-ink">
                See how our process works
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
