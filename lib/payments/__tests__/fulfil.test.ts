import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fulfilWorkshopPayment } from "../fulfil";

const ROW = {
  id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  name: "Jane Doe",
  email: "jane@example.com",
  amount_cents: 45000,
  currency: "aud",
  description: "AI Workshop — Fri 7 Aug",
  status: "pending",
};

function makeSession(paymentId: string | undefined): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    payment_intent: "pi_test_456",
    metadata: paymentId ? { workshop_payment_id: paymentId } : {},
  } as unknown as Stripe.Checkout.Session;
}

/** Minimal fake of the two supabase call chains fulfil uses. */
function makeSupabase(row: typeof ROW | null) {
  const update = jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ error: null }),
  });
  const supabase = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: row, error: null }),
        }),
      }),
      update,
    }),
  };
  return { supabase: supabase as unknown as SupabaseClient, update };
}

describe("fulfilWorkshopPayment", () => {
  const from = "Creative Milk <hello@creative-milk.com.au>";
  const internalTo = "contact@creative-milk.com.au";

  it("marks the row paid and sends confirmation + alert emails", async () => {
    const { supabase, update } = makeSupabase({ ...ROW });
    const sendEmail = jest.fn().mockResolvedValue({ error: null });
    await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "paid",
        stripe_payment_intent_id: "pi_test_456",
        stripe_checkout_session_id: "cs_test_123",
      }),
    );
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "jane@example.com" }),
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: internalTo }),
    );
  });

  it("is idempotent: an already-paid row sends nothing", async () => {
    const { supabase, update } = makeSupabase({ ...ROW, status: "paid" });
    const sendEmail = jest.fn();
    await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(update).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does nothing when metadata has no workshop_payment_id", async () => {
    const { supabase } = makeSupabase({ ...ROW });
    const sendEmail = jest.fn();
    await fulfilWorkshopPayment({
      session: makeSession(undefined),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does nothing when the row is missing", async () => {
    const { supabase, update } = makeSupabase(null);
    const sendEmail = jest.fn();
    await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(update).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
