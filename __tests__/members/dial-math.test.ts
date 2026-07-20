import {
  DIAL_CIRCUMFERENCE,
  dialColor,
  dialOffset,
} from "@/lib/members/tools/dial";

describe("dialOffset", () => {
  it("is the full circumference at 0 (empty ring)", () => {
    expect(dialOffset(0)).toBeCloseTo(DIAL_CIRCUMFERENCE, 6);
  });

  it("is 0 at 100 (full ring)", () => {
    expect(dialOffset(100)).toBeCloseTo(0, 6);
  });

  it("is half the circumference at 50", () => {
    expect(dialOffset(50)).toBeCloseTo(DIAL_CIRCUMFERENCE / 2, 6);
  });

  it("clamps out-of-range scores", () => {
    expect(dialOffset(140)).toBeCloseTo(0, 6);
    expect(dialOffset(-20)).toBeCloseTo(DIAL_CIRCUMFERENCE, 6);
  });
});

describe("dialColor", () => {
  it("uses the success colour from 80 up", () => {
    expect(dialColor(80)).toBe("var(--forest-signal)");
    expect(dialColor(100)).toBe("var(--forest-signal)");
  });

  it("uses gold from 50 to 79", () => {
    expect(dialColor(50)).toBe("var(--liquid-gold)");
    expect(dialColor(79)).toBe("var(--liquid-gold)");
  });

  it("uses the warning red below 50", () => {
    expect(dialColor(49)).toBe("#c0392b");
    expect(dialColor(0)).toBe("#c0392b");
  });
});
