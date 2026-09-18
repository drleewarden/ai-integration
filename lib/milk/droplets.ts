/**
 * Milk droplet particle system.
 *
 * Pure maths: no WebGL, no DOM, no React. The renderer decides how to draw a
 * droplet; this module only decides where droplets are and how long they last.
 *
 * Coordinate space is fluid-sim UV: 0..1 on both axes with y pointing UP, so
 * gravity decreases y. Velocities are UV units per second.
 */

export type Droplet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Seconds of life remaining. */
  life: number;
  /** 0..1, decays with age. Renderer multiplies dye intensity by this. */
  alpha: number;
  /** 0..1 relative splat radius, fixed at emission. */
  size: number;
};

export type DropletSystemOptions = {
  /** Downward acceleration, UV per second squared. */
  gravity?: number;
  /** Linear air resistance per second. */
  drag?: number;
  /** Minimum pointer speed (UV per second) that throws any droplets at all. */
  emitSpeed?: number;
  /** Seconds a droplet lives before it is removed. */
  lifetime?: number;
  /** Hard cap on live droplets. Oldest are dropped first. */
  maxDroplets?: number;
  /** Most droplets a single flick can throw. */
  maxPerEmit?: number;
  /** Fraction of pointer velocity a droplet inherits. */
  throwFactor?: number;
  /** Cone half-angle, radians, that droplets scatter within. */
  spread?: number;
  /** Injectable RNG so tests are deterministic. */
  random?: () => number;
};

export type DropletSystem = {
  /** Returns how many droplets the flick actually threw. */
  emit: (x: number, y: number, dx: number, dy: number) => number;
  step: (dt: number) => void;
  readonly droplets: readonly Droplet[];
  clear: () => void;
};

/**
 * Largest frame delta we integrate. A backgrounded tab or a long main-thread
 * stall hands back a huge delta; without this clamp every live droplet would
 * teleport off-screen in a single frame.
 */
const MAX_STEP = 1 / 30;

/** Droplets past this margin outside the canvas can never come back. */
const CULL_MARGIN = 0.05;

export function createDropletSystem(
  options: DropletSystemOptions = {}
): DropletSystem {
  const {
    gravity = 0.55,
    drag = 1.6,
    emitSpeed = 1.1,
    lifetime = 0.8,
    maxDroplets = 90,
    maxPerEmit = 8,
    throwFactor = 0.32,
    spread = 0.55,
    random = Math.random,
  } = options;

  const droplets: Droplet[] = [];

  const emit = (x: number, y: number, dx: number, dy: number): number => {
    const speed = Math.hypot(dx, dy);
    if (speed < emitSpeed) return 0;

    // Faster flicks throw more, but a single flick can never flood the buffer.
    const count = Math.min(maxPerEmit, Math.max(1, Math.round(speed)));
    const heading = Math.atan2(dy, dx);

    for (let i = 0; i < count; i++) {
      const angle = heading + (random() - 0.5) * 2 * spread;
      const power = speed * throwFactor * (0.6 + random() * 0.8);
      droplets.push({
        x,
        y,
        vx: Math.cos(angle) * power,
        vy: Math.sin(angle) * power,
        life: lifetime,
        alpha: 1,
        size: 0.45 + random() * 0.55,
      });
    }

    if (droplets.length > maxDroplets) {
      droplets.splice(0, droplets.length - maxDroplets);
    }

    return count;
  };

  const step = (dt: number) => {
    const t = Math.min(dt, MAX_STEP);
    const damping = Math.max(0, 1 - drag * t);

    // Reverse iteration so splicing does not skip the next droplet.
    for (let i = droplets.length - 1; i >= 0; i--) {
      const d = droplets[i];

      d.vy -= gravity * t;
      d.vx *= damping;
      d.vy *= damping;
      d.x += d.vx * t;
      d.y += d.vy * t;
      d.life -= t;
      d.alpha = Math.max(0, d.life / lifetime);

      const gone =
        d.life <= 0 ||
        d.y < -CULL_MARGIN ||
        d.y > 1 + CULL_MARGIN ||
        d.x < -CULL_MARGIN ||
        d.x > 1 + CULL_MARGIN;

      if (gone) droplets.splice(i, 1);
    }
  };

  const clear = () => {
    droplets.length = 0;
  };

  return {
    emit,
    step,
    get droplets() {
      return droplets as readonly Droplet[];
    },
    clear,
  };
}
