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

function makeSession(
  paymentId: string | undefined,
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    payment_intent: "pi_test_456",
    payment_status: "paid",
    metadata: paymentId ? { workshop_payment_id: paymentId } : {},
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

/**
 * Minimal fake of the two supabase call chains fulfil uses:
 *   .from().select().eq().maybeSingle()                    -- the lookup
 *   .from().update({...}).eq().neq("status","paid").select() -- the paid UPDATE
 */
function makeSupabase(opts: {
  row?: typeof ROW | null;
  selectError?: unknown;
  updateError?: unknown;
  /** Rows returned by the conditional UPDATE's .select(); defaults to [row] when a row is given. */
  updatedRows?: Array<{ id: string }> | null;
} = {}) {
  const {
    row = null,
    selectError = null,
    updateError = null,
    updatedRows = row ? [{ id: row.id }] : [],
  } = opts;

  const maybeSingle = jest
    .fn()
    .mockResolvedValue({ data: selectError ? null : row, error: selectError });
  const select = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({ maybeSingle }),
  });

  const updateSelect = jest
    .fn()
    .mockResolvedValue({ data: updatedRows, error: updateError });
  const neq = jest.fn().mockReturnValue({ select: updateSelect });
  const eq = jest.fn().mockReturnValue({ neq });
  const update = jest.fn().mockReturnValue({ eq });

  const supabase = {
    from: jest.fn().mockReturnValue({ select, update }),
  };
  return {
    supabase: supabase as unknown as SupabaseClient,
    update,
    updateSelect,
  };
}

describe("fulfilWorkshopPayment", () => {
  const from = "Creative Milk <hello@creative-milk.com.au>";
  const internalTo = "contact@creative-milk.com.au";

  it("marks the row paid and sends confirmation + alert emails", async () => {
    const { supabase, update } = makeSupabase({ row: { ...ROW } });
    const sendEmail = jest.fn().mockResolvedValue({ error: null });
    const result = await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(result).toBe(true);
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
    const { supabase, update } = makeSupabase({
      row: { ...ROW, status: "paid" },
    });
    const sendEmail = jest.fn();
    const result = await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(result).toBe(true);
    expect(update).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does nothing when metadata has no workshop_payment_id", async () => {
    const { supabase } = makeSupabase({ row: { ...ROW } });
    const sendEmail = jest.fn();
    const result = await fulfilWorkshopPayment({
      session: makeSession(undefined),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(result).toBe(true);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns true (no emails, no retry) when the row is missing", async () => {
    const { supabase, update } = makeSupabase({ row: null });
    const sendEmail = jest.fn();
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const result = await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(result).toBe(true);
    expect(update).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("returns false (retryable) when the lookup select errors", async () => {
    const { supabase, update } = makeSupabase({
      row: { ...ROW },
      selectError: { message: "connection reset" },
    });
    const sendEmail = jest.fn();
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const result = await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(result).toBe(false);
    expect(update).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("returns true (no emails, no retry) when payment_status is not paid", async () => {
    const { supabase, update } = makeSupabase({ row: { ...ROW } });
    const sendEmail = jest.fn();
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const result = await fulfilWorkshopPayment({
      session: makeSession(ROW.id, { payment_status: "unpaid" }),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(result).toBe(true);
    expect(update).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("returns false (retryable) when the paid update errors", async () => {
    const { supabase, updateSelect } = makeSupabase({
      row: { ...ROW },
      updateError: { message: "db down" },
    });
    const sendEmail = jest.fn();
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const result = await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(result).toBe(false);
    expect(updateSelect).toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("returns true and skips emails when the conditional update matches zero rows (concurrent delivery already paid it)", async () => {
    const { supabase, update } = makeSupabase({
      row: { ...ROW },
      updatedRows: [],
    });
    const sendEmail = jest.fn();
    const result = await fulfilWorkshopPayment({
      session: makeSession(ROW.id),
      supabase,
      sendEmail,
      from,
      internalTo,
    });
    expect(result).toBe(true);
    expect(update).toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("still sends the alert when the confirmation email fails", async () => {
    const { supabase } = makeSupabase({ row: { ...ROW } });
    const sendEmail = jest
      .fn()
      .mockResolvedValueOnce({ error: { message: "bounce" } })
      .mockResolvedValueOnce({ error: null });
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    await expect(
      fulfilWorkshopPayment({
        session: makeSession(ROW.id),
        supabase,
        sendEmail,
        from,
        internalTo,
      }),
    ).resolves.toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenLastCalledWith(
      expect.objectContaining({ to: internalTo }),
    );
    consoleErrorSpy.mockRestore();
  });

  it("still sends the alert when the confirmation email THROWS", async () => {
    const { supabase } = makeSupabase({ row: { ...ROW } });
    const sendEmail = jest
      .fn()
      .mockRejectedValueOnce(new Error("socket hang up"))
      .mockResolvedValueOnce({ error: null });
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    await expect(
      fulfilWorkshopPayment({
        session: makeSession(ROW.id),
        supabase,
        sendEmail,
        from,
        internalTo,
      }),
    ).resolves.toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenLastCalledWith(
      expect.objectContaining({ to: internalTo }),
    );
    consoleErrorSpy.mockRestore();
  });

  it("returns true (no webhook retry) when both email sends throw", async () => {
    const { supabase } = makeSupabase({ row: { ...ROW } });
    const sendEmail = jest.fn().mockRejectedValue(new Error("network down"));
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    // The row is already paid at this point -- a retry would be an
    // idempotent no-op that can't resend, so this must stay terminal.
    await expect(
      fulfilWorkshopPayment({
        session: makeSession(ROW.id),
        supabase,
        sendEmail,
        from,
        internalTo,
      }),
    ).resolves.toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(2);
    consoleErrorSpy.mockRestore();
  });
});
