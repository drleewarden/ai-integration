import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "AI Implementation Services Australia | 3-Phase Model | Creative Milk",
  description:
    "Custom AI implementation services for Australian businesses. Discovery Sprint from AUD $5K. Build & Integrate from $30K. Published pricing, change management included. Book a call.",
};

const faqs = [
  {
    q: "Do we have to do all three phases?",
    a: "No. Each phase stands alone. Most clients start with a Discovery Sprint, then proceed to Phase 2. Phase 3 is optional and many clients choose to maintain the system internally after Phase 2.",
  },
  {
    q: "What affects the price range within each phase?",
    a: "For the Discovery Sprint: the number of processes in scope and the complexity of your current tech stack. For Phase 2: the complexity of the system, the number of integrations, and the size of the team we're training. The Discovery Sprint locks in a fixed price for Phase 2 before you commit.",
  },
  {
    q: "What if the system doesn't hit the success metrics?",
    a: "We define the success metrics together in Phase 1. If the Phase 2 system doesn't hit them, we stay involved until it does. That's part of what the 95% outcome rate means — we don't declare something done until it works.",
  },
  {
    q: "Who will we work with?",
    a: "Craig and Darryn directly. You won't be handed to a junior consultant or an offshore team. The two founders are accountable for every engagement.",
  },
  {
    q: "Do you work with businesses outside Melbourne?",
    a: "Yes. We work with businesses across Australia. Discovery Sprints and ongoing partnership calls are done remotely. For Phase 2 builds that require on-site work, we travel.",
  },
];

const phase1Deliverables = [
  ["Process audit", "We map your current workflows and identify AI leverage points"],
  ["Stack review", "We assess your existing tech for integration feasibility"],
  ["Problem scoping", "We define one or more specific problems worth solving"],
  ["Success metrics", "We agree the exact outcomes we'll measure"],
  ["Go/no-go recommendation", "Honest advice — including if we think AI isn't the right answer"],
  ["Phase 2 proposal", "Fixed-price, scoped proposal ready to proceed if you choose"],
];

const phase2Deliverables = [
  ["System build", "Custom AI system designed to the Phase 1 specification"],
  ["Stack integration", "Built into your existing tools — no new vendor dependencies"],
  ["Testing & QA", "Validated against the success metrics agreed in Phase 1"],
  ["Change management", "Structured adoption plan for your team — included as standard"],
  ["Team training", "Hands-on sessions so your team owns the system, not just uses it"],
  ["IP transfer", "Full ownership of the system transfers to you on completion"],
  ["Documentation", "Plain-English system documentation for your team and IT"],
  ["30-day post-launch support", "We stay close for the first month to resolve any issues"],
];

const phase3Deliverables = [
  ["Performance monitoring", "Regular review of system output against Phase 1 success metrics"],
  ["Continuous optimisation", "Refinements to the model based on real-world performance data"],
  ["Monthly reporting", "Plain-English report: what the system did, what changed, what's next"],
  ["Strategic advisory", "Access to Craig and Darryn for ongoing AI decisions and expansion"],
  ["Priority support", "Direct line for issues — not a ticketing queue"],
];

const differentiators = [
  {
    title: "Published pricing",
    body: "We're one of the only AI agencies in Australia that publishes what things cost. Professional services buyers make better decisions with real numbers. So do we.",
  },
  {
    title: "Change management standard",
    body: "67–80% of AI projects fail because the team doesn't adopt the system. Every engagement includes a structured adoption plan and hands-on team training. Not as an upsell. As a basic requirement.",
  },
  {
    title: "You own everything",
    body: "We don't build on proprietary platforms that keep you dependent on us. Your system runs on your stack. Your team gets trained to own it. IP transfers on completion.",
  },
];

export default function Services() {
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
            <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>How we work</p>
            <h1
              className="h-display"
              style={{
                fontSize: "clamp(2.75rem, 7vw, 6rem)",
                color: "var(--warm-cream)",
                maxWidth: "18ch",
                marginBottom: "1.5rem",
              }}
            >
              Three phases. <em className="gold">One end-to-end partner.</em>
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
              We don't hand off after the strategy session. We don't disappear after the build
              ships. One engagement takes you from scoped problem to live system to ongoing
              outcomes — with a single partner across all three phases.
            </p>
          </div>
        </section>

        {/* ── Phase 1 ── */}
        <section
          className="section"
          style={{ backgroundColor: "var(--warm-cream)", borderBottom: "1px solid var(--rule)" }}
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: "clamp(3rem, 6vw, 6rem)",
                alignItems: "start",
                marginBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                paddingBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>Phase 01</p>
                <h2
                  className="h-section"
                  style={{ color: "var(--midnight-ink)", marginBottom: "0.5rem" }}
                >
                  Find out exactly what's possible — before you commit to anything.
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                    fontWeight: 300,
                    color: "var(--liquid-gold)",
                    marginTop: "1rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  AUD $5,000–$15,000
                </p>
                <p className="label" style={{ color: "var(--slate-mid)", marginBottom: "1.5rem" }}>
                  1–2 weeks · Can stand alone
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "clamp(1.5rem, 2.5vw, 2rem)",
                  border: "1px solid var(--rule)",
                }}
              >
                <p className="label" style={{ color: "var(--slate-mid)", marginBottom: "0.75rem" }}>
                  Ideal for
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {[
                    "Businesses that aren't sure if AI is right for them",
                    "Teams that have heard the promise before and want proof before committing",
                    "Organisations that want a scoped plan they can take to other providers if they choose",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="body-copy"
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        color: "var(--slate-mid)",
                        padding: "0.5rem 0",
                        borderBottom: i < 2 ? "1px solid var(--rule)" : "none",
                      }}
                    >
                      <span style={{ color: "var(--liquid-gold)", flexShrink: 0 }}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "clamp(2rem, 4vw, 4rem)",
                alignItems: "start",
              }}
            >
              <div
                className="body-copy"
                style={{ color: "var(--slate-mid)", lineHeight: 1.8 }}
              >
                <p style={{ marginBottom: "1rem" }}>
                  Most AI projects fail because nobody defined success before they started. The
                  Discovery Sprint fixes that.
                </p>
                <p>
                  We spend 1–2 weeks inside your business — understanding your processes, your
                  stack, and the specific problem you want solved. You don't have to proceed to
                  Phase 2. Many clients run the Discovery Sprint and implement the plan themselves.
                  That's fine — the plan is yours.
                </p>
              </div>
              <div>
                <p className="label" style={{ color: "var(--slate-mid)", marginBottom: "1rem" }}>
                  What's included
                </p>
                {phase1Deliverables.map(([k, v], i) => (
                  <div
                    key={i}
                    style={{
                      padding: "0.875rem 0",
                      borderBottom: i < phase1Deliverables.length - 1
                        ? "1px solid var(--rule)"
                        : "none",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--midnight-ink)",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {k}
                    </p>
                    <p className="body-copy" style={{ color: "var(--slate-mid)" }}>{v}</p>
                  </div>
                ))}
                <a
                  href="/contact"
                  className="cta cta-gold"
                  style={{ marginTop: "1.75rem" }}
                >
                  Start with a Discovery Sprint <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Phase 2 ── */}
        <section
          className="section"
          style={{ backgroundColor: "var(--off-white)", borderBottom: "1px solid var(--rule)" }}
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: "clamp(3rem, 6vw, 6rem)",
                alignItems: "start",
                marginBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                paddingBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>Phase 02</p>
                <h2
                  className="h-section"
                  style={{ color: "var(--midnight-ink)", marginBottom: "0.5rem" }}
                >
                  Built for your stack. <em className="gold">Owned by your team.</em>
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                    fontWeight: 300,
                    color: "var(--liquid-gold)",
                    marginTop: "1rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  AUD $30,000–$120,000
                </p>
                <p className="label" style={{ color: "var(--slate-mid)" }}>
                  4–6 weeks · Scope and pricing locked in at end of Phase 1
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "rgba(15,21,38,0.04)",
                  padding: "clamp(1.5rem, 2.5vw, 2rem)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--midnight-ink)",
                    marginBottom: "0.4rem",
                  }}
                >
                  Human-architected. Agent-accelerated.
                </p>
                <p className="body-copy" style={{ color: "var(--slate-mid)" }}>
                  Strategic thinking from Craig and Darryn. Execution compressed by AI-native
                  tooling.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "clamp(2rem, 4vw, 4rem)",
                alignItems: "start",
              }}
            >
              <div
                className="body-copy"
                style={{ color: "var(--slate-mid)", lineHeight: 1.8 }}
              >
                <p style={{ marginBottom: "1rem" }}>
                  We work inside your existing tech stack — not a proprietary platform that
                  requires ongoing fees. When it ships, your IT lead can read the code, your team
                  knows how to use it, and you own the IP outright.
                </p>
                <p>
                  Change management isn't an upsell here. It's standard. 67% of mid-market AI
                  projects fail because the team doesn't adopt the system. We build the adoption
                  plan into the engagement from the start.
                </p>
              </div>
              <div>
                <p className="label" style={{ color: "var(--slate-mid)", marginBottom: "1rem" }}>
                  What's included
                </p>
                {phase2Deliverables.map(([k, v], i) => (
                  <div
                    key={i}
                    style={{
                      padding: "0.875rem 0",
                      borderBottom: i < phase2Deliverables.length - 1
                        ? "1px solid var(--rule)"
                        : "none",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--midnight-ink)",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {k}
                    </p>
                    <p className="body-copy" style={{ color: "var(--slate-mid)" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Phase 3 ── */}
        <section
          className="section"
          style={{ backgroundColor: "var(--warm-cream)", borderBottom: "1px solid var(--rule)" }}
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: "clamp(3rem, 6vw, 6rem)",
                alignItems: "start",
                marginBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                paddingBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>Phase 03</p>
                <h2
                  className="h-section"
                  style={{ color: "var(--midnight-ink)", marginBottom: "0.5rem" }}
                >
                  We stay until the outcomes compound.
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                    fontWeight: 300,
                    color: "var(--liquid-gold)",
                    marginTop: "1rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  AUD $5,000–$15,000/month
                </p>
                <p className="label" style={{ color: "var(--slate-mid)" }}>
                  Optional — not every engagement continues to Phase 3
                </p>
              </div>
              <p
                className="body-copy"
                style={{ color: "var(--slate-mid)", lineHeight: 1.8, alignSelf: "end" }}
              >
                Most AI systems improve significantly in the first 3–6 months as they process real
                data and we refine the model. Phase 3 is for businesses that want ongoing
                optimisation and a strategic AI partner they can call.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "clamp(2rem, 4vw, 4rem)",
                alignItems: "start",
              }}
            >
              <p
                className="body-copy"
                style={{ color: "var(--slate-mid)", lineHeight: 1.8 }}
              >
                You don't need Phase 3. Many clients run Phase 2, take ownership, and maintain the
                system internally. Phase 3 is for businesses that want ongoing optimisation and a
                strategic AI partner they can call.
              </p>
              <div>
                <p className="label" style={{ color: "var(--slate-mid)", marginBottom: "1rem" }}>
                  What's included
                </p>
                {phase3Deliverables.map(([k, v], i) => (
                  <div
                    key={i}
                    style={{
                      padding: "0.875rem 0",
                      borderBottom: i < phase3Deliverables.length - 1
                        ? "1px solid var(--rule)"
                        : "none",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--midnight-ink)",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {k}
                    </p>
                    <p className="body-copy" style={{ color: "var(--slate-mid)" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Differentiators ── */}
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
              <div>
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>Why Creative Milk</p>
                <h2
                  className="h-section"
                  style={{ color: "var(--warm-cream)" }}
                >
                  Three things that make us different.
                </h2>
              </div>
              <p
                className="body-copy"
                style={{ color: "rgba(245,240,232,0.55)" }}
              >
                Not marketing claims. Structural differences in how we operate.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
              {differentiators.map((d, i) => (
                <div
                  key={i}
                  style={{
                    padding: "clamp(2rem, 3vw, 3rem)",
                    borderRight: i < differentiators.length - 1
                      ? "1px solid var(--rule-cream)"
                      : "none",
                  }}
                >
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
                    {d.title}
                  </h3>
                  <p
                    className="body-copy"
                    style={{ color: "rgba(245,240,232,0.55)" }}
                  >
                    {d.body}
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
              FAQs
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
              Not sure which phase you need? Start with a conversation.
            </h2>
            <p
              className="body-copy"
              style={{
                color: "rgba(245,240,232,0.6)",
                marginBottom: "2.5rem",
                fontSize: "1rem",
              }}
            >
              Tell us what you're trying to solve. We'll tell you whether a Discovery Sprint makes
              sense, what it would cost, and what we'd expect to find. No commitment required.
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
              <a href="/work" className="cta cta-outline-cream">
                See the work
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
