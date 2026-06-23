"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { EVENTS, pushEvent } from "../lib/gtm";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show button after scrolling down 400px
      setIsVisible(window.scrollY > 400);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    pushEvent(EVENTS.CTA_CLICK, {
      cta_label: "back_to_top",
      cta_location: "floating",
    });
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="show-md"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        width: "3rem",
        height: "3rem",
        borderRadius: "50%",
        backgroundColor: "var(--liquid-gold)",
        color: "var(--midnight-ink)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        transition: "all 0.3s var(--ease-out)",
        zIndex: 50,
        animation: "fadeIn 0.3s var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
      }}
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
}
