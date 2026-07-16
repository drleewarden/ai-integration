import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Pricing -- Creative Milk",
  description:
    "Three ways to engage Creative Milk. Fixed-price 30-Day Pilot, scoped Build engagements, and ongoing AI Ops Residency. Australian pricing, no hidden hours.",
};

type Tier = {
  number: string;
  name: string;
  eyebrow: string;
  price: string;
  cadence: string;
  pitch: string;
  description: string;
  includes: string[];
  outcomes: string;
  ideal: string;
  cta: { label: string; href: string };
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    number: "01",
    name: "30-Day Pilot",
    eyebrow: "Start here",
    price: "$7,500",
    cadence: "fixed · 30 days",
    pitch: "One problem. One system. One measurable outcome.",
    description:
      "We scope a single high-leverage workflow, ship it, measure it, and hand it over -- in thirty days. If we don't hit the outcome we agreed on, you don't pay the final invoice. No black boxes.",
    includes: [
      "Discovery session (2 hours, scoped before kickoff)",
      "One production-grade workflow or AI integration",
      "Documentation written for your team, not ours",
      "30-day support window after handover",
      "Outcome report with the numbers that matter",
    ],
    outcomes: "Hours reclaimed per week · turnaround time cut · admin removed",
    ideal: "First AI engagement · sceptical buyers · founders who want proof before scale",
    cta: { label: "Book a pilot call", href: "/#contact" },
    featured: true,
  },
  {
    number: "02",
    name: "Build Engagement",
    eyebrow: "Ship the system",
    price: "$25k–$60k",
    cadence: "fixed scope · 8–12 weeks",
    pitch: "Multi-system AI integration with a defined scope and a defined ceiling.",
    description:
      "When the pilot proved the thesis and you're ready to ship the real system. Three to five workflows, properly integrated into your stack, with the training and documentation your team needs to own it.",
    includes: [
      "Architecture design and integration plan",
      "Three to five production workflows",
      "Integration with your CRM, ERP, comms, or document stack",
      "Team training and capability transfer",
      "Three-month optimisation window after go-live",
    ],
    outcomes: "Process replaced end-to-end · headcount avoided · capacity unlocked",
    ideal: "Post-pilot expansion · teams of 10–250 · operations-led businesses",
    cta: { label: "Discuss a build", href: "/#contact" },
  },
  {
    number: "03",
    name: "AI Ops Residency",
    eyebrow: "Keep shipping",
    price: "From $3,500",
    cadence: "per month · rolling",
    pitch: "Monthly roadmap. Monthly ship. Quarterly outcome report.",
    description:
      "Not a support retainer. A residency. Each month we agree on what gets shipped -- new workflows, optimisations, integrations -- and ship it. Every quarter we publish a report on what changed and what it was worth.",
    includes: [
      "Monthly planning session and roadmap",
      "One shipped improvement or workflow per month",
      "Quarterly outcome report with hard numbers",
      "Priority response on anything in production",
      "Access to whatever we learn from other clients",
    ],
    outcomes: "Compounding improvement · operational leverage · stay ahead of the field",
    ideal: "Post-build maintenance · operationally-mature teams · businesses scaling AI",
    cta: { label: "Talk about residency", href: "/#contact" },
  },
];

const FAQ = [
  {
    q: "What if the 30-Day Pilot doesn't hit the outcome?",
    a: "If we don't hit the measurable target we agreed on at kickoff, you don't pay the final 50% invoice. We carry the risk of being right about the scope -- you carry the risk of being right about the problem.",
  },
  {
    q: "Why is your pricing public when most agencies hide it?",
    a: "Because the buyers we want are the ones who can decide quickly. If you need a quote to know whether we're in your range, you'd rather find that out in thirty seconds than on a sales call.",
  },
  {
    q: "Do you work hourly or on retainer?",
    a: "We don't sell hours. The Pilot is fixed. The Build is fixed-scope with a ceiling. The Residency is a monthly outcome, not a monthly bucket of hours. Hours are an input -- you're paying for the output.",
  },
  {
    q: "What stack do you work in?",
    a: "We're tool-agnostic. n8n, Make, Zapier, custom Node/Python, OpenAI, Anthropic, your existing CRM/ERP/comms. The right tool depends on your stack, your team, and what you'll own after we leave.",
  },
  {
    q: "Australian GST?",
    a: "All prices are AUD and exclude GST. We invoice in AUD with full tax compliance for Australian businesses.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main style={{ background: "var(--off-white)", minHeight: "100vh" }}>
        {/* HERO */}
        <section
          style={{
            background: "var(--midnight-ink)",
            color: "var(--warm-cream)",
            paddingTop: "clamp(8rem, 16vh, 11rem)",
            paddingBottom: "clamp(4rem, 8vh, 6rem)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-20%",
              right: "-10%",
              width: 720,
              height: 720,
              background:
                "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <span
              className="eyebrow animate-slideDown"
              style={{ color: "var(--liquid-gold)" }}
            >
              Pricing
            </span>
            <h1
              className="h-display animate-fadeInUp"
              style={{
                fontSize: "clamp(2.75rem, 7vw, 6rem)",
                color: "var(--warm-cream)",
                margin: "1.25rem 0 1.5rem",
                maxWidth: "18ch",
              }}
            >
              Pay for the
              <br />
              <em className="gold">outcome</em>, not the hours.
            </h1>
            <p
              className="animate-fadeInUp delay-200"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                lineHeight: 1.7,
                color: "rgba(245,240,232,0.62)",
                maxWidth: "54ch",
              }}
            >
              Three ways to work with us -- every one of them fixed, scoped, and
              measured by the outcome we agreed on at the start. No hourly
              billing. No moving goalposts. No surprises on the invoice.
            </p>
          </div>
        </section>

        {/* TIERS */}
        <section className="section" style={{ background: "var(--off-white)" }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "1.5rem",
                alignItems: "stretch",
              }}
            >
              {TIERS.map((tier, idx) => (
                <TierCard key={tier.number} tier={tier} index={idx} />
              ))}
            </div>

            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--slate-light)",
                textAlign: "center",
                marginTop: "3rem",
              }}
            >
              All prices AUD · GST not included · Australian businesses only
            </p>
          </div>
        </section>

        {/* RISK REVERSAL */}
        <section
          className="section"
          style={{ background: "var(--warm-cream)" }}
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
                gap: "clamp(2rem, 5vw, 5rem)",
                alignItems: "start",
              }}
            >
              <div>
                <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                  Our promise
                </span>
                <h2
                  className="h-section"
                  style={{
                    color: "var(--midnight-ink)",
                    marginTop: "1rem",
                    maxWidth: "16ch",
                  }}
                >
                  We carry the risk on
                  <br />
                  <em className="gold">being right</em>.
                </h2>
              </div>
              <div>
                <p
                  className="body-copy"
                  style={{ maxWidth: "48ch", marginBottom: "1.5rem" }}
                >
                  Most AI consultancies sell hours and hope the outcome
                  follows. We sell the outcome and back it with the only
                  guarantee that means anything -- money.
                </p>
                <p className="body-copy" style={{ maxWidth: "48ch" }}>
                  If your 30-Day Pilot doesn&apos;t hit the measurable target we
                  agreed on at kickoff, you don&apos;t pay the final invoice.
                  That&apos;s the whole offer. No fine print, no carve-outs, no
                  &quot;we tried our best&quot;.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          className="section"
          style={{
            background: "var(--midnight-ink)",
            color: "var(--warm-cream)",
          }}
        >
          <div className="container">
            <div
              style={{
                paddingBottom: "clamp(2rem, 4vw, 3.5rem)",
                borderBottom: "1px solid var(--rule-cream)",
              }}
            >
              <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                Questions you&apos;d ask in the call
              </span>
              <h2
                className="h-section"
                style={{ marginTop: "1rem", color: "var(--warm-cream)" }}
              >
                The fine print,
                <br />
                <em className="gold">up front</em>.
              </h2>
            </div>
            <div style={{ marginTop: "2.5rem", maxWidth: "60rem" }}>
              {FAQ.map((item, idx) => (
                <article
                  key={item.q}
                  style={{
                    padding: "1.75rem 0",
                    borderBottom: "1px solid var(--rule-cream)",
                    animation: `fadeInUp 0.6s var(--ease-out) ${idx * 0.06}s both`,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.2rem, 1.6vw, 1.5rem)",
                      fontWeight: 400,
                      lineHeight: 1.25,
                      color: "var(--warm-cream)",
                      margin: "0 0 0.65rem",
                    }}
                  >
                    {item.q}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.92rem",
                      lineHeight: 1.75,
                      color: "rgba(245,240,232,0.62)",
                      margin: 0,
                      maxWidth: "62ch",
                    }}
                  >
                    {item.a}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="section-tight"
          style={{
            background: "var(--warm-cream)",
            textAlign: "center",
            paddingBlock: "clamp(4rem, 8vw, 6rem)",
          }}
        >
          <div className="container">
            <h2
              className="h-section"
              style={{
                color: "var(--midnight-ink)",
                maxWidth: "20ch",
                margin: "0 auto 1.25rem",
              }}
            >
              Thirty days. One outcome.
              <br />
              <em className="gold">Fixed price</em>.
            </h2>
            <p
              className="body-copy"
              style={{ maxWidth: "44ch", margin: "0 auto 2.5rem" }}
            >
              Most pilots start within two weeks of the discovery call. Slots
              are limited because we run two at a time.
            </p>
            <a href="/#contact" className="cta cta-ink">
              Book a pilot call <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function TierCard({ tier, index }: { tier: Tier; index: number }) {
  const featured = tier.featured;
  return (
    <article
      style={{
        position: "relative",
        background: featured ? "var(--midnight-ink)" : "var(--milk-white)",
        color: featured ? "var(--warm-cream)" : "var(--midnight-ink)",
        border: featured
          ? "1px solid var(--rule-gold)"
          : "1px solid var(--rule)",
        padding: "clamp(2rem, 3vw, 2.75rem)",
        display: "flex",
        flexDirection: "column",
        animation: `fadeInUp 0.7s var(--ease-out) ${index * 0.08}s both`,
      }}
    >
      {featured && (
        <span
          style={{
            position: "absolute",
            top: -1,
            right: -1,
            background: "var(--liquid-gold)",
            color: "var(--midnight-ink)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            padding: "0.45rem 0.85rem",
            fontWeight: 700,
          }}
        >
          Recommended
        </span>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "1.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--liquid-gold)",
          }}
        >
          {tier.eyebrow}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.14em",
            color: featured ? "rgba(245,240,232,0.42)" : "var(--slate-light)",
          }}
        >
          {tier.number}
        </span>
      </div>

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.75rem, 2.4vw, 2.25rem)",
          fontWeight: 400,
          lineHeight: 1.1,
          margin: "0 0 0.75rem",
          letterSpacing: "-0.01em",
        }}
      >
        {tier.name}
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.65rem",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.25rem, 3.2vw, 2.85rem)",
            fontWeight: 300,
            color: featured ? "var(--liquid-gold)" : "var(--midnight-ink)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {tier.price}
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: featured ? "rgba(245,240,232,0.5)" : "var(--slate-light)",
          marginBottom: "1.5rem",
        }}
      >
        {tier.cadence}
      </span>

      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.1rem, 1.5vw, 1.25rem)",
          fontStyle: "italic",
          lineHeight: 1.35,
          color: featured ? "var(--warm-cream)" : "var(--midnight-ink)",
          margin: "0 0 1.25rem",
        }}
      >
        {tier.pitch}
      </p>

      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.88rem",
          lineHeight: 1.7,
          color: featured ? "rgba(245,240,232,0.6)" : "var(--slate-mid)",
          margin: "0 0 1.75rem",
        }}
      >
        {tier.description}
      </p>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--liquid-gold)",
          marginBottom: "0.85rem",
        }}
      >
        What&apos;s included
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 1.75rem",
          flex: 1,
        }}
      >
        {tier.includes.map((line) => (
          <li
            key={line}
            style={{
              display: "flex",
              gap: "0.6rem",
              alignItems: "flex-start",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              lineHeight: 1.55,
              color: featured ? "rgba(245,240,232,0.78)" : "var(--slate-mid)",
              marginBottom: "0.6rem",
            }}
          >
            <Check
              size={14}
              strokeWidth={1.5}
              aria-hidden="true"
              style={{
                color: "var(--liquid-gold)",
                marginTop: 4,
                flexShrink: 0,
              }}
            />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: featured ? "rgba(245,240,232,0.42)" : "var(--slate-light)",
          marginBottom: "0.35rem",
        }}
      >
        Typical outcomes
      </div>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.82rem",
          lineHeight: 1.55,
          color: featured ? "rgba(245,240,232,0.72)" : "var(--slate-mid)",
          margin: "0 0 1.25rem",
        }}
      >
        {tier.outcomes}
      </p>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: featured ? "rgba(245,240,232,0.42)" : "var(--slate-light)",
          marginBottom: "0.35rem",
        }}
      >
        Best fit
      </div>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.82rem",
          lineHeight: 1.55,
          color: featured ? "rgba(245,240,232,0.72)" : "var(--slate-mid)",
          margin: "0 0 2rem",
        }}
      >
        {tier.ideal}
      </p>

      <a
        href={tier.cta.href}
        className={featured ? "cta cta-gold" : "cta cta-outline-ink"}
        style={{ alignSelf: "flex-start" }}
      >
        {tier.cta.label} <ArrowRight size={14} aria-hidden="true" />
      </a>
    </article>
  );
}
