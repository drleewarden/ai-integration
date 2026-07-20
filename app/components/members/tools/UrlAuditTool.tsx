"use client";

import { useId, useState, type ReactNode } from "react";
import ScoreDial from "@/app/components/members/ScoreDial";

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

interface UrlAuditToolProps {
  endpoint: string;
  inputLabel: string;
  buttonLabel: string;
  busyLabel: string;
  scoreLabel: (finalUrl: string) => ReactNode;
}

/**
 * Shared client shell for URL-audit tools (Website Health Check, Security
 * Headers Audit): URL form, busy state, error alert and the scored report.
 * All gating and validation happens server-side at `endpoint`.
 */
export default function UrlAuditTool({
  endpoint,
  inputLabel,
  buttonLabel,
  busyLabel,
  scoreLabel,
}: UrlAuditToolProps) {
  const inputId = useId();
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
      const res = await fetch(endpoint, {
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
        <label htmlFor={inputId} style={{ flexBasis: "100%" }}>
          {inputLabel}
        </label>
        <input
          id={inputId}
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
          {busy ? busyLabel : buttonLabel}
        </button>
      </form>

      {error && (
        <p role="alert" style={{ marginTop: "1rem" }}>
          {error}
        </p>
      )}

      {report && (
        <div role="status" aria-live="polite" style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <ScoreDial score={report.score} />
            <p style={{ margin: 0 }}>{scoreLabel(report.finalUrl)}</p>
          </div>
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
