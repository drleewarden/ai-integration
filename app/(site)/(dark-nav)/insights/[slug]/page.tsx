import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts, postBySlug, displayTitle } from "@/lib/insights/posts";
import { BlogPostingSchema } from "@/app/components/Schema";
import PreferredSource from "@/app/components/PreferredSource";
import Link from "next/link";
import "./post.css";

/**
 * Single dynamic route for all Insights articles. Content comes from the
 * registry in lib/insights/posts.ts; the shared article stylesheet is
 * post.css. Statically generated for every known slug.
 *
 * Each post ships canonical + OpenGraph metadata and BlogPosting JSON-LD
 * (dates, publisher entity) so AI search engines can attribute and cite it.
 */

export const dynamicParams = false;

// Articles for the firm types covered by /for/professional-services. Every
// article already links only to /contact, so this adds the service-page links
// that were missing (internal-link additions, seo-audit 2026-10-01).
const PROFESSIONAL_SERVICES_SLUGS = new Set([
  "blog-04-ai-accounting-firms",
  "blog-13-ai-financial-advisers",
  "blog-15-ai-law-firms",
]);

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) return {};
  const url = `/insights/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: displayTitle(post),
      description: post.description,
      url,
      type: "article",
      siteName: "Creative Milk",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      section: post.category,
      // Defining openGraph here replaces the root layout's, so the
      // file-convention opengraph-image must be re-declared explicitly.
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle(post),
      description: post.description,
      images: ["/twitter-image"],
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) notFound();

  // Every post ends with a dark `.footer` bar. Split it off so the Preferred
  // Sources prompt sits at the end of the article body, above that bar.
  const barAt = post.html.lastIndexOf('<div class="footer">');
  const body = barAt === -1 ? post.html : post.html.slice(0, barAt);
  const bar = barAt === -1 ? "" : post.html.slice(barAt);

  return (
    <div style={{ paddingTop: "68px" }}>
      <BlogPostingSchema
        title={displayTitle(post)}
        description={post.description}
        slug={post.slug}
        datePublished={post.datePublished}
        dateModified={post.dateModified}
        category={post.category}
      />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <nav
        aria-label="Related Creative Milk pages"
        style={{
          maxWidth: "740px",
          padding: "0 3rem 2rem",
          fontSize: "0.95rem",
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>Next step:</strong>{" "}
          {PROFESSIONAL_SERVICES_SLUGS.has(post.slug) && (
            <>
              <Link href="/for/professional-services">
                AI for professional services firms
              </Link>
              {" · "}
            </>
          )}
          <Link href="/ai-consulting-melbourne">AI consulting in Melbourne</Link>
          {" · "}
          <Link href="/pricing">Published pricing</Link>
          {" · "}
          <Link href="/services">How an engagement works</Link>
        </p>
      </nav>
      <aside
        aria-label="Follow Creative Milk on Google"
        style={{ maxWidth: "740px", padding: "0 3rem 2.5rem" }}
      >
        <PreferredSource
          theme="light"
          label="Found this useful? Add Creative Milk as a preferred source and see more of our articles in Google."
          labelColor="var(--slate-mid)"
        />
      </aside>
      {bar && <div dangerouslySetInnerHTML={{ __html: bar }} />}
    </div>
  );
}
