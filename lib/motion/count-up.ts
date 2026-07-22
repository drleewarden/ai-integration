/**
 * Pure timing maths for count-up number animations. Kept free of React so
 * the easing curve and clamping are unit-testable.
 */

export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function countAt(
  target: number,
  elapsedMs: number,
  durationMs: number,
): number {
  if (durationMs <= 0) return target;
  const t = Math.min(Math.max(elapsedMs, 0) / durationMs, 1);
  return Math.round(target * easeOutExpo(t));
}
