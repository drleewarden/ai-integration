export type FAQItem = { q: string; a: string };

/**
 * Shared FAQ section used by /services and /pricing (and any future page).
 * Renders the standard cream question list and emits FAQPage JSON-LD so the
 * questions are eligible for rich results.
 */
export default function FAQ({
  title = "FAQs",
  eyebrow = "Common questions",
  items,
}: {
  title?: string;
  eyebrow?: string;
  items: FAQItem[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section
      className="section"
      style={{ backgroundColor: "var(--warm-cream)", borderBottom: "1px solid var(--rule)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="container" style={{ maxWidth: "740px" }}>
        <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>{eyebrow}</p>
        <h2
          className="h-section"
          style={{ color: "var(--midnight-ink)", marginBottom: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          {title}
        </h2>
        {items.map((item) => (
          <div
            key={item.q}
            style={{
              padding: "1.5rem 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--midnight-ink)",
                marginBottom: "0.6rem",
              }}
            >
              {item.q}
            </h3>
            <p
              className="body-copy"
              style={{ color: "var(--slate-mid)", lineHeight: 1.75 }}
            >
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
