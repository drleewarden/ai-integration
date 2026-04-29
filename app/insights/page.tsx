import type { Metadata } from "next";
import NewsletterForm from "../components/NewsletterForm";

export const metadata: Metadata = {
  title: "Insights | AI Implementation Articles & Case Studies | Creative Milk",
  description:
    "Real observations on AI implementation from Creative Milk — why projects fail, what works, and what we've built. No hype. Published regularly.",
};

const categoryColors: Record<string, string> = {
  "AI Implementation": "var(--liquid-gold)",
  "Industry Insights": "#4A7C59",
  "Change Management": "#5C6B7A",
  "Behind the Build": "var(--midnight-ink)",
  "AI Explainers": "#8A99A8",
  "Market & Strategy": "var(--liquid-gold)",
};

const articles = [
  {
    category: "AI Implementation",
    title: "Why 80% of AI implementations fail — and the four things we do differently",
    description: "The failure modes are predictable. The fixes are specific. Here's what we've learned building AI systems across 50+ engagements.",
    readTime: "8 min read",
    date: "April 2026",
    featured: true,
  },
  {
    category: "Change Management",
    title: "The system your team doesn't use is a system that doesn't work",
    description: "Change management isn't a nice-to-have. It's the difference between a system that delivers ROI and one that collects dust.",
    readTime: "6 min read",
    date: "March 2026",
    featured: false,
  },
  {
    category: "AI Implementation",
    title: "What a Discovery Sprint actually looks like — week by week",
    description: "We hear 'what do you actually do in two weeks?' more than any other question. Here's the honest answer.",
    readTime: "5 min read",
    date: "March 2026",
    featured: false,
  },
  {
    category: "Market & Strategy",
    title: "Why we publish our pricing when every other AI agency hides it",
    description: "The decision to put numbers on the page. What happened after we did. Why we're not changing it.",
    readTime: "4 min read",
    date: "February 2026",
    featured: false,
  },
  {
    category: "Industry Insights",
    title: "AI in Australian professional services: where the ROI actually is",
    description: "Three years of implementations across accounting, legal, and financial advice. The use cases that consistently deliver. The ones that don't.",
    readTime: "10 min read",
    date: "February 2026",
    featured: false,
  },
  {
    category: "Behind the Build",
    title: "How we built a support triage system that cut ticket volume 60% in month one",
    description: "The decisions, the integrations, the knowledge base problem, and what we'd do differently next time.",
    readTime: "7 min read",
    date: "January 2026",
    featured: false,
  },
];

export default function Insights() {
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--liquid-gold)" }}>
            INSIGHTS
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight" style={{ color: "var(--warm-cream)" }}>
            What we've learned building AI systems that actually work.
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
            Real observations from 50+ engagements. No recycled AI hype. No thought leadership for the sake of it. If we publish it, it's because we've seen it matter in a real project.
          </p>
        </div>
      </section>

      {/* Featured article */}
      {featured && (
        <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
          <div className="max-w-7xl mx-auto">
            <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "rgba(15,21,38,0.4)" }}>
              FEATURED
            </p>
            <div
              className="p-10 md:p-14 rounded-3xl cursor-pointer transition-all hover:shadow-xl"
              style={{ backgroundColor: "var(--midnight-ink)" }}
            >
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-6"
                style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}
              >
                {featured.category}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 max-w-2xl" style={{ color: "var(--warm-cream)" }}>
                {featured.title}
              </h2>
              <p className="text-base mb-6 max-w-xl" style={{ color: "rgba(245,240,232,0.65)" }}>
                {featured.description}
              </p>
              <div className="flex gap-4 text-sm" style={{ color: "rgba(245,240,232,0.4)" }}>
                <span>{featured.date}</span>
                <span>·</span>
                <span>{featured.readTime}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border cursor-pointer transition-all hover:shadow-lg hover:border-opacity-30"
                style={{ backgroundColor: "white", borderColor: "rgba(15,21,38,0.1)" }}
              >
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
                  style={{
                    backgroundColor: categoryColors[article.category] ?? "var(--liquid-gold)",
                    color: article.category === "Behind the Build" ? "var(--warm-cream)" : article.category === "Change Management" ? "white" : article.category === "Industry Insights" ? "white" : "var(--midnight-ink)",
                    opacity: 0.9,
                  }}
                >
                  {article.category}
                </span>
                <h3 className="font-bold text-lg mb-3 leading-snug" style={{ color: "var(--midnight-ink)" }}>
                  {article.title}
                </h3>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(15,21,38,0.6)" }}>
                  {article.description}
                </p>
                <div className="flex gap-3 text-xs" style={{ color: "rgba(15,21,38,0.4)" }}>
                  <span>{article.date}</span>
                  <span>·</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--midnight-ink)" }}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--warm-cream)" }}>
            Get new articles when they're published.
          </h2>
          <p className="text-base mb-8" style={{ color: "rgba(245,240,232,0.6)" }}>
            No weekly emails. No AI news roundups. Just new articles from Creative Milk when we publish them — roughly every two weeks.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}
