import {
  parseDollarsToCents,
  MAX_AMOUNT_CENTS,
  EMAIL_RE,
  UUID_RE,
} from "../validate";

describe("parseDollarsToCents", () => {
  it("parses whole dollars", () => {
    expect(parseDollarsToCents("450")).toBe(45000);
  });
  it("parses one and two decimal places", () => {
    expect(parseDollarsToCents("450.1")).toBe(45010);
    expect(parseDollarsToCents("450.15")).toBe(45015);
  });
  it("accepts a leading $ and thousands commas", () => {
    expect(parseDollarsToCents("$1,200.50")).toBe(120050);
  });
  it("rejects zero, negatives and three decimal places", () => {
    expect(parseDollarsToCents("0")).toBeNull();
    expect(parseDollarsToCents("0.00")).toBeNull();
    expect(parseDollarsToCents("-5")).toBeNull();
    expect(parseDollarsToCents("450.105")).toBeNull();
  });
  it("rejects non-numeric input and empty strings", () => {
    expect(parseDollarsToCents("abc")).toBeNull();
    expect(parseDollarsToCents("")).toBeNull();
    expect(parseDollarsToCents("45.0.0")).toBeNull();
  });
  it("rejects amounts over the cap", () => {
    expect(parseDollarsToCents("10000")).toBe(MAX_AMOUNT_CENTS);
    expect(parseDollarsToCents("10000.01")).toBeNull();
    expect(parseDollarsToCents("999999999999")).toBeNull();
  });
});

describe("regexes", () => {
  it("EMAIL_RE accepts a plain address and rejects garbage", () => {
    expect(EMAIL_RE.test("jane@example.com")).toBe(true);
    expect(EMAIL_RE.test("not-an-email")).toBe(false);
  });
  it("UUID_RE matches uuids case-insensitively", () => {
    expect(UUID_RE.test("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(true);
    expect(UUID_RE.test("6BA7B810-9DAD-11D1-80B4-00C04FD430C8")).toBe(true);
    expect(UUID_RE.test("nope")).toBe(false);
  });
});
