import { canAccess } from "@/lib/members/access";

describe("canAccess", () => {
  it("denies everything when not signed in", () => {
    expect(canAccess("free", null)).toBe(false);
    expect(canAccess("pro", null)).toBe(false);
  });

  it("free members: free yes, pro no", () => {
    expect(canAccess("free", "free")).toBe(true);
    expect(canAccess("pro", "free")).toBe(false);
  });

  it("pro members access everything", () => {
    expect(canAccess("free", "pro")).toBe(true);
    expect(canAccess("pro", "pro")).toBe(true);
  });
});
