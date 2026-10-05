import type { FAQItem } from "@/app/components/FAQ";

/**
 * Pulls the question/answer pairs out of an article's
 * "Frequently asked questions" section so the [slug] route can emit FAQPage
 * JSON-LD from the copy readers actually see. Deriving it from the HTML (rather
 * than keeping a second copy in the post JSON) means the structured data can
 * never drift from the visible FAQ.
 *
 * Expected markup, as used by the industry articles:
 *   <h2>Frequently asked questions</h2>
 *   <p><strong>Question?</strong></p>
 *   <p>Answer.</p>
 *
 * Returns an empty array when a post has no FAQ section.
 */
export function extractFaq(html: string): FAQItem[] {
  const start = html.search(/<h2>\s*Frequently asked questions\s*<\/h2>/i);
  if (start === -1) return [];

  // The section ends at the next h2 or the closing call-to-action block.
  const rest = html.slice(start).replace(/^<h2>[\s\S]*?<\/h2>/i, "");
  const endMatch = rest.search(/<h2[\s>]|<div class="acta">/i);
  const section = endMatch === -1 ? rest : rest.slice(0, endMatch);

  const items: FAQItem[] = [];
  const pair = /<p>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>\s*<p>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = pair.exec(section)) !== null) {
    const q = toText(m[1]);
    const a = toText(m[2]);
    if (q && a) items.push({ q, a });
  }
  return items;
}

function toText(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
