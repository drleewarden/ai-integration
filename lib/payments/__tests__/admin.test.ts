import { parseAdminEmails, isAdminEmail } from "../admin";

describe("parseAdminEmails", () => {
  it("splits, trims, lowercases and drops empties", () => {
    const set = parseAdminEmails(" Darryn@Example.com , ,b@c.com,");
    expect(set).toEqual(new Set(["darryn@example.com", "b@c.com"]));
  });
  it("returns an empty set for undefined/null/empty", () => {
    expect(parseAdminEmails(undefined).size).toBe(0);
    expect(parseAdminEmails(null).size).toBe(0);
    expect(parseAdminEmails("").size).toBe(0);
  });
});

describe("isAdminEmail", () => {
  const allow = parseAdminEmails("darryn@example.com");
  it("matches case-insensitively", () => {
    expect(isAdminEmail("DARRYN@example.COM", allow)).toBe(true);
  });
  it("rejects non-listed, null and undefined emails", () => {
    expect(isAdminEmail("other@example.com", allow)).toBe(false);
    expect(isAdminEmail(null, allow)).toBe(false);
    expect(isAdminEmail(undefined, allow)).toBe(false);
  });
  it("rejects everyone when the allowlist is empty", () => {
    expect(isAdminEmail("darryn@example.com", new Set())).toBe(false);
  });
});
