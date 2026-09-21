"use client";

import { useSyncExternalStore } from "react";
import {
  getAnimationPreference,
  getServerAnimationPreference,
  setAnimationPreference,
  subscribeToAnimationPreference,
} from "@/lib/animation-preference";

/**
 * Nav control for the hero animation.
 *
 * Shares state with WebGLBackground through lib/animation-preference, so the
 * two never need a common React ancestor. Rendered only where the animation
 * exists (the homepage), so it is never a control that does nothing.
 *
 * `aria-pressed` makes it announce as a toggle rather than a link, and the
 * label states the current state outright so nobody has to work out whether
 * the word is a status or an action.
 */
export default function AnimationToggle({
  style,
}: {
  style?: React.CSSProperties;
}) {
  const animate = useSyncExternalStore(
    subscribeToAnimationPreference,
    getAnimationPreference,
    getServerAnimationPreference
  );

  return (
    <button
      type="button"
      aria-pressed={animate}
      onClick={() => setAnimationPreference(!animate)}
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
        background: "none",
        border: "none",
        cursor: "pointer",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--liquid-gold)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(245,240,232,0.62)";
      }}
    >
      Animation: {animate ? "On" : "Off"}
    </button>
  );
}
