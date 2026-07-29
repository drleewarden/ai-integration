export const CHECKOUT_SESSION_ID_RE = /^cs_(?:test_|live_)?[A-Za-z0-9]{10,120}$/;

export type PaymentConfirmationState =
  | "pending"
  | "confirming"
  | "paid"
  | "void";

export function paymentConfirmationState({
  rowStatus,
  returnedFromCheckout,
  hasVerifiedCheckout,
}: {
  rowStatus: string;
  returnedFromCheckout: boolean;
  hasVerifiedCheckout: boolean;
}): PaymentConfirmationState {
  if (rowStatus === "void") return "void";
  if (rowStatus === "paid" || hasVerifiedCheckout) return "paid";
  if (returnedFromCheckout) return "confirming";
  return "pending";
}
