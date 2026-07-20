import { runSecurityChecks } from "../security-headers";

/** Headers that pass every presence check; no cookies, no server banner. */
const GOOD: Record<string, string> = {
  "strict-transport-security": "max-age=63072000; includeSubDomains",
  "content-security-policy": "default-src 'self'",
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=()",
};

function headersOf(overrides: Record<string, string> = {}): Headers {
  return new Headers({ ...GOOD, ...overrides });
}

function check(headers: Headers, id: string) {
  const found = runSecurityChecks(headers).checks.find((c) => c.id === id);
  if (!found) throw new Error(`no check with id ${id}`);
  return found;
}

describe("runSecurityChecks", () => {
  it("scores 100 with all protections present and lists 8 checks", () => {
    const report = runSecurityChecks(headersOf());
    expect(report.checks).toHaveLength(8);
    expect(report.score).toBe(100);
    expect(report.failed).toHaveLength(0);
  });

  it("scores an empty header set: cookie + disclosure pass, presence checks fail", () => {
    const report = runSecurityChecks(new Headers());
    // 2 of 8 pass (no cookies to get wrong, no software banner to leak).
    expect(report.score).toBe(25);
    const failedIds = report.failed.map((c) => c.id).sort();
    expect(failedIds).toEqual([
      "clickjacking",
      "csp",
      "hsts",
      "nosniff",
      "permissions",
      "referrer",
    ]);
  });

  it("every check carries plain-English advice", () => {
    for (const c of runSecurityChecks(new Headers()).checks) {
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.advice.length).toBeGreaterThan(20);
    }
  });

  describe("hsts", () => {
    it("passes with a positive max-age", () => {
      expect(check(headersOf(), "hsts").pass).toBe(true);
    });
    it("fails when max-age is 0", () => {
      const h = headersOf({ "strict-transport-security": "max-age=0" });
      expect(check(h, "hsts").pass).toBe(false);
    });
    it("fails when the header is absent", () => {
      expect(check(new Headers(), "hsts").pass).toBe(false);
    });
  });

  describe("csp", () => {
    it("passes with any policy present", () => {
      expect(check(headersOf(), "csp").pass).toBe(true);
    });
    it("fails when absent", () => {
      expect(check(new Headers(), "csp").pass).toBe(false);
    });
  });

  describe("clickjacking", () => {
    it("passes via x-frame-options", () => {
      expect(check(headersOf(), "clickjacking").pass).toBe(true);
    });
    it("passes via CSP frame-ancestors without x-frame-options", () => {
      const h = new Headers({
        "content-security-policy": "frame-ancestors 'none'",
      });
      expect(check(h, "clickjacking").pass).toBe(true);
    });
    it("fails with neither protection", () => {
      const h = new Headers({ "content-security-policy": "default-src 'self'" });
      expect(check(h, "clickjacking").pass).toBe(false);
    });
  });

  describe("nosniff", () => {
    it("passes case-insensitively", () => {
      const h = headersOf({ "x-content-type-options": "NOSNIFF" });
      expect(check(h, "nosniff").pass).toBe(true);
    });
    it("fails on any other value", () => {
      const h = headersOf({ "x-content-type-options": "none" });
      expect(check(h, "nosniff").pass).toBe(false);
    });
    it("fails when absent", () => {
      expect(check(new Headers(), "nosniff").pass).toBe(false);
    });
  });

  describe("referrer", () => {
    it("passes with a privacy-preserving policy", () => {
      expect(check(headersOf(), "referrer").pass).toBe(true);
    });
    it("fails on unsafe-url", () => {
      const h = headersOf({ "referrer-policy": "unsafe-url" });
      expect(check(h, "referrer").pass).toBe(false);
    });
    it("fails when absent", () => {
      expect(check(new Headers(), "referrer").pass).toBe(false);
    });
  });

  describe("permissions", () => {
    it("passes when present", () => {
      expect(check(headersOf(), "permissions").pass).toBe(true);
    });
    it("fails when absent", () => {
      expect(check(new Headers(), "permissions").pass).toBe(false);
    });
  });

  describe("cookies", () => {
    it("passes with no set-cookie header at all", () => {
      expect(check(headersOf(), "cookies").pass).toBe(true);
    });
    it("passes when every cookie has Secure and HttpOnly (any case)", () => {
      const h = headersOf();
      h.append("set-cookie", "session=abc; Path=/; secure; httponly");
      expect(check(h, "cookies").pass).toBe(true);
    });
    it("fails when a single cookie lacks HttpOnly", () => {
      const h = headersOf();
      h.append("set-cookie", "session=abc; Secure");
      expect(check(h, "cookies").pass).toBe(false);
    });
    it("fails when one of several cookies lacks HttpOnly", () => {
      const h = headersOf();
      h.append("set-cookie", "a=1; Secure; HttpOnly");
      h.append("set-cookie", "b=2; Secure");
      expect(check(h, "cookies").pass).toBe(false);
    });
    it("is not fooled by a cookie literally named secure", () => {
      const h = headersOf();
      h.append("set-cookie", "secure=1; HttpOnly");
      expect(check(h, "cookies").pass).toBe(false);
    });
  });

  describe("disclosure", () => {
    it("passes with no server or x-powered-by headers", () => {
      expect(check(headersOf(), "disclosure").pass).toBe(true);
    });
    it("passes for a version-free server banner", () => {
      const h = headersOf({ server: "cloudflare" });
      expect(check(h, "disclosure").pass).toBe(true);
    });
    it("fails for a versioned server banner", () => {
      const h = headersOf({ server: "nginx/1.18.0" });
      expect(check(h, "disclosure").pass).toBe(false);
    });
    it("fails when x-powered-by is present", () => {
      const h = headersOf({ "x-powered-by": "Express" });
      expect(check(h, "disclosure").pass).toBe(false);
    });
  });

  it("scores equal-weighted: 2 passes of 8 rounds to 25", () => {
    const h = new Headers({
      "strict-transport-security": "max-age=1",
      "content-security-policy": "default-src 'self'",
    });
    h.append("set-cookie", "a=1"); // fails cookies
    h.set("x-powered-by", "PHP/8.1"); // fails disclosure
    // passes: hsts + csp only — clickjacking needs frame-ancestors or XFO,
    // and nosniff/referrer/permissions are absent.
    expect(runSecurityChecks(h).score).toBe(25);
  });
});
