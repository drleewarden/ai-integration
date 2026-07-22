/**
 * recordActivity is strictly best-effort: correct payload on success,
 * logged-and-swallowed on both error results and thrown rejections.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { recordActivity } from "../activity";

function makeClient(insert: jest.Mock): SupabaseClient {
  return { from: jest.fn(() => ({ insert })) } as unknown as SupabaseClient;
}

describe("recordActivity", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("inserts the shaped row into member_activity", async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const client = makeClient(insert);

    await recordActivity(client, "user-1", {
      slug: "security-headers-audit",
      kind: "tool_run",
      summary: { score: 78, host: "example.com" },
    });

    expect(client.from).toHaveBeenCalledWith("member_activity");
    expect(insert).toHaveBeenCalledWith({
      member_id: "user-1",
      item_slug: "security-headers-audit",
      kind: "tool_run",
      summary: { score: 78, host: "example.com" },
    });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("stores null summary when none is given (downloads)", async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    await recordActivity(makeClient(insert), "user-1", {
      slug: "ai-policy-template",
      kind: "download",
    });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "download", summary: null }),
    );
  });

  it("logs and swallows an error result", async () => {
    const insert = jest.fn().mockResolvedValue({ error: { message: "denied" } });
    await expect(
      recordActivity(makeClient(insert), "user-1", {
        slug: "website-health-check",
        kind: "tool_run",
      }),
    ).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("logs and swallows a thrown rejection", async () => {
    const insert = jest.fn().mockRejectedValue(new Error("network down"));
    await expect(
      recordActivity(makeClient(insert), "user-1", {
        slug: "website-health-check",
        kind: "tool_run",
      }),
    ).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });
});
