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
    <Link href={`/members/${item.slug}`} className="member-card">
      <p className="eyebrow" style={{ margin: 0 }}>
        {TYPE_LABEL[item.type]}
        {item.tier === "pro" && (
          <span
            className="member-card-pill"
            aria-label={locked ? "Pro — locked" : "Pro"}
          >
            {locked ? "Pro 🔒" : "Pro"}
          </span>
        )}
      </p>
      <h2>{item.title}</h2>
      <p className="member-card-desc">{item.description}</p>
      <span className="member-card-open" aria-hidden="true">
        {locked ? "Preview" : "Open"} <span className="mc-arrow">→</span>
      </span>
    </Link>
  );
}
