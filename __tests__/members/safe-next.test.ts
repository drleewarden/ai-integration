import { safeNext } from "@/lib/members/safe-next";

const BASE = "https://www.creative-milk.com.au";

describe("safeNext", () => {
  it("passes through a normal same-site path", () => {
    expect(safeNext("/members/account", BASE)).toBe("/members/account");
  });

  it("falls back to /members for null", () => {
    expect(safeNext(null, BASE)).toBe("/members");
  });

  it("falls back to /members for undefined", () => {
    expect(safeNext(undefined, BASE)).toBe("/members");
  });

  it("falls back to /members for protocol-relative //evil.com", () => {
    expect(safeNext("//evil.com", BASE)).toBe("/members");
  });

  it("falls back to /members for backslash tricks (/\\evil.com)", () => {
    expect(safeNext("/\\evil.com", BASE)).toBe("/members");
  });

  it("falls back to /members for a leading tab (/\\tevil.com)", () => {
    expect(safeNext("/\tevil.com", BASE)).toBe("/members");
  });

  it("falls back to /members for an external absolute URL", () => {
    expect(safeNext("https://evil.com", BASE)).toBe("/members");
  });

  it("preserves the query string on a valid path", () => {
    expect(safeNext("/members?a=1", BASE)).toBe("/members?a=1");
  });
});
