import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our AI Implementation Process | Discovery Sprint to Managed Partnership | Creative Milk",
  description:
    "See exactly how Creative Milk delivers AI systems in 6–8 weeks. Discovery Sprint, Build & Integrate, Managed Partnership — with published pricing and a 95% outcome rate.",
};

const failureModes = [
  {
    label: "No success metric defined upfront",
    body: '"We want to use AI" is not a brief. Projects without a measurable target can\'t be declared done — and can\'t be called successful.',
  },
  {
    label: "Strategy without implementation",
    body: "Consultants produce roadmaps. Nobody builds the system. Businesses pay for a document and get nothing running.",
  },
  {
    label: "Technology without people",
    body: "A system can be technically perfect and still fail if the team doesn't adopt it. Most agencies deliver software. Nobody trains the humans.",
  },
  {
    label: "Vendor dependency",
    body: "Agencies that build on proprietary platforms leave clients locked in. When the agency relationship ends, the system stops.",
  },
];

const stats = [
  { value: "50+", label: "Engagements delivered" },
  { value: "95%", label: "Outcome rate" },
  { value: "$2M+", label: "Revenue lifted" },
  { value: "6–8 wks", label: "Average delivery" },
];

const timeline = [
  { period: "Week 0", label: "First call (30 mins)", body: "You describe the problem. We ask questions. We agree whether a Discovery Sprint makes sense. If it does, we send a proposal within 48 hours." },
  { period: "Weeks 1–2", label: "Discovery Sprint", body: "Stakeholder interviews, process mapping, stack audit. We identify the system worth building. We agree the success metric. We deliver the go/no-go and Phase 2 proposal." },
  { period: "Week 2–3", label: "Decision point", body: "You review the Phase 2 proposal. Fixed price, fixed scope, fixed timeline. You decide whether to proceed. There's no pressure — the Discovery Sprint plan is yours regardless." },
  { period: "Weeks 3–8", label: "Build & Integrate", body: "We build. Daily standups at the start. Weekly check-ins through the build. You see the system before it's live. We train the team in weeks 7–8." },
  { period: "Week 8", label: "Launch", body: "System goes live in your stack. Outcome measurement begins from day one." },
  { period: "Weeks 8–12", label: "30-day support window", body: "We stay close. Any issues, refinements, or adoption questions — we're on it." },
  { period: "Month 3+", label: "Managed Partnership (optional)", body: "If you want ongoing optimisation and a strategic AI partner, Phase 3 begins. If not, you run the system and we're available if you need us." },
];

export default function Process() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--liquid-gold)" }}>
            HOW WE WORK
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight" style={{ color: "var(--warm-cream)" }}>
            We tell you up front what we can ship in 6–8 weeks.
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
            Most AI projects fail not because the technology doesn't work — but because nobody defined success before they started. We scope every engagement around a measurable outcome. That's how we get to 95%.
          </p>
        </div>
      </section>

      {/* Why projects fail */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            THE PROBLEM WITH HOW AI IS USUALLY DONE
          </p>
          <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--midnight-ink)" }}>
            The technology rarely fails. The implementation does.
          </h2>
          <p className="text-lg mb-12 max-w-2xl" style={{ color: "rgba(15,21,38,0.65)" }}>
            67–80% of mid-market AI projects fail to deliver their promised ROI. The reasons are predictable:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {failureModes.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border"
                style={{ borderColor: "rgba(15,21,38,0.12)", backgroundColor: "white" }}
              >
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full mt-0.5" style={{ backgroundColor: "#dc3545" }} />
                  <div>
                    <h3 className="font-bold mb-2" style={{ color: "var(--midnight-ink)" }}>{f.label}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(15,21,38,0.65)" }}>{f.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm" style={{ color: "rgba(15,21,38,0.55)" }}>
            We've spent years watching these failure modes repeat. Our process is built around preventing all four.
          </p>
        </div>
      </section>

      {/* Approach */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            OUR APPROACH
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--warm-cream)" }}>
            Human-architected. Agent-accelerated.
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(245,240,232,0.65)" }}>
            Strategic thinking comes from Craig and Darryn — experienced practitioners who've built and managed AI systems across 50+ engagements. Execution is accelerated by AI-native tooling that compresses delivery timelines without compromising quality. Every engagement follows the same architecture: define success → build to spec → measure outcomes.
          </p>
        </div>
      </section>

      {/* Phase 1 */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            PHASE 01 · 1–2 WEEKS · AUD $5K–$15K
          </p>
          <h2 className="text-4xl font-bold mb-6" style={{ color: "var(--midnight-ink)" }}>
            Define the problem. Set the target. Make the decision.
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
              <p>
                The Discovery Sprint is where we earn the right to build something.
              </p>
              <p>
                We spend 1–2 weeks inside your business. We map the processes you're trying to improve, assess your existing tech stack for integration feasibility, and identify the specific problem worth solving. Then we do something most agencies skip: we tell you honestly whether the ROI justifies the investment.
              </p>
              <p>
                Some clients run the Discovery Sprint and find that a simpler solution — not AI — is the right answer. We'll tell you that. It's not a sales pitch. It's a professional assessment.
              </p>
              <div className="mt-6 p-5 rounded-2xl" style={{ backgroundColor: "rgba(15,21,38,0.05)" }}>
                <p className="text-sm italic" style={{ color: "rgba(15,21,38,0.6)" }}>
                  "We don't know if AI is right for us."
                </p>
                <p className="text-sm mt-2 font-medium" style={{ color: "var(--midnight-ink)" }}>
                  That's the Discovery Sprint's job. You find out before you commit to a build.
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide" style={{ color: "rgba(15,21,38,0.4)" }}>What happens in a Discovery Sprint</h3>
              <div className="space-y-3">
                {[
                  ["Stakeholder interviews", "Understand the real problem, not just the stated one"],
                  ["Process mapping", "Document current workflows and identify AI leverage points"],
                  ["Stack audit", "Assess integration feasibility and surface any blockers"],
                  ["Success metric definition", "Agree the measurable outcome we'll target"],
                  ["Go/no-go recommendation", "Honest advice — including if we think AI isn't the right answer"],
                  ["Phase 2 proposal", "Fixed-price, scoped proposal ready to proceed if you choose"],
                ].map(([k, v], i) => (
                  <div key={i} className="flex gap-3 py-3 border-b" style={{ borderColor: "rgba(15,21,38,0.08)" }}>
                    <span className="text-sm font-semibold min-w-[160px]" style={{ color: "var(--midnight-ink)" }}>{k}</span>
                    <span className="text-sm" style={{ color: "rgba(15,21,38,0.6)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 2 */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            PHASE 02 · 4–6 WEEKS · AUD $30K–$120K
          </p>
          <h2 className="text-4xl font-bold mb-6" style={{ color: "var(--midnight-ink)" }}>
            We build the system. Your team learns to own it.
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
              <p>
                Phase 2 is the build. Everything is defined — the system design, the integrations, the success metrics, the fixed price. We build.
              </p>
              <p>
                We work inside your existing stack. No proprietary platform. No new vendor relationships. The system uses the tools your team already has, extended with AI capabilities.
              </p>
              <p>
                <strong style={{ color: "var(--midnight-ink)" }}>Change management is not optional.</strong> Every Phase 2 engagement includes an adoption plan built alongside the system — not retrofitted after — plus hands-on training sessions with the people who will use the system daily.
              </p>
              <div className="mt-6 p-5 rounded-2xl" style={{ backgroundColor: "rgba(15,21,38,0.04)" }}>
                <p className="text-sm italic" style={{ color: "rgba(15,21,38,0.6)" }}>
                  "We tried something like this before and the team never used it."
                </p>
                <p className="text-sm mt-2 font-medium" style={{ color: "var(--midnight-ink)" }}>
                  We know. That's why change management is standard. The system your team doesn't adopt is a system that doesn't work.
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide" style={{ color: "rgba(15,21,38,0.4)" }}>What's delivered at the end of Phase 2</h3>
              <div className="space-y-3">
                {[
                  ["Live system", "Running in your stack, connected to your data"],
                  ["IP transfer", "You own the code, the model, the documentation"],
                  ["Team training", "Your team can use and manage the system independently"],
                  ["Documentation", "Plain-English guide for users and your IT team"],
                  ["30-day support", "We stay close for the first month after launch"],
                  ["Outcome measurement", "Dashboard or report showing the metrics we agreed in Phase 1"],
                ].map(([k, v], i) => (
                  <div key={i} className="flex gap-3 py-3 border-b" style={{ borderColor: "rgba(15,21,38,0.08)" }}>
                    <span className="text-sm font-semibold min-w-[160px]" style={{ color: "var(--midnight-ink)" }}>{k}</span>
                    <span className="text-sm" style={{ color: "rgba(15,21,38,0.6)" }}>{v}</span>
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
            PHASE 03 · ONGOING · AUD $5K–$15K/MONTH
          </p>
          <h2 className="text-4xl font-bold mb-6" style={{ color: "var(--midnight-ink)" }}>
            We stay until the outcomes compound.
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
              <p>
                Most AI systems improve significantly in the first 3–6 months as they process real data and we refine the model. The Managed Partnership keeps us involved through that period.
              </p>
              <p>
                This phase is optional. Many clients complete Phase 2 and manage the system internally. We built it so they can. Phase 3 is for businesses that want a strategic AI partner on retainer.
              </p>
              <div className="mt-6 p-5 rounded-2xl" style={{ backgroundColor: "rgba(15,21,38,0.05)" }}>
                <p className="text-sm italic" style={{ color: "rgba(15,21,38,0.6)" }}>
                  "We don't want to be dependent on you forever."
                </p>
                <p className="text-sm mt-2 font-medium" style={{ color: "var(--midnight-ink)" }}>
                  You won't be. Phase 2 is designed so your team owns the system and can run it without us. Phase 3 is a choice, not a dependency. If you cancel, your system keeps running.
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                "Monthly performance review against Phase 1 success metrics",
                "Continuous model optimisation based on real-world data",
                "Expansion planning — where to apply AI next as the first system beds in",
                "Direct access to Craig and Darryn for questions and strategic decisions",
                "Priority support — not a ticketing queue",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 py-3 border-b text-base" style={{ borderColor: "rgba(15,21,38,0.08)", color: "rgba(15,21,38,0.7)" }}>
                  <span className="flex-shrink-0 mt-1 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 95% stat */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            THE NUMBER THAT MATTERS
          </p>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <h2 className="text-4xl font-bold" style={{ color: "var(--warm-cream)" }}>
              95% of our engagements hit their defined success metric.
            </h2>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
              <p>
                That number means something specific. Before every Phase 2 build, we agree a measurable target with the client — a specific metric that defines "it worked." The 95% is the percentage of engagements where that metric was hit.
              </p>
              <p>
                The 5% that didn't hit target: in most cases, the external conditions changed (business pivot, team restructure, market shift) rather than the system failing. We'll explain the details if you ask.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-12 rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(245,240,232,0.08)", backgroundColor: "rgba(245,240,232,0.04)" }}>
            {stats.map((s, i) => (
              <div key={i} className="px-6 py-5" style={{ backgroundColor: "rgba(245,240,232,0.02)" }}>
                <div className="text-3xl font-bold mb-1" style={{ color: "var(--liquid-gold)" }}>{s.value}</div>
                <div className="text-sm" style={{ color: "rgba(245,240,232,0.5)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            A REAL ENGAGEMENT
          </p>
          <h2 className="text-4xl font-bold mb-12" style={{ color: "var(--midnight-ink)" }}>
            From first call to live system — what the timeline actually looks like.
          </h2>
          <div className="space-y-0">
            {timeline.map((t, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 py-6 border-b" style={{ borderColor: "rgba(15,21,38,0.08)" }}>
                <div className="col-span-3">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--liquid-gold)" }}>{t.period}</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: "var(--midnight-ink)" }}>{t.label}</p>
                </div>
                <p className="col-span-9 text-base leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "var(--warm-cream)" }}>
            Ready to find out what we'd build for your business?
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(245,240,232,0.65)" }}>
            Start with a Discovery Sprint. We'll map your problem, assess the opportunity, and give you an honest recommendation — including if AI isn't the right answer. Fixed price. No surprises. Plain English next steps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}
            >
              Start with a Discovery Sprint <ArrowRight size={18} />
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
