import { createDropletSystem } from "../droplets";

/**
 * Coordinates throughout are fluid-sim UV: 0..1 on both axes, y pointing UP.
 * Gravity therefore *decreases* y. Velocities are UV units per second.
 */

// Deterministic jitter so emission counts and spread are assertable.
const noJitter = () => 0.5;

describe("droplet emission", () => {
  it("emits nothing when the pointer moves slower than the flick threshold", () => {
    const system = createDropletSystem({ emitSpeed: 1, random: noJitter });

    const emitted = system.emit(0.5, 0.5, 0.2, 0.0);

    expect(emitted).toBe(0);
    expect(system.droplets).toHaveLength(0);
  });

  it("emits droplets at the pointer when the flick is fast enough", () => {
    const system = createDropletSystem({ emitSpeed: 1, random: noJitter });

    const emitted = system.emit(0.25, 0.75, 3, 0);

    expect(emitted).toBeGreaterThan(0);
    expect(system.droplets[0].x).toBeCloseTo(0.25, 5);
    expect(system.droplets[0].y).toBeCloseTo(0.75, 5);
  });

  it("throws more droplets from a faster flick", () => {
    const gentle = createDropletSystem({ emitSpeed: 1, random: noJitter });
    const violent = createDropletSystem({ emitSpeed: 1, random: noJitter });

    gentle.emit(0.5, 0.5, 1.5, 0);
    violent.emit(0.5, 0.5, 12, 0);

    expect(violent.droplets.length).toBeGreaterThan(gentle.droplets.length);
  });

  it("throws droplets in the direction of the flick", () => {
    const system = createDropletSystem({ emitSpeed: 1, random: noJitter });

    system.emit(0.5, 0.5, 4, 0);

    expect(system.droplets.every((d) => d.vx > 0)).toBe(true);
  });

  it("never holds more than maxDroplets", () => {
    const system = createDropletSystem({
      emitSpeed: 1,
      maxDroplets: 5,
      random: noJitter,
    });

    for (let i = 0; i < 20; i++) system.emit(0.5, 0.5, 10, 0);

    expect(system.droplets).toHaveLength(5);
  });
});

describe("droplet motion", () => {
  it("pulls droplets downward over time", () => {
    const system = createDropletSystem({
      emitSpeed: 1,
      gravity: 1,
      drag: 0,
      random: noJitter,
    });
    system.emit(0.5, 0.5, 3, 0);
    const startY = system.droplets[0].y;

    system.step(0.1);
    system.step(0.1);

    expect(system.droplets[0].y).toBeLessThan(startY);
  });

  it("slows droplets down through drag", () => {
    const system = createDropletSystem({
      emitSpeed: 1,
      gravity: 0,
      drag: 4,
      random: noJitter,
    });
    system.emit(0.5, 0.5, 4, 0);
    const startVx = system.droplets[0].vx;

    system.step(0.1);

    expect(system.droplets[0].vx).toBeLessThan(startVx);
    expect(system.droplets[0].vx).toBeGreaterThan(0);
  });

  it("clamps oversized frame deltas so a stalled tab cannot teleport droplets", () => {
    const smooth = createDropletSystem({ emitSpeed: 1, gravity: 1, random: noJitter });
    const stalled = createDropletSystem({ emitSpeed: 1, gravity: 1, random: noJitter });
    smooth.emit(0.5, 0.5, 3, 0);
    stalled.emit(0.5, 0.5, 3, 0);

    smooth.step(1 / 30);
    stalled.step(5);

    expect(stalled.droplets[0].x).toBeCloseTo(smooth.droplets[0].x, 5);
  });

  it("removes droplets once their life runs out", () => {
    const system = createDropletSystem({
      emitSpeed: 1,
      lifetime: 0.2,
      random: noJitter,
    });
    system.emit(0.5, 0.5, 3, 0);
    expect(system.droplets.length).toBeGreaterThan(0);

    for (let i = 0; i < 10; i++) system.step(1 / 30);

    expect(system.droplets).toHaveLength(0);
  });

  it("fades droplets out as they age", () => {
    const system = createDropletSystem({
      emitSpeed: 1,
      lifetime: 1,
      random: noJitter,
    });
    system.emit(0.5, 0.5, 3, 0);
    const startAlpha = system.droplets[0].alpha;

    system.step(0.5);

    expect(system.droplets[0].alpha).toBeLessThan(startAlpha);
    expect(system.droplets[0].alpha).toBeGreaterThan(0);
  });

  it("drops droplets that fall out of the viewport", () => {
    const system = createDropletSystem({
      emitSpeed: 1,
      gravity: 4,
      lifetime: 100,
      random: noJitter,
    });
    system.emit(0.5, 0.05, 3, 0);

    for (let i = 0; i < 60; i++) system.step(1 / 60);

    expect(system.droplets).toHaveLength(0);
  });
});

describe("droplet impacts", () => {
  it("reports where a droplet struck the surface when its flight ends", () => {
    const system = createDropletSystem({
      emitSpeed: 1,
      lifetime: 0.2,
      gravity: 1,
      random: noJitter,
    });
    system.emit(0.5, 0.5, 3, 0);
    const impacts: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < 10; i++) {
      system.step(1 / 30, (d) => impacts.push({ x: d.x, y: d.y }));
    }

    expect(impacts.length).toBeGreaterThan(0);
    // It struck downstream of where it was thrown, not at the cursor.
    expect(impacts[0].x).toBeGreaterThan(0.5);
    expect(impacts[0].y).toBeLessThan(0.5);
  });

  it("does not report an impact while droplets are still in flight", () => {
    const system = createDropletSystem({
      emitSpeed: 1,
      lifetime: 1,
      random: noJitter,
    });
    system.emit(0.5, 0.5, 3, 0);
    const onImpact = jest.fn();

    system.step(1 / 60, onImpact);

    expect(onImpact).not.toHaveBeenCalled();
  });

  it("does not report an impact for a droplet that leaves the viewport", () => {
    const system = createDropletSystem({
      emitSpeed: 1,
      gravity: 6,
      lifetime: 100,
      random: noJitter,
    });
    system.emit(0.5, 0.02, 3, 0);
    const onImpact = jest.fn();

    for (let i = 0; i < 60; i++) system.step(1 / 60, onImpact);

    expect(system.droplets).toHaveLength(0);
    expect(onImpact).not.toHaveBeenCalled();
  });
});

describe("droplet lifecycle", () => {
  it("clears every droplet on demand", () => {
    const system = createDropletSystem({ emitSpeed: 1, random: noJitter });
    system.emit(0.5, 0.5, 8, 0);
    expect(system.droplets.length).toBeGreaterThan(0);

    system.clear();

    expect(system.droplets).toHaveLength(0);
  });
});
