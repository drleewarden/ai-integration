import { countAt, easeOutExpo } from "@/lib/motion/count-up";

describe("easeOutExpo", () => {
  it("starts at 0 and ends at 1", () => {
    expect(easeOutExpo(0)).toBeCloseTo(0, 3);
    expect(easeOutExpo(1)).toBe(1);
  });

  it("is monotonically increasing", () => {
    let prev = -1;
    for (let t = 0; t <= 1.001; t += 0.05) {
      const v = easeOutExpo(t);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe("countAt", () => {
  it("is 0 at the start and target at the end", () => {
    expect(countAt(88, 0, 900)).toBe(0);
    expect(countAt(88, 900, 900)).toBe(88);
  });

  it("clamps past the duration", () => {
    expect(countAt(88, 5000, 900)).toBe(88);
  });

  it("returns the target immediately for a non-positive duration", () => {
    expect(countAt(88, 0, 0)).toBe(88);
    expect(countAt(88, 0, -5)).toBe(88);
  });

  it("returns integers", () => {
    expect(Number.isInteger(countAt(88, 333, 900))).toBe(true);
  });
});
