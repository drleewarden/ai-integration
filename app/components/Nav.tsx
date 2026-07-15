"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { CMWordmark } from "./CMLogo";
import { EVENTS, pushEvent } from "../lib/gtm";

type NavLink = { label: string; href: string; blurb?: string };
type NavGroup =
  | { label: string; href: string; items?: undefined }
  | { label: string; items: NavLink[]; href?: undefined };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Services",
    items: [
      {
        label: "What We Build",
        href: "/what-we-build",
        blurb: "The kinds of AI systems we deliver",
      },
      {
        label: "Process",
        href: "/process",
        blurb: "How an engagement actually runs",
      },
      {
        label: "Pricing",
        href: "/pricing",
        blurb: "Engagement shapes and ranges",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        label: "AI Readiness",
        href: "/ai-readiness",
        blurb: "Free assessment — where are you on the curve?",
      },
      {
        label: "Opportunity Cost",
        href: "/opportunity-cost",
        blurb: "Calculator — what's the delay costing you?",
      },
      {
        label: "Insights",
        href: "/insights",
        blurb: "Articles and field notes",
      },
      {
        label: "Workshop",
        href: "/events/workshop",
        blurb: "Upcoming live session",
      },
      {
        label: "Melbourne Workshop",
        href: "/events/workshop-melbourne",
        blurb: "Melbourne · 7 Aug — for small business owners",
      },
      {
        label: "Members",
        href: "/members",
        blurb: "Free tools, plugins and guides",
      },
    ],
  },
  {
    label: "Work",
    items: [
      {
        label: "Case Studies",
        href: "/work",
        blurb: "Recent engagements and outcomes",
      },
      {
        label: "Clients",
        href: "/clients",
        blurb: "Who we've worked with",
      },
    ],
  },
  { label: "About", href: "/about" },
];

export default function Nav({ forceDark = false }: { forceDark?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        insetInline: 0,
        zIndex: 100,
        background: (scrolled || forceDark)
          ? "rgba(15, 21, 38, 0.95)"
          : "transparent",
        backdropFilter: (scrolled || forceDark) ? "blur(14px) saturate(140%)" : "none",
        WebkitBackdropFilter: (scrolled || forceDark) ? "blur(14px) saturate(140%)" : "none",
        borderBottom: (scrolled || forceDark)
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
          aria-label="Creative Milk -- home"
          style={{ display: "inline-flex" }}
        >
          <CMWordmark variant="cream-on-ink" markSize={28} />
        </a>

        <div
          className="hide-md"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            position: "relative",
          }}
        >
          {NAV_GROUPS.map((group) => {
            if (!group.items) {
              return (
                <a
                  key={group.label}
                  href={group.href}
                  style={navLinkStyle}
                  onMouseEnter={(e) => {
                    setOpenMenu(null);
                    e.currentTarget.style.color = "var(--liquid-gold)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(245,240,232,0.62)";
                  }}
                >
                  {group.label}
                </a>
              );
            }

            const isOpen = openMenu === group.label;
            return (
              <div
                key={group.label}
                onMouseEnter={() => {
                  cancelClose();
                  setOpenMenu(group.label);
                }}
                onMouseLeave={scheduleClose}
                style={{ position: "relative" }}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  onClick={() => setOpenMenu(isOpen ? null : group.label)}
                  onFocus={() => {
                    cancelClose();
                    setOpenMenu(group.label);
                  }}
                  style={{
                    ...navLinkStyle,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: isOpen
                      ? "var(--liquid-gold)"
                      : "rgba(245,240,232,0.62)",
                    gap: "0.4rem",
                  }}
                >
                  {group.label}
                  <ChevronDown
                    size={12}
                    style={{
                      transition: "transform var(--dur-fast) var(--ease-out)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                    }}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    role="menu"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.5rem)",
                      left: 0,
                      minWidth: 280,
                      background: "rgba(15,21,38,0.98)",
                      backdropFilter: "blur(14px) saturate(140%)",
                      WebkitBackdropFilter: "blur(14px) saturate(140%)",
                      border: "1px solid rgba(245,240,232,0.1)",
                      boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
                      padding: "0.75rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.125rem",
                    }}
                  >
                    {group.items.map((item) => (
                      <a
                        key={item.href}
                        role="menuitem"
                        href={item.href}
                        onClick={() => setOpenMenu(null)}
                        style={{
                          display: "block",
                          padding: "0.75rem 0.9rem",
                          textDecoration: "none",
                          transition: "background var(--dur-fast) var(--ease-out)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(201,168,76,0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.9rem",
                            color: "var(--warm-cream)",
                            marginBottom: item.blurb ? "0.2rem" : 0,
                          }}
                        >
                          {item.label}
                        </div>
                        {item.blurb && (
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.65rem",
                              letterSpacing: "0.04em",
                              color: "rgba(245,240,232,0.45)",
                              lineHeight: 1.5,
                            }}
                          >
                            {item.blurb}
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <a
            href="/contact"
            className="cta cta-gold"
            style={{ marginLeft: "1rem" }}
            onClick={() =>
              pushEvent(EVENTS.CTA_CLICK, {
                cta_label: "book_a_call",
                cta_location: "nav_desktop",
              })
            }
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
            gap: "0.25rem",
            overflowY: "auto",
          }}
        >
          {NAV_GROUPS.map((group) => {
            if (!group.items) {
              return (
                <a
                  key={group.label}
                  href={group.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.75rem",
                    fontWeight: 300,
                    color: "var(--warm-cream)",
                    padding: "1rem 0",
                    borderBottom: "1px solid rgba(245,240,232,0.08)",
                  }}
                >
                  {group.label}
                </a>
              );
            }

            const isOpen = openMobileGroup === group.label;
            return (
              <div
                key={group.label}
                style={{
                  borderBottom: "1px solid rgba(245,240,232,0.08)",
                }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenMobileGroup(isOpen ? null : group.label)
                  }
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "transparent",
                    border: "none",
                    padding: "1rem 0",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.75rem",
                    fontWeight: 300,
                    color: "var(--warm-cream)",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  {group.label}
                  <ChevronDown
                    size={20}
                    style={{
                      transition: "transform var(--dur-fast) var(--ease-out)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                      color: "rgba(245,240,232,0.5)",
                    }}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                      paddingBottom: "1rem",
                    }}
                  >
                    {group.items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "1rem",
                          color: "rgba(245,240,232,0.75)",
                          padding: "0.65rem 0 0.65rem 1rem",
                          borderLeft: "1px solid rgba(201,168,76,0.3)",
                        }}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <a
            href="/contact"
            onClick={() => {
              pushEvent(EVENTS.CTA_CLICK, {
                cta_label: "book_a_call",
                cta_location: "nav_mobile",
              });
              setMobileOpen(false);
            }}
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

const navLinkStyle: React.CSSProperties = {
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
  textDecoration: "none",
};
