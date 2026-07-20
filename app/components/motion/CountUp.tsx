"use client";

import { useEffect, useState } from "react";
import { countAt } from "@/lib/motion/count-up";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Integer count-up. The animated digits are decorative (aria-hidden); the
 * sr-only span carries the stable final value so live regions announce it
 * once instead of on every frame.
 */
export default function CountUp({
  value,
  durationMs = 900,
}: {
  value: number;
  durationMs?: number;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(() => (reduced ? value : 0));

  useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const next = countAt(value, now - start, durationMs);
      setShown(next);
      if (next !== value) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs, reduced]);

  return (
    <>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </>
  );
}
