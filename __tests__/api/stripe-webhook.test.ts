// route.ts imports the real `resend` package at module scope. Left unmocked,
// it pulls in postal-mime, which needs TextEncoder -- unavailable in this
// suite's jsdom environment. Mirrors the mock pattern in send-email.test.ts.
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(function (this: any) {
    this.emails = { send: jest.fn() };
    return this;
  }),
}));

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

// The workshop-payment branch delegates entirely to fulfilWorkshopPayment --
// mocked here so these route tests only pin the routing seam (which branch
// runs, and how its true/false return maps to the HTTP response) rather
// than re-testing fulfil's own logic (covered by lib/payments/__tests__/fulfil.test.ts).
const mockFulfilWorkshopPayment = jest.fn().mockResolvedValue(true);
jest.mock("../../lib/payments/fulfil", () => ({
  fulfilWorkshopPayment: (...args: unknown[]) =>
    mockFulfilWorkshopPayment(...args),
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
    mockFulfilWorkshopPayment.mockResolvedValue(true);
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
    // Metadata has no workshop_payment_id -- this is the subscription path,
    // not the workshop payment-link path.
    expect(mockFulfilWorkshopPayment).not.toHaveBeenCalled();
  });

  describe("checkout.session.completed workshop payment routing", () => {
    it("routes sessions carrying workshop_payment_id to fulfilWorkshopPayment only", async () => {
      const session = {
        id: "cs_test_workshop_1",
        payment_intent: "pi_test_1",
        payment_status: "paid",
        metadata: { workshop_payment_id: "wp_1" },
      };
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: { object: session },
      });
      const res = await POST(makeReq("{}"));
      expect(res.status).toBe(200);
      expect(mockFulfilWorkshopPayment).toHaveBeenCalledTimes(1);
      expect(mockFulfilWorkshopPayment).toHaveBeenCalledWith(
        expect.objectContaining({ session }),
      );
      // The member_profiles/subscription branch must never run for a
      // workshop payment-link event.
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns 500 so Stripe retries when fulfilWorkshopPayment reports a transient failure", async () => {
      mockFulfilWorkshopPayment.mockResolvedValue(false);
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_workshop_2",
            payment_intent: "pi_test_2",
            payment_status: "paid",
            metadata: { workshop_payment_id: "wp_2" },
          },
        },
      });
      const res = await POST(makeReq("{}"));
      expect(res.status).toBe(500);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  it("subscription.updated with past_due downgrades to free using a fresh retrieve", async () => {
    mockRetrieve.mockResolvedValueOnce({
      id: "sub_1",
      status: "past_due",
      customer: "cus_1",
    });
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      // Stale event payload still says "active" -- the handler must not
      // trust it and should re-fetch the subscription instead.
      data: { object: { id: "sub_1", status: "active", customer: "cus_1" } },
    });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mockRetrieve).toHaveBeenCalledWith("sub_1");
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
