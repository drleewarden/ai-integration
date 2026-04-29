import { ArrowRight } from "lucide-react";

const stats = [
  { value: "50+", label: "Engagements delivered" },
  { value: "95%", label: "Outcome rate" },
  { value: "$2M+", label: "Revenue lifted" },
  { value: "6–8 wks", label: "Average delivery" },
];

const useCases = [
  {
    metric: "−60%",
    problem: "Support team drowning in repetitive tickets",
    system: "Intelligent triage and resolution layer",
    outcome: "60% reduction in support ticket volume",
  },
  {
    metric: "+35%",
    problem: "Conversion rate plateauing despite increasing ad spend",
    system: "Personalised recommendations engine",
    outcome: "+35% conversion rate",
  },
  {
    metric: "10×",
    problem: "Analyst team spending most of their time pulling reports",
    system: "Predictive analytics layer surfacing decisions automatically",
    outcome: "10× faster insights, analyst time redirected to strategy",
  },
];

const phases = [
  {
    num: "1",
    name: "Discovery Sprint",
    timeline: "1–2 weeks · AUD $5K–$15K",
    body: "We define the specific problem, set measurable success targets, and give you an honest go/no-go on whether the ROI justifies the build. You get a scoped plan before committing to anything further.",
  },
  {
    num: "2",
    name: "Build & Integrate",
    timeline: "4–6 weeks · AUD $30K–$120K",
    body: "We build the system into your existing stack. Change management and team training are included as standard — not an upsell. IP transfers to you on completion.",
  },
  {
    num: "3",
    name: "Managed Partnership",
    timeline: "Ongoing · AUD $5K–$15K/month",
    body: "We stay until the outcomes are real. Monitoring, optimisation, and performance measurement so the system compounds over time.",
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section
        className="pt-32 pb-24 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: "var(--midnight-ink)" }}
      >
        <div className="max-w-7xl mx-auto">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ color: "var(--liquid-gold)" }}
          >
            AI Implementation Partners · Australia
          </p>
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight max-w-4xl"
            style={{ color: "var(--warm-cream)" }}
          >
            AI that actually changes your numbers.
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
            style={{ color: "rgba(245,240,232,0.7)" }}
          >
            We build custom AI systems for Australian businesses — scoped around your specific problem, measured by outcomes you can point to. No buzzwords. No black boxes. A system that runs, in 6–8 weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
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

          {/* Proof bar */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border"
            style={{ borderColor: "rgba(245,240,232,0.1)", backgroundColor: "rgba(245,240,232,0.05)" }}
          >
            {stats.map((s, i) => (
              <div key={i} className="px-6 py-5" style={{ backgroundColor: "rgba(245,240,232,0.03)" }}>
                <div className="text-3xl font-bold mb-1" style={{ color: "var(--liquid-gold)" }}>
                  {s.value}
                </div>
                <div className="text-sm" style={{ color: "rgba(245,240,232,0.55)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            THE REALITY
          </p>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--midnight-ink)" }}>
                Most businesses are paying for AI that doesn't actually run.
              </h2>
            </div>
            <div>
              <p className="text-lg leading-relaxed mb-4" style={{ color: "rgba(15,21,38,0.7)" }}>
                Sixty-four percent of Australian businesses use some form of AI. Less than 5% have integrated it in a way that changes their numbers.
              </p>
              <p className="text-lg leading-relaxed mb-4" style={{ color: "rgba(15,21,38,0.7)" }}>
                The gap isn't technology. It's implementation.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: "rgba(15,21,38,0.7)" }}>
                Tools get bought. Consultants produce roadmaps. Nobody builds the system, trains the team, or sticks around to measure whether it worked. That's the problem we fix.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mt-12 max-w-lg">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: "rgba(15,21,38,0.06)" }}>
              <div className="text-4xl font-bold mb-2" style={{ color: "var(--midnight-ink)" }}>64–80%</div>
              <div className="text-sm" style={{ color: "rgba(15,21,38,0.6)" }}>of AU businesses have some form of AI</div>
            </div>
            <div className="p-6 rounded-2xl" style={{ backgroundColor: "rgba(15,21,38,0.06)" }}>
              <div className="text-4xl font-bold mb-2" style={{ color: "var(--midnight-ink)" }}>~5%</div>
              <div className="text-sm" style={{ color: "rgba(15,21,38,0.6)" }}>have real integration that changes results</div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)", borderTop: "1px solid rgba(15,21,38,0.08)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            WHAT WE BUILD
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--midnight-ink)" }}>
            Real systems. Real outcomes. Specific numbers.
          </h2>
          <p className="text-lg mb-12 max-w-2xl" style={{ color: "rgba(15,21,38,0.65)" }}>
            We don't sell tools. We don't do strategy-only. We build AI systems that run inside your existing stack and measure their own performance from day one.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((c, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border"
                style={{ backgroundColor: "white", borderColor: "rgba(15,21,38,0.1)" }}
              >
                <div className="text-5xl font-bold mb-6" style={{ color: "var(--midnight-ink)" }}>
                  {c.metric}
                </div>
                <p className="text-sm font-medium mb-2" style={{ color: "rgba(15,21,38,0.5)" }}>
                  Problem: {c.problem}
                </p>
                <p className="text-sm mb-4" style={{ color: "rgba(15,21,38,0.5)" }}>
                  System: {c.system}
                </p>
                <p className="font-semibold" style={{ color: "var(--midnight-ink)" }}>
                  {c.outcome}
                </p>
                <a
                  href="/work"
                  className="inline-flex items-center gap-1 mt-4 text-sm font-medium"
                  style={{ color: "var(--liquid-gold)" }}
                >
                  See how we built it <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm" style={{ color: "rgba(15,21,38,0.55)" }}>
            Not sure what AI could do for your business?{" "}
            <a href="/what-we-build" className="underline" style={{ color: "var(--midnight-ink)" }}>
              Explore what we build →
            </a>
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            HOW WE WORK
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-12" style={{ color: "var(--warm-cream)" }}>
            Three phases. One partner. Outcomes from day one.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {phases.map((p, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border"
                style={{ borderColor: "rgba(245,240,232,0.1)", backgroundColor: "rgba(245,240,232,0.03)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-6"
                  style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}
                >
                  {p.num}
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "var(--warm-cream)" }}>
                  {p.name}
                </h3>
                <p className="text-xs mb-4" style={{ color: "var(--liquid-gold)" }}>
                  {p.timeline}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.6)" }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
          <a
            href="/process"
            className="inline-flex items-center gap-1 mt-10 text-sm font-medium"
            style={{ color: "var(--liquid-gold)" }}
          >
            See our full process →
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)", borderTop: "1px solid rgba(245,240,232,0.06)" }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--liquid-gold)" }}>
            THE NUMBERS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--warm-cream)" }}>
            50 engagements. 95% outcome rate. $2M+ revenue lifted.
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(245,240,232,0.6)" }}>
            Those aren't marketing claims. They're the aggregate of scoped engagements where we defined success upfront and measured it after. The 5% that didn't hit target — we'll tell you why if you ask.
          </p>
        </div>
      </section>

      {/* Case study pull quote */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-8" style={{ color: "var(--liquid-gold)" }}>
            CLIENT RESULT
          </p>
          <blockquote
            className="text-2xl md:text-3xl font-medium leading-relaxed mb-6"
            style={{ color: "var(--midnight-ink)" }}
          >
            "We'd been paying for AI tools for 18 months and seen nothing move. Creative Milk scoped the problem in a week, built the system in five weeks, and our support volume dropped 60% in the first month."
          </blockquote>
          <p className="text-sm mb-8" style={{ color: "rgba(15,21,38,0.5)" }}>
            — Head of Operations, Customer Support Platform
          </p>
          <a
            href="/work"
            className="inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: "var(--midnight-ink)" }}
          >
            Read the full case study →
          </a>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--warm-cream)" }}>
            Ready to build something that actually works?
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(245,240,232,0.65)" }}>
            Tell us about the problem you're trying to solve. We'll respond within 24 hours with an honest answer: whether we can help, what we'd propose, and what a Discovery Sprint would look like for your situation. No NDAs in the first call. No vague roadmaps. Plain English next steps.
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
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold border transition-all hover:opacity-80"
              style={{ borderColor: "rgba(245,240,232,0.3)", color: "var(--warm-cream)" }}
            >
              See our pricing
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
