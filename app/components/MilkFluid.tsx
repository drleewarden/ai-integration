"use client";

import { useEffect, useRef, useState } from "react";
import { createMilkFluid, type MilkFluid as Fluid } from "@/lib/milk/fluid";
import { createDropletSystem } from "@/lib/milk/droplets";

/**
 * Creative Milk hero cursor effect.
 *
 * Milk trails off the cursor through a WebGL2 fluid simulation, and fast
 * flicks throw droplets that arc down under gravity and disperse back into
 * the fluid.
 *
 * Desktop only, and deliberately so: it needs a real mouse to mean anything,
 * and it is decorative, so it renders nothing at all rather than degrading on
 * a phone or for someone who asked for less motion.
 *
 * Layering: this canvas sits above WebGLBackground and below the hero content
 * (which owns z-index 1), so the milk reads over the midnight ink field
 * without ever obscuring the headline.
 *
 * Simulation state lives in lib/milk/fluid.ts (GPU) and lib/milk/droplets.ts
 * (pure maths). This component only owns the browser: capability gating,
 * pointer input, the frame loop, and teardown.
 */

/** Below this width the effect is off: no mouse, and no room for it to read. */
const MIN_DESKTOP_WIDTH = 1024;

/** Pointer speed, in UV per second, that starts throwing droplets. */
const FLICK_THRESHOLD = 1.15;

/** Ignore sub-pixel pointer jitter so a resting cursor does not leak milk. */
const MIN_MOVE = 0.0015;

/** Per-axis cap on a single frame's pointer delta, in UV. */
const MAX_DELTA = 0.05;

/** Pointer delta to fluid force. Tuned against the hero's height. */
const FORCE_SCALE = 2600;

/**
 * Milk laid down per trail sub-splat. Not divided across the sub-splats: a
 * longer stroke genuinely holds more milk, and spreading a fixed budget over
 * the ribbon washes the trail out to nothing on fast moves.
 */
const TRAIL_DYE = 0.42;

/** Distance in UV between trail sub-splats, and the cap on how many. */
const TRAIL_STEP = 0.012;
const MAX_TRAIL_STEPS = 6;

/** Milk a droplet sheds per second of life, scaled by its remaining alpha. */
const DROPLET_DYE_RATE = 2.4;

/**
 * Desktop gate. `hover` and `pointer: fine` are the truer test for "has a
 * mouse" than width alone, and width keeps it off cramped desktop windows.
 */
const DESKTOP_QUERY =
  `(min-width: ${MIN_DESKTOP_WIDTH}px) and (hover: hover) and (pointer: fine)`;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export default function MilkFluid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  // Watched rather than read once: someone who loads the page in a narrow
  // window and then maximises it should get the effect without a reload.
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setEnabled(desktop.matches && !reduced.matches);

    update();
    desktop.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    let fluid: Fluid | null = null;

    // ── Backing store, DPR capped to match WebGLBackground ─────
    const sizeCanvas = (): boolean => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.max(1, Math.floor((canvas.clientWidth || 1) * dpr));
      const h = Math.max(1, Math.floor((canvas.clientHeight || 1) * dpr));
      if (canvas.width === w && canvas.height === h) return false;
      canvas.width = w;
      canvas.height = h;
      return true;
    };
    sizeCanvas();

    fluid = createMilkFluid(canvas);
    // No WebGL2 or no float render targets: leave the hero as it was.
    if (!fluid) return;

    const droplets = createDropletSystem({
      emitSpeed: FLICK_THRESHOLD,
      gravity: 0.5,
      drag: 1.4,
      lifetime: 0.85,
      maxDroplets: 80,
      throwFactor: 0.3,
    });

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        if (sizeCanvas()) fluid?.resize();
      });
    };
    window.addEventListener("resize", onResize, { passive: true });

    // ── Pointer input ──────────────────────────────────────────
    // Queued rather than splatted inline so all GL work happens in the frame
    // loop, which keeps pointermove cheap on a high-polling-rate mouse.
    const pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false, seen: false };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;

      // Only splat while the cursor is actually over the hero, so moving
      // across the nav or below the fold does not inject phantom milk.
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        pointer.seen = false;
        return;
      }

      // First sample after entering has no meaningful delta; seed and wait.
      if (!pointer.seen) {
        pointer.seen = true;
        pointer.x = x;
        pointer.y = y;
        return;
      }

      if (Math.hypot(x - pointer.x, y - pointer.y) < MIN_MOVE) return;

      pointer.dx = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, x - pointer.x));
      pointer.dy = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, y - pointer.y));
      pointer.x = x;
      pointer.y = y;
      pointer.moved = true;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // ── Pause when the hero is off-screen or the tab is hidden ─
    let onScreen = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) {
        // Drop queued droplets so nothing snaps forward on return.
        droplets.clear();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ── Frame loop ─────────────────────────────────────────────
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 1 / 60);
      last = now;

      if (!onScreen || document.hidden) return;

      if (pointer.moved) {
        pointer.moved = false;
        const dx = pointer.dx * FORCE_SCALE;
        // Slight downward bias so the trail sags like liquid rather than
        // hanging in place.
        const dy = pointer.dy * FORCE_SCALE - 12;

        // A fast flick can cover a lot of ground between two pointer events.
        // Splatting only at the end point leaves a dotted line, so walk the
        // segment and lay the milk down as a continuous ribbon.
        const steps = Math.min(
          MAX_TRAIL_STEPS,
          Math.max(1, Math.ceil(Math.hypot(pointer.dx, pointer.dy) / TRAIL_STEP))
        );
        const fromX = pointer.x - pointer.dx;
        const fromY = pointer.y - pointer.dy;

        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const x = fromX + pointer.dx * t;
          const y = fromY + pointer.dy * t;
          fluid.addVelocity(x, y, dx, dy);
          fluid.addDye(x, y, TRAIL_DYE, 0.85);
        }

        droplets.emit(pointer.x, pointer.y, pointer.dx / dt, pointer.dy / dt);
      }

      droplets.step(dt);
      for (const d of droplets.droplets) {
        // Rate, not per-frame constant: a 144Hz display must not deposit
        // twice the milk a 72Hz one does.
        fluid.addDye(d.x, d.y, DROPLET_DYE_RATE * d.alpha * dt, 0.28 * d.size);
      }

      fluid.step(dt);
      fluid.render();
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      droplets.clear();
      fluid.dispose();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="milk-canvas"
      aria-hidden="true"
      role="presentation"
    />
  );
}
