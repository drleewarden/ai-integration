/**
 * Geometry and colour banding for the health-check score dial. Pure module
 * so the arc maths and band boundaries are unit-testable.
 */

export const DIAL_RADIUS = 52;
export const DIAL_CIRCUMFERENCE = 2 * Math.PI * DIAL_RADIUS;

export function dialOffset(score: number): number {
  const clamped = Math.min(100, Math.max(0, score));
  return DIAL_CIRCUMFERENCE * (1 - clamped / 100);
}

export function dialColor(score: number): string {
  if (score >= 80) return "var(--forest-signal)";
  if (score >= 50) return "var(--liquid-gold)";
  return "#c0392b";
}
