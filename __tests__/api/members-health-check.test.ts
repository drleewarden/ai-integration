/**
 * Route-level tests for /api/members/tools/health-check with auth, DNS and
 * network mocked. Follows the pattern of __tests__/api/send-email.test.ts.
 */
import { resetRateLimits } from "../../lib/rate-limit";

jest.mock("../../lib/supabase/auth-server", () => ({
  getMemberProfile: jest.fn(),
}));
jest.mock("node:dns/promises", () => ({
  lookup: jest.fn(),
}));

import { POST } from "../../app/api/members/tools/health-check/route";
import { getMemberProfile } from "../../lib/supabase/auth-server";
import { lookup } from "node:dns/promises";

const mockProfile = getMemberProfile as jest.Mock;
const mockLookup = lookup as unknown as jest.Mock;

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/members/tools/health-check", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.7",
    },
    body: JSON.stringify(body),
  });
}

const HTML = `<!doctype html><html lang="en"><head><title>A perfectly fine page title</title></head><body><h1>Hi</h1></body></html>`;

describe("POST /api/members/tools/health-check", () => {
  beforeEach(() => {
    resetRateLimits();
    jest.clearAllMocks();
    mockProfile.mockResolvedValue({ profile: { tier: "free" } });
    mockLookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
    global.fetch = jest.fn().mockResolvedValue(
      new Response(HTML, {
        status: 200,
        headers: { "content-type": "text/html" },
      }),
    );
  });

  it("401s without a session", async () => {
    mockProfile.mockResolvedValue(null);
    const res = await POST(makeReq({ url: "https://example.com" }));
    expect(res.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("400s on an invalid URL", async () => {
    const res = await POST(makeReq({ url: "http://example.com" }));
    expect(res.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("400s when DNS resolves to a private address", async () => {
    mockLookup.mockResolvedValue([{ address: "192.168.1.10", family: 4 }]);
    const res = await POST(makeReq({ url: "https://rebind.example.com" }));
    expect(res.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns a scored report for a valid page", async () => {
    const res = await POST(makeReq({ url: "https://example.com" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.score).toBeGreaterThan(0);
    expect(Array.isArray(json.checks)).toBe(true);
    expect(json.checks).toHaveLength(10);
    expect(json.finalUrl).toBe("https://example.com/");
  });

  it("400s when the target site cannot be fetched", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("boom"));
    const res = await POST(makeReq({ url: "https://example.com" }));
    expect(res.status).toBe(400);
  });

  it("400s when the site responds with an error status", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response("nope", { status: 500 }),
    );
    const res = await POST(makeReq({ url: "https://example.com" }));
    expect(res.status).toBe(400);
  });
});
