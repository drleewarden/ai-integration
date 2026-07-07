import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import NewsletterForm from "@/app/components/NewsletterForm";
import { posts, displayTitle } from "@/lib/insights/posts";

export const metadata: Metadata = {
  title: "Insights | AI Implementation Articles & Case Studies | Creative Milk",
  description:
    "Real observations on AI implementation from Creative Milk -- why projects fail, what works, and what we've built. No hype. Published regularly.",
};

const categoryColors: Record<string, string> = {
  "AI Implementation": "var(--liquid-gold)",
  "Industry Insights": "#4A7C59",
  "Change Management": "#5C6B7A",
  "Behind the Build": "var(--midnight-ink)",
  "AI Explainers": "#8A99A8",
  "Market & Strategy": "var(--liquid-gold)",
};

const categoryTextColors: Record<string, string> = {
  "AI Implementation": "var(--midnight-ink)",
  "Industry Insights": "#fff",
  "Change Management": "#fff",
  "Behind the Build": "var(--warm-cream)",
  "AI Explainers": "var(--midnight-ink)",
  "Market & Strategy": "var(--midnight-ink)",
};

export default function Insights() {
  // Cards derive from the post registry (lib/insights/posts.ts), so the
  // index always matches the published articles. First post is featured.
  const [featured, ...rest] = posts;

  return (
    <>
        {/* Hero */}
        <section
          className="section"
          style={{
            backgroundColor: "var(--midnight-ink)",
            paddingTop: "clamp(6rem, 12vw, 9rem)",
          }}
        >
          <div className="container">
            <span className="eyebrow" style={{ marginBottom: "1.5rem" }}>Insights</span>
            <h1
              className="h-display"
              style={{
                color: "var(--warm-cream)",
                fontSize: "clamp(3rem, 7vw, 6rem)",
                maxWidth: "20ch",
                marginTop: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              What we've learned building AI systems that <em className="gold">actually work.</em>
            </h1>
            <p
              className="body-copy"
              style={{
                maxWidth: "52ch",
                color: "rgba(245,240,232,0.65)",
              }}
            >
              Real observations from 50+ engagements. No recycled AI hype. No thought leadership for the sake
              of it. If we publish it, it's because we've seen it matter in a real project.
            </p>
          </div>
        </section>

        {/* Featured article */}
        {featured && (
          <section
            className="section-tight"
            style={{ backgroundColor: "var(--warm-cream)" }}
          >
            <div className="container">
              <div
                style={{
                  paddingBottom: "clamp(2rem,4vw,3rem)",
                  borderBottom: "1px solid var(--rule)",
                  marginBottom: "clamp(2rem,4vw,3rem)",
                }}
              >
                <span className="eyebrow">Featured</span>
              </div>
              <Link
                href={`/insights/${featured.slug}`}
                style={{
                  display: "block",
                  backgroundColor: "var(--midnight-ink)",
                  padding: "clamp(2.5rem,5vw,4.5rem)",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    fontWeight: 400,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "0.3rem 0.75rem",
                    backgroundColor: categoryColors[featured.category] ?? "var(--liquid-gold)",
                    color: categoryTextColors[featured.category] ?? "var(--midnight-ink)",
                    marginBottom: "1.5rem",
                  }}
                >
                  {featured.category}
                </span>
                <h2
                  className="h-section"
                  style={{
                    color: "var(--warm-cream)",
                    maxWidth: "28ch",
                    marginTop: 0,
                    marginBottom: "1rem",
                  }}
                >
                  {displayTitle(featured)}
                </h2>
                <p
                  className="body-copy"
                  style={{
                    color: "rgba(245,240,232,0.65)",
                    maxWidth: "48ch",
                    marginBottom: "1.5rem",
                  }}
                >
                  {featured.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    borderTop: "1px solid var(--rule-cream)",
                    paddingTop: "1.25rem",
                  }}
                >
                  <span className="label" style={{ color: "rgba(245,240,232,0.4)" }}>{featured.readTime}</span>
                  <span style={{ marginLeft: "auto" }}>
                    <span className="cta-link">
                      Read article <ArrowRight size={11} />
                    </span>
                  </span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Article grid */}
        <section
          className="section-tight"
          style={{ backgroundColor: "var(--warm-cream)" }}
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
              }}
            >
              {rest.map((article) => (
                <Link
                  key={article.slug}
                  href={`/insights/${article.slug}`}
                  style={{ textDecoration: "none" }}
                >
                <article
                  style={{
                    height: "100%",
                    padding: "clamp(2rem,3vw,3rem)",
                    borderRight: "1px solid var(--rule)",
                    borderBottom: "1px solid var(--rule)",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    transition: "background var(--dur-base) var(--ease-out)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      fontWeight: 400,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      padding: "0.3rem 0.75rem",
                      backgroundColor: categoryColors[article.category] ?? "var(--liquid-gold)",
                      color: categoryTextColors[article.category] ?? "var(--midnight-ink)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {article.category}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: "1.2rem",
                      lineHeight: 1.25,
                      color: "var(--midnight-ink)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {displayTitle(article)}
                  </h3>
                  <p
                    className="body-copy"
                    style={{
                      color: "rgba(15,21,38,0.6)",
                      fontSize: "0.85rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {article.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "center",
                      borderTop: "1px solid var(--rule)",
                      paddingTop: "1rem",
                    }}
                  >
                    <span className="label" style={{ color: "rgba(15,21,38,0.4)" }}>{article.readTime}</span>
                  </div>
                </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="section" style={{ backgroundColor: "var(--midnight-ink)" }}>
          <div className="container" style={{ maxWidth: "600px", textAlign: "center" }}>
            <span className="eyebrow" style={{ marginBottom: "1.5rem", justifyContent: "center" }}>
              Stay in the loop
            </span>
            <h2
              className="h-section"
              style={{
                color: "var(--warm-cream)",
                marginTop: "1rem",
                marginBottom: "1rem",
              }}
            >
              Get new articles when they're published.
            </h2>
            <p
              className="body-copy"
              style={{
                color: "rgba(245,240,232,0.6)",
                maxWidth: "44ch",
                margin: "0 auto 2.5rem",
              }}
            >
              No weekly emails. No AI news roundups. Just new articles from Creative Milk when we publish them --
              roughly every two weeks.
            </p>
            <NewsletterForm />
          </div>
        </section>
    </>
  );
}
