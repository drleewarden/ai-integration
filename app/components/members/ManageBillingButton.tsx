"use client";

import { useState } from "react";

export default function ManageBillingButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/members/portal", { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.url) {
        setError("Could not open billing. Please try again.");
        setBusy(false);
        return;
      }
      window.location.assign(body.url);
    } catch {
      setError("Could not open billing. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={open} disabled={busy} className="cta" style={{ minHeight: 44 }}>
        {busy ? "One moment…" : "Manage billing"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
