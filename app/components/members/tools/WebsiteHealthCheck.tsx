"use client";

import { useState } from "react";

interface Check {
  id: string;
  label: string;
  pass: boolean;
  advice: string;
}

interface Report {
  finalUrl: string;
  score: number;
  checks: Check[];
  failed: Check[];
}

/**
 * Free members tool: single-page website audit. The heavy lifting (and all
 * gating/validation) happens in /api/members/tools/health-check.
 */
export default function WebsiteHealthCheck() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/members/tools/health-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
      } else {
        setReport(json);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={run}
        style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
      >
        <label htmlFor="hc-url" style={{ flexBasis: "100%" }}>
          Your website address
        </label>
        <input
          id="hc-url"
          type="text"
          inputMode="url"
          placeholder="yourbusiness.com.au"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{ flex: "1 1 16rem", minHeight: 44, padding: "0 0.75rem" }}
        />
        <button
          type="submit"
          className="cta"
          disabled={busy}
          style={{ minHeight: 44 }}
        >
          {busy ? "Checking…" : "Check my site"}
        </button>
      </form>

      {error && (
        <p role="alert" style={{ marginTop: "1rem" }}>
          {error}
        </p>
      )}

      {report && (
        <div role="status" aria-live="polite" style={{ marginTop: "1.5rem" }}>
          <p>
            Health score for <strong>{report.finalUrl}</strong>:{" "}
            <strong style={{ fontSize: "1.5rem" }}>{report.score}/100</strong>
          </p>
          {report.failed.length > 0 ? (
            <>
              <h3>Fix these first</h3>
              <ul>
                {report.failed.slice(0, 3).map((c) => (
                  <li key={c.id} style={{ marginBottom: "0.75rem" }}>
                    <strong>{c.label}:</strong> {c.advice}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>No issues found on this page — nicely done.</p>
          )}
          <h3>All checks</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {report.checks.map((c) => (
              <li key={c.id}>
                <span aria-hidden="true">{c.pass ? "✓" : "✗"}</span>{" "}
                <span className="sr-only">
                  {c.pass ? "Passed:" : "Failed:"}
                </span>
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
