import { CMWordmark } from "./CMLogo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--midnight-deep)",
        borderTop: "1px solid var(--rule-cream)",
        paddingBlock: "2.5rem",
      }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <div>
          <CMWordmark variant="cream-on-ink" markSize={26} />
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              lineHeight: 1.7,
              color: "rgba(245,240,232,0.45)",
              marginTop: "1rem",
              maxWidth: "32ch",
            }}
          >
            Intelligence that actually works for your business.
          </p>
        </div>

        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--liquid-gold)",
              marginBottom: "0.85rem",
            }}
          >
            Sections
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              ["Services", "/#services"],
              ["Case studies", "/#work"],
              ["Process", "/#process"],
              ["Pricing", "/pricing"],
              ["Opportunity cost calculator", "/opportunity-cost"],
              ["For professional services", "/for/professional-services"],
              ["Contact", "/#contact"],
            ].map(([label, href]) => (
              <li key={label} style={{ marginBottom: "0.5rem" }}>
                <a
                  href={href}
                  className="footer-link"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--liquid-gold)",
              marginBottom: "0.85rem",
            }}
          >
            Get in touch
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              lineHeight: 1.7,
              color: "rgba(245,240,232,0.7)",
              margin: 0,
            }}
          >
            Use the{" "}
            <a
              href="/#contact"
              className="footer-link"
              style={{
                color: "var(--liquid-gold)",
                borderBottom: "1px solid rgba(201,168,76,0.3)",
              }}
            >
              contact form
            </a>{" "}
            -- we&apos;ll respond within 24 hours.
          </p>
        </div>
      </div>

      <div
        className="container"
        style={{
          marginTop: "2.5rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--rule-cream)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            color: "rgba(245,240,232,0.32)",
            margin: 0,
          }}
        >
          © {year} Creative Milk. AI Solutions for Businesses.
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            color: "rgba(245,240,232,0.32)",
            margin: 0,
          }}
        >
          AI that works.
        </p>
      </div>
    </footer>
  );
}
