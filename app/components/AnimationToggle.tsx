"use client";

import { useState, useSyncExternalStore } from "react";
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
 *
 * The button itself stays 44px tall for the touch target while the pill
 * inside it is the visible control, so the styling does not cost
 * accessibility.
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
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      // Named explicitly rather than relying on name-from-content: with the
      // label nested inside the pill the button was exposed to the
      // accessibility tree with no name at all. aria-pressed carries the
      // state, so the name only has to say what the control is.
      aria-label="Hero animation"
      aria-pressed={animate}
      onClick={() => setAnimationPreference(!animate)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 44,
        padding: "0 0.5rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        ...style,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: hovered
            ? "var(--warm-cream)"
            : "rgba(245,240,232,0.62)",
          padding: "0.4rem 0.8rem",
          borderRadius: 999,
          border: `1px solid ${
            hovered ? "rgba(201,168,76,0.55)" : "rgba(245,240,232,0.18)"
          }`,
          background: animate
            ? "rgba(201,168,76,0.10)"
            : "rgba(245,240,232,0.04)",
          transition:
            "color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)",
          whiteSpace: "nowrap",
        }}
      >
        {/* Lit when running, dim when not: the state is readable without
            parsing the word. */}
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: animate
              ? "var(--liquid-gold)"
              : "rgba(245,240,232,0.28)",
            boxShadow: animate ? "0 0 6px rgba(201,168,76,0.8)" : "none",
            transition:
              "background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
          }}
        />
        Animation: {animate ? "On" : "Off"}
      </span>
    </button>
  );
}
