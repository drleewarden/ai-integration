import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Implementation Pricing Australia | Published Rates | Creative Milk",
  description:
    "Creative Milk publishes AI implementation pricing. Discovery Sprint from AUD $5K. Build & Integrate from $30K. Managed Partnership from $5K/month. No hidden fees.",
};

const faqs = [
  {
    q: "Is there flexibility in the pricing?",
    a: "The price ranges reflect real variation in engagement complexity. A Discovery Sprint for a single process with a clean tech stack costs less than one scoping multiple integrations across a complex stack. Phase 2 pricing is fixed once Phase 1 is complete — no surprises from that point. We don't negotiate on price for the same scope.",
  },
  {
    q: "Do we need to do all three phases?",
    a: "No. Each phase stands alone. The Discovery Sprint is a contained engagement — you get a plan and a recommendation. Phase 2 requires Phase 1 because the scope and fixed price are determined there. Phase 3 is optional — many clients run their system independently after Phase 2.",
  },
  {
    q: "What if the system doesn't hit the success metric?",
    a: "We define the success metrics together in Phase 1. If Phase 2 doesn't hit them, we stay involved until it does. That's part of what the 95% outcome rate means — we don't declare something done until the outcome is real.",
  },
  {
    q: "Can we start with a smaller engagement?",
    a: "The Discovery Sprint is the entry point. At AUD $5,000–$15,000, it's the lowest-risk way to find out whether AI is the right answer for your specific problem, what it would cost to build, and what outcome you'd expect.",
  },
  {
    q: "What's your capacity?",
    a: "We take a limited number of engagements at any one time. If we're at capacity, we'll tell you when we can start and give you the option of being on the list. We don't rush engagements to fit more in — that's how 95% outcome rates drop.",
  },
  {
    q: "Do you work with businesses outside Melbourne?",
    a: "Yes. Discovery Sprints are mostly remote — we can run them anywhere. For Phase 2 builds requiring on-site work, we travel. We've worked with businesses across Australia.",
  },
];

export default function Pricing() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--liquid-gold)" }}>
            PRICING
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight" style={{ color: "var(--warm-cream)" }}>
            Most AI agencies won't tell you what it costs. We will.
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
            We publish our pricing because we think hiding it wastes everyone's time. If the numbers don't fit your budget, we'd rather you know now. If they do — let's talk about what we'd build.
          </p>
        </div>
      </section>

      {/* Phases */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-base mb-12 max-w-2xl" style={{ color: "rgba(15,21,38,0.65)" }}>
            Every Creative Milk engagement follows the same three-phase architecture. Each phase can stand alone. Most clients proceed through all three.
          </p>

          <div className="space-y-8">
            {/* Phase 1 */}
            <div className="rounded-3xl border overflow-hidden" style={{ borderColor: "rgba(15,21,38,0.12)" }}>
              <div className="px-8 py-6 flex flex-col md:flex-row md:items-center gap-4 justify-between" style={{ backgroundColor: "var(--midnight-ink)" }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--liquid-gold)" }}>PHASE 01</p>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--warm-cream)" }}>Discovery Sprint</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: "var(--liquid-gold)" }}>AUD $5K–$15K</p>
                  <p className="text-sm" style={{ color: "rgba(245,240,232,0.5)" }}>1–2 weeks · Can stand alone</p>
                </div>
              </div>
              <div className="px-8 py-8 grid md:grid-cols-2 gap-8" style={{ backgroundColor: "white" }}>
                <div>
                  <p className="text-base leading-relaxed mb-4" style={{ color: "rgba(15,21,38,0.7)" }}>
                    The Discovery Sprint is a scoped investigation into your specific business problem. We spend 1–2 weeks understanding your processes, your stack, and the opportunity.
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
                    We come out with a specific system design, agreed success metrics, a go/no-go recommendation, and a fixed-price Phase 2 proposal if we both want to proceed. The plan is yours — no obligation to proceed with us.
                  </p>
                  <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: "rgba(15,21,38,0.04)" }}>
                    <p className="text-xs font-bold mb-2" style={{ color: "rgba(15,21,38,0.45)" }}>WHAT AFFECTS THE PRICE</p>
                    <p className="text-sm" style={{ color: "rgba(15,21,38,0.65)" }}>Lower ($5K): single process, clear brief, simple tech stack</p>
                    <p className="text-sm mt-1" style={{ color: "rgba(15,21,38,0.65)" }}>Upper ($15K): multiple processes, complex integrations, larger stakeholder group</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    "Process audit and opportunity map",
                    "Scoped system design",
                    "Agreed success metric",
                    "Go/no-go recommendation with supporting rationale",
                    "Fixed-price Phase 2 proposal (if applicable)",
                    "The plan is yours — no obligation to proceed with us",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: "rgba(15,21,38,0.7)" }}>
                      <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="rounded-3xl border overflow-hidden" style={{ borderColor: "rgba(15,21,38,0.12)" }}>
              <div className="px-8 py-6 flex flex-col md:flex-row md:items-center gap-4 justify-between" style={{ backgroundColor: "var(--midnight-ink)" }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--liquid-gold)" }}>PHASE 02</p>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--warm-cream)" }}>Build & Integrate</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: "var(--liquid-gold)" }}>AUD $30K–$120K</p>
                  <p className="text-sm" style={{ color: "rgba(245,240,232,0.5)" }}>4–6 weeks · Requires Phase 1</p>
                </div>
              </div>
              <div className="px-8 py-8 grid md:grid-cols-2 gap-8" style={{ backgroundColor: "white" }}>
                <div>
                  <p className="text-base leading-relaxed mb-4" style={{ color: "rgba(15,21,38,0.7)" }}>
                    We build the system to the specification from Phase 1. Production-ready, integrated into your existing stack, with change management and team training included as standard. IP transfers to you on completion.
                  </p>
                  <p className="font-semibold text-sm mb-4" style={{ color: "var(--midnight-ink)" }}>
                    The Phase 2 price is fixed at the end of Phase 1. No surprises.
                  </p>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(15,21,38,0.04)" }}>
                    <p className="text-xs font-bold mb-2" style={{ color: "rgba(15,21,38,0.45)" }}>WHAT AFFECTS THE PRICE</p>
                    <p className="text-sm" style={{ color: "rgba(15,21,38,0.65)" }}>Lower ($30K): single integration, defined scope, small team</p>
                    <p className="text-sm mt-1" style={{ color: "rgba(15,21,38,0.65)" }}>Upper ($120K): multiple integrations, complex data pipelines, larger team, extensive training</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    "Production AI system running in your stack",
                    "Full IP transfer — code, documentation, model",
                    "Team training and adoption plan (standard)",
                    "30-day post-launch support window",
                    "Outcome measurement framework",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: "rgba(15,21,38,0.7)" }}>
                      <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="rounded-3xl border overflow-hidden" style={{ borderColor: "rgba(15,21,38,0.12)" }}>
              <div className="px-8 py-6 flex flex-col md:flex-row md:items-center gap-4 justify-between" style={{ backgroundColor: "var(--midnight-ink)" }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--liquid-gold)" }}>PHASE 03</p>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--warm-cream)" }}>Managed Partnership</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: "var(--liquid-gold)" }}>AUD $5K–$15K<span className="text-lg">/mo</span></p>
                  <p className="text-sm" style={{ color: "rgba(245,240,232,0.5)" }}>Ongoing · Optional</p>
                </div>
              </div>
              <div className="px-8 py-8 grid md:grid-cols-2 gap-8" style={{ backgroundColor: "white" }}>
                <p className="text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
                  Ongoing optimisation, performance monitoring, and strategic advisory. We stay close as the system processes real data and improves over time. Monthly reporting against Phase 1 success metrics. Direct access to Craig and Darryn. Typically a 3-month minimum, month-to-month thereafter.
                </p>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(15,21,38,0.04)" }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "rgba(15,21,38,0.45)" }}>WHAT AFFECTS THE PRICE</p>
                  <p className="text-sm mb-2" style={{ color: "rgba(15,21,38,0.65)" }}>Lower ($5K/month): monitoring and reporting only, stable system</p>
                  <p className="text-sm" style={{ color: "rgba(15,21,38,0.65)" }}>Upper ($15K/month): active optimisation, model retraining, expansion planning</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why we publish */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12" style={{ color: "var(--warm-cream)" }}>
            Three reasons we put numbers on the page.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "It respects your time",
                body: "Professional services buyers make better decisions with real numbers. If our engagement costs are outside your budget, it's better for both of us to know before the first call.",
              },
              {
                num: "02",
                title: "It signals how we work",
                body: "Agencies that hide pricing often have flexible pricing — meaning the price depends on what they think you'll pay. We don't work that way. Our prices reflect the scope and complexity of the work.",
              },
              {
                num: "03",
                title: "It creates better conversations",
                body: "When you know what things cost, we can have a real conversation about what's worth doing. The first call becomes about the problem — not a quote request.",
              },
            ].map((r, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border"
                style={{ borderColor: "rgba(245,240,232,0.1)", backgroundColor: "rgba(245,240,232,0.03)" }}
              >
                <p className="text-xs font-bold mb-3" style={{ color: "var(--liquid-gold)" }}>{r.num}</p>
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--warm-cream)" }}>{r.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.6)" }}>{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10" style={{ color: "var(--midnight-ink)" }}>
            Common questions
          </h2>
          <div className="space-y-8">
            {faqs.map((faq, i) => (
              <div key={i} className="pb-8 border-b" style={{ borderColor: "rgba(15,21,38,0.08)" }}>
                <h3 className="font-bold mb-3" style={{ color: "var(--midnight-ink)" }}>{faq.q}</h3>
                <p className="text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "var(--warm-cream)" }}>
            Ready to see what we'd build for your budget?
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(245,240,232,0.65)" }}>
            Tell us about your problem and your rough budget range. We'll tell you which phase makes sense to start with and what we'd expect to find in a Discovery Sprint.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}
            >
              Book a call <ArrowRight size={18} />
            </a>
            <a
              href="/process"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold border transition-all hover:opacity-80"
              style={{ borderColor: "rgba(245,240,232,0.3)", color: "var(--warm-cream)" }}
            >
              See our process
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
