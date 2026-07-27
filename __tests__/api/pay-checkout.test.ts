import { NextRequest } from "next/server";

const mockCreateSession = jest.fn();
jest.mock("../../lib/stripe", () => ({
  getStripe: () => ({
    checkout: { sessions: { create: mockCreateSession } },
  }),
}));

const mockMaybeSingle = jest.fn();
const mockUpdateEq = jest.fn().mockResolvedValue({ error: null });
const mockFrom = jest.fn().mockImplementation(() => ({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }),
  }),
  update: jest.fn().mockReturnValue({ eq: mockUpdateEq }),
}));
jest.mock("../../lib/supabase/server", () => ({
  getServiceSupabase: () => ({ from: mockFrom }),
}));

import { POST } from "../../app/api/pay/checkout/route";
import { resetRateLimits } from "../../lib/rate-limit";

const VALID_UUID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const ROW = {
  id: VALID_UUID,
  status: "pending",
  amount_cents: 45000,
  currency: "aud",
  description: "AI Workshop — Fri 7 Aug",
  email: "jane@example.com",
};

function makeRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    nextUrl: { origin: "http://localhost:3000" },
  } as unknown as NextRequest;
}

describe("POST /api/pay/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimits();
    mockMaybeSingle.mockResolvedValue({ data: ROW, error: null });
    mockCreateSession.mockResolvedValue({
      id: "cs_test_1",
      url: "https://checkout.stripe.com/pay/cs_test_1",
    });
  });

  it("rejects a malformed id with 400", async () => {
    const res = await POST(makeRequest({ id: "nope" }));
    expect(res.status).toBe(400);
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown id", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const res = await POST(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(404);
  });

  it("returns 409 when the link is not pending", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { ...ROW, status: "paid" },
      error: null,
    });
    const res = await POST(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(409);
  });

  it("creates a payment-mode checkout session from DB values only", async () => {
    const res = await POST(makeRequest({ id: VALID_UUID }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe("https://checkout.stripe.com/pay/cs_test_1");
    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        customer_email: "jane@example.com",
        metadata: { workshop_payment_id: VALID_UUID },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "aud",
              unit_amount: 45000,
              product_data: { name: "AI Workshop — Fri 7 Aug" },
            },
          },
        ],
      }),
    );
  });
});
