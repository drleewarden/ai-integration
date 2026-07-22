/**
 * Single-page website health checks for the members Website Health Check.
 * Pure string analysis — regex-based on purpose (no HTML parser dependency);
 * good enough for the marketing-page patterns this audits.
 */

export interface HealthCheck {
  id: string;
  label: string;
  pass: boolean;
  advice: string;
  weight: number;
}

export interface HealthReport {
  score: number;
  checks: HealthCheck[];
  failed: HealthCheck[];
}

const MAX_HEALTHY_BYTES = 1_500_000;

function extract(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

export function runHealthChecks(html: string, htmlBytes: number): HealthReport {
  const title = extract(html, /<title[^>]*>([^<]*)<\/title>/i);
  const metaDesc =
    extract(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    ) ??
    extract(
      html,
      /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
    );
  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  const imgsWithAlt = imgs.filter((tag) =>
    /\balt=["'][^"']+["']/i.test(tag),
  ).length;
  const altCoverage = imgs.length === 0 ? 1 : imgsWithAlt / imgs.length;

  const checks: HealthCheck[] = [
    {
      id: "title",
      label: "Page title",
      pass: !!title && title.length >= 10 && title.length <= 65,
      advice:
        "Give the page a unique title of 10–65 characters. It is the headline Google shows and the strongest single on-page SEO signal.",
      weight: 15,
    },
    {
      id: "meta-description",
      label: "Meta description",
      pass: !!metaDesc && metaDesc.length >= 50 && metaDesc.length <= 165,
      advice:
        "Add a meta description of 50–165 characters that sells the click. Without one, search engines improvise — usually badly.",
      weight: 10,
    },
    {
      id: "h1",
      label: "Single H1 heading",
      pass: h1Count === 1,
      advice:
        "Use exactly one H1 that states what the page is about. Multiple or missing H1s muddy the page's topic for search engines and screen readers.",
      weight: 10,
    },
    {
      id: "img-alt",
      label: "Image alt text",
      pass: altCoverage >= 0.8,
      advice:
        "Describe images with alt text. It is an accessibility requirement and helps your images rank in image search.",
      weight: 10,
    },
    {
      id: "viewport",
      label: "Mobile viewport",
      pass: /<meta[^>]+name=["']viewport["']/i.test(html),
      advice:
        "Add a viewport meta tag so the page scales on phones. Google indexes the mobile version of your site first.",
      weight: 15,
    },
    {
      id: "canonical",
      label: "Canonical URL",
      pass: /<link[^>]+rel=["']canonical["']/i.test(html),
      advice:
        "Add a canonical link so duplicate URLs (with and without trailing slash, tracking params) don't split your ranking signals.",
      weight: 5,
    },
    {
      id: "og-tags",
      label: "Social sharing tags",
      pass:
        /<meta[^>]+property=["']og:title["']/i.test(html) &&
        /<meta[^>]+property=["']og:description["']/i.test(html),
      advice:
        "Add Open Graph title and description tags so shared links look professional on LinkedIn, Facebook and in messaging apps.",
      weight: 5,
    },
    {
      id: "lang",
      label: "Language attribute",
      pass: /<html[^>]+lang=["'][a-z]{2}/i.test(html),
      advice:
        'Set lang="en-AU" (or your language) on the <html> tag so screen readers pronounce your content correctly.',
      weight: 5,
    },
    {
      id: "structured-data",
      label: "Structured data",
      pass: /application\/ld\+json/i.test(html),
      advice:
        "Add JSON-LD structured data (Organisation or LocalBusiness) so search engines and AI assistants understand who you are.",
      weight: 10,
    },
    {
      id: "page-weight",
      label: "Page weight",
      pass: htmlBytes <= MAX_HEALTHY_BYTES,
      advice:
        "The page HTML is heavier than 1.5MB. Trim inline scripts and styles — heavy pages load slowly on mobile connections and cost you visitors.",
      weight: 15,
    },
  ];

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const passedWeight = checks.reduce(
    (sum, c) => sum + (c.pass ? c.weight : 0),
    0,
  );
  const score = Math.round((passedWeight / totalWeight) * 100);

  return { score, checks, failed: checks.filter((c) => !c.pass) };
}
