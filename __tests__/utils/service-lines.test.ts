import {
  isServiceLine,
  normaliseSourcePath,
  resolveEnquirySource,
  serviceLineForPath,
  SERVICE_LINE_LABELS,
  SERVICE_LINES,
} from "@/lib/service-lines";

const ORIGIN = "https://www.creative-milk.com.au";

describe("serviceLineForPath", () => {
  it.each([
    ["/specialised-websites", "websites"],
    ["/websites", "websites"],
    ["/ai-automation-melbourne", "ai-automation"],
    ["/ai-consulting-melbourne", "ai-automation"],
    ["/what-we-build", "ai-automation"],
    ["/for/professional-services", "ai-automation"],
    ["/events/workshop", "workshop"],
    ["/events/workshop-melbourne", "workshop"],
    ["/ai-readiness", "tools"],
    ["/opportunity-cost", "tools"],
    ["/tools", "tools"],
  ])("maps %s to %s", (path, expected) => {
    expect(serviceLineForPath(path)).toBe(expected);
  });

  // Mixed-intent pages must not be attributed to a service line: inventing a
  // signal here would make the six-month revenue comparison meaningless.
  it.each(["/", "/pricing", "/process", "/work", "/about", "/insights", "/contact"])(
    "leaves %s as general",
    (path) => {
      expect(serviceLineForPath(path)).toBe("general");
    },
  );

  it("is case insensitive", () => {
    expect(serviceLineForPath("/Specialised-Websites")).toBe("websites");
  });

  it("matches nested paths under a prefix", () => {
    expect(serviceLineForPath("/insights/ai-for-retail")).toBe("general");
    expect(serviceLineForPath("/for/legal")).toBe("ai-automation");
  });

  it("has a label for every service line", () => {
    for (const line of SERVICE_LINES) {
      expect(SERVICE_LINE_LABELS[line]).toBeTruthy();
    }
  });
});

describe("isServiceLine", () => {
  it("accepts known lines", () => {
    expect(isServiceLine("websites")).toBe(true);
    expect(isServiceLine("general")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isServiceLine("Websites")).toBe(false);
    expect(isServiceLine("<script>alert(1)</script>")).toBe(false);
    expect(isServiceLine("")).toBe(false);
    expect(isServiceLine(undefined)).toBe(false);
    expect(isServiceLine(null)).toBe(false);
    expect(isServiceLine(42)).toBe(false);
    expect(isServiceLine({ toString: () => "websites" })).toBe(false);
  });
});

describe("normaliseSourcePath", () => {
  it("accepts a site-relative path", () => {
    expect(normaliseSourcePath("/specialised-websites")).toBe(
      "/specialised-websites",
    );
    expect(normaliseSourcePath("  /pricing  ")).toBe("/pricing");
  });

  // Query strings and fragments are dropped so tracking parameters and
  // anything personal in a visitor's URL are never captured.
  it("strips query strings and fragments", () => {
    expect(normaliseSourcePath("/pricing?utm_source=google&email=a@b.com")).toBe(
      "/pricing",
    );
    expect(normaliseSourcePath("/pricing#tiers")).toBe("/pricing");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(normaliseSourcePath("https://evil.example/x")).toBeNull();
    expect(normaliseSourcePath("//evil.example/x")).toBeNull();
    expect(normaliseSourcePath("javascript:alert(1)")).toBeNull();
    expect(normaliseSourcePath("mailto:a@b.com")).toBeNull();
  });

  it("rejects markup and other unexpected characters", () => {
    expect(normaliseSourcePath('/x"><img src=x onerror=alert(1)>')).toBeNull();
    expect(normaliseSourcePath("/x<script>")).toBeNull();
    expect(normaliseSourcePath("/x y")).toBeNull();
  });

  it("rejects an over-long path", () => {
    expect(normaliseSourcePath("/" + "a".repeat(200))).toBeNull();
  });

  it("rejects non-strings", () => {
    expect(normaliseSourcePath(undefined)).toBeNull();
    expect(normaliseSourcePath(null)).toBeNull();
    expect(normaliseSourcePath(123)).toBeNull();
  });
});

describe("resolveEnquirySource", () => {
  it("uses the pathname when it already identifies a service line", () => {
    expect(
      resolveEnquirySource(
        "/specialised-websites",
        `${ORIGIN}/pricing`,
        ORIGIN,
      ),
    ).toEqual({
      sourcePath: "/specialised-websites",
      serviceLine: "websites",
    });
  });

  // The form stands alone at /contact, where the pathname says nothing useful.
  it("falls back to a same-origin referrer on a mixed-intent page", () => {
    expect(
      resolveEnquirySource(
        "/contact",
        `${ORIGIN}/ai-automation-melbourne`,
        ORIGIN,
      ),
    ).toEqual({
      sourcePath: "/ai-automation-melbourne",
      serviceLine: "ai-automation",
    });
  });

  it("ignores a cross-origin referrer", () => {
    expect(
      resolveEnquirySource(
        "/contact",
        "https://www.google.com/search?q=creative+milk",
        ORIGIN,
      ),
    ).toEqual({ sourcePath: "/contact", serviceLine: "general" });
  });

  it("ignores a same-origin referrer that is itself mixed intent", () => {
    expect(
      resolveEnquirySource("/contact", `${ORIGIN}/about`, ORIGIN),
    ).toEqual({ sourcePath: "/contact", serviceLine: "general" });
  });

  it("survives a missing or malformed referrer", () => {
    expect(resolveEnquirySource("/contact", "", ORIGIN)).toEqual({
      sourcePath: "/contact",
      serviceLine: "general",
    });
    expect(resolveEnquirySource("/contact", "not a url", ORIGIN)).toEqual({
      sourcePath: "/contact",
      serviceLine: "general",
    });
  });
});
