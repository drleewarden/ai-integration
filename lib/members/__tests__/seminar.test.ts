/**
 * @jest-environment node
 */
import {
  SEMINAR_CODE,
  complimentaryUntil,
  effectiveTier,
  isSeminarCodeValid,
} from "@/lib/members/seminar";

const now = new Date("2026-10-20T00:00:00Z");
describe("isSeminarCodeValid", () => {
  it("accepts the code printed in the QR, with no setup", () => {
    expect(SEMINAR_CODE).toBe("growth4-nldutam");
    expect(isSeminarCodeValid("growth4-nldutam")).toBe(true);
  });

  it("rejects wrong, empty, or differently sized codes", () => {
    expect(isSeminarCodeValid("growth4-nldutax")).toBe(false);
    expect(isSeminarCodeValid("growth4")).toBe(false);
    expect(isSeminarCodeValid("")).toBe(false);
    expect(isSeminarCodeValid(null)).toBe(false);
    expect(isSeminarCodeValid(undefined)).toBe(false);
  });
});

describe("complimentaryUntil", () => {
  it("grants proDays from now", () => {
    expect(complimentaryUntil(null, 90, now).toISOString()).toBe("2027-01-18T00:00:00.000Z");
  });

  it("never shortens a longer existing grant", () => {
    expect(complimentaryUntil("2027-06-01T00:00:00Z", 90, now).toISOString()).toBe(
      "2027-06-01T00:00:00.000Z",
    );
  });
});

describe("effectiveTier", () => {
  it("keeps paid pro", () => {
    expect(effectiveTier("pro", null, now)).toBe("pro");
  });

  it("upgrades free while the grant is live, then lapses", () => {
    expect(effectiveTier("free", "2026-11-01T00:00:00Z", now)).toBe("pro");
    expect(effectiveTier("free", "2026-10-01T00:00:00Z", now)).toBe("free");
    expect(effectiveTier("free", null, now)).toBe("free");
  });
});
