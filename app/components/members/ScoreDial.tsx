"use client";

import { useEffect, useState } from "react";
import {
  DIAL_CIRCUMFERENCE,
  DIAL_RADIUS,
  dialColor,
  dialOffset,
} from "@/lib/members/tools/dial";
import CountUp from "@/app/components/motion/CountUp";
import { useReducedMotion } from "@/app/components/motion/useReducedMotion";

/**
 * Animated ring for a 0-100 score. The ring sweeps in via a CSS transition
 * on stroke-dashoffset while the number counts up; both settle on the same
 * final state. Everything inside is decorative -- the accessible name is
 * the role="img" label.
 */
export default function ScoreDial({ score }: { score: number }) {
  const reduced = useReducedMotion();
  const [offset, setOffset] = useState(() =>
    reduced ? dialOffset(score) : DIAL_CIRCUMFERENCE,
  );

  useEffect(() => {
    // One frame at the empty state so the transition has a start point.
    const raf = requestAnimationFrame(() => setOffset(dialOffset(score)));
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div
      role="img"
      aria-label={`Health score ${score} out of 100`}
      style={{ position: "relative", width: 128, height: 128 }}
    >
      <div aria-hidden="true">
        <svg viewBox="0 0 120 120" width={128} height={128}>
          <circle
            cx="60"
            cy="60"
            r={DIAL_RADIUS}
            fill="none"
            stroke="var(--rule)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={DIAL_RADIUS}
            fill="none"
            stroke={dialColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={DIAL_CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{
              transition: "stroke-dashoffset 1.1s var(--ease-out)",
            }}
          />
        </svg>
        <p
          className="h-display"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            margin: 0,
            fontSize: "1.9rem",
          }}
        >
          <CountUp value={score} durationMs={1100} />
        </p>
      </div>
    </div>
  );
}
