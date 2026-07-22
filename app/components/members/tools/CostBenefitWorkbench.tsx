"use client";

import { useState } from "react";
import {
  evaluateScenarios,
  type Scenario,
} from "@/lib/members/tools/cost-benefit";

/**
 * Pro members tool: model up to five automations side by side — setup
 * cost, subscription, hours saved — ranked by first-year net with
 * payback period. Engine lives in lib/members/tools/cost-benefit;
 * printing the page gives a comparison to put in front of a partner
 * or accountant.
 */
const MAX_SCENARIOS = 5;

const blankScenario = (id: string): Scenario => ({
  id,
  name: "",
  setupCost: 500,
  monthlyCost: 30,
  hoursSavedPerWeek: 2,
  hourlyValue: 85,
});

export default function CostBenefitWorkbench() {
  const [nextId, setNextId] = useState(3);
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { ...blankScenario("s1"), name: "Automation A" },
    { ...blankScenario("s2"), name: "Automation B" },
  ]);

  const update = (id: string, patch: Partial<Scenario>) =>
    setScenarios((all) =>
      all.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );

  const remove = (id: string) =>
    setScenarios((all) => all.filter((s) => s.id !== id));

  const add = () => {
    setScenarios((all) => [
      ...all,
      {
        ...blankScenario(`s${nextId}`),
        name: `Automation ${String.fromCharCode(64 + nextId)}`,
      },
    ]);
    setNextId((n) => n + 1);
  };

  const results = evaluateScenarios(scenarios);

  const numberField = (
    s: Scenario,
    label: string,
    key: "setupCost" | "monthlyCost" | "hoursSavedPerWeek" | "hourlyValue",
    max: number,
  ) => (
    <div style={{ flex: "1 1 140px" }}>
      <label
        htmlFor={`cbw-${s.id}-${key}`}
        style={{ display: "block", fontSize: "0.875rem" }}
      >
        {label}
      </label>
      <input
        id={`cbw-${s.id}-${key}`}
        type="number"
        min={0}
        max={max}
        value={s[key]}
        onChange={(e) =>
          update(s.id, {
            [key]: Math.max(0, Math.min(max, Number(e.target.value) || 0)),
          })
        }
        style={{ width: "100%", minHeight: 44, padding: "0.5rem", fontSize: "1rem" }}
      />
    </div>
  );

  return (
    <div>
      <p>
        Put each automation you&apos;re weighing up on a row — rough numbers
        are fine, that&apos;s the point. The ranking updates as you type;
        print this page for a comparison you can hand to a partner or
        accountant.
      </p>

      {scenarios.map((s) => (
        <fieldset
          key={s.id}
          style={{
            border: "1px solid var(--slate-mid, #888)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor={`cbw-${s.id}-name`}
              style={{ display: "block", fontSize: "0.875rem" }}
            >
              What&apos;s the automation?
            </label>
            <input
              id={`cbw-${s.id}-name`}
              type="text"
              value={s.name}
              maxLength={60}
              placeholder="e.g. Invoice reminders"
              onChange={(e) => update(s.id, { name: e.target.value })}
              style={{ width: "100%", minHeight: 44, padding: "0.5rem", fontSize: "1rem" }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {numberField(s, "Setup cost ($)", "setupCost", 50000)}
            {numberField(s, "Subscription ($/month)", "monthlyCost", 5000)}
            {numberField(s, "Hours saved / week", "hoursSavedPerWeek", 60)}
            {numberField(s, "Hourly value ($)", "hourlyValue", 500)}
          </div>
          {scenarios.length > 1 && (
            <button
              type="button"
              onClick={() => remove(s.id)}
              style={{ marginTop: "0.75rem", minHeight: 44, padding: "0 1rem" }}
            >
              Remove
            </button>
          )}
        </fieldset>
      ))}

      {scenarios.length < MAX_SCENARIOS && (
        <button
          type="button"
          onClick={add}
          style={{ minHeight: 44, padding: "0 1rem", marginBottom: "2rem" }}
        >
          + Add another automation
        </button>
      )}

      <div role="status" aria-live="polite">
        <h3>Ranked by first-year value</h3>
        <ol>
          {results.map((r) => (
            <li key={r.id} style={{ marginBottom: "1.25rem" }}>
              <strong>{r.name || "Unnamed automation"}</strong>
              <br />
              First-year net:{" "}
              <strong>
                {r.firstYearNet < 0 ? "−" : ""}$
                {Math.abs(r.firstYearNet).toLocaleString("en-AU")}
              </strong>{" "}
              (saves ${r.annualSaving.toLocaleString("en-AU")}/yr, costs $
              {(r.annualRunningCost + r.setupCost).toLocaleString("en-AU")} in
              year one)
              <br />
              Payback:{" "}
              <strong>
                {r.paybackMonths === null
                  ? "never at these numbers"
                  : r.paybackMonths === 0
                    ? "immediate"
                    : `about ${r.paybackMonths} month${r.paybackMonths === 1 ? "" : "s"}`}
              </strong>
              {" — "}
              {r.verdict}
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => window.print()}
          className="cta"
          style={{ minHeight: 44 }}
        >
          Print this comparison
        </button>
      </div>
    </div>
  );
}
