"use client";

import { useState } from "react";

/**
 * Seed interactive tool: back-of-envelope automation ROI.
 * hoursPerWeek * hourlyValue * 46 working weeks, vs a rough setup cost band.
 */
export default function RoiQuickCheck() {
  const [hoursPerWeek, setHoursPerWeek] = useState(3);
  const [hourlyValue, setHourlyValue] = useState(85);
  const [people, setPeople] = useState(1);

  const annualCost = Math.round(hoursPerWeek * hourlyValue * people * 46);
  const verdict =
    annualCost >= 15000
      ? "Strong case — this is exactly the kind of task worth automating first."
      : annualCost >= 5000
        ? "Worth a look — a light automation could pay for itself inside a year."
        : "Marginal — batch it or template it before reaching for automation.";

  const field = (
    label: string,
    id: string,
    value: number,
    set: (n: number) => void,
    max: number,
  ) => (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={id}>
        {label}: <strong>{value}</strong>
      </label>
      <input
        id={id}
        type="range"
        min={1}
        max={max}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        style={{ width: "100%", minHeight: 44 }}
      />
    </div>
  );

  return (
    <div>
      {field("Hours spent per week", "roi-hours", hoursPerWeek, setHoursPerWeek, 40)}
      {field("Hourly value of that time ($)", "roi-value", hourlyValue, setHourlyValue, 300)}
      {field("People doing this task", "roi-people", people, setPeople, 20)}
      <p role="status" aria-live="polite">
        Rough annual cost of this task:{" "}
        <strong>${annualCost.toLocaleString("en-AU")}</strong>
        <br />
        {verdict}
      </p>
    </div>
  );
}
