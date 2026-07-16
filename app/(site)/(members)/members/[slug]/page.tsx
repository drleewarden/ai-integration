import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { itemBySlug } from "@/lib/members/items";
import { canAccess } from "@/lib/members/access";
import { getMemberProfile } from "@/lib/supabase/auth-server";
import LockedPreview from "@/app/components/members/LockedPreview";
import { TOOL_COMPONENTS } from "@/app/components/members/tools";
import "./members-article.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = itemBySlug(slug);
  return {
    title: item ? `${item.title} | Creative Milk Members` : "Members",
    robots: { index: false, follow: false },
  };
}

export default async function MemberItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = itemBySlug(slug);
  if (!item) notFound();

  const member = await getMemberProfile();
  const tier = member?.profile.tier ?? null;
  const allowed = canAccess(item.tier, tier);

  return (
    <article className="section" style={{ maxWidth: 720, margin: "0 auto" }}>
      <p className="eyebrow">
        <Link href="/members">← Library</Link>
      </p>
      <h1 className="h-display">{item.title}</h1>
      <p>{item.description}</p>

      {!allowed ? (
        <LockedPreview title={item.title} />
      ) : item.type === "download" ? (
        <a
          href={`/api/members/download/${item.slug}`}
          className="cta"
          style={{ minHeight: 44, display: "inline-block" }}
        >
          Download {item.fileName}
        </a>
      ) : item.type === "tool" ? (
        (() => {
          const Tool = TOOL_COMPONENTS[item.componentKey];
          return <Tool />;
        })()
      ) : (
        <div
          className="members-article"
          dangerouslySetInnerHTML={{ __html: item.html }}
        />
      )}
    </article>
  );
}
