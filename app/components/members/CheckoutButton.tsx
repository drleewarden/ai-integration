"use client";

import { useState } from "react";

export default function CheckoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/members/checkout", { method: "POST" });
      if (res.status === 401) {
        window.location.assign("/login?next=%2Fmembers%2Fupgrade");
        return;
      }
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.url) {
        setError("Could not start checkout. Please try again.");
        setBusy(false);
        return;
      }
      window.location.assign(body.url);
    } catch {
      setError("Could not start checkout. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={checkout} disabled={busy} className="cta" style={{ minHeight: 44 }}>
        {busy ? "One moment…" : "Upgrade to Pro — $29/month"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
