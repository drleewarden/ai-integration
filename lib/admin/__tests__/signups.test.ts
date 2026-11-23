/**
 * @jest-environment node
 */
import {
  excludeSeminarMembers,
  parseSignupType,
  type GeneralSignupRow,
} from "@/lib/admin/signups";

describe("parseSignupType", () => {
  it("accepts the three known sections", () => {
    expect(parseSignupType("seminar")).toBe("seminar");
    expect(parseSignupType("workshop")).toBe("workshop");
    expect(parseSignupType("general")).toBe("general");
  });

  it("defaults to seminar for missing or unknown values", () => {
    expect(parseSignupType(undefined)).toBe("seminar");
    expect(parseSignupType("")).toBe("seminar");
    expect(parseSignupType("admin")).toBe("seminar");
    expect(parseSignupType("constructor")).toBe("seminar");
  });

  it("uses the first value when the param repeats", () => {
    expect(parseSignupType(["workshop", "general"])).toBe("workshop");
  });
});

describe("excludeSeminarMembers", () => {
  const member = (email: string): GeneralSignupRow => ({
    id: email,
    created_at: "2026-10-01T00:00:00Z",
    email,
    display_name: null,
    tier: "free",
    subscription_status: null,
    complimentary_pro_until: null,
  });

  it("drops members who signed up through the seminar, ignoring case", () => {
    const rows = excludeSeminarMembers(
      [member("Ann@Example.com"), member("bob@example.com")],
      ["ann@example.com"],
    );
    expect(rows.map((r) => r.email)).toEqual(["bob@example.com"]);
  });

  it("keeps everyone when there are no seminar signups", () => {
    expect(excludeSeminarMembers([member("a@b.co")], [])).toHaveLength(1);
  });
});
