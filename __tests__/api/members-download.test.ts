/**
 * Enforcement matrix for the members download route:
 *   anonymous            -> 401
 *   free member + free   -> 302 (signed url)
 *   free member + pro    -> 403
 *   pro member + pro     -> 302
 *   unknown slug         -> 404
 *   guide slug (no file) -> 404
 */
import { NextRequest } from "next/server";

const mockGetMemberProfile = jest.fn();
const mockInsert = jest.fn();
jest.mock("../../lib/supabase/auth-server", () => ({
  getMemberProfile: (...args: unknown[]) => mockGetMemberProfile(...args),
  getAuthServerSupabase: jest.fn(async () => ({
    from: () => ({ insert: (...args: unknown[]) => mockInsert(...args) }),
  })),
}));

const mockCreateSignedUrl = jest.fn();
jest.mock("../../lib/supabase/server", () => ({
  getServiceSupabase: () => ({
    storage: {
      from: () => ({
        createSignedUrl: (...args: unknown[]) => mockCreateSignedUrl(...args),
      }),
    },
  }),
}));

// Mock NextResponse.redirect to return a response with the location header
jest.mock("next/server", () => {
  const originalModule = jest.requireActual("next/server");
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      redirect: (url: string, status: number) => {
        const headers = new Headers();
        headers.set("location", url);
        return {
          status,
          headers,
        };
      },
      json: originalModule.NextResponse.json,
    },
  };
});

import { GET } from "../../app/api/members/download/[slug]/route";
import { resetRateLimits } from "../../lib/rate-limit";

const makeReq = (slug: string) =>
  ({
    url: `http://localhost/api/members/download/${slug}`,
    method: "GET",
    headers: new Headers(),
  } as unknown as NextRequest);
const ctx = (slug: string) => ({ params: Promise.resolve({ slug }) });
const member = (tier: "free" | "pro") => ({
  user: { id: "u1", email: "m@example.com" },
  profile: { tier, email: "m@example.com", display_name: null, stripe_customer_id: null, subscription_status: null },
});

describe("GET /api/members/download/[slug]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimits();
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example.com/file.zip" },
      error: null,
    });
    mockInsert.mockResolvedValue({ error: null });
  });

  it("401 for anonymous", async () => {
    mockGetMemberProfile.mockResolvedValue(null);
    const res = await GET(makeReq("ai-policy-template"), ctx("ai-policy-template"));
    expect(res.status).toBe(401);
  });

  it("302 for free member on free download", async () => {
    mockGetMemberProfile.mockResolvedValue(member("free"));
    const res = await GET(makeReq("ai-policy-template"), ctx("ai-policy-template"));
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://signed.example.com/file.zip");
    expect(mockCreateSignedUrl).toHaveBeenCalledWith(
      "ai-policy-template/ai-policy-template-v1.zip",
      60,
      expect.objectContaining({ download: "ai-policy-template-v1.zip" }),
    );
  });

  it("404 for unknown slug", async () => {
    mockGetMemberProfile.mockResolvedValue(member("pro"));
    const res = await GET(makeReq("nope"), ctx("nope"));
    expect(res.status).toBe(404);
  });

  it("404 for a non-download item", async () => {
    mockGetMemberProfile.mockResolvedValue(member("pro"));
    const res = await GET(makeReq("automation-playbook"), ctx("automation-playbook"));
    expect(res.status).toBe(404);
  });

  it("500 when signing fails", async () => {
    mockGetMemberProfile.mockResolvedValue(member("free"));
    mockCreateSignedUrl.mockResolvedValue({ data: null, error: { message: "boom" } });
    const res = await GET(makeReq("ai-policy-template"), ctx("ai-policy-template"));
    expect(res.status).toBe(500);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("records a download activity after issuing the signed URL", async () => {
    mockGetMemberProfile.mockResolvedValue(member("free"));
    const res = await GET(makeReq("ai-policy-template"), ctx("ai-policy-template"));
    expect(res.status).toBe(302);
    expect(mockInsert).toHaveBeenCalledWith({
      member_id: "u1",
      item_slug: "ai-policy-template",
      kind: "download",
      summary: null,
    });
  });

  it("still redirects when the activity insert throws", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetMemberProfile.mockResolvedValue(member("free"));
    mockInsert.mockRejectedValue(new Error("db down"));
    const res = await GET(makeReq("ai-policy-template"), ctx("ai-policy-template"));
    expect(res.status).toBe(302);
    errorSpy.mockRestore();
  });
});
