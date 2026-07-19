"use client";

import { useState } from "react";
import {
  PROCESSES,
  rankOpportunities,
} from "@/lib/members/tools/opportunity-finder";

/**
 * Free members tool: rank the user's best automation candidates by payoff
 * versus effort. Pure client-side maths — the engine lives in
 * lib/members/tools/opportunity-finder.
 */
export default function OpportunityFinder() {
  const [hours, setHours] = useState<Record<string, number>>({});
  const [hourlyValue, setHourlyValue] = useState(85);

  const results = rankOpportunities(hours, hourlyValue);

  return (
    <div>
      <p>
        Roughly how many hours a week does your business spend on each of
        these? Skip anything that doesn&apos;t apply.
      </p>
      {PROCESSES.map((p) => (
        <div key={p.id} style={{ marginBottom: "1rem" }}>
          <label htmlFor={`of-${p.id}`}>
            {p.label}: <strong>{hours[p.id] ?? 0} hrs/week</strong>
          </label>
          <input
            id={`of-${p.id}`}
            type="range"
            min={0}
            max={20}
            value={hours[p.id] ?? 0}
            onChange={(e) =>
              setHours((h) => ({ ...h, [p.id]: Number(e.target.value) }))
            }
            style={{ width: "100%", minHeight: 44 }}
          />
        </div>
      ))}
      <div style={{ marginBottom: "1.5rem" }}>
        <label htmlFor="of-value">
          Hourly value of that time ($): <strong>{hourlyValue}</strong>
        </label>
        <input
          id="of-value"
          type="range"
          min={30}
          max={300}
          value={hourlyValue}
          onChange={(e) => setHourlyValue(Number(e.target.value))}
          style={{ width: "100%", minHeight: 44 }}
        />
      </div>

      <div role="status" aria-live="polite">
        {results.length === 0 ? (
          <p>
            Slide any task above zero to see your best automation candidates.
          </p>
        ) : (
          <>
            <h3>Your top automation candidates</h3>
            <ol>
              {results.map((r) => (
                <li key={r.id} style={{ marginBottom: "1rem" }}>
                  <strong>{r.label}</strong> — costing you roughly{" "}
                  <strong>${r.annualCost.toLocaleString("en-AU")}</strong> a
                  year ({r.effort} effort to automate)
                  <br />
                  {r.blueprint}
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
