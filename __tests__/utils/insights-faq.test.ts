import { extractFaq } from "@/lib/insights/faq";
import { posts, postBySlug } from "@/lib/insights/posts";

describe("extractFaq", () => {
  it("returns an empty list when a post has no FAQ section", () => {
    expect(extractFaq("<h2>Intro</h2><p><strong>Bold?</strong></p><p>Text</p>")).toEqual([]);
  });

  it("reads question/answer pairs and stops before the call to action", () => {
    const html = [
      "<h2>Frequently asked questions</h2>",
      "<p><strong>First &amp; best?</strong></p>",
      '<p>Yes, see <a href="/pricing">pricing</a>.</p>',
      "<p><em>Source note.</em></p>",
      '<div class="acta"><p><strong>Not a question</strong></p><p>CTA</p></div>',
    ].join("\n");
    expect(extractFaq(html)).toEqual([{ q: "First & best?", a: "Yes, see pricing." }]);
  });

  it("finds the law firm FAQ, including the questions added for search", () => {
    const post = postBySlug("blog-15-ai-law-firms");
    const questions = extractFaq(post!.html).map((f) => f.q);
    expect(questions).toEqual(
      expect.arrayContaining([
        "Which legal AI capabilities are mature enough to use today?",
        "Is legal AI worth it for small firms and independent lawyers?",
        "How can litigation lawyers use AI?",
      ]),
    );
  });

  it("gives every post with an FAQ heading at least one complete pair", () => {
    for (const post of posts) {
      if (/Frequently asked questions/i.test(post.html)) {
        const faq = extractFaq(post.html);
        expect(faq.length).toBeGreaterThan(0);
        for (const item of faq) {
          expect(item.q).not.toMatch(/[<>]/);
          expect(item.a).not.toMatch(/[<>]/);
        }
      }
    }
  });
});
