import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts, postBySlug, displayTitle } from "@/lib/insights/posts";
import { BlogPostingSchema } from "@/app/components/Schema";
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
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </div>
  );
}
