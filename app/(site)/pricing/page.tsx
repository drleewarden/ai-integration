import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "AI Implementation Pricing Australia | Published Rates | Creative Milk",
  description:
    "Creative Milk publishes AI implementation pricing. Discovery Sprint from AUD $5K. Build & Integrate from $30K. Managed Partnership from $5K/month. No hidden fees.",
};

const faqs = [
  {
    q: "Is there flexibility in the pricing?",
    a: "The price ranges reflect real variation in engagement complexity. A Discovery Sprint for a single process with a clean tech stack costs less than one scoping multiple integrations across a complex stack. Phase 2 pricing is fixed once Phase 1 is complete -- no surprises from that point. We don't negotiate on price for the same scope.",
  },
  {
    q: "Do we need to do all three phases?",
    a: "No. Each phase stands alone. The Discovery Sprint is a contained engagement -- you get a plan and a recommendation. Phase 2 requires Phase 1 because the scope and fixed price are determined there. Phase 3 is optional -- many clients run their system independently after Phase 2.",
  },
  {
    q: "What if the system doesn't hit the success metric?",
    a: "We define the success metrics together in Phase 1. If Phase 2 doesn't hit them, we stay involved until it does. That's part of what the 95% outcome rate means -- we don't declare something done until the outcome is real.",
  },
  {
    q: "Can we start with a smaller engagement?",
    a: "The Discovery Sprint is the entry point. At AUD $5,000–$15,000, it's the lowest-risk way to find out whether AI is the right answer for your specific problem, what it would cost to build, and what outcome you'd expect.",
  },
  {
    q: "What's your capacity?",
    a: "We take a limited number of engagements at any one time. If we're at capacity, we'll tell you when we can start and give you the option of being on the list. We don't rush engagements to fit more in -- that's how 95% outcome rates drop.",
  },
  {
    q: "Do you work with businesses outside Melbourne?",
    a: "Yes. Discovery Sprints are mostly remote -- we can run them anywhere. For Phase 2 builds requiring on-site work, we travel. We've worked with businesses across Australia.",
  },
];

const phases = [
  {
    num: "Phase 01",
    title: "Discovery Sprint",
    price: "AUD $5K–$15K",
    meta: "1–2 weeks · Can stand alone",
    body: "The Discovery Sprint is a scoped investigation into your specific business problem. We spend 1–2 weeks understanding your processes, your stack, and the opportunity. We come out with a specific system design, agreed success metrics, a go/no-go recommendation, and a fixed-price Phase 2 proposal if we both want to proceed. The plan is yours -- no obligation to proceed with us.",
    priceNote: [
      "Lower ($5K): single process, clear brief, simple tech stack",
      "Upper ($15K): multiple processes, complex integrations, larger stakeholder group",
    ],
    deliverables: [
      "Process audit and opportunity map",
      "Scoped system design",
      "Agreed success metric",
      "Go/no-go recommendation with supporting rationale",
      "Fixed-price Phase 2 proposal (if applicable)",
      "The plan is yours -- no obligation to proceed with us",
    ],
  },
  {
    num: "Phase 02",
    title: "Build & Integrate",
    price: "AUD $30K–$120K",
    meta: "4–6 weeks · Requires Phase 1",
    body: "We build the system to the specification from Phase 1. Production-ready, integrated into your existing stack, with change management and team training included as standard. IP transfers to you on completion.",
    priceNote: [
      "Lower ($30K): single integration, defined scope, small team",
      "Upper ($120K): multiple integrations, complex data pipelines, larger team, extensive training",
    ],
    deliverables: [
      "Production AI system running in your stack",
      "Full IP transfer -- code, documentation, model",
      "Team training and adoption plan (standard)",
      "30-day post-launch support window",
      "Outcome measurement framework",
    ],
  },
  {
    num: "Phase 03",
    title: "Managed Partnership",
    price: "AUD $5K–$15K/mo",
    meta: "Ongoing · Optional",
    body: "Ongoing optimisation, performance monitoring, and strategic advisory. We stay close as the system processes real data and improves over time. Monthly reporting against Phase 1 success metrics. Direct access to Craig and Darryn. Typically a 3-month minimum, month-to-month thereafter.",
    priceNote: [
      "Lower ($5K/month): monitoring and reporting only, stable system",
      "Upper ($15K/month): active optimisation, model retraining, expansion planning",
    ],
    deliverables: [],
  },
];

const reasons = [
  {
    num: "01",
    title: "It respects your time",
    body: "Professional services buyers make better decisions with real numbers. If our engagement costs are outside your budget, it's better for both of us to know before the first call.",
  },
  {
    num: "02",
    title: "It signals how we work",
    body: "Agencies that hide pricing often have flexible pricing -- meaning the price depends on what they think you'll pay. We don't work that way. Our prices reflect the scope and complexity of the work.",
  },
  {
    num: "03",
    title: "It creates better conversations",
    body: "When you know what things cost, we can have a real conversation about what's worth doing. The first call becomes about the problem -- not a quote request.",
  },
];

export default function Pricing() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <main id="main">

        {/* ── Hero ── */}
        <section
          className="section"
          style={{
            backgroundColor: "var(--midnight-ink)",
            paddingTop: "clamp(6rem, 12vw, 9rem)",
          }}
        >
          <div className="container">
            <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>Pricing</p>
            <h1
              className="h-display"
              style={{
                fontSize: "clamp(2.75rem, 7vw, 6rem)",
                color: "var(--warm-cream)",
                maxWidth: "18ch",
                marginBottom: "1.5rem",
              }}
            >
              Most AI agencies won't tell you what it costs.{" "}
              <em className="gold">We will.</em>
            </h1>
            <p
              className="body-copy"
              style={{
                maxWidth: "52ch",
                color: "rgba(245,240,232,0.6)",
                fontSize: "1.05rem",
                lineHeight: 1.7,
              }}
            >
              We publish our pricing because we think hiding it wastes everyone's time. If the
              numbers don't fit your budget, we'd rather you know now. If they do -- let's talk
              about what we'd build.
            </p>
          </div>
        </section>

        {/* ── Phases ── */}
        <section
          className="section"
          style={{ backgroundColor: "var(--warm-cream)" }}
        >
          <div className="container">
            <p
              className="body-copy"
              style={{
                maxWidth: "56ch",
                marginBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                color: "var(--slate-mid)",
              }}
            >
              Every Creative Milk engagement follows the same three-phase architecture. Each phase
              can stand alone. Most clients proceed through all three.
            </p>

            {phases.map((phase, idx) => (
              <div
                key={idx}
                style={{
                  borderTop: "1px solid var(--rule)",
                  marginBottom: 0,
                  overflow: "hidden",
                }}
              >
                {/* Phase header */}
                <div
                  style={{
                    backgroundColor: "var(--midnight-ink)",
                    padding: "clamp(1.25rem, 2vw, 1.75rem) clamp(1.5rem, 3vw, 2.5rem)",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <p className="eyebrow no-rule" style={{ marginBottom: "0.35rem" }}>
                      {phase.num}
                    </p>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                        fontWeight: 300,
                        color: "var(--warm-cream)",
                        lineHeight: 1.1,
                      }}
                    >
                      {phase.title}
                    </h2>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                        fontWeight: 300,
                        color: "var(--liquid-gold)",
                        lineHeight: 1,
                        marginBottom: "0.3rem",
                      }}
                    >
                      {phase.price}
                    </p>
                    <p
                      className="label"
                      style={{ color: "rgba(245,240,232,0.45)" }}
                    >
                      {phase.meta}
                    </p>
                  </div>
                </div>

                {/* Phase body */}
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "clamp(1.75rem, 3vw, 2.5rem) clamp(1.5rem, 3vw, 2.5rem)",
                    display: "grid",
                    gridTemplateColumns: phase.deliverables.length > 0 ? "1fr 1fr" : "1fr 1fr",
                    gap: "clamp(2rem, 4vw, 3.5rem)",
                  }}
                >
                  <div>
                    <p
                      className="body-copy"
                      style={{ color: "var(--slate-mid)", lineHeight: 1.75, marginBottom: "1.25rem" }}
                    >
                      {phase.body}
                    </p>
                    {idx === 1 && (
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "var(--midnight-ink)",
                          marginBottom: "1rem",
                        }}
                      >
                        The Phase 2 price is fixed at the end of Phase 1. No surprises.
                      </p>
                    )}
                    <div
                      style={{
                        backgroundColor: "rgba(15,21,38,0.04)",
                        padding: "1rem 1.25rem",
                      }}
                    >
                      <p
                        className="label"
                        style={{ color: "var(--slate-mid)", marginBottom: "0.5rem" }}
                      >
                        What affects the price
                      </p>
                      {phase.priceNote.map((note, ni) => (
                        <p
                          key={ni}
                          className="body-copy"
                          style={{
                            color: "var(--slate-mid)",
                            marginTop: ni > 0 ? "0.35rem" : 0,
                          }}
                        >
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>
                  {phase.deliverables.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {phase.deliverables.map((item, di) => (
                        <li
                          key={di}
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            padding: "0.625rem 0",
                            borderBottom:
                              di < phase.deliverables.length - 1
                                ? "1px solid var(--rule)"
                                : "none",
                            alignItems: "flex-start",
                          }}
                        >
                          <span
                            style={{
                              flexShrink: 0,
                              width: "1rem",
                              height: "1rem",
                              marginTop: "0.15rem",
                              backgroundColor: "var(--liquid-gold)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.6rem",
                              color: "var(--midnight-ink)",
                              fontWeight: 700,
                            }}
                          >
                            ✓
                          </span>
                          <span
                            className="body-copy"
                            style={{ color: "var(--slate-mid)" }}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--rule)" }} />
          </div>
        </section>

        {/* ── Why we publish ── */}
        <section
          className="section"
          style={{ backgroundColor: "var(--midnight-ink)" }}
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: "clamp(3rem, 6vw, 6rem)",
                alignItems: "end",
                marginBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                paddingBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                borderBottom: "1px solid var(--rule-cream)",
              }}
            >
              <h2
                className="h-section"
                style={{ color: "var(--warm-cream)" }}
              >
                Three reasons we put numbers on the page.
              </h2>
              <p
                className="body-copy"
                style={{ color: "rgba(245,240,232,0.55)" }}
              >
                It's not a bold move. It's just what professional services should look like.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
              {reasons.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: "clamp(2rem, 3vw, 3rem)",
                    borderRight: i < reasons.length - 1
                      ? "1px solid var(--rule-cream)"
                      : "none",
                  }}
                >
                  <p
                    className="eyebrow no-rule"
                    style={{ marginBottom: "1rem" }}
                  >
                    {r.num}
                  </p>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.2rem, 2vw, 1.5rem)",
                      fontWeight: 300,
                      color: "var(--warm-cream)",
                      marginBottom: "0.75rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {r.title}
                  </h3>
                  <p
                    className="body-copy"
                    style={{ color: "rgba(245,240,232,0.55)" }}
                  >
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQs ── */}
        <section
          className="section"
          style={{ backgroundColor: "var(--warm-cream)", borderBottom: "1px solid var(--rule)" }}
        >
          <div className="container" style={{ maxWidth: "740px" }}>
            <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>Common questions</p>
            <h2
              className="h-section"
              style={{ color: "var(--midnight-ink)", marginBottom: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Pricing FAQs
            </h2>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  padding: "1.5rem 0",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--midnight-ink)",
                    marginBottom: "0.6rem",
                  }}
                >
                  {faq.q}
                </h3>
                <p
                  className="body-copy"
                  style={{ color: "var(--slate-mid)", lineHeight: 1.75 }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="section"
          style={{ backgroundColor: "var(--midnight-ink)" }}
        >
          <div
            className="container"
            style={{ textAlign: "center", maxWidth: "52ch", marginInline: "auto" }}
          >
            <h2
              className="h-section"
              style={{ color: "var(--warm-cream)", marginBottom: "1.25rem" }}
            >
              Ready to see what we'd build for your budget?
            </h2>
            <p
              className="body-copy"
              style={{
                color: "rgba(245,240,232,0.6)",
                marginBottom: "2.5rem",
                fontSize: "1rem",
              }}
            >
              Tell us about your problem and your rough budget range. We'll tell you which phase
              makes sense to start with and what we'd expect to find in a Discovery Sprint.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <a href="/contact" className="cta cta-gold">
                Book a call <ArrowRight size={16} />
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
