import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Clients from "@/app/components/Clients";
import Contact from "@/app/components/Contact";

export const metadata: Metadata = {
  title: "Clients | Creative Milk",
  description:
    "Companies Creative Milk has worked with across software, government, insurance, energy, health, retail, and design-led technology teams.",
};

const SECTOR_STATS = [
  { value: "9+", label: "Enterprise sectors" },
  { value: "50+", label: "Engagements shipped" },
  { value: "95%", label: "Outcome rate" },
  { value: "6–8", label: "Weeks to ship" },
];

export default function ClientsPage() {
  return (
    <>
        {/* ── Background image zone: hero → client tiles ── */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          {/* Background image */}
          <Image
            src="/images/clients-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            aria-hidden="true"
            style={{
              objectFit: "cover",
              objectPosition: "center 20%",
              zIndex: 0,
            }}
          />
          {/* Dark overlay for readability */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(15,21,38,0.72) 0%, rgba(15,21,38,0.65) 50%, rgba(15,21,38,0.80) 100%)",
              zIndex: 1,
            }}
          />

          {/* ── Hero ── */}
          <section
            className="section"
            style={{
              position: "relative",
              zIndex: 2,
              background: "transparent",
              color: "var(--warm-cream)",
              paddingTop: "clamp(7rem, 13vw, 10rem)",
              paddingBottom: "clamp(3rem, 6vw, 5rem)",
              borderBottom: "1px solid var(--rule-cream-strong)",
            }}
          >
            <div className="container">
              <p className="eyebrow" style={{ marginBottom: "1.75rem" }}>
                Selected Companies
              </p>

              <h1
                className="h-display"
                style={{
                  fontSize: "clamp(2.75rem, 7.5vw, 6.25rem)",
                  color: "var(--warm-cream)",
                  maxWidth: "20ch",
                  marginBottom: "1.5rem",
                }}
              >
                The companies we&rsquo;ve helped{" "}
                <em className="gold">ship real systems.</em>
              </h1>

              <p
                className="body-copy"
                style={{
                  maxWidth: "58ch",
                  color: "rgba(245,240,232,0.65)",
                  fontSize: "1.05rem",
                  lineHeight: 1.75,
                }}
              >
                A snapshot of work across enterprise software, government,
                insurance, energy, health, retail, and design-led technology
                teams. Different sectors, same standard: AI systems with a
                measurable target before a single line of code gets written.
              </p>
            </div>
          </section>

          {/* ── Sector stat strip ── */}
          <section
            aria-label="Reach by the numbers"
            style={{
              position: "relative",
              zIndex: 2,
              background: "transparent",
              color: "var(--warm-cream)",
              borderBottom: "1px solid var(--rule-cream-strong)",
            }}
          >
            <div className="container">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                  gap: 0,
                  borderTop: "1px solid var(--rule-cream-strong)",
                }}
              >
                {SECTOR_STATS.map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: "clamp(1.5rem, 3vw, 2.25rem)",
                      borderRight:
                        i < SECTOR_STATS.length - 1
                          ? "1px solid var(--rule-cream-strong)"
                          : "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 300,
                        fontSize: "clamp(2rem, 3.6vw, 2.85rem)",
                        lineHeight: 1,
                        color: "var(--warm-cream)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.62rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(245,240,232,0.58)",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Logo grid ── */}
          <Clients standalone bgTransparent />
        </div>

        {/* ── Closing CTA band ── */}
        <section
          style={{
            background: "var(--warm-cream)",
            color: "var(--midnight-ink)",
            padding: "clamp(4rem, 7vw, 6rem) 0",
            borderBottom: "1px solid rgba(15,21,38,0.12)",
          }}
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: "clamp(2rem, 5vw, 4rem)",
                alignItems: "end",
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                  Start a project
                </p>
                <h2
                  className="h-section"
                  style={{
                    color: "var(--midnight-ink)",
                    margin: 0,
                    maxWidth: "20ch",
                  }}
                >
                  Want to be on this{" "}
                  <em className="gold">list?</em>
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  justifySelf: "end",
                  maxWidth: "48ch",
                }}
              >
                <p
                  className="body-copy"
                  style={{
                    color: "rgba(15,21,38,0.65)",
                    margin: 0,
                  }}
                >
                  Tell us the outcome you want, the constraints you&rsquo;re
                  working inside, and the team that will live with the system.
                  We&rsquo;ll come back with a scoped path to shipping it.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <Link href="/contact" className="cta cta-gold">
                    Book a call
                    <ArrowRight size={14} strokeWidth={2} />
                  </Link>
                  <Link
                    href="/work"
                    className="cta cta-outline-ink"
                  >
                    See the work
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Contact variant="cream" />
    </>
  );
}
