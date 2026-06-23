"use client";

import { EVENTS, pushEvent } from "../lib/gtm";

export const COOKIE_SETTINGS_EVENT = "cm:open-consent-banner";

export default function CookieSettingsLink() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      window.localStorage.removeItem("cm_consent");
    } catch {
      // Storage may be blocked; banner will still reopen for this session.
    }
    pushEvent(EVENTS.COOKIE_SETTINGS_OPEN);
    window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
  };

  return (
    <a
      href="#cookie-settings"
      onClick={handleClick}
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
      Cookie settings
    </a>
  );
}
