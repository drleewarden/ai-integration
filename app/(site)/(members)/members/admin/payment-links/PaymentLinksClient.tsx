"use client";

import { useState } from "react";
import { formatAmount } from "@/lib/payments/emails";
import { parseDollarsToCents } from "@/lib/payments/validate";

export interface PaymentRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  amount_cents: number;
  currency: string;
  description: string;
  status: "pending" | "paid" | "void";
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: "rgba(245,240,232,0.05)",
  border: "1px solid var(--rule)",
  color: "inherit",
  fontSize: "1rem",
  minHeight: 44,
};

export default function PaymentLinksClient({
  initialRows,
}: {
  initialRows: PaymentRow[];
}) {
  const [rows, setRows] = useState<PaymentRow[]>(initialRows);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("AI Workshop");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState<string | null>(null);

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    setManualUrl(null);
    try {
      const res = await fetch("/api/admin/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, amount, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Something went wrong.",
        );
        return;
      }
      if (data.emailSent) {
        setNotice(`Link created and emailed to ${email}.`);
        setManualUrl(null);
      } else {
        setNotice(
          "Link created, but the email FAILED to send — copy the link below and send it manually.",
        );
        setManualUrl(data.url);
      }
      // Optimistic prepend; amount here mirrors what the server stored.
      // The server already accepted this same string, so parsing can't
      // realistically fail here — `?? 0` only satisfies the type checker.
      const cents = parseDollarsToCents(amount) ?? 0;
      setRows([
        {
          id: data.id,
          created_at: new Date().toISOString(),
          name,
          email,
          amount_cents: cents,
          currency: "aud",
          description,
          status: "pending",
        },
        ...rows,
      ]);
      setName("");
      setEmail("");
      setAmount("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function voidLink(id: string) {
    setError(null);
    setNotice(null);
    const res = await fetch("/api/admin/payment-links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setRows(rows.map((r) => (r.id === id ? { ...r, status: "void" } : r)));
    } else {
      const data = await res.json();
      setError(
        typeof data.error === "string" ? data.error : "Couldn't void the link.",
      );
    }
  }

  async function copyLink(id: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/pay/${id}`);
    setNotice("Link copied to clipboard.");
  }

  return (
    <>
      <form onSubmit={createLink} style={{ marginBottom: "3rem" }}>
        <div style={{ display: "grid", gap: "1rem" }}>
          <label>
            <span className="eyebrow no-rule">Name</span>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              autoComplete="off"
            />
          </label>
          <label>
            <span className="eyebrow no-rule">Email</span>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={320}
              autoComplete="off"
            />
          </label>
          <label>
            <span className="eyebrow no-rule">Amount (AUD)</span>
            <input
              style={inputStyle}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              inputMode="decimal"
              placeholder="450.00"
            />
          </label>
          <label>
            <span className="eyebrow no-rule">Description</span>
            <input
              style={inputStyle}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={500}
            />
          </label>
        </div>
        <button
          type="submit"
          className="cta"
          disabled={busy}
          style={{ marginTop: "1.5rem", minHeight: 44 }}
        >
          {busy ? "Creating…" : "Create & email link"}
        </button>
        {notice && (
          <p role="status" style={{ color: "var(--liquid-gold)", marginTop: "1rem" }}>
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" style={{ color: "var(--liquid-gold)", marginTop: "1rem" }}>
            {error}
          </p>
        )}
        {manualUrl && (
          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              flexWrap: "wrap",
              padding: "0.75rem 1rem",
              background: "rgba(245,240,232,0.05)",
              border: "1px solid var(--rule)",
            }}
          >
            <code style={{ fontSize: "0.875rem", wordBreak: "break-all" }}>
              {manualUrl}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(manualUrl)}
              style={{
                minHeight: 44,
                background: "none",
                border: "1px solid var(--rule)",
                color: "inherit",
                padding: "0 1rem",
                cursor: "pointer",
              }}
            >
              Copy link
            </button>
          </div>
        )}
      </form>

      <h2 className="eyebrow" style={{ marginBottom: "1rem" }}>
        Recent links
      </h2>
      {rows.length === 0 && <p>No payment links yet.</p>}
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map((r) => (
          <li
            key={r.id}
            style={{
              padding: "1rem 0",
              borderBottom: "1px solid var(--rule)",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>{r.name}</strong>{" "}
              <span style={{ opacity: 0.7 }}>({r.email})</span>
              <br />
              {formatAmount(r.amount_cents, r.currency)} ·{" "}
              <span
                style={{
                  color:
                    r.status === "paid"
                      ? "var(--liquid-gold)"
                      : r.status === "void"
                        ? "rgba(245,240,232,0.4)"
                        : "inherit",
                }}
              >
                {r.status}
              </span>{" "}
              · {new Date(r.created_at).toLocaleDateString("en-AU")}
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => copyLink(r.id)}
                style={{ minHeight: 44, background: "none", border: "1px solid var(--rule)", color: "inherit", padding: "0 1rem", cursor: "pointer" }}
              >
                Copy link
              </button>
              {r.status === "pending" && (
                <button
                  type="button"
                  onClick={() => voidLink(r.id)}
                  style={{ minHeight: 44, background: "none", border: "1px solid var(--rule)", color: "inherit", padding: "0 1rem", cursor: "pointer" }}
                >
                  Void
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
