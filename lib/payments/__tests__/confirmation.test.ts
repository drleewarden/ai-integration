import {
  CHECKOUT_SESSION_ID_RE,
  paymentConfirmationState,
} from "../confirmation";

describe("payment confirmation", () => {
  it.each([
    "cs_test_1234567890",
    "cs_live_1234567890",
    "cs_1234567890",
  ])("accepts a bounded Checkout Session id: %s", (id) => {
    expect(CHECKOUT_SESSION_ID_RE.test(id)).toBe(true);
  });

  it.each(["cs_", "cs_bad-value", `cs_${"a".repeat(121)}`, "pi_1234567890"])(
    "rejects an invalid Checkout Session id: %s",
    (id) => {
      expect(CHECKOUT_SESSION_ID_RE.test(id)).toBe(false);
    },
  );

  it("does not show a payment action while a checkout return is unverified", () => {
    expect(
      paymentConfirmationState({
        rowStatus: "pending",
        returnedFromCheckout: true,
        hasVerifiedCheckout: false,
      }),
    ).toBe("confirming");
  });

  it("keeps an ordinary pending visit payable", () => {
    expect(
      paymentConfirmationState({
        rowStatus: "pending",
        returnedFromCheckout: false,
        hasVerifiedCheckout: false,
      }),
    ).toBe("pending");
  });

  it("shows paid after either database or Stripe verification", () => {
    expect(
      paymentConfirmationState({
        rowStatus: "paid",
        returnedFromCheckout: false,
        hasVerifiedCheckout: false,
      }),
    ).toBe("paid");
    expect(
      paymentConfirmationState({
        rowStatus: "pending",
        returnedFromCheckout: true,
        hasVerifiedCheckout: true,
      }),
    ).toBe("paid");
  });

  it("never lets a checkout return mask a void payment", () => {
    expect(
      paymentConfirmationState({
        rowStatus: "void",
        returnedFromCheckout: true,
        hasVerifiedCheckout: true,
      }),
    ).toBe("void");
  });
});
