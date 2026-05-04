"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { CMWordmark } from "./CMLogo";

const NAV_ITEMS = [
  { label: "What We Build", href: "/what-we-build" },
  { label: "Work", href: "/work" },
  { label: "Process", href: "/process" },
  { label: "Pricing", href: "/pricing" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
];

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        insetInline: 0,
        zIndex: 100,
        background: scrolled
          ? "rgba(15, 21, 38, 0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(245,240,232,0.08)"
          : "1px solid transparent",
        transition: "background 280ms var(--ease-out), backdrop-filter 280ms var(--ease-out), border-color 280ms var(--ease-out)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}
      >
        <a
          href="/"
          aria-label="Creative Milk — home"
          style={{ display: "inline-flex" }}
        >
          <CMWordmark variant="cream-on-ink" markSize={28} />
        </a>

        <div
          className="hide-md"
          style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(245,240,232,0.62)",
                padding: "0.5rem 1rem",
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                transition: "color var(--dur-fast) var(--ease-out)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--liquid-gold)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(245,240,232,0.62)")
              }
            >
              {item.label}
            </a>
          ))}
          <a
            href="/contact"
            className="cta cta-gold"
            style={{ marginLeft: "1rem" }}
          >
            Book a call
          </a>
        </div>

        <button
          className="show-md"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            color: "var(--warm-cream)",
          }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="animate-fadeIn"
          style={{
            position: "fixed",
            inset: "68px 0 0 0",
            background: "var(--midnight-deep)",
            padding: "2rem var(--container-pad)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 300,
                color: "var(--warm-cream)",
                padding: "1rem 0",
                borderBottom: "1px solid rgba(245,240,232,0.08)",
              }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="cta cta-gold"
            style={{
              marginTop: "1.5rem",
              justifyContent: "center",
              width: "100%",
            }}
          >
            Book a call
          </a>
        </div>
      )}
    </nav>
  );
}
