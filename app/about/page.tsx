import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Creative Milk | AI Implementation Partners | Craig & Darryn",
  description:
    "Creative Milk is an Australian AI implementation agency founded by Craig and Darryn. We build custom AI systems that deliver measurable outcomes. Two founders. Direct accountability.",
};

const principles = [
  {
    num: "01",
    title: "Outcomes before everything",
    body: "An AI system that ships on time and on budget but doesn't hit its target is a failed project. We define the success metric before we build anything. That's what the 95% outcome rate means.",
  },
  {
    num: "02",
    title: "Plain English is a professional standard",
    body: "If we can't explain what we're building in plain English, we don't have a clear enough picture of the problem. Jargon is a warning sign, not a mark of expertise.",
  },
  {
    num: "03",
    title: "The people matter as much as the system",
    body: "67–80% of mid-market AI projects fail not because the technology doesn't work — but because the team doesn't adopt it. Change management is standard in every engagement. Not optional. Not an upsell.",
  },
  {
    num: "04",
    title: "You should own what we build",
    body: "We build on your stack. IP transfers on completion. Your team is trained to run the system without us. If you want to take it to another provider, you can. Dependency isn't a business model we want.",
  },
];

export default function About() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--liquid-gold)" }}>
            ABOUT
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight" style={{ color: "var(--warm-cream)" }}>
            We got tired of watching good businesses pay for AI that didn't work.
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
            Creative Milk exists because there's a gap between what AI agencies promise and what they deliver. We built the practice we wished existed when we were on the other side of that table.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            WHY WE EXIST
          </p>
          <div className="grid md:grid-cols-2 gap-16">
            <h2 className="text-4xl font-bold" style={{ color: "var(--midnight-ink)" }}>
              The problem we kept seeing.
            </h2>
            <div className="space-y-4 text-lg leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
              <p>
                Between us, we'd spent years watching the same failure mode repeat.
              </p>
              <p>
                A business hears that AI will transform their operations. They talk to an agency. The agency produces a strategy document, or configures a tool, or builds a proof of concept that works in isolation and fails in practice. The business spends the budget, the team gets frustrated, and "AI" becomes a word that makes the founder sigh.
              </p>
              <p>
                The failure wasn't usually the technology. It was the gap between what was promised and what got built — and the absence of anyone willing to stay accountable for whether it actually worked.
              </p>
              <p>
                That's the gap Creative Milk was built to close. We don't do strategy-only engagements. We don't disappear after the build. We define success before we start, we build to that definition, and we measure whether we hit it. That's the whole model.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Craig */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div
              className="aspect-square rounded-3xl flex items-end p-8"
              style={{ backgroundColor: "rgba(15,21,38,0.06)" }}
            >
              <p className="text-sm" style={{ color: "rgba(15,21,38,0.4)" }}>Photo — Craig</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--liquid-gold)" }}>
                CO-FOUNDER
              </p>
              <h2 className="text-3xl font-bold mb-1" style={{ color: "var(--midnight-ink)" }}>Craig</h2>
              <p className="text-sm font-medium mb-6" style={{ color: "rgba(15,21,38,0.5)" }}>
                Strategy, Client Relationships &amp; Marketing
              </p>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
                <p>
                  Craig brings the strategy and communication layer to every Creative Milk engagement. His role is to make sure every engagement starts with the right problem.
                </p>
                <p>
                  He runs Discovery Sprints, translates between business outcomes and technical requirements, and stays accountable to the client through the full lifecycle.
                </p>
                <p>
                  He's also the reason our case studies are written in plain English. If he can't explain the system to a client's CFO in five minutes, the brief isn't finished.
                </p>
              </div>
            </div>
          </div>

          {/* Darryn */}
          <div className="grid md:grid-cols-2 gap-12 items-start md:flex-row-reverse">
            <div className="md:order-2">
              <div
                className="aspect-square rounded-3xl flex items-end p-8"
                style={{ backgroundColor: "rgba(15,21,38,0.06)" }}
              >
                <p className="text-sm" style={{ color: "rgba(15,21,38,0.4)" }}>Photo — Darryn</p>
              </div>
            </div>
            <div className="md:order-1">
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--liquid-gold)" }}>
                CO-FOUNDER
              </p>
              <h2 className="text-3xl font-bold mb-1" style={{ color: "var(--midnight-ink)" }}>Darryn</h2>
              <p className="text-sm font-medium mb-6" style={{ color: "rgba(15,21,38,0.5)" }}>
                Architecture, Build &amp; Technical Delivery
              </p>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
                <p>
                  Darryn designs and builds the systems. He takes the problem definition from Phase 1 and turns it into a production system that runs in your stack, integrates with your tools, and transfers cleanly to your team.
                </p>
                <p>
                  He's also the reason we can deliver in 6–8 weeks. Not because we cut corners — because he builds systems the right way the first time and uses AI-native tooling throughout the build to compress timelines without compromising quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            OUR PRINCIPLES
          </p>
          <h2 className="text-4xl font-bold mb-12" style={{ color: "var(--warm-cream)" }}>
            Four things we believe about AI implementation.
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {principles.map((p, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border"
                style={{ borderColor: "rgba(245,240,232,0.1)", backgroundColor: "rgba(245,240,232,0.03)" }}
              >
                <p className="text-xs font-bold mb-3" style={{ color: "var(--liquid-gold)" }}>{p.num}</p>
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--warm-cream)" }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.6)" }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Working model */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            HOW WE WORK TOGETHER
          </p>
          <div className="grid md:grid-cols-2 gap-16">
            <h2 className="text-4xl font-bold" style={{ color: "var(--midnight-ink)" }}>
              Two founders. One accountable team.
            </h2>
            <div className="space-y-4 text-lg leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
              <p>
                When you work with Creative Milk, you work with Craig and Darryn directly. There are no account managers between you and the people doing the work. No junior consultants running the project while the principals are elsewhere. The people you talk to in the sales conversation are the people who build your system.
              </p>
              <p>
                That's not a feature that scales infinitely — and we know it. We take a limited number of engagements at any one time because that's what it takes to deliver a 95% outcome rate.
              </p>
              <p>
                If you're looking for a large agency with 50 people and multiple project streams, we're not it. If you want two experienced people who are accountable for your outcome from day one, that's exactly what we are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "var(--warm-cream)" }}>
            Ready to work with us?
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(245,240,232,0.65)" }}>
            Tell us about the problem you're trying to solve. We respond within 24 hours with an honest assessment of whether we can help and what that would look like.
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
