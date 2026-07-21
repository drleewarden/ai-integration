/**
 * Pure dashboard shaping: relative timestamps, unknown-slug filtering,
 * the 5-row cap, and the greeting-name fallback chain.
 */
import {
  ACTIVITY_FEED_LIMIT,
  buildActivityFeed,
  formatRelativeTime,
  greetingName,
  type ActivityRow,
} from "../dashboard";

const NOW = new Date("2026-07-21T10:00:00.000Z");

function row(overrides: Partial<ActivityRow> = {}): ActivityRow {
  return {
    id: "a1",
    item_slug: "security-headers-audit",
    kind: "tool_run",
    summary: { score: 78, host: "example.com" },
    created_at: "2026-07-21T08:00:00.000Z",
    ...overrides,
  };
}

describe("formatRelativeTime", () => {
  it.each([
    ["2026-07-21T09:59:30.000Z", "just now"],
    ["2026-07-21T09:59:00.000Z", "1 minute ago"],
    ["2026-07-21T09:15:00.000Z", "45 minutes ago"],
    ["2026-07-21T09:00:00.000Z", "1 hour ago"],
    ["2026-07-21T08:00:00.000Z", "2 hours ago"],
    ["2026-07-20T09:00:00.000Z", "1 day ago"],
    ["2026-07-14T10:00:00.000Z", "7 days ago"],
  ])("%s -> %s", (iso, expected) => {
    expect(formatRelativeTime(iso, NOW)).toBe(expected);
  });

  it("falls back to an en-AU date beyond 30 days", () => {
    expect(formatRelativeTime("2026-05-01T10:00:00.000Z", NOW)).toBe(
      "1 May 2026",
    );
  });

  it("clamps future timestamps (clock skew) to 'just now'", () => {
    expect(formatRelativeTime("2026-07-21T10:05:00.000Z", NOW)).toBe(
      "just now",
    );
  });
});

describe("buildActivityFeed", () => {
  const resolveTitle = (slug: string) =>
    slug === "gone-item" ? undefined : `Title of ${slug}`;

  it("shapes rows with title, score, host and relative time", () => {
    const feed = buildActivityFeed([row()], resolveTitle, NOW);
    expect(feed).toEqual([
      {
        id: "a1",
        slug: "security-headers-audit",
        title: "Title of security-headers-audit",
        kind: "tool_run",
        score: 78,
        host: "example.com",
        when: "2 hours ago",
      },
    ]);
  });

  it("skips rows whose slug is no longer in the registry", () => {
    const feed = buildActivityFeed(
      [row({ id: "a1", item_slug: "gone-item" }), row({ id: "a2" })],
      resolveTitle,
      NOW,
    );
    expect(feed.map((f) => f.id)).toEqual(["a2"]);
  });

  it("caps the feed at ACTIVITY_FEED_LIMIT rows", () => {
    const rows = Array.from({ length: 9 }, (_, i) => row({ id: `a${i}` }));
    const feed = buildActivityFeed(rows, resolveTitle, NOW);
    expect(ACTIVITY_FEED_LIMIT).toBe(5);
    expect(feed).toHaveLength(5);
    expect(feed[0].id).toBe("a0");
  });

  it("nulls score/host when summary is missing or malformed", () => {
    const feed = buildActivityFeed(
      [row({ summary: null }), row({ id: "a2", summary: { score: "78", host: 9 } })],
      resolveTitle,
      NOW,
    );
    expect(feed[0].score).toBeNull();
    expect(feed[0].host).toBeNull();
    expect(feed[1].score).toBeNull();
    expect(feed[1].host).toBeNull();
  });
});

describe("greetingName", () => {
  it("prefers the display name", () => {
    expect(greetingName("Sam Taylor", "sam@example.com")).toBe("Sam Taylor");
  });

  it("falls back to the email local part", () => {
    expect(greetingName(null, "sam.taylor@example.com")).toBe("sam.taylor");
    expect(greetingName("   ", "sam@example.com")).toBe("sam");
  });

  it("falls back to 'there' when both are empty", () => {
    expect(greetingName(null, "")).toBe("there");
  });
});
