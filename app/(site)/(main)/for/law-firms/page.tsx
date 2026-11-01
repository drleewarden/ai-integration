import { ArrowRight, Clock, FileText, ScrollText, Search } from "lucide-react";
import type { Metadata } from "next";
import FAQ from "@/app/components/FAQ";
import { BreadcrumbSchema } from "@/app/components/Schema";
import { PRICING_PHASES } from "@/lib/pricing";

const URL_PATH = "/for/law-firms";
const BASE_URL = "https://www.creative-milk.com.au";

export const metadata: Metadata = {
  title: "AI for Law Firms Australia | Creative Milk",
  description:
    "AI for small Australian law firms: document review, matter intake and time capture. Published pricing from AUD $5K. A lawyer checks every output.",
  alternates: { canonical: URL_PATH },
  openGraph: {
    title: "AI for Law Firms: Fixed-Price Builds, a Lawyer in the Loop",
    description:
      "Creative Milk builds AI systems for small Australian law firms, starting with a Discovery Sprint that finds the one workflow worth building first.",
    url: URL_PATH,
    type: "website",
    // Defining openGraph replaces the root layout's, so re-declare the
    // file-convention share image explicitly.
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI for Law Firms: Fixed-Price Builds, a Lawyer in the Loop",
    description:
      "Creative Milk builds AI systems for small Australian law firms, starting with a Discovery Sprint that finds the one workflow worth building first.",
    images: ["/twitter-image"],
  },
};

// Prices come from lib/pricing.ts (the single source of truth) so this page
// cannot drift from /pricing. The display strings use an en dash for ranges;
// the brand rule is a plain hyphen, so normalise it here.
const phaseById = (id: "discovery" | "build") => {
  const phase = PRICING_PHASES.find((p) => p.id === id);
  if (!phase) throw new Error(`Missing pricing phase: ${id}`);
  return {
    name: phase.name,
    price: phase.priceDisplay.replace(/–/g, "-"),
    duration: phase.duration.replace(/–/g, "-"),
  };
};

const DISCOVERY = phaseById("discovery");
const BUILD = phaseById("build");

const PAINS = [
  {
    icon: <FileText size={22} strokeWidth={1.4} />,
    title: "Lawyers doing first-pass reading",
    body: "Discovery bundles, leases, supply agreements and disclosure documents all need a first read for the same clauses and dates. It is necessary work, but it does not need a lawyer's judgement until the second read.",
  },
  {
    icon: <ScrollText size={22} strokeWidth={1.4} />,
    title: "Every new matter starts with the same admin",
    body: "Intake forms, ID checks, engagement letters and opening the file in your practice management system. The matter stalls here before any legal work begins.",
  },
  {
    icon: <Clock size={22} strokeWidth={1.4} />,
    title: "Time that never reaches a time entry",
    body: "A ten-minute call, a quick email thread, a file review between meetings. If it is not captured the same day it is usually not captured at all, and the firm has done the work for free.",
  },
];

const SYSTEMS = [
  {
    number: "01",
    icon: <Search size={20} strokeWidth={1.4} />,
    title: "Research and summarisation",
    body: "A system that searches the sources you already pay for, then produces a structured research brief in your firm's template. Every point cites its source so a lawyer can check it. Where the sources run out, it says so instead of guessing.",
  },
  {
    number: "02",
    icon: <FileText size={20} strokeWidth={1.4} />,
    title: "Document review against your playbook",
    body: "AI reads contracts and bundles, flags clauses that deviate from your standard positions, and pulls out dates and obligations into your file. A lawyer reviews the flags before anything is relied on.",
  },
  {
    number: "03",
    icon: <ScrollText size={20} strokeWidth={1.4} />,
    title: "Matter intake and engagement letters",
    body: "AI collects the intake details, drafts the engagement letter from your templates and pre-fills the matter record. It is staged for partner sign-off, so nobody starts from a blank page.",
  },
  {
    number: "04",
    icon: <Clock size={20} strokeWidth={1.4} />,
    title: "Time capture from emails and calendar",
    body: "With consent, AI drafts time entries from the emails, calls and calendar events of the day and matches them to a matter. The fee earner approves, edits or rejects each one.",
  },
];

const FAQS = [
  {
    q: "What does AI actually do for a small law firm?",
    a: "AI takes on the high-volume, low-judgement work around a matter: first-pass document review against your playbook, research summaries with cited sources, matter intake and engagement letter drafts, and time entries drafted from emails and calendar events. A lawyer reviews every output before it is relied on or sent. Creative Milk starts with a Discovery Sprint to find which of these is worth building first in your firm.",
  },
  {
    q: "Is client data and legal professional privilege protected?",
    a: "Privilege and confidentiality are settled before anything is built, not after. The Discovery Sprint maps where client matter data would be processed and stored, whether any of it could be used to train a model, and what your privilege, confidentiality and Privacy Act obligations require. Those decisions are agreed with you and written down. If a workflow cannot be built safely, the Sprint says so.",
  },
  {
    q: "How much does AI for a law firm cost?",
    a: `Creative Milk publishes its pricing. A Discovery Sprint is ${DISCOVERY.price} over ${DISCOVERY.duration} and ends with a go or no-go decision and a fixed price for the build. Build & Integrate is ${BUILD.price} over ${BUILD.duration}, fixed at the end of the Sprint. The Sprint stands alone: the plan is yours and there is no obligation to proceed with Creative Milk.`,
  },
  {
    q: "Is this only for big firms?",
    a: "No. Creative Milk deliberately works with small businesses, which includes solo practitioners, boutique practices and small to mid-size firms. It does not build for enterprise legal departments. The aim is a project that can be scoped, shipped in weeks and handed over, rather than a year-long programme.",
  },
  {
    q: "What happens if the system does not hit the agreed numbers?",
    a: "The success metrics are set at the end of the Discovery Sprint. If Build & Integrate does not hit them, Creative Milk stays involved until it does. That guarantee is attached to every Build & Integrate engagement.",
  },
];

export default function LawFirmsPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "AI for Law Firms",
    provider: { "@id": `${BASE_URL}/#organisation` },
    areaServed: { "@type": "Country", name: "Australia" },
    description:
      "AI systems for small Australian law firms: research summaries, document review, matter intake and time capture, scoped through a fixed-price Discovery Sprint.",
    url: `${BASE_URL}${URL_PATH}`,
  };

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "AI for Law Firms", url: URL_PATH },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero */}
      <section
        className="section"
        style={{
          backgroundColor: "var(--midnight-ink)",
          paddingTop: "clamp(6rem, 12vw, 9rem)",
        }}
      >
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
            AI for law firms, Australia
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
            AI for law firms, <em className="gold">built around one workflow.</em>
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
            We build AI systems for small Australian law firms: research,
            document review, matter intake and time capture. Published
            pricing, honest timelines, and a lawyer checking every output
            before it is relied on.
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
              Book a call <ArrowRight size={14} aria-hidden="true" />
            </a>
            <a href="/pricing" className="cta cta-outline-cream">
              See published pricing
            </a>
          </div>
        </div>
      </section>

      {/* Short answer (AEO) */}
      <section
        className="section"
        style={{
          backgroundColor: "var(--warm-cream)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div className="container" style={{ maxWidth: "760px" }}>
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
            The short answer
          </p>
          <h2
            className="h-section"
            style={{ color: "var(--midnight-ink)", marginBottom: "1.25rem" }}
          >
            What can AI do for a small law firm?
          </h2>
          <p
            className="body-copy"
            style={{ color: "var(--slate-mid)", lineHeight: 1.8, marginBottom: "1rem" }}
          >
            AI is good at the high-volume, low-judgement work around a
            matter: a first read of documents against your playbook, research
            summaries with cited sources, intake and engagement letter
            drafts, and time entries drafted from your emails and calendar. It
            is not a replacement for a lawyer&apos;s advice, and a lawyer
            reviews every output.
          </p>
          <p
            className="body-copy"
            style={{ color: "var(--slate-mid)", lineHeight: 1.8 }}
          >
            The risk is spending money on the wrong one. A Discovery Sprint
            ({DISCOVERY.price}, {DISCOVERY.duration}) finds the single workflow
            with the best payback in your firm, and tells you honestly if
            none is worth building.
          </p>
        </div>
      </section>

      {/* Pains */}
      <section className="section" style={{ backgroundColor: "white" }}>
        <div className="container">
          <div
            style={{
              paddingBottom: "clamp(2rem, 4vw, 3.5rem)",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
              Where the hours go
            </p>
            <h2
              className="h-section"
              style={{ color: "var(--midnight-ink)", marginTop: "1rem", maxWidth: "20ch" }}
            >
              Three places a law firm <em className="gold">loses billable time.</em>
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {PAINS.map((pain) => (
              <article
                key={pain.title}
                style={{
                  padding: "clamp(2rem, 3vw, 3rem)",
                  borderRight: "1px solid var(--rule)",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "var(--midnight-ink)",
                    color: "var(--liquid-gold)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.75rem",
                  }}
                  aria-hidden="true"
                >
                  {pain.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.4rem, 1.9vw, 1.7rem)",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    color: "var(--midnight-ink)",
                    margin: "0 0 0.85rem",
                  }}
                >
                  {pain.title}
                </h3>
                <p
                  className="body-copy"
                  style={{ color: "var(--slate-mid)", lineHeight: 1.75, margin: 0 }}
                >
                  {pain.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Systems */}
      <section className="section" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="container">
          <div
            style={{
              paddingBottom: "clamp(2rem, 4vw, 3.5rem)",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
              What we build
            </p>
            <h2
              className="h-section"
              style={{ color: "var(--midnight-ink)", marginTop: "1rem", maxWidth: "20ch" }}
            >
              Four systems <em className="gold">worth considering.</em>
            </h2>
            <p
              className="body-copy"
              style={{ maxWidth: "56ch", marginTop: "1.25rem" }}
            >
              Every build is scoped to your firm and starts from one of these.
              Which one comes first depends on your matter volume and your
              existing tools, which is what the Discovery Sprint works out.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            }}
          >
            {SYSTEMS.map((s) => (
              <article
                key={s.number}
                style={{
                  padding: "clamp(2rem, 3vw, 2.75rem)",
                  borderRight: "1px solid var(--rule)",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: "var(--midnight-ink)",
                      color: "var(--liquid-gold)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-hidden="true"
                  >
                    {s.icon}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.14em",
                      color: "var(--slate-light)",
                    }}
                  >
                    {s.number}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.35rem, 1.8vw, 1.6rem)",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    color: "var(--midnight-ink)",
                    margin: "0 0 0.85rem",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  className="body-copy"
                  style={{ color: "var(--slate-mid)", lineHeight: 1.75, margin: 0 }}
                >
                  {s.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Privilege and confidentiality */}
      <section
        className="section"
        style={{ backgroundColor: "var(--midnight-ink)", color: "var(--warm-cream)" }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "clamp(2rem, 5vw, 5rem)",
              alignItems: "start",
            }}
          >
            <div>
              <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                What you would expect us to address
              </p>
              <h2
                className="h-section"
                style={{ color: "var(--warm-cream)", marginTop: "1rem", maxWidth: "18ch" }}
              >
                Privilege and confidentiality come <em className="gold">first.</em>
              </h2>
            </div>
            <div>
              <p
                className="body-copy"
                style={{ maxWidth: "48ch", marginBottom: "1.5rem", color: "rgba(245,240,232,0.62)" }}
              >
                Before anything is built, the Discovery Sprint maps where
                client matter data would be processed and stored, whether any
                of it could train a model, and what your privilege,
                confidentiality and Privacy Act obligations require.
              </p>
              <p
                className="body-copy"
                style={{ maxWidth: "48ch", color: "rgba(245,240,232,0.62)" }}
              >
                A lawyer stays responsible for every piece of work. The systems
                draft, flag and summarise. They do not give advice, and they do
                not send anything to a client on their own.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement */}
      <section className="section" style={{ backgroundColor: "white" }}>
        <div className="container">
          <div
            style={{
              paddingBottom: "clamp(2rem, 4vw, 3.5rem)",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
              How it runs
            </p>
            <h2
              className="h-section"
              style={{ color: "var(--midnight-ink)", marginTop: "1rem", maxWidth: "20ch" }}
            >
              Start small. <em className="gold">Decide with the plan in hand.</em>
            </h2>
            <p
              className="body-copy"
              style={{ maxWidth: "56ch", marginTop: "1.25rem" }}
            >
              Same published pricing as every Creative Milk engagement. Full
              detail on{" "}
              <a href="/pricing" style={{ color: "var(--midnight-ink)", fontWeight: 700 }}>
                the pricing page
              </a>
              .
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {[
              {
                num: "Phase 01",
                name: DISCOVERY.name,
                price: DISCOVERY.price,
                meta: `${DISCOVERY.duration} · Stands alone`,
                body: "A process audit of your firm, system design and success metrics for the one workflow worth fixing first. It ends with a go or no-go and a fixed price for the build. The plan is yours, with no obligation to proceed with us.",
              },
              {
                num: "Phase 02",
                name: BUILD.name,
                price: BUILD.price,
                meta: `${BUILD.duration} · Needs Phase 01`,
                body: "The production system, built into the tools your firm already uses, with full IP transfer, team training and 30 days of post-launch support. Price is fixed at the end of Phase 01. If it does not hit the agreed success metrics, we stay involved until it does.",
              },
            ].map((phase, idx) => (
              <article
                key={phase.num}
                style={{
                  padding: "clamp(2rem, 3vw, 2.75rem)",
                  borderRight: idx === 0 ? "1px solid var(--rule)" : "none",
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
                  {phase.name}
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

      {/* Who it is for */}
      <section
        className="section"
        style={{ backgroundColor: "var(--warm-cream)", borderBottom: "1px solid var(--rule)" }}
      >
        <div className="container" style={{ maxWidth: "760px" }}>
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
            Who this is for
          </p>
          <h2
            className="h-section"
            style={{ color: "var(--midnight-ink)", marginBottom: "1.25rem" }}
          >
            Small firms that can say yes to a project.
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              "Principals and managing partners who feel the review-hours pain daily",
              "Practice managers who can scope and approve a project",
              "Senior associates buried in first-pass reading who would rather do the legal work",
            ].map((item, i, arr) => (
              <li
                key={item}
                className="body-copy"
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  color: "var(--slate-mid)",
                  padding: "0.75rem 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--rule)" : "none",
                }}
              >
                <span style={{ color: "var(--liquid-gold)", flexShrink: 0 }}>-</span>
                {item}
              </li>
            ))}
          </ul>
          <p
            className="body-copy"
            style={{ color: "var(--slate-mid)", lineHeight: 1.8, marginTop: "1.5rem" }}
          >
            For a deeper look at what is and is not worth building, read{" "}
            <a
              href="/insights/blog-15-ai-law-firms"
              style={{ color: "var(--midnight-ink)", fontWeight: 700 }}
            >
              AI for law firms: what&apos;s actually worth building
            </a>
            . Working across accounting, consulting or construction as well?
            See{" "}
            <a
              href="/for/professional-services"
              style={{ color: "var(--midnight-ink)", fontWeight: 700 }}
            >
              AI for professional services firms
            </a>
            .
          </p>
        </div>
      </section>

      {/* FAQs */}
      <FAQ title="AI for law firms: FAQs" items={FAQS} />

      {/* CTA */}
      <section className="section" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div
          className="container"
          style={{ textAlign: "center", maxWidth: "52ch", marginInline: "auto" }}
        >
          <h2
            className="h-section"
            style={{ color: "var(--warm-cream)", marginBottom: "1.25rem" }}
          >
            Which workflow costs your firm the most hours?
          </h2>
          <p
            className="body-copy"
            style={{ color: "rgba(245,240,232,0.6)", marginBottom: "2.5rem", fontSize: "1rem" }}
          >
            Tell us. We will say honestly whether it is worth building, and
            what we would expect a Discovery Sprint to find.
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
