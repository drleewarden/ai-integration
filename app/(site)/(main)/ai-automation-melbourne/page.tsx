import type { Metadata } from "next";
import { ArrowRight, Check, MapPin } from "lucide-react";
import FAQ from "@/app/components/FAQ";
import { BreadcrumbSchema, LocalServiceSchema } from "@/app/components/Schema";

export const metadata: Metadata = {
  title: "AI Automation Melbourne | AI Agents for Small Business | Creative Milk",
  description:
    "Melbourne AI automation for small and mid-sized businesses. Creative Milk builds custom AI agents, workflow automations, and integrations with human approval controls.",
  alternates: { canonical: "/ai-automation-melbourne" },
  openGraph: {
    title: "AI Automation Melbourne | Creative Milk",
    description:
      "Custom AI agents and workflow automations built into the systems your team already uses.",
    type: "website",
  },
};

const WORKFLOWS = [
  {
    title: "Finance and document processing",
    body: "Read invoices and receipts, validate the data, post entries into Xero, and send low-confidence items to a person for review.",
  },
  {
    title: "Lead and client intake",
    body: "Qualify enquiries, collect the right information, update your CRM, draft the next document, and route the opportunity to the right person.",
  },
  {
    title: "Email and service operations",
    body: "Triage incoming messages, draft replies using approved business knowledge, update records, and escalate exceptions before anything is sent.",
  },
  {
    title: "Knowledge and project support",
    body: "Give staff reliable answers across policies, drawings, specifications, and project files, with source links and a review queue for unclear cases.",
  },
  {
    title: "Reporting and follow-up",
    body: "Pull data from multiple systems, prepare recurring reports, flag changes, and trigger the follow-up tasks that normally fall between the cracks.",
  },
  {
    title: "Approvals and handovers",
    body: "Move work through defined approval steps, notify the next owner, keep an audit trail, and involve a person wherever judgement is required.",
  },
];

const CAPABILITIES = [
  "Melbourne-based, founder-led team",
  "Workflow discovery and process mapping",
  "Custom AI agents and integrations",
  "Human approval and exception controls",
  "Team training included with every build",
  "Full client ownership of code and documentation",
  "Published pricing and fixed build scope",
  "Ongoing monitoring available when needed",
];

const FAQS = [
  {
    q: "What can a small business automate with AI?",
    a: "Good starting points are repetitive, high-volume workflows with clear inputs and outcomes. Common examples include invoice processing, email triage, lead qualification, client onboarding, document preparation, internal knowledge search, CRM updates, recurring reports, and follow-up. Creative Milk starts with the workflow costing your team the most time, then tests whether automation is commercially worthwhile.",
  },
  {
    q: "What is the difference between automation and an AI agent?",
    a: "Traditional automation follows fixed rules. An AI agent can interpret unstructured information, choose from permitted next actions, use connected tools, and send uncertain cases to a person. The safest business systems combine both: rules for predictable steps, AI where interpretation is needed, and human approval around consequential actions.",
  },
  {
    q: "Can an AI agent connect to Xero, HubSpot, Microsoft 365, or our CRM?",
    a: "Usually, yes. Creative Milk designs around your existing stack and connects systems through supported APIs and secure integration layers. Feasibility, permissions, data quality, and security requirements are checked during discovery before a build is proposed.",
  },
  {
    q: "How much does AI automation cost in Melbourne?",
    a: "Creative Milk publishes its pricing. A Discovery Sprint costs AUD $5,000 to $15,000. A production Build & Integrate engagement costs AUD $30,000 to $120,000, with the fixed price confirmed after discovery. Ongoing management is optional and starts at AUD $5,000 per month.",
  },
  {
    q: "Does Creative Milk work with small businesses?",
    a: "Yes. Creative Milk works with small and mid-sized businesses where a valuable recurring workflow can justify custom implementation. Existing examples include accounting, legal, and construction teams with 8 to 22 staff. Very simple needs may be better solved with an off-the-shelf tool, and Creative Milk will say so during discovery.",
  },
  {
    q: "How long does an AI automation project take?",
    a: "Discovery normally takes 1 to 2 weeks. A scoped production system is usually built and integrated in 4 to 6 weeks. The goal is first measurable value in 6 to 8 weeks, followed by a 30-day support window and optional ongoing optimisation.",
  },
];

export default function AIAutomationMelbournePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "AI Automation Melbourne", url: "/ai-automation-melbourne" },
        ]}
      />
      <LocalServiceSchema
        serviceName="AI Automation and Custom AI Agents"
        areaName="Melbourne"
        description="Custom AI agents and multi-step workflow automation for Melbourne small and mid-sized businesses, integrated into existing business systems with human approval controls."
        url="/ai-automation-melbourne"
      />

      <section
        className="section"
        style={{
          backgroundColor: "var(--midnight-ink)",
          color: "var(--warm-cream)",
          paddingTop: "clamp(8rem, 14vw, 11rem)",
        }}
      >
        <div className="container">
          <p className="eyebrow" style={{ color: "var(--liquid-gold)", marginBottom: "1.5rem" }}>
            AI automation, Melbourne
          </p>
          <h1
            className="h-display"
            style={{
              color: "var(--warm-cream)",
              fontSize: "clamp(3rem, 7.5vw, 6.5rem)",
              maxWidth: "17ch",
              marginBottom: "1.75rem",
            }}
          >
            AI agents and workflows that <em className="gold">do the work.</em>
          </h1>
          <p
            className="body-copy"
            style={{ color: "rgba(245,240,232,0.68)", fontSize: "1.08rem", maxWidth: "62ch" }}
          >
            Creative Milk is a Melbourne AI automation company. We design and
            implement agents that work across email, documents, CRM, accounting,
            and operational systems, with a person in control wherever judgement
            matters.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "2.5rem" }}>
            <a href="/contact" className="cta cta-gold">
              Discuss your workflow <ArrowRight size={14} aria-hidden="true" />
            </a>
            <a href="/work" className="cta cta-outline-cream">
              See production examples
            </a>
          </div>
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.55rem",
              marginTop: "2rem",
              color: "rgba(245,240,232,0.48)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <MapPin size={14} aria-hidden="true" /> South Melbourne, working Australia-wide
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--warm-cream)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(2rem, 6vw, 6rem)" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>What agentic means here</p>
            <h2 className="h-section" style={{ color: "var(--midnight-ink)", maxWidth: "15ch" }}>
              More than a chatbot. <em className="gold">Less than a black box.</em>
            </h2>
          </div>
          <div>
            <p className="body-copy" style={{ fontSize: "1.05rem", marginBottom: "1.25rem" }}>
              An agentic workflow is an automated process in which AI can
              interpret information, choose the next permitted action, use
              connected business tools, and escalate exceptions to a person.
            </p>
            <p className="body-copy">
              We define the boundaries, permissions, review points, and success
              measures before the system is built. Your team can see what it did,
              approve consequential actions, and take over whenever needed.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--off-white)" }}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>Workflows we automate</p>
          <h2 className="h-section" style={{ color: "var(--midnight-ink)", maxWidth: "17ch", marginBottom: "3rem" }}>
            Start with the work that <em className="gold">keeps coming back.</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", borderTop: "1px solid var(--rule)", borderLeft: "1px solid var(--rule)" }}>
            {WORKFLOWS.map((workflow, index) => (
              <article key={workflow.title} style={{ padding: "clamp(1.75rem, 3vw, 2.5rem)", borderRight: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}>
                <span className="eyebrow" style={{ color: "var(--liquid-gold)" }}>{String(index + 1).padStart(2, "0")}</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.65rem", fontWeight: 400, color: "var(--midnight-ink)", margin: "1.3rem 0 0.8rem" }}>
                  {workflow.title}
                </h3>
                <p className="body-copy">{workflow.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--midnight-ink)", color: "var(--warm-cream)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(2.5rem, 7vw, 7rem)", alignItems: "start" }}>
          <div>
            <p className="eyebrow" style={{ color: "var(--liquid-gold)", marginBottom: "1.25rem" }}>Why Creative Milk</p>
            <h2 className="h-section" style={{ color: "var(--warm-cream)", maxWidth: "16ch" }}>
              Built for adoption, not just <em className="gold">demonstration.</em>
            </h2>
            <p className="body-copy" style={{ color: "rgba(245,240,232,0.62)", marginTop: "1.5rem", maxWidth: "50ch" }}>
              Our production examples include accounting, legal, and construction
              teams with 8 to 22 staff. Each system was measured by time recovered
              or work completed faster, not by the number of features shipped.
            </p>
          </div>
          <div style={{ borderTop: "1px solid rgba(245,240,232,0.15)" }}>
            {CAPABILITIES.map((capability) => (
              <div key={capability} style={{ display: "flex", gap: "0.85rem", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid rgba(245,240,232,0.1)", color: "rgba(245,240,232,0.78)", fontFamily: "var(--font-sans)", fontSize: "0.9rem" }}>
                <Check size={16} color="var(--liquid-gold)" aria-hidden="true" />
                {capability}
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQ title="AI automation Melbourne FAQs" items={FAQS} />

      <section className="section" style={{ background: "var(--liquid-gold)", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: "760px" }}>
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>One workflow first</p>
          <h2 className="h-section" style={{ color: "var(--midnight-ink)", marginBottom: "1.25rem" }}>
            Tell us what is costing your team the most hours.
          </h2>
          <p className="body-copy" style={{ color: "rgba(15,21,38,0.72)", marginBottom: "2rem" }}>
            We&apos;ll tell you whether AI is the right answer, what we would test,
            and what a useful first engagement looks like.
          </p>
          <a href="/contact" className="cta" style={{ background: "var(--midnight-ink)", color: "var(--warm-cream)" }}>
            Discuss your workflow <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}
