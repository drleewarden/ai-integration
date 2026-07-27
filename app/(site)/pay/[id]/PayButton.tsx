"use client";

import { useState } from "react";

/**
 * Starts Stripe Checkout for this payment link. Sends ONLY the row id --
 * the server decides the amount. Redirects the whole page to Stripe.
 */
export default function PayButton({ paymentId }: { paymentId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/pay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paymentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again.",
        );
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="cta"
        onClick={startCheckout}
        disabled={busy}
        style={{ minHeight: 44, cursor: busy ? "wait" : "pointer" }}
      >
        {busy ? "Opening secure checkout…" : "Pay now"}
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--liquid-gold)", marginTop: "1rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
