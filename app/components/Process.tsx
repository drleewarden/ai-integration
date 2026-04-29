type Step = {
  number: string;
  title: string;
  description: string;
  duration: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "Discovery & Strategy",
    description:
      "We map your business objectives, technical landscape, and AI readiness. The output is a scoped plan with measurable targets — not a vague roadmap.",
    duration: "1–2 weeks",
  },
  {
    number: "02",
    title: "Build & Integrate",
    description:
      "Human-architected, agent-accelerated. We build to your stack and your team's capabilities, not ours.",
    duration: "4–6 weeks",
  },
  {
    number: "03",
    title: "Optimise & Scale",
    description:
      "We monitor, refine, and scale performance — and we stay until the outcomes are real, not just live.",
    duration: "Ongoing",
  },
];

export default function Process() {
  return (
    <section
      id="process"
      className="section"
      style={{ background: "var(--warm-cream)" }}
    >
      <div className="container">
        <div
          style={{
            paddingBottom: "clamp(2rem, 4vw, 3.5rem)",
            borderBottom: "1px solid var(--rule)",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: "clamp(2rem, 5vw, 5rem)",
            alignItems: "end",
          }}
        >
          <div>
            <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
              04 — Process
            </span>
            <h2
              className="h-section"
              style={{
                color: "var(--midnight-ink)",
                marginTop: "1rem",
                maxWidth: "16ch",
              }}
            >
              How we work —
              <br />
              <em
                style={{
                  fontStyle: "italic",
                  color: "var(--slate-mid)",
                }}
              >
                and why it matters
              </em>
            </h2>
          </div>
          <p
            className="body-copy"
            style={{ maxWidth: "44ch", justifySelf: "end" }}
          >
            Three phases, predictable timelines. We tell you up front what we
            can ship in 6–8 weeks, and we don&apos;t move the goalposts.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            position: "relative",
          }}
        >
          {STEPS.map((step, idx) => (
            <article
              key={step.number}
              style={{
                position: "relative",
                padding: "clamp(2rem, 3vw, 3rem)",
                borderRight: "1px solid var(--rule)",
                borderBottom: "1px solid var(--rule)",
                animation: `fadeInUp 0.7s var(--ease-out) ${idx * 0.1}s both`,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(4rem, 7vw, 6rem)",
                  fontWeight: 300,
                  lineHeight: 0.9,
                  color: "rgba(15, 21, 38, 0.08)",
                  letterSpacing: "-0.03em",
                  marginBottom: "1rem",
                }}
              >
                {step.number}
              </div>

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--liquid-gold)",
                  marginBottom: "1rem",
                }}
              >
                {step.duration}
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.5rem, 2vw, 1.85rem)",
                  fontWeight: 400,
                  lineHeight: 1.15,
                  color: "var(--midnight-ink)",
                  margin: "0 0 1rem",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  lineHeight: 1.75,
                  color: "var(--slate-mid)",
                  margin: 0,
                  maxWidth: "32ch",
                }}
              >
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
