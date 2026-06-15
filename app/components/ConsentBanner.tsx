"use client";

import { useEffect, useState } from "react";
import { grantConsent, denyConsent } from "../lib/gtm";
import { COOKIE_SETTINGS_EVENT } from "./CookieSettingsLink";

const STORAGE_KEY = "cm_consent";

type StoredChoice = "granted" | "denied";

function readStoredChoice(): StoredChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function writeStoredChoice(choice: StoredChoice): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Storage may be blocked (private mode, quota). Choice still applies for
    // this session via the consent update; the banner will reappear next visit.
  }
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = readStoredChoice();
    if (stored === "granted") {
      grantConsent();
    } else if (stored === "denied") {
      denyConsent();
    } else {
      setVisible(true);
    }

    const onReopen = () => setVisible(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, onReopen);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, onReopen);
  }, []);

  const handleAccept = () => {
    grantConsent();
    writeStoredChoice("granted");
    setVisible(false);
  };

  const handleDecline = () => {
    denyConsent();
    writeStoredChoice("denied");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        left: "1rem",
        right: "1rem",
        bottom: "1rem",
        maxWidth: "640px",
        marginInline: "auto",
        padding: "1.25rem 1.5rem",
        backgroundColor: "var(--midnight-tint)",
        color: "var(--warm-cream)",
        border: "1px solid rgba(245, 240, 232, 0.12)",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        animation: "fadeInUp 0.4s var(--ease-out) both",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.95rem",
          lineHeight: 1.5,
        }}
      >
        We use cookies to measure how visitors use this site so we can improve
        it. Analytics only — no advertising profiles.
      </p>
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={handleAccept}
          style={{
            minHeight: "44px",
            padding: "0.625rem 1.25rem",
            backgroundColor: "var(--liquid-gold)",
            color: "var(--midnight-ink)",
            border: "none",
            borderRadius: "999px",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "background var(--dur-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--gold-light)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--liquid-gold)";
          }}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={handleDecline}
          style={{
            minHeight: "44px",
            padding: "0.625rem 1.25rem",
            backgroundColor: "transparent",
            color: "var(--warm-cream)",
            border: "1px solid rgba(245, 240, 232, 0.3)",
            borderRadius: "999px",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(245, 240, 232, 0.6)";
            e.currentTarget.style.backgroundColor = "rgba(245, 240, 232, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(245, 240, 232, 0.3)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
