import { items, itemBySlug } from "@/lib/members/items";

describe("members content registry", () => {
  it("has unique slugs", () => {
    const slugs = items.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every item has required base fields", () => {
    for (const item of items) {
      expect(item.slug).toMatch(/^[a-z0-9-]+$/);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(["download", "tool", "guide"]).toContain(item.type);
      expect(["free", "pro"]).toContain(item.tier);
    }
  });

  it("type-specific payloads are present", () => {
    for (const item of items) {
      if (item.type === "download") expect(item.storagePath.length).toBeGreaterThan(0);
      if (item.type === "tool") expect(item.componentKey.length).toBeGreaterThan(0);
      if (item.type === "guide") expect(item.html.length).toBeGreaterThan(0);
    }
  });

  it("itemBySlug finds items and misses unknowns", () => {
    expect(itemBySlug("ai-policy-template")?.type).toBe("download");
    expect(itemBySlug("nope")).toBeUndefined();
  });
});
