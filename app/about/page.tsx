import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "About Creative Milk | AI Implementation Partners | Craig & Darryn",
  description:
    "Creative Milk is an Australian AI implementation agency founded by Craig and Darryn. We build custom AI systems that deliver measurable outcomes. Two founders. Direct accountability.",
};

const principles = [
  {
    num: "01",
    title: "Outcomes before everything",
    body: "An AI system that ships on time and on budget but doesn't hit its target is a failed project. We define the success metric before we build anything. That's what the 95% outcome rate means.",
  },
  {
    num: "02",
    title: "Plain English is a professional standard",
    body: "If we can't explain what we're building in plain English, we don't have a clear enough picture of the problem. Jargon is a warning sign, not a mark of expertise.",
  },
  {
    num: "03",
    title: "The people matter as much as the system",
    body: "67–80% of mid-market AI projects fail not because the technology doesn't work — but because the team doesn't adopt it. Change management is standard in every engagement. Not optional. Not an upsell.",
  },
  {
    num: "04",
    title: "You should own what we build",
    body: "We build on your stack. IP transfers on completion. Your team is trained to run the system without us. If you want to take it to another provider, you can. Dependency isn't a business model we want.",
  },
];

export default function About() {
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
            <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>About</p>
            <h1
              className="h-display"
              style={{
                fontSize: "clamp(2.75rem, 7vw, 6rem)",
                color: "var(--warm-cream)",
                maxWidth: "18ch",
                marginBottom: "1.5rem",
              }}
            >
              We got tired of watching good businesses pay for AI that{" "}
              <em className="gold">didn't work.</em>
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
              Creative Milk exists because there's a gap between what AI agencies promise and what
              they deliver. We built the practice we wished existed when we were on the other side
              of that table.
            </p>
          </div>
        </section>

        {/* ── Why we exist ── */}
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
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>Why we exist</p>
                <h2
                  className="h-section"
                  style={{ color: "var(--midnight-ink)" }}
                >
                  The problem we kept seeing.
                </h2>
              </div>
              <div
                className="body-copy"
                style={{ color: "var(--slate-mid)", fontSize: "1rem", lineHeight: 1.8 }}
              >
                <p style={{ marginBottom: "1rem" }}>
                  Between us, we'd spent years watching the same failure mode repeat.
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  A business hears that AI will transform their operations. They talk to an agency.
                  The agency produces a strategy document, or configures a tool, or builds a proof
                  of concept that works in isolation and fails in practice. The business spends the
                  budget, the team gets frustrated, and "AI" becomes a word that makes the founder
                  sigh.
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  The failure wasn't usually the technology. It was the gap between what was
                  promised and what got built — and the absence of anyone willing to stay
                  accountable for whether it actually worked.
                </p>
                <p>
                  That's the gap Creative Milk was built to close. We don't do strategy-only
                  engagements. We don't disappear after the build. We define success before we
                  start, we build to that definition, and we measure whether we hit it. That's the
                  whole model.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Founders ── */}
        <section
          className="section"
          style={{ backgroundColor: "var(--off-white)", borderBottom: "1px solid var(--rule)" }}
        >
          <div className="container">

            {/* Craig */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr",
                gap: "clamp(2.5rem, 5vw, 5rem)",
                alignItems: "start",
                marginBottom: "clamp(3rem, 6vw, 5rem)",
                paddingBottom: "clamp(3rem, 6vw, 5rem)",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div
                style={{
                  aspectRatio: "1 / 1",
                  backgroundColor: "rgba(15,21,38,0.05)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "1.5rem",
                }}
              >
                <span className="label" style={{ color: "rgba(15,21,38,0.35)" }}>Photo — Craig</span>
              </div>
              <div>
                <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>Co-Founder</p>
                <h2
                  className="h-section"
                  style={{
                    color: "var(--midnight-ink)",
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Craig
                </h2>
                <p
                  className="label"
                  style={{ color: "var(--slate-mid)", marginBottom: "1.5rem" }}
                >
                  Strategy, Client Relationships &amp; Marketing
                </p>
                <div
                  className="body-copy"
                  style={{ color: "var(--slate-mid)", lineHeight: 1.8 }}
                >
                  <p style={{ marginBottom: "1rem" }}>
                    Craig brings the strategy and communication layer to every Creative Milk
                    engagement. His role is to make sure every engagement starts with the right
                    problem.
                  </p>
                  <p style={{ marginBottom: "1rem" }}>
                    He runs Discovery Sprints, translates between business outcomes and technical
                    requirements, and stays accountable to the client through the full lifecycle.
                  </p>
                  <p>
                    He's also the reason our case studies are written in plain English. If he can't
                    explain the system to a client's CFO in five minutes, the brief isn't finished.
                  </p>
                </div>
              </div>
            </div>

            {/* Darryn */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr",
                gap: "clamp(2.5rem, 5vw, 5rem)",
                alignItems: "start",
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>Co-Founder</p>
                <h2
                  className="h-section"
                  style={{
                    color: "var(--midnight-ink)",
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Darryn
                </h2>
                <p
                  className="label"
                  style={{ color: "var(--slate-mid)", marginBottom: "1.5rem" }}
                >
                  Architecture, Build &amp; Technical Delivery
                </p>
                <div
                  className="body-copy"
                  style={{ color: "var(--slate-mid)", lineHeight: 1.8 }}
                >
                  <p style={{ marginBottom: "1rem" }}>
                    Darryn designs and builds the systems. He takes the problem definition from
                    Phase 1 and turns it into a production system that runs in your stack,
                    integrates with your tools, and transfers cleanly to your team.
                  </p>
                  <p>
                    He's also the reason we can deliver in 6–8 weeks. Not because we cut corners —
                    because he builds systems the right way the first time and uses AI-native
                    tooling throughout the build to compress timelines without compromising quality.
                  </p>
                </div>
              </div>
              <div
                style={{
                  aspectRatio: "1 / 1",
                  backgroundColor: "rgba(15,21,38,0.05)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "1.5rem",
                }}
              >
                <span className="label" style={{ color: "rgba(15,21,38,0.35)" }}>Photo — Darryn</span>
              </div>
            </div>

          </div>
        </section>

        {/* ── Principles ── */}
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
                alignItems: "start",
                marginBottom: "clamp(3rem, 5vw, 4rem)",
                paddingBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                borderBottom: "1px solid var(--rule-cream)",
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>Our principles</p>
                <h2
                  className="h-section"
                  style={{ color: "var(--warm-cream)" }}
                >
                  Four things we believe about AI implementation.
                </h2>
              </div>
              <p
                className="body-copy"
                style={{ color: "rgba(245,240,232,0.55)", alignSelf: "end" }}
              >
                These aren't values written for the website. They're the conclusions we reached
                after watching projects fail for the same predictable reasons.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
              }}
            >
              {principles.map((p, i) => (
                <div
                  key={i}
                  style={{
                    padding: "clamp(2rem, 3vw, 3rem)",
                    borderRight: i % 2 === 0 ? "1px solid var(--rule-cream)" : "none",
                    borderBottom: i < 2 ? "1px solid var(--rule-cream)" : "none",
                  }}
                >
                  <p
                    className="eyebrow no-rule"
                    style={{ marginBottom: "1rem" }}
                  >
                    {p.num}
                  </p>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.25rem, 2.2vw, 1.6rem)",
                      fontWeight: 300,
                      color: "var(--warm-cream)",
                      marginBottom: "0.75rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="body-copy"
                    style={{ color: "rgba(245,240,232,0.55)" }}
                  >
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Working model ── */}
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
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>How we work together</p>
                <h2
                  className="h-section"
                  style={{ color: "var(--midnight-ink)" }}
                >
                  Two founders. <em className="gold">One accountable team.</em>
                </h2>
              </div>
              <div
                className="body-copy"
                style={{ color: "var(--slate-mid)", lineHeight: 1.8 }}
              >
                <p style={{ marginBottom: "1rem" }}>
                  When you work with Creative Milk, you work with Craig and Darryn directly.
                  There are no account managers between you and the people doing the work. No
                  junior consultants running the project while the principals are elsewhere.
                  The people you talk to in the sales conversation are the people who build your
                  system.
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  That's not a feature that scales infinitely — and we know it. We take a limited
                  number of engagements at any one time because that's what it takes to deliver a
                  95% outcome rate.
                </p>
                <p>
                  If you're looking for a large agency with 50 people and multiple project streams,
                  we're not it. If you want two experienced people who are accountable for your
                  outcome from day one, that's exactly what we are.
                </p>
              </div>
            </div>
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
              Ready to work with us?
            </h2>
            <p
              className="body-copy"
              style={{
                color: "rgba(245,240,232,0.6)",
                marginBottom: "2.5rem",
                fontSize: "1rem",
              }}
            >
              Tell us about the problem you're trying to solve. We respond within 24 hours with an
              honest assessment of whether we can help and what that would look like.
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
