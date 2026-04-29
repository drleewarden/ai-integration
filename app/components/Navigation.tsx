"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "What We Build", href: "/what-we-build" },
  { label: "Work", href: "/work" },
  { label: "Process", href: "/process" },
  { label: "Pricing", href: "/pricing" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed w-full z-50 border-b"
      style={{
        backgroundColor: "var(--midnight-ink)",
        borderColor: "rgba(245,240,232,0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a
            href="/"
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--warm-cream)" }}
          >
            Creative Milk
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm transition-colors hover:opacity-100"
                style={{ color: "rgba(245,240,232,0.65)" }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/contact"
              className="text-sm font-semibold px-5 py-2 rounded-full transition-all hover:opacity-90"
              style={{
                backgroundColor: "var(--liquid-gold)",
                color: "var(--midnight-ink)",
              }}
            >
              Book a call
            </a>
          </div>

          <button
            className="md:hidden"
            style={{ color: "var(--warm-cream)" }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden px-4 pb-6 pt-2 border-t flex flex-col gap-4"
          style={{
            backgroundColor: "var(--midnight-ink)",
            borderColor: "rgba(245,240,232,0.1)",
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm"
              style={{ color: "rgba(245,240,232,0.7)" }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/contact"
            className="text-sm font-semibold px-5 py-3 rounded-full text-center mt-2"
            style={{
              backgroundColor: "var(--liquid-gold)",
              color: "var(--midnight-ink)",
            }}
            onClick={() => setOpen(false)}
          >
            Book a call
          </a>
        </div>
      )}
    </nav>
  );
}
