import { TrendingUp } from "lucide-react";

type CaseStudy = {
  company: string;
  description: string;
  result: string;
  metric: string;
};

const CASE_STUDIES: CaseStudy[] = [
  {
    company: "E-Commerce Platform",
    description:
      "Personalised product recommendations that drive sales without increasing ad spend.",
    result: "35% increase in conversion rates",
    metric: "+35%",
  },
  {
    company: "SaaS Analytics Tool",
    description:
      "Predictive analytics layer that surfaces insights automatically — no analyst required.",
    result: "10× faster insights generation",
    metric: "10×",
  },
  {
    company: "Customer Support Platform",
    description:
      "Intelligent triage system that resolves the majority of enquiries before a human touches them.",
    result: "60% reduction in support tickets",
    metric: "−60%",
  },
];

export default function Work() {
  return (
    <section
      id="work"
      className="section"
      style={{
        background: "var(--midnight-ink)",
        color: "var(--warm-cream)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-30%",
          right: "-10%",
          width: 700,
          height: 700,
          background:
            "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            paddingBottom: "clamp(2rem, 4vw, 3.5rem)",
            borderBottom: "1px solid var(--rule-cream)",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: "clamp(2rem, 5vw, 5rem)",
            alignItems: "end",
          }}
        >
          <div>
            <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
              03 — Selected work
            </span>
            <h2 className="h-section" style={{ marginTop: "1rem" }}>
              The work speaks
              <br />
              <em className="gold">for itself</em>
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
            Three engagements, three real outcomes. We&apos;ll walk you through
            the system architecture, what worked, and what we&apos;d do
            differently.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {CASE_STUDIES.map((study, idx) => (
            <article
              key={study.company}
              className="work-card"
              style={{
                padding: "clamp(2rem, 3vw, 3rem) clamp(1.5rem, 2.5vw, 2.5rem)",
                borderRight: "1px solid var(--rule-cream)",
                borderBottom: "1px solid var(--rule-cream)",
                animation: `fadeInUp 0.7s var(--ease-out) ${idx * 0.1}s both`,
                cursor: "default",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3.5rem, 7vw, 5.5rem)",
                  fontWeight: 300,
                  lineHeight: 1,
                  color: "var(--liquid-gold)",
                  letterSpacing: "-0.03em",
                  marginBottom: "1.5rem",
                }}
              >
                {study.metric}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  fontWeight: 400,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--warm-cream)",
                  margin: "0 0 0.85rem",
                }}
              >
                {study.company}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  color: "rgba(245,240,232,0.55)",
                  margin: "0 0 2rem",
                  maxWidth: "30ch",
                }}
              >
                {study.description}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--forest-light)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                <TrendingUp size={14} aria-hidden="true" />
                {study.result}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
