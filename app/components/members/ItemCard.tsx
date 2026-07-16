import Link from "next/link";
import type { MemberItem } from "@/lib/members/items";

const TYPE_LABEL: Record<MemberItem["type"], string> = {
  download: "Download",
  tool: "Tool",
  guide: "Guide",
};

export default function ItemCard({
  item,
  locked,
}: {
  item: MemberItem;
  locked: boolean;
}) {
  return (
    <Link
      href={`/members/${item.slug}`}
      style={{
        display: "block",
        border: "1px solid color-mix(in srgb, var(--warm-cream) 20%, transparent)",
        borderRadius: 12,
        padding: "1.5rem",
        textDecoration: "none",
      }}
    >
      <p className="eyebrow">
        {TYPE_LABEL[item.type]}
        {item.tier === "pro" && (
          <span
            style={{ marginLeft: "0.5rem", color: "var(--liquid-gold)" }}
            aria-label={locked ? "Pro — locked" : "Pro"}
          >
            {locked ? "Pro 🔒" : "Pro"}
          </span>
        )}
      </p>
      <h2 style={{ margin: "0.25rem 0 0.5rem" }}>{item.title}</h2>
      <p style={{ margin: 0 }}>{item.description}</p>
    </Link>
  );
}
