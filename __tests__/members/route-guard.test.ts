import { membersRedirectPath } from "@/lib/members/route-guard";

describe("membersRedirectPath", () => {
  it("redirects anonymous visitors of members pages to login with next", () => {
    expect(membersRedirectPath("/members", false)).toBe(
      "/login?next=%2Fmembers",
    );
    expect(membersRedirectPath("/members/account", false)).toBe(
      "/login?next=%2Fmembers%2Faccount",
    );
  });

  it("allows the upgrade page without auth (public pitch page)", () => {
    expect(membersRedirectPath("/members/upgrade", false)).toBeNull();
  });

  it("allows authenticated members everywhere", () => {
    expect(membersRedirectPath("/members", true)).toBeNull();
    expect(membersRedirectPath("/members/account", true)).toBeNull();
  });

  it("ignores non-members paths", () => {
    expect(membersRedirectPath("/about", false)).toBeNull();
  });
});
