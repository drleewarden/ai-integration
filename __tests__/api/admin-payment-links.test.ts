import { NextRequest } from "next/server";

let mockSend: jest.Mock;
jest.mock("resend", () => {
  const sendMock = jest.fn();
  const MockResend = jest.fn().mockImplementation(function (this: any) {
    this.emails = { send: sendMock };
    return this;
  });
  (MockResend as any)._mockSend = sendMock;
  return { Resend: MockResend };
});

const mockGetSessionUser = jest.fn();
jest.mock("../../lib/supabase/auth-server", () => ({
  getSessionUser: () => mockGetSessionUser(),
}));

// Chainable service-client fake. Tests set the resolved values.
const mockSingle = jest.fn();
const mockUpdateResult = jest.fn();
const mockFrom = jest.fn().mockImplementation(() => ({
  insert: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({ single: mockSingle }),
  }),
  update: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({ select: mockUpdateResult }),
    }),
  }),
}));
jest.mock("../../lib/supabase/server", () => ({
  getServiceSupabase: () => ({ from: mockFrom }),
}));

process.env.RESEND_API_KEY = "test-api-key";
process.env.ADMIN_EMAILS = "admin@creative-milk.com.au";

import { POST, PATCH } from "../../app/api/admin/payment-links/route";
import { Resend } from "resend";
import { resetRateLimits } from "../../lib/rate-limit";

mockSend = (Resend as any)._mockSend;

const VALID_UUID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function makeRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    nextUrl: { origin: "http://localhost:3000" },
  } as unknown as NextRequest;
}

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  amount: "450",
  description: "AI Workshop — Fri 7 Aug",
};

describe("POST /api/admin/payment-links", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimits();
    mockGetSessionUser.mockResolvedValue({
      email: "admin@creative-milk.com.au",
    });
    mockSingle.mockResolvedValue({ data: { id: VALID_UUID }, error: null });
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  it("rejects a signed-out caller with 401", async () => {
    mockGetSessionUser.mockResolvedValue(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("rejects a non-admin member with 401", async () => {
    mockGetSessionUser.mockResolvedValue({ email: "member@example.com" });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("rejects an invalid amount with 400", async () => {
    const res = await POST(makeRequest({ ...validBody, amount: "0" }));
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email with 400", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "nope" }));
    expect(res.status).toBe(400);
  });

  it("creates the row and sends the payment-request email", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(VALID_UUID);
    expect(json.url).toContain(`/pay/${VALID_UUID}`);
    expect(json.emailSent).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "jane@example.com" }),
    );
  });

  it("still returns the link when the email send fails", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "nope" } });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.emailSent).toBe(false);
  });
});

describe("PATCH /api/admin/payment-links (void)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimits();
    mockGetSessionUser.mockResolvedValue({
      email: "admin@creative-milk.com.au",
    });
  });

  it("rejects non-admins with 401", async () => {
    mockGetSessionUser.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(401);
  });

  it("rejects a malformed id with 400", async () => {
    const res = await PATCH(makeRequest({ id: "not-a-uuid" }));
    expect(res.status).toBe(400);
  });

  it("voids a pending link", async () => {
    mockUpdateResult.mockResolvedValue({
      data: [{ id: VALID_UUID }],
      error: null,
    });
    const res = await PATCH(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(200);
  });

  it("returns 409 when the link is not pending", async () => {
    mockUpdateResult.mockResolvedValue({ data: [], error: null });
    const res = await PATCH(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(409);
  });
});
