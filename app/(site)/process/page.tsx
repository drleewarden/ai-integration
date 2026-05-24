import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Our AI Implementation Process | Discovery Sprint to Managed Partnership | Creative Milk",
  description:
    "See exactly how Creative Milk delivers AI systems in 6–8 weeks. Discovery Sprint, Build & Integrate, Managed Partnership -- with published pricing and a 95% outcome rate.",
};

const failureModes = [
  {
    label: "No success metric defined upfront",
    body: '"We want to use AI" is not a brief. Projects without a measurable target can\'t be declared done -- and can\'t be called successful.',
  },
  {
    label: "Strategy without implementation",
    body: "Consultants produce roadmaps. Nobody builds the system. Businesses pay for a document and get nothing running.",
  },
  {
    label: "Technology without people",
    body: "A system can be technically perfect and still fail if the team doesn't adopt it. Most agencies deliver software. Nobody trains the humans.",
  },
  {
    label: "Vendor dependency",
    body: "Agencies that build on proprietary platforms leave clients locked in. When the agency relationship ends, the system stops.",
  },
];

const stats = [
  { value: "50+", label: "Engagements delivered" },
  { value: "95%", label: "Outcome rate" },
  { value: "$2M+", label: "Revenue lifted" },
  { value: "6–8 wks", label: "Average delivery" },
];

const timeline = [
  {
    period: "Week 0",
    label: "First call (30 mins)",
    body: "You describe the problem. We ask questions. We agree whether a Discovery Sprint makes sense. If it does, we send a proposal within 48 hours.",
  },
  {
    period: "Weeks 1–2",
    label: "Discovery Sprint",
    body: "Stakeholder interviews, process mapping, stack audit. We identify the system worth building. We agree the success metric. We deliver the go/no-go and Phase 2 proposal.",
  },
  {
    period: "Week 2–3",
    label: "Decision point",
    body: "You review the Phase 2 proposal. Fixed price, fixed scope, fixed timeline. You decide whether to proceed. There's no pressure -- the Discovery Sprint plan is yours regardless.",
  },
  {
    period: "Weeks 3–8",
    label: "Build & Integrate",
    body: "We build. Daily standups at the start. Weekly check-ins through the build. You see the system before it's live. We train the team in weeks 7–8.",
  },
  {
    period: "Week 8",
    label: "Launch",
    body: "System goes live in your stack. Outcome measurement begins from day one.",
  },
  {
    period: "Weeks 8–12",
    label: "30-day support window",
    body: "We stay close. Any issues, refinements, or adoption questions -- we're on it.",
  },
  {
    period: "Month 3+",
    label: "Managed Partnership (optional)",
    body: "If you want ongoing optimisation and a strategic AI partner, Phase 3 begins. If not, you run the system and we're available if you need us.",
  },
];

const phase2Deliverables = [
  ["Live system", "Running in your stack, connected to your data"],
  ["IP transfer", "You own the code, the model, the documentation"],
  ["Team training", "Your team can use and manage the system independently"],
  ["Documentation", "Plain-English guide for users and your IT team"],
  ["30-day support", "We stay close for the first month after launch"],
  ["Outcome measurement", "Dashboard or report showing the metrics we agreed in Phase 1"],
];

const phase1Deliverables = [
  ["Stakeholder interviews", "Understand the real problem, not just the stated one"],
  ["Process mapping", "Document current workflows and identify AI leverage points"],
  ["Stack audit", "Assess integration feasibility and surface any blockers"],
  ["Success metric definition", "Agree the measurable outcome we'll target"],
  ["Go/no-go recommendation", "Honest advice -- including if we think AI isn't the right answer"],
  ["Phase 2 proposal", "Fixed-price, scoped proposal ready to proceed if you choose"],
];

export default function Process() {
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
              We tell you up front what we can ship{" "}
              <em className="gold">in 6–8 weeks.</em>
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
              Most AI projects fail not because the technology doesn't work -- but because nobody
              defined success before they started. We scope every engagement around a measurable
              outcome. That's how we get to 95%.
            </p>
          </div>
        </section>

        {/* ── Why projects fail ── */}
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
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                  The problem with how AI is usually done
                </p>
                <h2
                  className="h-section"
                  style={{ color: "var(--midnight-ink)" }}
                >
                  The technology rarely fails. The implementation does.
                </h2>
              </div>
              <p
                className="body-copy"
                style={{ color: "var(--slate-mid)", lineHeight: 1.75, alignSelf: "end" }}
              >
                67–80% of mid-market AI projects fail to deliver their promised ROI. The reasons
                are predictable -- and preventable.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
              }}
            >
              {failureModes.map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: "clamp(2rem, 3vw, 3rem)",
                    borderRight: i % 2 === 0 ? "1px solid var(--rule)" : "none",
                    borderBottom: i < 2 ? "1px solid var(--rule)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: "0.5rem",
                      height: "0.5rem",
                      backgroundColor: "#c0392b",
                      marginBottom: "1rem",
                    }}
                  />
                  <h3
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "var(--midnight-ink)",
                      marginBottom: "0.6rem",
                    }}
                  >
                    {f.label}
                  </h3>
                  <p
                    className="body-copy"
                    style={{ color: "var(--slate-mid)", lineHeight: 1.7 }}
                  >
                    {f.body}
                  </p>
                </div>
              ))}
            </div>

            <p
              className="body-copy"
              style={{
                marginTop: "2rem",
                color: "var(--slate-mid)",
                fontStyle: "italic",
              }}
            >
              We've spent years watching these failure modes repeat. Our process is built around
              preventing all four.
            </p>
          </div>
        </section>

        {/* ── Approach ── */}
        <section
          className="section-tight"
          style={{ backgroundColor: "var(--midnight-ink)", borderBottom: "1px solid var(--rule-cream)" }}
        >
          <div className="container" style={{ textAlign: "center" }}>
            <p className="eyebrow" style={{ marginBottom: "1.25rem", justifyContent: "center" }}>
              Our approach
            </p>
            <h2
              className="h-section"
              style={{
                color: "var(--warm-cream)",
                marginBottom: "1.25rem",
                maxWidth: "22ch",
                marginInline: "auto",
              }}
            >
              Human-architected. <em className="gold">Agent-accelerated.</em>
            </h2>
            <p
              className="body-copy"
              style={{
                maxWidth: "52ch",
                marginInline: "auto",
                color: "rgba(245,240,232,0.6)",
                fontSize: "1rem",
              }}
            >
              Strategic thinking comes from Craig and Darryn -- experienced practitioners who've
              built and managed AI systems across 50+ engagements. Execution is accelerated by
              AI-native tooling that compresses delivery timelines without compromising quality.
              Every engagement follows the same architecture: define success → build to spec →
              measure outcomes.
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
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                  Phase 01 · 1–2 weeks · AUD $5K–$15K
                </p>
                <h2
                  className="h-section"
                  style={{ color: "var(--midnight-ink)" }}
                >
                  Define the problem. Set the target. Make the decision.
                </h2>
              </div>
              <div
                style={{
                  backgroundColor: "rgba(15,21,38,0.04)",
                  padding: "clamp(1.5rem, 2.5vw, 2rem)",
                  alignSelf: "end",
                }}
              >
                <p
                  className="body-copy"
                  style={{ fontStyle: "italic", color: "var(--slate-mid)", marginBottom: "0.75rem" }}
                >
                  "We don't know if AI is right for us."
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--midnight-ink)",
                  }}
                >
                  That's the Discovery Sprint's job. You find out before you commit to a build.
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
                  The Discovery Sprint is where we earn the right to build something.
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  We spend 1–2 weeks inside your business. We map the processes you're trying to
                  improve, assess your existing tech stack for integration feasibility, and
                  identify the specific problem worth solving. Then we do something most agencies
                  skip: we tell you honestly whether the ROI justifies the investment.
                </p>
                <p>
                  Some clients run the Discovery Sprint and find that a simpler solution -- not AI
                  -- is the right answer. We'll tell you that. It's not a sales pitch. It's a
                  professional assessment.
                </p>
              </div>
              <div>
                <p className="label" style={{ color: "var(--slate-mid)", marginBottom: "1rem" }}>
                  What happens in a Discovery Sprint
                </p>
                {phase1Deliverables.map(([k, v], i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "1rem",
                      padding: "0.875rem 0",
                      borderBottom:
                        i < phase1Deliverables.length - 1 ? "1px solid var(--rule)" : "none",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--midnight-ink)",
                        minWidth: "160px",
                        flexShrink: 0,
                      }}
                    >
                      {k}
                    </span>
                    <span
                      className="body-copy"
                      style={{ color: "var(--slate-mid)" }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
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
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                  Phase 02 · 4–6 weeks · AUD $30K–$120K
                </p>
                <h2
                  className="h-section"
                  style={{ color: "var(--midnight-ink)" }}
                >
                  We build the system. Your team learns to own it.
                </h2>
              </div>
              <div
                style={{
                  backgroundColor: "rgba(15,21,38,0.04)",
                  padding: "clamp(1.5rem, 2.5vw, 2rem)",
                  alignSelf: "end",
                }}
              >
                <p
                  className="body-copy"
                  style={{ fontStyle: "italic", color: "var(--slate-mid)", marginBottom: "0.75rem" }}
                >
                  "We tried something like this before and the team never used it."
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--midnight-ink)",
                  }}
                >
                  We know. That's why change management is standard. The system your team doesn't
                  adopt is a system that doesn't work.
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
                  Phase 2 is the build. Everything is defined -- the system design, the
                  integrations, the success metrics, the fixed price. We build.
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  We work inside your existing stack. No proprietary platform. No new vendor
                  relationships. The system uses the tools your team already has, extended with
                  AI capabilities.
                </p>
                <p>
                  <strong style={{ color: "var(--midnight-ink)" }}>
                    Change management is not optional.
                  </strong>{" "}
                  Every Phase 2 engagement includes an adoption plan built alongside the system --
                  not retrofitted after -- plus hands-on training sessions with the people who will
                  use the system daily.
                </p>
              </div>
              <div>
                <p className="label" style={{ color: "var(--slate-mid)", marginBottom: "1rem" }}>
                  What's delivered at the end of Phase 2
                </p>
                {phase2Deliverables.map(([k, v], i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "1rem",
                      padding: "0.875rem 0",
                      borderBottom:
                        i < phase2Deliverables.length - 1 ? "1px solid var(--rule)" : "none",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--midnight-ink)",
                        minWidth: "140px",
                        flexShrink: 0,
                      }}
                    >
                      {k}
                    </span>
                    <span
                      className="body-copy"
                      style={{ color: "var(--slate-mid)" }}
                    >
                      {v}
                    </span>
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
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                  Phase 03 · Ongoing · AUD $5K–$15K/month
                </p>
                <h2
                  className="h-section"
                  style={{ color: "var(--midnight-ink)" }}
                >
                  We stay until the outcomes compound.
                </h2>
              </div>
              <div
                style={{
                  backgroundColor: "rgba(15,21,38,0.04)",
                  padding: "clamp(1.5rem, 2.5vw, 2rem)",
                  alignSelf: "end",
                }}
              >
                <p
                  className="body-copy"
                  style={{ fontStyle: "italic", color: "var(--slate-mid)", marginBottom: "0.75rem" }}
                >
                  "We don't want to be dependent on you forever."
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--midnight-ink)",
                  }}
                >
                  You won't be. Phase 2 is designed so your team owns the system. Phase 3 is a
                  choice, not a dependency. If you cancel, your system keeps running.
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
                  Most AI systems improve significantly in the first 3–6 months as they process
                  real data and we refine the model. The Managed Partnership keeps us involved
                  through that period.
                </p>
                <p>
                  This phase is optional. Many clients complete Phase 2 and manage the system
                  internally. We built it so they can. Phase 3 is for businesses that want a
                  strategic AI partner on retainer.
                </p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Monthly performance review against Phase 1 success metrics",
                  "Continuous model optimisation based on real-world data",
                  "Expansion planning -- where to apply AI next as the first system beds in",
                  "Direct access to Craig and Darryn for questions and strategic decisions",
                  "Priority support -- not a ticketing queue",
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      padding: "0.875rem 0",
                      borderBottom: i < 4 ? "1px solid var(--rule)" : "none",
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
            </div>
          </div>
        </section>

        {/* ── 95% stat ── */}
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
                marginBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                paddingBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                borderBottom: "1px solid var(--rule-cream)",
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                  The number that matters
                </p>
                <h2
                  className="h-section"
                  style={{ color: "var(--warm-cream)" }}
                >
                  95% of our engagements hit their defined success metric.
                </h2>
              </div>
              <div
                className="body-copy"
                style={{ color: "rgba(245,240,232,0.6)", lineHeight: 1.8 }}
              >
                <p style={{ marginBottom: "1rem" }}>
                  That number means something specific. Before every Phase 2 build, we agree a
                  measurable target with the client -- a specific metric that defines "it worked."
                  The 95% is the percentage of engagements where that metric was hit.
                </p>
                <p>
                  The 5% that didn't hit target: in most cases, the external conditions changed
                  (business pivot, team restructure, market shift) rather than the system failing.
                  We'll explain the details if you ask.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                border: "1px solid var(--rule-cream)",
              }}
            >
              {stats.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "clamp(1.5rem, 2.5vw, 2rem) clamp(1.25rem, 2vw, 1.75rem)",
                    borderRight: i < stats.length - 1 ? "1px solid var(--rule-cream)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(2rem, 4vw, 3rem)",
                      fontWeight: 300,
                      color: "var(--liquid-gold)",
                      lineHeight: 1,
                      marginBottom: "0.4rem",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="label"
                    style={{ color: "rgba(245,240,232,0.45)" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
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
                alignItems: "end",
                marginBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                paddingBottom: "clamp(2.5rem, 4vw, 3.5rem)",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>A real engagement</p>
                <h2
                  className="h-section"
                  style={{ color: "var(--midnight-ink)" }}
                >
                  From first call to live system.
                </h2>
              </div>
              <p
                className="body-copy"
                style={{ color: "var(--slate-mid)" }}
              >
                What the timeline actually looks like -- week by week.
              </p>
            </div>

            <div>
              {timeline.map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    gap: "clamp(1.5rem, 3vw, 3rem)",
                    padding: "clamp(1.25rem, 2vw, 1.75rem) 0",
                    borderBottom:
                      i < timeline.length - 1 ? "1px solid var(--rule)" : "none",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <p
                      className="eyebrow no-rule"
                      style={{ marginBottom: "0.25rem" }}
                    >
                      {t.period}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--midnight-ink)",
                      }}
                    >
                      {t.label}
                    </p>
                  </div>
                  <p
                    className="body-copy"
                    style={{ color: "var(--slate-mid)", lineHeight: 1.7 }}
                  >
                    {t.body}
                  </p>
                </div>
              ))}
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
              Ready to find out what we'd build for your business?
            </h2>
            <p
              className="body-copy"
              style={{
                color: "rgba(245,240,232,0.6)",
                marginBottom: "2.5rem",
                fontSize: "1rem",
              }}
            >
              Start with a Discovery Sprint. We'll map your problem, assess the opportunity, and
              give you an honest recommendation -- including if AI isn't the right answer. Fixed
              price. No surprises. Plain English next steps.
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
                Start with a Discovery Sprint <ArrowRight size={16} />
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
