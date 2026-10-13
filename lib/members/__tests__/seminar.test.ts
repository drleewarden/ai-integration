/**
 * @jest-environment node
 */
import {
  complimentaryUntil,
  effectiveTier,
  isSeminarCodeValid,
  readSeminarConfig,
} from "@/lib/members/seminar";

const now = new Date("2026-10-20T00:00:00Z");
const config = {
  code: "GROWTH4",
  closesAt: new Date("2026-10-27T00:00:00Z"),
  proDays: 90,
};

describe("readSeminarConfig", () => {
  it("is null when the code or closing date is missing", () => {
    expect(readSeminarConfig({})).toBeNull();
    expect(readSeminarConfig({ SEMINAR_ACCESS_CODE: "X" })).toBeNull();
    expect(
      readSeminarConfig({ SEMINAR_ACCESS_CODE: "X", SEMINAR_ACCESS_CLOSES_AT: "nope" }),
    ).toBeNull();
  });

  it("defaults to 90 days and rejects silly values", () => {
    const base = { SEMINAR_ACCESS_CODE: "X", SEMINAR_ACCESS_CLOSES_AT: "2026-10-27" };
    expect(readSeminarConfig(base)?.proDays).toBe(90);
    expect(readSeminarConfig({ ...base, SEMINAR_PRO_DAYS: "30" })?.proDays).toBe(30);
    expect(readSeminarConfig({ ...base, SEMINAR_PRO_DAYS: "9999" })?.proDays).toBe(90);
    expect(readSeminarConfig({ ...base, SEMINAR_PRO_DAYS: "-1" })?.proDays).toBe(90);
  });
});

describe("isSeminarCodeValid", () => {
  it("accepts the right code inside the window", () => {
    expect(isSeminarCodeValid("GROWTH4", config, now)).toBe(true);
  });

  it("rejects wrong, empty, or differently sized codes", () => {
    expect(isSeminarCodeValid("GROWTH5", config, now)).toBe(false);
    expect(isSeminarCodeValid("GROWTH", config, now)).toBe(false);
    expect(isSeminarCodeValid("", config, now)).toBe(false);
    expect(isSeminarCodeValid(null, config, now)).toBe(false);
  });

  it("rejects after the closing date and when unconfigured", () => {
    expect(isSeminarCodeValid("GROWTH4", config, new Date("2026-10-28T00:00:00Z"))).toBe(false);
    expect(isSeminarCodeValid("GROWTH4", null, now)).toBe(false);
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
