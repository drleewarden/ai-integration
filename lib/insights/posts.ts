/**
 * Single source of truth for Insights (blog) content.
 *
 * Each post lives in content/insights/<slug>.json (metadata + article HTML).
 * The shared article stylesheet is app/(site)/(dark-nav)/insights/[slug]/post.css.
 *
 * Adding a post: drop a new JSON file in content/insights/, import it below,
 * and add it to the array. The [slug] route, the /insights index, and
 * sitemap.xml all derive from this list -- nothing else to update.
 */

import blog01 from "@/content/insights/blog-01-why-ai-fails.json";
import blog02 from "@/content/insights/blog-02-ai-costs-returns.json";
import blog03 from "@/content/insights/blog-03-change-management.json";
import blog04 from "@/content/insights/blog-04-ai-accounting-firms.json";
import blog05 from "@/content/insights/blog-05-what-is-ai-agent.json";
import blog06 from "@/content/insights/blog-06-behind-support-build.json";

export interface InsightPost {
  slug: string;
  num: number;
  /** Full SEO title, as used in the <title> tag. */
  title: string;
  description: string;
  category: string;
  readTime: string;
  /** ISO date (YYYY-MM-DD) the article was first published. */
  datePublished: string;
  /** ISO date (YYYY-MM-DD) of the last substantive edit. */
  dateModified: string;
  /** Pre-rendered article body HTML. */
  html: string;
}

export const posts: InsightPost[] = (
  [blog01, blog02, blog03, blog04, blog05, blog06] as InsightPost[]
).sort((a, b) => a.num - b.num);

export function postBySlug(slug: string): InsightPost | undefined {
  return posts.find((p) => p.slug === slug);
}

/**
 * Human-facing title for cards and headings: strips the "| Creative Milk
 * Insights" SEO suffix and any "Blog Article NN:" working prefix.
 */
export function displayTitle(post: InsightPost): string {
  return post.title
    .replace(/\s*\|\s*Creative Milk Insights\s*$/i, "")
    .replace(/^Blog Article \d+:\s*/i, "")
    .trim();
}
