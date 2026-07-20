import { render } from "@testing-library/react";
import ItemCard from "@/app/components/members/ItemCard";
import type { MemberItem } from "@/lib/members/items";

const item = {
  slug: "test-item",
  title: "Test item",
  description: "A test item.",
  type: "guide",
  tier: "free",
} as MemberItem;

describe("ItemCard entrance stagger", () => {
  it("applies the enter class and stagger index custom property", () => {
    const { container } = render(
      <ItemCard item={item} locked={false} index={3} />,
    );
    const card = container.querySelector("a.member-card")!;
    expect(card.className).toContain("member-card-enter");
    expect((card as HTMLElement).style.getPropertyValue("--stagger-i")).toBe(
      "3",
    );
  });

  it("defaults the stagger index to 0", () => {
    const { container } = render(<ItemCard item={item} locked={false} />);
    const card = container.querySelector("a.member-card") as HTMLElement;
    expect(card.style.getPropertyValue("--stagger-i")).toBe("0");
  });
});
