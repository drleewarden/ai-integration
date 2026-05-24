import { TrendingUp, ArrowRight } from "lucide-react";

type CaseStudy = {
  sector: string;
  company: string;
  headline: string;
  situation: string;
  system: string;
  outcome: string;
  metric: string;
  metricLabel: string;
  timeBack: string;
  href: string;
};

const CASE_STUDIES: CaseStudy[] = [
  {
    sector: "Accounting · 14 staff",
    company: "Sydney mid-tier firm",
    headline: "BAS prep that used to take a fortnight, now closes in a long lunch.",
    situation:
      "Three seniors spending the back half of every month chasing receipts, retyping invoice data, and reconciling against bank feeds. Partners writing review notes by hand.",
    system:
      "Document intake bot reading PDF receipts and invoices, posting structured entries into Xero with confidence scores; review notes drafted from variance patterns; staff approve in one click.",
    outcome: "32 hours per BAS cycle reclaimed, redirected to advisory work.",
    metric: "−72%",
    metricLabel: "BAS prep time",
    timeBack: "32 hrs / cycle",
    href: "/work/sydney-accounting",
  },
  {
    sector: "Legal · 8 staff",
    company: "Brisbane boutique firm",
    headline: "Client onboarding that took 4 days now closes in under a day.",
    situation:
      "New matter intake bottlenecked on conflict checks, ID verification, engagement letter drafting, and trust account setup. New clients waited; team chased.",
    system:
      "AI-driven intake conversation that captures matter details, runs conflict checks against the case database, drafts the engagement letter from the right template, and stages everything for partner sign-off.",
    outcome: "Onboarding cycle compressed from 96 hours to under 22 hours.",
    metric: "4× faster",
    metricLabel: "client onboarding",
    timeBack: "74 hrs / matter",
    href: "/work/brisbane-legal",
  },
  {
    sector: "Construction · 22 staff",
    company: "Melbourne commercial builder",
    headline: "RFIs answered before the site supervisor gets back to the ute.",
    situation:
      "Site teams stuck waiting on document searches for variations, RFIs, and subbie clarifications -- pulled from a 4-year archive of drawings, specs, and emails across three project systems.",
    system:
      "AI assistant trained on the firm's project archive: site staff ask a question by voice or text, get an answer with the source documents linked, and queue any unclear items for the project manager to review.",
    outcome: "60% of site queries resolved without a human; PM workload back to design and program.",
    metric: "−60%",
    metricLabel: "PM interruptions",
    timeBack: "18 hrs / PM / wk",
    href: "/work/melbourne-construction",
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
              03 -- Case studies
            </span>
            <h2 className="h-section" style={{ marginTop: "1rem" }}>
              Three firms.
              <br />
              <em className="gold">Real hours</em> back.
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
            We measure work in hours reclaimed and decisions improved -- not
            features shipped. Here&apos;s what that looks like when it&apos;s
            running in production.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          {CASE_STUDIES.map((study, idx) => (
            <article
              key={study.company}
              className="work-card"
              style={{
                padding: "clamp(2rem, 3vw, 2.75rem) clamp(1.75rem, 2.5vw, 2.5rem)",
                borderRight: "1px solid var(--rule-cream)",
                borderBottom: "1px solid var(--rule-cream)",
                animation: `fadeInUp 0.7s var(--ease-out) ${idx * 0.1}s both`,
                display: "flex",
                flexDirection: "column",
              }}
            >
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
                {study.sector}
              </div>

              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3rem, 5.5vw, 4.5rem)",
                  fontWeight: 300,
                  lineHeight: 1,
                  color: "var(--liquid-gold)",
                  letterSpacing: "-0.03em",
                  marginBottom: "0.35rem",
                }}
              >
                {study.metric}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(245,240,232,0.42)",
                  marginBottom: "1.75rem",
                }}
              >
                {study.metricLabel}
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.35rem, 1.8vw, 1.65rem)",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: "var(--warm-cream)",
                  margin: "0 0 1.25rem",
                }}
              >
                {study.headline}
              </h3>

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(245,240,232,0.42)",
                  marginBottom: "0.4rem",
                }}
              >
                Situation
              </div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                  color: "rgba(245,240,232,0.65)",
                  margin: "0 0 1.25rem",
                }}
              >
                {study.situation}
              </p>

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(245,240,232,0.42)",
                  marginBottom: "0.4rem",
                }}
              >
                What we built
              </div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                  color: "rgba(245,240,232,0.65)",
                  margin: "0 0 1.5rem",
                  flex: 1,
                }}
              >
                {study.system}
              </p>

              <div
                style={{
                  paddingTop: "1rem",
                  borderTop: "1px dashed var(--rule-cream-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
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
                  {study.timeBack}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.12em",
                    color: "rgba(245,240,232,0.4)",
                    textTransform: "uppercase",
                  }}
                >
                  {study.company}
                </span>
              </div>

              <a
                href={study.href}
                className="cta-link"
                aria-label={`Read the full ${study.sector} case study`}
              >
                Read the full case study{" "}
                <ArrowRight size={12} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>

        <div
          style={{
            marginTop: "clamp(3rem, 5vw, 4rem)",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "2rem",
            borderTop: "1px solid var(--rule-cream)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.2rem, 1.6vw, 1.5rem)",
              fontStyle: "italic",
              color: "rgba(245,240,232,0.7)",
              margin: 0,
              maxWidth: "42ch",
            }}
          >
            Want the version of this for your firm? The pilot tells you in 30
            days whether it ships.
          </p>
          <a href="/pricing" className="cta cta-gold">
            See the pilot
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
