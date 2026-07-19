"use client";

import { useState } from "react";
import Link from "next/link";
import type { AuditConfig } from "@/lib/members/tools/audits/types";
import { defaultAnswers } from "@/lib/members/tools/audits/types";

/**
 * Generic engine for the config-driven business audits. All model logic
 * lives in the config's pure score() (lib/members/tools/audits); this
 * component only renders questions and the live result.
 */
export default function AuditTool({ config }: { config: AuditConfig }) {
  const [answers, setAnswers] = useState<Record<string, number>>(() =>
    defaultAnswers(config),
  );

  const set = (id: string, value: number) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const result = config.score(answers);

  const bandColor =
    result.band === "high"
      ? "#c0392b"
      : result.band === "medium"
        ? "var(--liquid-gold)"
        : "var(--forest-signal)";

  return (
    <div>
      <p style={{ color: "var(--slate-mid)", marginBottom: "2rem" }}>
        {config.intro}
      </p>

      {config.questions.map((q) => (
        <div key={q.id} style={{ marginBottom: "1.25rem" }}>
          <label htmlFor={`${config.slug}-${q.id}`} style={{ display: "block" }}>
            {q.label}
            {q.kind === "slider" && (
              <>
                {": "}
                <strong>
                  {q.prefix}
                  {answers[q.id].toLocaleString("en-AU")}
                </strong>
              </>
            )}
          </label>
          {q.kind === "slider" ? (
            <input
              id={`${config.slug}-${q.id}`}
              type="range"
              min={q.min}
              max={q.max}
              step={q.step}
              value={answers[q.id]}
              onChange={(e) => set(q.id, Number(e.target.value))}
              style={{ width: "100%", minHeight: 44 }}
            />
          ) : (
            <select
              id={`${config.slug}-${q.id}`}
              className="input-light"
              value={answers[q.id]}
              onChange={(e) => set(q.id, Number(e.target.value))}
              style={{ width: "100%", minHeight: 44, marginTop: "0.35rem" }}
            >
              {q.options?.map((option, index) => (
                <option key={option} value={index}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      <div
        role="status"
        aria-live="polite"
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          border: "1px solid var(--rule)",
          borderLeft: `3px solid ${bandColor}`,
          borderRadius: 12,
          background: "var(--milk-white)",
        }}
      >
        <p
          className="h-display"
          style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", margin: 0 }}
        >
          {result.headlineValue}
        </p>
        <p className="eyebrow no-rule" style={{ margin: "0.25rem 0 1rem" }}>
          {result.headlineLabel}
        </p>
        <p style={{ margin: "0 0 1rem" }}>{result.verdict}</p>
        <p style={{ margin: 0 }}>
          {config.remediation.copy}{" "}
          <Link href={`/members/${config.remediation.slug}`}>
            {config.remediation.isPro ? "See the Pro guide →" : "Open the free guide →"}
          </Link>
        </p>
        <p
          style={{
            margin: "1rem 0 0",
            fontSize: "0.8rem",
            color: "var(--slate-light)",
          }}
        >
          {result.assumptions}
        </p>
      </div>
    </div>
  );
}
