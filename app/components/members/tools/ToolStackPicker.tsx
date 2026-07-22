"use client";

import { useState } from "react";
import {
  INDUSTRIES,
  TEAM_SIZES,
  TIME_SINKS,
  recommendStack,
  type IndustryId,
  type TeamSizeId,
  type TimeSinkId,
} from "@/lib/members/tools/tool-stack-picker";

/**
 * Free members tool: answer three questions, get a starter stack of
 * 3–4 tool categories with reasons. Pure client-side — the engine
 * lives in lib/members/tools/tool-stack-picker.
 */
export default function ToolStackPicker() {
  const [industry, setIndustry] = useState<IndustryId | "">("");
  const [teamSize, setTeamSize] = useState<TeamSizeId | "">("");
  const [timeSink, setTimeSink] = useState<TimeSinkId | "">("");

  const ready = industry !== "" && teamSize !== "" && timeSink !== "";
  const picks = ready
    ? recommendStack(industry as IndustryId, teamSize as TeamSizeId, timeSink as TimeSinkId)
    : [];

  const selectStyle = {
    display: "block",
    width: "100%",
    minHeight: 44,
    marginTop: "0.25rem",
    padding: "0.5rem",
    fontSize: "1rem",
  } as const;

  return (
    <div>
      <p>
        Three questions, no email required — a starter stack of tools worth
        trialling, matched to your business.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="tsp-industry">What kind of business are you?</label>
        <select
          id="tsp-industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value as IndustryId)}
          style={selectStyle}
        >
          <option value="">Choose…</option>
          {INDUSTRIES.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="tsp-team">How big is the team?</label>
        <select
          id="tsp-team"
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value as TeamSizeId)}
          style={selectStyle}
        >
          <option value="">Choose…</option>
          {TEAM_SIZES.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label htmlFor="tsp-sink">Where does the most time disappear?</label>
        <select
          id="tsp-sink"
          value={timeSink}
          onChange={(e) => setTimeSink(e.target.value as TimeSinkId)}
          style={selectStyle}
        >
          <option value="">Choose…</option>
          {TIME_SINKS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div role="status" aria-live="polite">
        {!ready ? (
          <p>Answer all three questions to see your starter stack.</p>
        ) : (
          <>
            <h3>Your starter stack</h3>
            <ol>
              {picks.map((p) => (
                <li key={p.category} style={{ marginBottom: "1rem" }}>
                  <strong>{p.category}</strong> — e.g. {p.examples}
                  <br />
                  {p.why}
                </li>
              ))}
            </ol>
            <p>
              Trial one at a time, starting from the top — the Cost-Benefit
              Workbench (Pro) can tell you whether each one earns its keep.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
