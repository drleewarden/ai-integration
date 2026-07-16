const mockConstructEvent = jest.fn();
const mockRetrieve = jest.fn().mockResolvedValue({
  id: "sub_1",
  status: "active",
  customer: "cus_1",
});

jest.mock("../../lib/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: (...a: unknown[]) => mockConstructEvent(...a) },
    subscriptions: {
      retrieve: mockRetrieve,
    },
  }),
}));

const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest
  .fn()
  .mockResolvedValue({ data: [{ id: "u1" }], error: null });
jest.mock("../../lib/supabase/server", () => ({
  getServiceSupabase: () => ({
    from: () => ({
      update: (...a: unknown[]) => {
        mockUpdate(...a);
        return {
          eq: (...e: unknown[]) => {
            mockEq(...e);
            return { select: (...s: unknown[]) => mockSelect(...s) };
          },
        };
      },
    }),
  }),
}));

process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

import { POST } from "../../app/api/stripe/webhook/route";

const makeReq = (body: string, sig: string | null = "sig") => {
  const headers = new Map();
  if (sig) {
    headers.set("stripe-signature", sig);
  }
  return {
    method: "POST",
    headers,
    text: async () => body,
  } as unknown as import("next/server").NextRequest;
};

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockResolvedValue({ data: [{ id: "u1" }], error: null });
  });

  it("400 when signature header missing", async () => {
    const res = await POST(makeReq("{}", null));
    expect(res.status).toBe(400);
    expect(mockConstructEvent).not.toHaveBeenCalled();
  });

  it("400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("bad sig");
    });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("checkout.session.completed sets pro via subscription lookup", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer: "cus_1",
          subscription: "sub_1",
          metadata: { supabase_user_id: "u1" },
        },
      },
    });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        tier: "pro",
        subscription_status: "active",
        stripe_subscription_id: "sub_1",
        stripe_customer_id: "cus_1",
      }),
    );
    expect(mockEq).toHaveBeenCalledWith("id", "u1");
  });

  it("subscription.updated with past_due downgrades to free", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: { object: { id: "sub_1", status: "past_due", customer: "cus_1" } },
    });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ tier: "free", subscription_status: "past_due" }),
    );
    expect(mockEq).toHaveBeenCalledWith("stripe_customer_id", "cus_1");
  });

  it("subscription.deleted downgrades to free", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_1", status: "canceled", customer: "cus_1" } },
    });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ tier: "free", subscription_status: "canceled" }),
    );
  });

  it("ignores unhandled event types", async () => {
    mockConstructEvent.mockReturnValue({ type: "invoice.paid", data: { object: {} } });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("subscription.updated with zero matching rows still 200s and logs a warning", async () => {
    mockSelect.mockResolvedValue({ data: [], error: null });
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: { object: { id: "sub_1", status: "active", customer: "cus_missing" } },
    });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "no member_profiles row matched stripe_customer_id=cus_missing",
      ),
    );
    consoleErrorSpy.mockRestore();
  });
});
