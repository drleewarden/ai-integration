import { runHealthChecks } from "../health-check";

const GOOD_PAGE = `<!doctype html>
<html lang="en-AU"><head>
<title>Plumber Brisbane — Fast Local Service | Acme Plumbing</title>
<meta name="description" content="Acme Plumbing offers same-day plumbing across Brisbane. Licensed, insured and trusted by 500+ local homes and businesses.">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="https://acme.example/">
<meta property="og:title" content="Acme Plumbing">
<meta property="og:description" content="Same-day plumbing across Brisbane.">
<script type="application/ld+json">{"@type":"LocalBusiness"}</script>
</head><body>
<h1>Brisbane's most reliable plumbers</h1>
<img src="/van.jpg" alt="Acme van"><img src="/team.jpg" alt="The team">
</body></html>`;

describe("runHealthChecks", () => {
  it("scores a well-formed page 100", () => {
    const report = runHealthChecks(GOOD_PAGE, 50_000);
    expect(report.failed).toHaveLength(0);
    expect(report.score).toBe(100);
    expect(report.checks).toHaveLength(10);
  });

  it("fails title check when missing", () => {
    const html = GOOD_PAGE.replace(/<title>.*<\/title>/, "");
    const report = runHealthChecks(html, 50_000);
    expect(report.failed.map((c) => c.id)).toContain("title");
    expect(report.score).toBeLessThan(100);
  });

  it("fails title check when too long", () => {
    const html = GOOD_PAGE.replace(
      /<title>.*<\/title>/,
      `<title>${"x".repeat(80)}</title>`,
    );
    expect(runHealthChecks(html, 50_000).failed.map((c) => c.id)).toContain(
      "title",
    );
  });

  it("fails h1 check with zero or multiple h1s", () => {
    const none = GOOD_PAGE.replace(/<h1>.*<\/h1>/, "");
    expect(runHealthChecks(none, 50_000).failed.map((c) => c.id)).toContain(
      "h1",
    );
    const two = GOOD_PAGE.replace("</body>", "<h1>Another</h1></body>");
    expect(runHealthChecks(two, 50_000).failed.map((c) => c.id)).toContain(
      "h1",
    );
  });

  it("fails alt-text check when under 80% coverage", () => {
    const html = GOOD_PAGE.replace(
      "</body>",
      '<img src="a.jpg"><img src="b.jpg"><img src="c.jpg"></body>',
    );
    // 2 of 5 images have alt => 40%
    expect(runHealthChecks(html, 50_000).failed.map((c) => c.id)).toContain(
      "img-alt",
    );
  });

  it("passes alt-text check on a page with no images", () => {
    const html = GOOD_PAGE.replace(/<img[^>]*>/g, "");
    expect(
      runHealthChecks(html, 50_000).failed.map((c) => c.id),
    ).not.toContain("img-alt");
  });

  it("fails weight check for pages over 1.5MB", () => {
    expect(
      runHealthChecks(GOOD_PAGE, 2_000_000).failed.map((c) => c.id),
    ).toContain("page-weight");
  });

  it("every check carries advice text", () => {
    const report = runHealthChecks("<html></html>", 100);
    for (const c of report.checks) expect(c.advice.length).toBeGreaterThan(10);
  });

  it("score is an integer percentage between 0 and 100", () => {
    const report = runHealthChecks("<html></html>", 100);
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
    expect(Number.isInteger(report.score)).toBe(true);
  });
});
