import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts, postBySlug } from "@/lib/insights/posts";
import "./post.css";

/**
 * Single dynamic route for all Insights articles. Content comes from the
 * registry in lib/insights/posts.ts; the shared article stylesheet is
 * post.css. Statically generated for every known slug.
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
  return {
    title: post.title,
    description: post.description,
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
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </div>
  );
}
