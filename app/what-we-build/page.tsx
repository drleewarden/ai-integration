import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What AI Can Do For Your Business | Use Cases & Applications | Creative Milk",
  description:
    "Practical AI applications for Australian businesses — customer support, sales intelligence, operations automation, document processing, and more. Real systems with real outcomes. Creative Milk.",
};

const useCases = [
  {
    eyebrow: "USE CASE 01",
    headline: "Stop your best people from answering the same question 40 times a day.",
    body: "Most support queues are 60–70% tier-1 queries — password resets, billing questions, feature how-tos — that follow predictable patterns and require no human judgement. AI handles these end-to-end. What's left for your team is the work that actually needs them.",
    builds: [
      "Intelligent ticket triage and auto-resolution systems",
      "AI-powered knowledge base with real-time update capability",
      "Escalation routing with pre-populated context for the support agent",
      "Multi-channel coverage: email, chat, in-app",
    ],
    outcomes: [
      "60% reduction in tier-1 ticket volume",
      "34% reduction in average handling time on escalated tickets",
      "Support team NPS improvement — staff report higher satisfaction on complex work",
    ],
    caseStudy: "How we cut support volume 60% for a SaaS platform",
    fit: "Businesses with 500+ tickets/week and a repeating pattern in tier-1 queries",
  },
  {
    eyebrow: "USE CASE 02",
    headline: "Stop leaving revenue in the data you already have.",
    body: "E-commerce businesses are sitting on purchase history, browse behaviour, and session data that most of them never fully use. AI turns that data into personalised product and content experiences that convert at a measurably higher rate — without increasing ad spend.",
    builds: [
      "Personalised product recommendation engines (homepage, PDP, post-purchase)",
      "Dynamic pricing models for inventory management and margin optimisation",
      "Customer lifetime value prediction and segmentation",
      "Abandoned cart and replenishment trigger systems",
    ],
    outcomes: [
      "+35% conversion rate lift from personalisation",
      "4.1× email recommendation click-through rate",
      "22% increase in return customer purchase rate",
    ],
    caseStudy: "How we delivered +35% conversion for an e-commerce business",
    fit: "E-commerce businesses with 12+ months of transaction data and returning customers",
  },
  {
    eyebrow: "USE CASE 03",
    headline: "The manual processes that eat your team's week don't have to.",
    body: "Operations work — data entry, report generation, approval routing, document processing, scheduling — follows rules. Rules can be automated. The question isn't whether it's possible; it's which processes are worth automating first, and in what order they compound.",
    builds: [
      "End-to-end workflow automation for approval, routing, and notification chains",
      "Data entry and form processing automation",
      "Document classification, extraction, and filing systems",
      "Scheduling and resource allocation optimisation",
    ],
    outcomes: [
      "40–60% reduction in manual data entry hours",
      "2–3 day process cycle times compressed to same-day",
      "Error rates in manual data processes reduced to near-zero",
    ],
    caseStudy: null,
    fit: "Businesses where staff spend 30%+ of their week on repeatable, rules-based tasks",
  },
  {
    eyebrow: "USE CASE 04",
    headline: "Stop paying your analysts to pull reports. Start paying them to think.",
    body: "Standard reporting — weekly dashboards, client reports, performance summaries — is valuable. The manual process of generating it is not. AI handles the data pull, the formatting, the distribution, and the anomaly detection. Your analysts focus on what the numbers mean and what to do about them.",
    builds: [
      "Automated report generation and distribution (scheduled or triggered)",
      "Anomaly detection and intelligent alerting",
      "Plain-English performance summaries generated from structured data",
      "Decision-support dashboards that surface insights, not just data",
    ],
    outcomes: [
      "85% reduction in time spent on standard reporting",
      "10× faster delivery from data event to insight",
      "Anomalies caught automatically that were previously missed for days or weeks",
    ],
    caseStudy: "How we gave a SaaS analytics team 12 hours back per week",
    fit: "Teams running 10+ regular reports and spending more than 20% of analyst time on report generation",
  },
  {
    eyebrow: "USE CASE 05",
    headline: "Documents are where professional services businesses lose the most time.",
    body: "Accounting firms, law firms, financial advisers, and construction businesses process enormous volumes of documents — contracts, invoices, applications, compliance forms. Reading, classifying, extracting data from, and routing these documents is skilled but time-consuming work. AI handles the routine volume. Your team handles the judgement calls.",
    builds: [
      "Contract review and clause extraction systems",
      "Invoice and purchase order processing automation",
      "Compliance document classification and flagging",
      "Application intake processing (for financial, legal, NDIS contexts)",
    ],
    outcomes: [
      "70–80% reduction in document processing time",
      "Same-day turnaround on intake documents previously taking 2–3 days",
      "Compliance flag accuracy exceeding manual review rates",
    ],
    caseStudy: null,
    fit: "Professional services businesses processing 50+ structured documents per week",
  },
  {
    eyebrow: "USE CASE 06",
    headline: "What if every new team member could access the knowledge of your most experienced one?",
    body: "Growing businesses accumulate knowledge in the heads of their longest-serving people. When those people are unavailable — or when they leave — that knowledge walks out with them. AI knowledge systems capture, organise, and make that expertise accessible to the whole team in real time.",
    builds: [
      "Internal AI knowledge assistants trained on company documentation and processes",
      "Onboarding acceleration systems (new team members ask, the system answers)",
      "Meeting intelligence and action extraction",
      "SOPs and process documentation automation",
    ],
    outcomes: [
      "New hire time-to-productivity reduced by 30–40%",
      "Reduction in repeated questions to senior staff",
      "Documentation coverage improvement from ad hoc to systematic",
    ],
    caseStudy: null,
    fit: "Businesses growing headcount and experiencing knowledge transfer friction",
  },
];

const industries = [
  { name: "Professional Services", sub: "Accounting, legal, financial advice", problems: "Document processing, client intake, compliance, reporting" },
  { name: "Construction & Trades", sub: null, problems: "Project scheduling, procurement, safety reporting, document management" },
  { name: "E-Commerce", sub: null, problems: "Recommendations, personalisation, inventory, customer retention" },
  { name: "Healthcare & NDIS", sub: null, problems: "Intake, scheduling, compliance documentation, care coordination" },
  { name: "SaaS", sub: null, problems: "Support automation, analytics, onboarding, churn prediction" },
];

export default function WhatWeBuild() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--liquid-gold)" }}>
            WHAT WE BUILD
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight" style={{ color: "var(--warm-cream)" }}>
            Here's what AI actually does for a business like yours.
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
            Not a list of tools. Not a buzzword glossary. Real systems, organised by the type of problem you're trying to solve. Find your situation and see what's been built for businesses in exactly the same position.
          </p>
          <p className="mt-6 text-sm" style={{ color: "rgba(245,240,232,0.45)" }}>
            We've applied AI to 50+ business problems. These are the categories where we see the most consistent, measurable impact.
          </p>
        </div>
      </section>

      {/* Use cases */}
      {useCases.map((uc, idx) => (
        <section
          key={idx}
          className="py-20 px-4 sm:px-6 lg:px-8"
          style={{ backgroundColor: idx % 2 === 0 ? "var(--warm-cream)" : "white" }}
        >
          <div className="max-w-7xl mx-auto">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
              {uc.eyebrow}
            </p>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--midnight-ink)" }}>
                  {uc.headline}
                </h2>
                <p className="text-base leading-relaxed mb-6" style={{ color: "rgba(15,21,38,0.7)" }}>
                  {uc.body}
                </p>
                <div className="p-4 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(15,21,38,0.05)" }}>
                  <p className="font-semibold mb-1" style={{ color: "rgba(15,21,38,0.5)" }}>Best fit:</p>
                  <p style={{ color: "rgba(15,21,38,0.7)" }}>{uc.fit}</p>
                </div>
                {uc.caseStudy && (
                  <a href="/work" className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--midnight-ink)" }}>
                    {uc.caseStudy} <ArrowRight size={14} />
                  </a>
                )}
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "rgba(15,21,38,0.4)" }}>What we build</h3>
                  <ul className="space-y-2">
                    {uc.builds.map((b, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "rgba(15,21,38,0.7)" }}>
                        <span className="flex-shrink-0 mt-0.5 text-base" style={{ color: "var(--liquid-gold)" }}>—</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "rgba(15,21,38,0.4)" }}>Outcomes we've measured</h3>
                  <ul className="space-y-2">
                    {uc.outcomes.map((o, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "rgba(15,21,38,0.7)" }}>
                        <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}>✓</span>
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Industries */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--warm-cream)" }}>
            Every industry has different AI leverage points. Find yours.
          </h2>
          <p className="text-base mb-12" style={{ color: "rgba(245,240,232,0.55)" }}>
            Industry-specific pages coming soon. In the meantime, book a call and we'll walk through what we'd target first in your sector.
          </p>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {industries.map((ind, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border"
                style={{ borderColor: "rgba(245,240,232,0.1)", backgroundColor: "rgba(245,240,232,0.03)" }}
              >
                <h3 className="font-bold mb-1" style={{ color: "var(--warm-cream)" }}>{ind.name}</h3>
                {ind.sub && <p className="text-xs mb-3" style={{ color: "rgba(245,240,232,0.4)" }}>{ind.sub}</p>}
                <p className="text-xs leading-relaxed" style={{ color: "rgba(245,240,232,0.5)" }}>{ind.problems}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "var(--midnight-ink)" }}>
            Tell us the problem. We'll tell you where AI fits — if it does.
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(15,21,38,0.65)" }}>
            Some businesses come to us knowing exactly what they want to automate. Most don't. That's fine — finding the right starting point is exactly what the Discovery Sprint is for. We scope the problem, assess the opportunity, and give you an honest recommendation on whether AI is the right answer and where it'll have the most impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--midnight-ink)", color: "var(--warm-cream)" }}
            >
              Book a call <ArrowRight size={18} />
            </a>
            <a
              href="/process"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold border transition-all hover:opacity-80"
              style={{ borderColor: "rgba(15,21,38,0.3)", color: "var(--midnight-ink)" }}
            >
              See how our process works
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
