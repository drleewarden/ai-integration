import type { Metadata } from "next";
import { ArrowRight, Clock, FileText, MessageSquare, ClipboardList, Workflow, ShieldCheck } from "lucide-react";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title:
    "AI for Accounting, Legal, Consulting & Construction — Creative Milk",
  description:
    "AI integration for Australian professional services and construction firms. Reclaim ten-plus hours a week of billable capacity. Fixed-price 30-Day Pilot, measured by outcome.",
};

const PAINS = [
  {
    icon: <Clock size={22} strokeWidth={1.4} />,
    title: "Billable hours leaking into admin",
    body: "Your team is paid to advise, not to chase documents, retype contract clauses, or rebuild the same client report every Tuesday. The hours you bill are a fraction of the hours they spend.",
  },
  {
    icon: <FileText size={22} strokeWidth={1.4} />,
    title: "Document intake is the bottleneck",
    body: "Every new matter, engagement, or job starts with the same drag — extracting numbers from a PDF, sorting attachments, getting data into the system of record. It's where projects stall.",
  },
  {
    icon: <ShieldCheck size={22} strokeWidth={1.4} />,
    title: "Compliance can't be a side hustle",
    body: "ATO, ASIC, NCC, state-based licensing — the cost of a single miss outweighs a year of fees. But the people doing it well are the ones you'd rather have on client work.",
  },
];

const USE_CASES = [
  {
    number: "01",
    icon: <FileText size={20} strokeWidth={1.4} />,
    title: "Document intake & extraction",
    sectors: "Accounting · Legal · Construction",
    body: "AI extracts structured data from contracts, invoices, trust statements, BOQs, RFIs, and engagement letters — straight into Xero, MYOB, your practice management system, or your project ledger. The 40-minute manual entry becomes 90 seconds with a human in the loop.",
    win: "20–35 hours per week reclaimed across a 10-person firm",
  },
  {
    number: "02",
    icon: <ClipboardList size={20} strokeWidth={1.4} />,
    title: "Client & matter onboarding",
    sectors: "Legal · Consulting · Accounting",
    body: "AI runs the intake conversation, pulls the documents, verifies the IDs, drafts the engagement letter against your templates, and stages it for partner sign-off — before anyone on your team has touched the file.",
    win: "Onboarding time cut from 4 days to under 24 hours",
  },
  {
    number: "03",
    icon: <MessageSquare size={20} strokeWidth={1.4} />,
    title: "Automated client comms & status",
    sectors: "All sectors",
    body: "Clients ask the same questions in different words across email, SMS, and portal. AI drafts on-brand responses with the context of their matter, surfaces the questions only you can answer, and keeps every conversation logged against the right file.",
    win: "60–80% of routine client questions answered without team time",
  },
  {
    number: "04",
    icon: <Workflow size={20} strokeWidth={1.4} />,
    title: "Reporting & WIP visibility",
    sectors: "Consulting · Construction · Accounting",
    body: "Weekly client reports, WIP summaries, variance reports, project status — generated from the data already in your stack. The partner gets a draft Monday morning. The client gets a report that doesn't read like every other consultancy's.",
    win: "Half a day per partner per week back on advisory work",
  },
  {
    number: "05",
    icon: <Clock size={20} strokeWidth={1.4} />,
    title: "Time capture from communications",
    sectors: "Legal · Consulting · Accounting",
    body: "AI watches your emails, calls, and calendar (with consent), drafts the time entries against the right matter, and stages them for your one-click approval at the end of the day. The leaked hours come back as recovered revenue.",
    win: "8–15% increase in captured billable hours — pure margin",
  },
  {
    number: "06",
    icon: <ShieldCheck size={20} strokeWidth={1.4} />,
    title: "Compliance & quality assurance",
    sectors: "Legal · Construction · Accounting",
    body: "AI reads every outgoing document against your compliance rules, your engagement terms, and your prior precedent — flagging anything that doesn't match before it goes to the client. A second pair of eyes that doesn't sleep.",
    win: "Catch the costly errors at draft, not at audit",
  },
];

const PROOF_NUMBERS = [
  { value: "10+", label: "Hours per week per FTE" },
  { value: "8–15%", label: "Recovered billable capture" },
  { value: "30 days", label: "From kickoff to live system" },
  { value: "$7,500", label: "Pilot, fixed price" },
];

export default function ProfessionalServicesPage() {
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
            paddingBottom: "clamp(3rem, 6vh, 5rem)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-25%",
              right: "-15%",
              width: 760,
              height: 760,
              background:
                "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <span
              className="eyebrow animate-slideDown"
              style={{ color: "var(--liquid-gold)" }}
            >
              For accounting · legal · consulting · construction
            </span>
            <h1
              className="h-display animate-fadeInUp"
              style={{
                fontSize: "clamp(2.75rem, 8vw, 6.5rem)",
                color: "var(--warm-cream)",
                margin: "1.25rem 0 1.5rem",
                maxWidth: "16ch",
              }}
            >
              Stop billing
              <br />
              for the work that
              <br />
              <em className="gold">shouldn&apos;t exist</em>.
            </h1>
            <p
              className="animate-fadeInUp delay-200"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
                lineHeight: 1.7,
                color: "rgba(245,240,232,0.62)",
                maxWidth: "56ch",
              }}
            >
              We build AI systems for Australian accounting, legal, consulting,
              and construction firms — to take the admin off your team and put
              the hours back into client work. Fixed-price pilot. Measurable
              outcomes. No black boxes.
            </p>
            <div
              className="animate-fadeInUp delay-400"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                marginTop: "2.5rem",
              }}
            >
              <a href="/#contact" className="cta cta-gold">
                Book a pilot call <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a href="/pricing" className="cta cta-outline-cream">
                See pricing
              </a>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 0,
                marginTop: "clamp(3rem, 6vh, 5rem)",
                borderTop: "1px solid var(--rule-cream)",
              }}
            >
              {PROOF_NUMBERS.map((n, i) => (
                <div
                  key={n.label}
                  style={{
                    padding: "1.5rem 1.25rem 0",
                    borderRight:
                      i < PROOF_NUMBERS.length - 1
                        ? "1px solid var(--rule-cream)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 300,
                      fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)",
                      lineHeight: 1,
                      color: "var(--warm-cream)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {n.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(245,240,232,0.42)",
                      marginTop: "0.6rem",
                    }}
                  >
                    {n.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PAINS */}
        <section className="section" style={{ background: "var(--off-white)" }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
                gap: "clamp(2rem, 5vw, 5rem)",
                alignItems: "end",
                paddingBottom: "clamp(2rem, 4vw, 3.5rem)",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div>
                <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                  Why this matters now
                </span>
                <h2
                  className="h-section"
                  style={{
                    color: "var(--midnight-ink)",
                    marginTop: "1rem",
                    maxWidth: "16ch",
                  }}
                >
                  Three things are
                  <br />
                  <em className="gold">costing you</em> right now.
                </h2>
              </div>
              <p
                className="body-copy"
                style={{ maxWidth: "44ch", justifySelf: "end" }}
              >
                Every professional services and construction firm we&apos;ve
                worked with is bleeding margin in the same three places. The
                fix is rarely more people — it&apos;s a system.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              }}
            >
              {PAINS.map((pain, idx) => (
                <article
                  key={pain.title}
                  style={{
                    padding: "clamp(2rem, 3vw, 3rem)",
                    borderRight: "1px solid var(--rule)",
                    borderBottom: "1px solid var(--rule)",
                    animation: `fadeInUp 0.7s var(--ease-out) ${idx * 0.08}s both`,
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
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9rem",
                      lineHeight: 1.75,
                      color: "var(--slate-mid)",
                      margin: 0,
                      maxWidth: "38ch",
                    }}
                  >
                    {pain.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="section" style={{ background: "var(--warm-cream)" }}>
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
                  What we build
                </span>
                <h2
                  className="h-section"
                  style={{
                    color: "var(--midnight-ink)",
                    marginTop: "1rem",
                    maxWidth: "16ch",
                  }}
                >
                  Six systems
                  <br />
                  <em className="gold">that pay back</em> in months.
                </h2>
              </div>
              <p
                className="body-copy"
                style={{ maxWidth: "44ch", justifySelf: "end" }}
              >
                Every engagement is scoped to your specific firm, but most
                start with one of these. They are the workflows where AI moves
                from interesting to indispensable.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              }}
            >
              {USE_CASES.map((uc, idx) => (
                <article
                  key={uc.number}
                  style={{
                    padding: "clamp(2rem, 3vw, 2.75rem)",
                    borderRight: "1px solid var(--rule)",
                    borderBottom: "1px solid var(--rule)",
                    animation: `fadeInUp 0.7s var(--ease-out) ${idx * 0.06}s both`,
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
                      {uc.icon}
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        letterSpacing: "0.14em",
                        color: "var(--slate-light)",
                      }}
                    >
                      {uc.number}
                    </span>
                  </div>

                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.58rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--liquid-gold)",
                      marginBottom: "0.5rem",
                      display: "block",
                    }}
                  >
                    {uc.sectors}
                  </span>

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
                    {uc.title}
                  </h3>

                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.88rem",
                      lineHeight: 1.7,
                      color: "var(--slate-mid)",
                      margin: "0 0 1.5rem",
                    }}
                  >
                    {uc.body}
                  </p>

                  <div
                    style={{
                      paddingTop: "1rem",
                      borderTop: "1px dashed var(--rule-strong)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--forest-signal)",
                    }}
                  >
                    Typical win → {uc.win}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* COMPLIANCE / TRUST */}
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
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
                gap: "clamp(2rem, 5vw, 5rem)",
                alignItems: "start",
              }}
            >
              <div>
                <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                  What you&apos;d expect us to address
                </span>
                <h2
                  className="h-section"
                  style={{
                    color: "var(--warm-cream)",
                    marginTop: "1rem",
                    maxWidth: "18ch",
                  }}
                >
                  Yes, we&apos;ve thought
                  <br />
                  about <em className="gold">privilege, privacy,</em>
                  <br />
                  and the ATO.
                </h2>
              </div>
              <div>
                <p
                  className="body-copy"
                  style={{
                    maxWidth: "48ch",
                    marginBottom: "1.5rem",
                    color: "rgba(245,240,232,0.62)",
                  }}
                >
                  Australian data sovereignty by default. No client data
                  leaves your environment without your sign-off, and never
                  trains a third-party model. We design every system to fit
                  the way your professional indemnity, privilege, and
                  retention obligations already work.
                </p>
                <p
                  className="body-copy"
                  style={{
                    maxWidth: "48ch",
                    color: "rgba(245,240,232,0.62)",
                  }}
                >
                  We&apos;ll bring the privacy, security, and audit-trail
                  documentation to the discovery call. If your professional
                  body or insurer needs a sign-off, we&apos;ve done the work
                  before — and we&apos;ll do it again.
                </p>
              </div>
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
            <span className="eyebrow no-rule" style={{ justifyContent: "center" }}>
              Start with the pilot
            </span>
            <h2
              className="h-section"
              style={{
                color: "var(--midnight-ink)",
                maxWidth: "20ch",
                margin: "1rem auto 1.25rem",
              }}
            >
              One workflow. Thirty days.
              <br />
              <em className="gold">$7,500 fixed.</em>
            </h2>
            <p
              className="body-copy"
              style={{ maxWidth: "44ch", margin: "0 auto 2.5rem" }}
            >
              We&apos;ll pick the single workflow with the biggest payback in
              your firm, ship it, measure it, and hand it over. If we
              don&apos;t hit the outcome we agreed on, you don&apos;t pay the
              final invoice.
            </p>
            <div
              style={{
                display: "inline-flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <a href="/#contact" className="cta cta-ink">
                Book a pilot call <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a href="/pricing" className="cta cta-outline-ink">
                See full pricing
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
