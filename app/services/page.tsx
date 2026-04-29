import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Implementation Services Australia | 3-Phase Model | Creative Milk",
  description:
    "Custom AI implementation services for Australian businesses. Discovery Sprint from AUD $5K. Build & Integrate from $30K. Published pricing, change management included. Book a call.",
};

const faqs = [
  {
    q: "Do we have to do all three phases?",
    a: "No. Each phase stands alone. Most clients start with a Discovery Sprint, then proceed to Phase 2. Phase 3 is optional and many clients choose to maintain the system internally after Phase 2.",
  },
  {
    q: "What affects the price range within each phase?",
    a: "For the Discovery Sprint: the number of processes in scope and the complexity of your current tech stack. For Phase 2: the complexity of the system, the number of integrations, and the size of the team we're training. The Discovery Sprint locks in a fixed price for Phase 2 before you commit.",
  },
  {
    q: "What if the system doesn't hit the success metrics?",
    a: "We define the success metrics together in Phase 1. If the Phase 2 system doesn't hit them, we stay involved until it does. That's part of what the 95% outcome rate means — we don't declare something done until it works.",
  },
  {
    q: "Who will we work with?",
    a: "Craig and Darryn directly. You won't be handed to a junior consultant or an offshore team. The two founders are accountable for every engagement.",
  },
  {
    q: "Do you work with businesses outside Melbourne?",
    a: "Yes. We work with businesses across Australia. Discovery Sprints and ongoing partnership calls are done remotely. For Phase 2 builds that require on-site work, we travel.",
  },
];

export default function Services() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--liquid-gold)" }}>
            HOW WE WORK
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight" style={{ color: "var(--warm-cream)" }}>
            Three phases. One end-to-end partner.
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
            We don't hand off after the strategy session. We don't disappear after the build ships. One engagement takes you from scoped problem to live system to ongoing outcomes — with a single partner across all three phases.
          </p>
        </div>
      </section>

      {/* Phase 1 */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            PHASE 01
          </p>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-2" style={{ color: "var(--midnight-ink)" }}>
                Find out exactly what's possible — before you commit to anything.
              </h2>
              <p className="text-2xl font-bold mt-4 mb-1" style={{ color: "var(--midnight-ink)" }}>AUD $5,000–$15,000</p>
              <p className="text-sm mb-6" style={{ color: "rgba(15,21,38,0.5)" }}>1–2 weeks · Can stand alone</p>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
                <p>
                  Most AI projects fail because nobody defined success before they started. The Discovery Sprint fixes that.
                </p>
                <p>
                  We spend 1–2 weeks inside your business — understanding your processes, your stack, and the specific problem you want solved. You don't have to proceed to Phase 2. Many clients run the Discovery Sprint and implement the plan themselves. That's fine — the plan is yours.
                </p>
              </div>
              <div className="mt-8 p-5 rounded-2xl border" style={{ borderColor: "rgba(15,21,38,0.1)", backgroundColor: "white" }}>
                <p className="text-sm font-semibold mb-3" style={{ color: "rgba(15,21,38,0.4)" }}>Ideal for</p>
                <ul className="space-y-2">
                  {[
                    "Businesses that aren't sure if AI is right for them",
                    "Teams that have heard the promise before and want proof before committing",
                    "Organisations that want a scoped plan they can take to other providers if they choose",
                  ].map((item, i) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: "rgba(15,21,38,0.7)" }}>
                      <span style={{ color: "var(--liquid-gold)" }}>—</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: "rgba(15,21,38,0.4)" }}>What's included</h3>
              <div className="space-y-3">
                {[
                  ["Process audit", "We map your current workflows and identify AI leverage points"],
                  ["Stack review", "We assess your existing tech for integration feasibility"],
                  ["Problem scoping", "We define one or more specific problems worth solving"],
                  ["Success metrics", "We agree the exact outcomes we'll measure"],
                  ["Go/no-go recommendation", "Honest advice — including if we think AI isn't the right answer"],
                  ["Phase 2 proposal", "Fixed-price, scoped proposal ready to proceed if you choose"],
                ].map(([k, v], i) => (
                  <div key={i} className="py-3 border-b" style={{ borderColor: "rgba(15,21,38,0.08)" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--midnight-ink)" }}>{k}</p>
                    <p className="text-sm" style={{ color: "rgba(15,21,38,0.6)" }}>{v}</p>
                  </div>
                ))}
              </div>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}
              >
                Start with a Discovery Sprint <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 2 */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            PHASE 02
          </p>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-2" style={{ color: "var(--midnight-ink)" }}>
                Built for your stack. Owned by your team.
              </h2>
              <p className="text-2xl font-bold mt-4 mb-1" style={{ color: "var(--midnight-ink)" }}>AUD $30,000–$120,000</p>
              <p className="text-sm mb-6" style={{ color: "rgba(15,21,38,0.5)" }}>4–6 weeks · Scope and pricing locked in at end of Phase 1</p>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
                <p>
                  We work inside your existing tech stack — not a proprietary platform that requires ongoing fees. When it ships, your IT lead can read the code, your team knows how to use it, and you own the IP outright.
                </p>
                <p>
                  Change management isn't an upsell here. It's standard. 67% of mid-market AI projects fail because the team doesn't adopt the system. We build the adoption plan into the engagement from the start.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-2xl" style={{ backgroundColor: "rgba(15,21,38,0.04)" }}>
                <p className="text-sm font-bold" style={{ color: "var(--midnight-ink)" }}>Human-architected. Agent-accelerated.</p>
                <p className="text-sm mt-1" style={{ color: "rgba(15,21,38,0.6)" }}>Strategic thinking from Craig and Darryn. Execution compressed by AI-native tooling.</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: "rgba(15,21,38,0.4)" }}>What's included</h3>
              <div className="space-y-3">
                {[
                  ["System build", "Custom AI system designed to the Phase 1 specification"],
                  ["Stack integration", "Built into your existing tools — no new vendor dependencies"],
                  ["Testing & QA", "Validated against the success metrics agreed in Phase 1"],
                  ["Change management", "Structured adoption plan for your team — included as standard"],
                  ["Team training", "Hands-on sessions so your team owns the system, not just uses it"],
                  ["IP transfer", "Full ownership of the system transfers to you on completion"],
                  ["Documentation", "Plain-English system documentation for your team and IT"],
                  ["30-day post-launch support", "We stay close for the first month to resolve any issues"],
                ].map(([k, v], i) => (
                  <div key={i} className="py-3 border-b" style={{ borderColor: "rgba(15,21,38,0.08)" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--midnight-ink)" }}>{k}</p>
                    <p className="text-sm" style={{ color: "rgba(15,21,38,0.6)" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 3 */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            PHASE 03
          </p>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-2" style={{ color: "var(--midnight-ink)" }}>
                We stay until the outcomes compound.
              </h2>
              <p className="text-2xl font-bold mt-4 mb-1" style={{ color: "var(--midnight-ink)" }}>AUD $5,000–$15,000/month</p>
              <p className="text-sm mb-6" style={{ color: "rgba(15,21,38,0.5)" }}>Optional — not every engagement continues to Phase 3</p>
              <p className="text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
                Most AI systems improve significantly in the first 3–6 months as they process real data and we refine the model. The Managed Partnership keeps us involved through that period — monitoring performance, adjusting the system, and measuring outcomes against the targets we set in Phase 1.
              </p>
              <p className="mt-4 text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
                You don't need Phase 3. Many clients run Phase 2, take ownership, and maintain the system internally. Phase 3 is for businesses that want ongoing optimisation and a strategic AI partner they can call.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: "rgba(15,21,38,0.4)" }}>What's included</h3>
              <div className="space-y-3">
                {[
                  ["Performance monitoring", "Regular review of system output against Phase 1 success metrics"],
                  ["Continuous optimisation", "Refinements to the model based on real-world performance data"],
                  ["Monthly reporting", "Plain-English report: what the system did, what changed, what's next"],
                  ["Strategic advisory", "Access to Craig and Darryn for ongoing AI decisions and expansion"],
                  ["Priority support", "Direct line for issues — not a ticketing queue"],
                ].map(([k, v], i) => (
                  <div key={i} className="py-3 border-b" style={{ borderColor: "rgba(15,21,38,0.08)" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--midnight-ink)" }}>{k}</p>
                    <p className="text-sm" style={{ color: "rgba(15,21,38,0.6)" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            WHY CREATIVE MILK
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Published pricing",
                body: "We're one of the only AI agencies in Australia that publishes what things cost. Professional services buyers make better decisions with real numbers. So do we.",
              },
              {
                title: "Change management standard",
                body: "67–80% of AI projects fail because the team doesn't adopt the system. Every engagement includes a structured adoption plan and hands-on team training. Not as an upsell. As a basic requirement.",
              },
              {
                title: "You own everything",
                body: "We don't build on proprietary platforms that keep you dependent on us. Your system runs on your stack. Your team gets trained to own it. IP transfers on completion.",
              },
            ].map((d, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border"
                style={{ borderColor: "rgba(245,240,232,0.1)", backgroundColor: "rgba(245,240,232,0.03)" }}
              >
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--warm-cream)" }}>{d.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.6)" }}>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10" style={{ color: "var(--midnight-ink)" }}>Common questions</h2>
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
            Not sure which phase you need? Start with a conversation.
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(245,240,232,0.65)" }}>
            Tell us what you're trying to solve. We'll tell you whether a Discovery Sprint makes sense, what it would cost, and what we'd expect to find. No commitment required.
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
              href="/work"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold border transition-all hover:opacity-80"
              style={{ borderColor: "rgba(245,240,232,0.3)", color: "var(--warm-cream)" }}
            >
              See the work
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
