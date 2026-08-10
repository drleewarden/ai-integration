import { CMWordmark } from "./CMLogo";
import CookieSettingsLink from "./CookieSettingsLink";

// Official brand glyphs (Simple Icons paths) -- lucide's outline versions are
// approximations, not the real marks.
function FacebookMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

function InstagramMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0Zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03Zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
    </svg>
  );
}

const SOCIALS = [
  {
    label: "Creative Milk on Facebook",
    href: "https://www.facebook.com/Creative.MilkAI",
    Mark: FacebookMark,
  },
  {
    label: "Creative Milk on Instagram",
    href: "https://www.instagram.com/creativemilk.ai/",
    Mark: InstagramMark,
  },
];

const CONTACTS = [
  { label: "Darryn", tel: "+61455775052", display: "0455 775 052" },
  { label: "Craig", tel: "+61426522294", display: "0426 522 294" },
];

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
              ["Contact", "/contact"],
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
              href="/contact"
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

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "1.1rem 0 0",
              display: "grid",
              gap: "0.4rem",
            }}
          >
            <li>
              <a
                href="mailto:contact@creative-milk.com.au"
                className="footer-link"
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem" }}
              >
                contact@creative-milk.com.au
              </a>
            </li>
            {CONTACTS.map(({ label, tel, display }) => (
              <li key={label}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(245,240,232,0.4)",
                    marginRight: "0.6rem",
                  }}
                >
                  {label}
                </span>{" "}
                <a
                  href={`tel:${tel}`}
                  className="footer-link"
                  style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem" }}
                >
                  {display}
                </a>
              </li>
            ))}
          </ul>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              marginTop: "1.1rem",
              marginLeft: "-0.7rem",
            }}
          >
            {SOCIALS.map(({ label, href, Mark }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="footer-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "44px",
                  height: "44px",
                }}
              >
                <Mark />
              </a>
            ))}
          </div>
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
          }}
        >
          <a
            href="/privacy"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.12em",
              color: "rgba(245,240,232,0.45)",
              margin: 0,
              textDecoration: "none",
              borderBottom: "1px solid rgba(245,240,232,0.18)",
              paddingBottom: "1px",
            }}
          >
            Privacy
          </a>
          <CookieSettingsLink />
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
      </div>
    </footer>
  );
}
