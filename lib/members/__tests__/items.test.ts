import { itemBySlug } from "@/lib/members/items";

describe("ai-native-readiness registry entry", () => {
  it("is registered as a free download following storage conventions", () => {
    const item = itemBySlug("ai-native-readiness");
    expect(item).toBeDefined();
    if (!item || item.type !== "download") {
      throw new Error("expected a download item");
    }
    expect(item.tier).toBe("free");
    expect(item.fileName).toBe("ai-native-readiness-v1.zip");
    expect(item.storagePath).toBe(
      "ai-native-readiness/ai-native-readiness-v1.zip",
    );
  });
});
