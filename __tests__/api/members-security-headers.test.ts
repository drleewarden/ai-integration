/**
 * Route-level tests for /api/members/tools/security-headers with auth, DNS
 * and network mocked. Mirrors __tests__/api/members-health-check.test.ts.
 */
import { resetRateLimits } from "../../lib/rate-limit";

jest.mock("../../lib/supabase/auth-server", () => ({
  getMemberProfile: jest.fn(),
}));
jest.mock("node:dns/promises", () => ({
  lookup: jest.fn(),
}));

import { POST } from "../../app/api/members/tools/security-headers/route";
import { getMemberProfile } from "../../lib/supabase/auth-server";
import { lookup } from "node:dns/promises";

const mockProfile = getMemberProfile as jest.Mock;
const mockLookup = lookup as unknown as jest.Mock;

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/members/tools/security-headers", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.7",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

/** A response whose headers pass all eight checks. */
function secureResponse(): Response {
  return new Response("", {
    status: 200,
    headers: {
      "strict-transport-security": "max-age=63072000",
      "content-security-policy": "default-src 'self'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "camera=()",
    },
  });
}

describe("POST /api/members/tools/security-headers", () => {
  beforeEach(() => {
    resetRateLimits();
    jest.clearAllMocks();
    mockProfile.mockResolvedValue({ profile: { tier: "free" } });
    mockLookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
    global.fetch = jest.fn().mockResolvedValue(secureResponse());
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

  it("413s an oversized body", async () => {
    const res = await POST(makeReq({ url: "x".repeat(5_000) }));
    expect(res.status).toBe(413);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("400s when the url field is not a string", async () => {
    const res = await POST(makeReq({ url: 42 }));
    expect(res.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns a scored report for a well-configured site", async () => {
    const res = await POST(makeReq({ url: "https://example.com" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.finalUrl).toBe("https://example.com/");
    expect(json.checks).toHaveLength(8);
    expect(json.score).toBe(100);
    expect(json.failed).toHaveLength(0);
  });

  it("reports failures for a bare response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response("", { status: 200, headers: { server: "nginx/1.18.0" } }),
    );
    const res = await POST(makeReq({ url: "https://example.com" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.score).toBeLessThan(50);
    expect(json.failed.map((c: { id: string }) => c.id)).toContain(
      "disclosure",
    );
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
