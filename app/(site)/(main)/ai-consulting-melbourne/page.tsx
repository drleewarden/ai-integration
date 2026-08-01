import { ArrowRight, MapPin } from "lucide-react";
import type { Metadata } from "next";
import FAQ from "@/app/components/FAQ";
import { BreadcrumbSchema, LocalServiceSchema } from "@/app/components/Schema";

export const metadata: Metadata = {
  title: "AI Consulting Melbourne | Creative Milk",
  description:
    "AI consulting for Melbourne businesses: fixed-price Discovery Sprints from $5K, custom AI builds, honest timelines. Book a call to see what we'd build.",
  openGraph: {
    title: "AI Consulting Melbourne, Built by People Who've Shipped It",
    description:
      "Melbourne-based, AU-wide: fixed-price AI builds measured by outcomes, not deliverables. See what a Discovery Sprint would find in your business.",
    type: "website",
  },
};

const PHASES = [
  {
    num: "Phase 01",
    title: "Discovery Sprint",
    price: "AUD $5,000–$15,000",
    meta: "1–2 weeks · Stands alone",
    body: "A process audit, system design, and success metrics for the one workflow worth fixing first — ending in a go/no-go decision and a fixed Phase 2 price. The plan is yours; there's no obligation to proceed with us.",
  },
  {
    num: "Phase 02",
    title: "Build & Integrate",
    price: "AUD $30,000–$120,000",
    meta: "4–6 weeks · Needs Phase 1",
    body: "The production AI system, built and integrated into your existing tools, with full IP transfer, team training, and 30 days of post-launch support. Price is fixed at the end of Phase 1 — no surprises.",
  },
  {
    num: "Phase 03",
    title: "Managed Partnership",
    price: "AUD $5,000–$15,000/mo",
    meta: "Ongoing · 3-month minimum",
    body: "Optimisation, monitoring, reporting, and strategic advisory once the system is live — with direct access to Craig and Darryn, not a support queue.",
  },
];

const FAQS = [
  {
    q: "What does an AI consultant in Melbourne actually do?",
    a: "An AI consultant scopes one real business problem, then designs and builds (or advises on) the AI system that solves it — measured by an outcome like hours recovered or decisions improved, not by hours billed or a slide deck. Creative Milk is a Melbourne-based AI consulting and integration partnership run on a three-phase model: Discovery Sprint, Build & Integrate, and — if you want it — an ongoing Managed Partnership.",
  },
  {
    q: "How much does AI consulting cost in Melbourne?",
    a: "Creative Milk publishes its pricing. A Discovery Sprint — process audit, system design, and a fixed Phase 2 proposal — is AUD $5,000–$15,000 over 1–2 weeks. Build & Integrate — the production system, full IP transfer, and team training — is AUD $30,000–$120,000 over 4–6 weeks, priced fixed at the end of Phase 1 so there are no surprises. A Managed Partnership for ongoing optimisation runs AUD $5,000–$15,000 a month, three-month minimum.",
  },
  {
    q: "Do I have to be based in Melbourne to work with Creative Milk?",
    a: "No. Creative Milk is based in Melbourne and works with small and mid-sized businesses across Australia. Being local means discovery sessions and workshops can happen in person if that's useful to you — but the three-phase engagement runs the same whether you're down the road or interstate.",
  },
  {
    q: "What happens if the AI system doesn't hit the numbers we agreed on?",
    a: "If Phase 2 (Build & Integrate) doesn't hit the success metrics set at the end of Phase 1, Creative Milk stays involved until it does — that's the guarantee attached to every Build & Integrate engagement.",
  },
  {
    q: "Is there a low-commitment way to see how this works first?",
    a: "Yes — the “Automate Your Business” workshop. The first cohort runs Friday 7 August 2026, 3–5pm, in person at the Elwood + St Kilda Neighbourhood Learning Centre in Melbourne ($39, 24 seats). You leave with a working AI email-reply system, a repeatable pattern for spotting automatable workflows in your own business, and a 12-week measurement plan — not useful in the first 30 minutes, full refund on the spot.",
  },
];

export default function AIConsultingMelbournePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "AI Consulting Melbourne", url: "/ai-consulting-melbourne" },
        ]}
      />
      <LocalServiceSchema
        serviceName="AI Consulting Melbourne"
        areaName="Melbourne"
        description="AI consulting and custom AI system builds for Melbourne and Australia-wide small businesses, scoped around one business problem at a time and measured by outcome."
        url="/ai-consulting-melbourne"
      />

      {/* ── Hero ── */}
      <section
        className="section"
        style={{
          backgroundColor: "var(--midnight-ink)",
          paddingTop: "clamp(6rem, 12vw, 9rem)",
        }}
      >
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
            AI consulting, Melbourne
          </p>
          <h1
            className="h-display"
            style={{
              fontSize: "clamp(2.75rem, 7vw, 6rem)",
              color: "var(--warm-cream)",
              maxWidth: "20ch",
              marginBottom: "1.5rem",
            }}
          >
            AI consulting Melbourne — published pricing,{" "}
            <em className="gold">honest timelines.</em>
          </h1>
          <p
            className="body-copy"
            style={{
              maxWidth: "58ch",
              color: "rgba(245,240,232,0.6)",
              fontSize: "1.05rem",
              lineHeight: 1.7,
            }}
          >
            Creative Milk is a Melbourne-based AI consulting and integration
            partnership. We scope one business problem at a time, build the
            system in a fixed 4–6 week window, and measure it by the
            outcome it delivers — hours recovered, decisions improved —
            not by hours billed.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginTop: "2.5rem",
            }}
          >
            <a href="/contact" className="cta cta-gold">
              Book a Discovery call <ArrowRight size={14} aria-hidden="true" />
            </a>
            <a href="/pricing" className="cta cta-outline-cream">
              See published pricing
            </a>
          </div>
        </div>
      </section>

      {/* ── Short answer / AEO callout ── */}
      <section
        className="section"
        style={{ backgroundColor: "var(--warm-cream)", borderBottom: "1px solid var(--rule)" }}
      >
        <div className="container" style={{ maxWidth: "760px" }}>
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
            The short answer
          </p>
          <h2
            className="h-section"
            style={{ color: "var(--midnight-ink)", marginBottom: "1.25rem" }}
          >
            What is AI consulting, and who is it for?
          </h2>
          <p
            className="body-copy"
            style={{ color: "var(--slate-mid)", lineHeight: 1.8, marginBottom: "1rem" }}
          >
            AI consulting is the work of finding a specific, repetitive, or
            error-prone part of a business and designing an AI system that
            fixes it — then building, integrating, and (optionally)
            maintaining that system. It is not a strategy deck and it is not
            a generic chatbot bolted onto your website.
          </p>
          <p
            className="body-copy"
            style={{ color: "var(--slate-mid)", lineHeight: 1.8 }}
          >
            Creative Milk works with small businesses — solo operators,
            small teams, and agencies — across Melbourne and the rest of
            Australia. We deliberately don't chase enterprise accounts:
            we want projects we can scope, ship in weeks rather than
            quarters, and hand over, so the next business gets the same
            attention the last one did.
          </p>
        </div>
      </section>

      {/* ── Three-phase model ── */}
      <section className="section" style={{ backgroundColor: "white" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "clamp(2rem, 5vw, 5rem)",
              alignItems: "end",
              paddingBottom: "clamp(2rem, 4vw, 3.5rem)",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div>
              <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                How an engagement runs
              </p>
              <h2
                className="h-section"
                style={{ color: "var(--midnight-ink)", marginTop: "1rem", maxWidth: "18ch" }}
              >
                Three phases. Published pricing. No surprises.
              </h2>
            </div>
            <p className="body-copy" style={{ maxWidth: "44ch", justifySelf: "end" }}>
              Every Creative Milk engagement follows the same structure,
              whichever phase you start at. Full detail on{" "}
              <a href="/services" style={{ color: "var(--midnight-ink)", fontWeight: 700 }}>
                the services page
              </a>
              .
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {PHASES.map((phase, idx) => (
              <article
                key={phase.num}
                style={{
                  padding: "clamp(2rem, 3vw, 2.75rem)",
                  borderRight: idx < PHASES.length - 1 ? "1px solid var(--rule)" : "none",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <p className="eyebrow" style={{ marginBottom: "1rem" }}>
                  {phase.num}
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.35rem, 1.8vw, 1.6rem)",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    color: "var(--midnight-ink)",
                    margin: "0 0 0.5rem",
                  }}
                >
                  {phase.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.3rem, 2.2vw, 1.6rem)",
                    fontWeight: 300,
                    color: "var(--liquid-gold)",
                    margin: "0 0 0.25rem",
                  }}
                >
                  {phase.price}
                </p>
                <p className="label" style={{ color: "var(--slate-mid)", marginBottom: "1.25rem" }}>
                  {phase.meta}
                </p>
                <p
                  className="body-copy"
                  style={{ color: "var(--slate-mid)", lineHeight: 1.75, margin: 0 }}
                >
                  {phase.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Local presence / workshop ── */}
      <section
        className="section"
        style={{ backgroundColor: "var(--midnight-ink)", color: "var(--warm-cream)" }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "clamp(2rem, 5vw, 5rem)",
              alignItems: "start",
            }}
          >
            <div>
              <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                <MapPin size={13} aria-hidden="true" style={{ marginRight: "0.4rem", verticalAlign: "-2px" }} />
                In Melbourne, in person
              </p>
              <h2
                className="h-section"
                style={{ color: "var(--warm-cream)", marginTop: "1rem", maxWidth: "20ch" }}
              >
                Try it before you commit to it.
              </h2>
              <p
                className="body-copy"
                style={{ maxWidth: "48ch", marginTop: "1.25rem", color: "rgba(245,240,232,0.62)" }}
              >
                Our first in-person workshop — &ldquo;Automate your
                business: put time back in your pocket&rdquo; — runs
                Friday 7 August 2026, 3–5pm, at the Elwood + St Kilda
                Neighbourhood Learning Centre. $39, 24 seats. You leave with
                a working AI email-reply system, a repeatable pattern for
                spotting automatable workflows, and a 12-week measurement
                plan. Not useful in the first 30 minutes? Full refund on the
                spot, no questions.
              </p>
              <div style={{ marginTop: "2rem" }}>
                <a href="/events/workshop-melbourne" className="cta cta-gold">
                  Reserve my seat <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div
              style={{
                border: "1px solid var(--rule-cream)",
                padding: "clamp(1.5rem, 2.5vw, 2rem)",
              }}
            >
              <p className="label" style={{ color: "rgba(245,240,232,0.45)", marginBottom: "0.75rem" }}>
                Who this is for
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Business owners who feel the repetitive-work pain daily",
                  "COOs and operations managers who can say yes to a pilot",
                  "Project managers scoping their first AI build",
                ].map((item, i) => (
                  <li
                    key={item}
                    className="body-copy"
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      color: "rgba(245,240,232,0.62)",
                      padding: "0.6rem 0",
                      borderBottom: i < 2 ? "1px solid var(--rule-cream)" : "none",
                    }}
                  >
                    <span style={{ color: "var(--liquid-gold)", flexShrink: 0 }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <FAQ title="AI consulting Melbourne — FAQs" items={FAQS} />

      {/* ── CTA ── */}
      <section className="section" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div
          className="container"
          style={{ textAlign: "center", maxWidth: "52ch", marginInline: "auto" }}
        >
          <h2
            className="h-section"
            style={{ color: "var(--warm-cream)", marginBottom: "1.25rem" }}
          >
            Ready to scope your own Discovery Sprint?
          </h2>
          <p
            className="body-copy"
            style={{ color: "rgba(245,240,232,0.6)", marginBottom: "2.5rem", fontSize: "1rem" }}
          >
            Tell us the workflow that's costing you the most hours. We'll
            tell you honestly whether it's worth building — and what
            we'd expect a Discovery Sprint to find.
          </p>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}
          >
            <a href="/contact" className="cta cta-gold">
              Book a call <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href="/pricing" className="cta cta-outline-cream">
              See full pricing
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
