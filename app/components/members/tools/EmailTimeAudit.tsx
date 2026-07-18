"use client";

import { useState } from "react";

/**
 * Free members tool: the annual cost of manual email handling and how
 * much of it is automatable. Same back-of-envelope conventions as the
 * ROI Quick Check: 46 working weeks, 5 email days a week.
 */
const WORKING_WEEKS = 46;
const DAYS_PER_WEEK = 5;

export default function EmailTimeAudit() {
  const [emailsPerDay, setEmailsPerDay] = useState(30);
  const [minutesPerEmail, setMinutesPerEmail] = useState(4);
  const [routineShare, setRoutineShare] = useState(50);
  const [hourlyValue, setHourlyValue] = useState(85);

  const annualHours = Math.round(
    (emailsPerDay * minutesPerEmail * DAYS_PER_WEEK * WORKING_WEEKS) / 60,
  );
  const annualCost = Math.round(annualHours * hourlyValue);
  const routineCost = Math.round((annualCost * routineShare) / 100);
  const weeksOfWork = Math.round(annualHours / 38);

  const verdict =
    routineCost >= 15000
      ? "That routine slice is a part-time salary. Templates, auto-replies and AI drafting should be this month's project."
      : routineCost >= 5000
        ? "Enough to matter — an afternoon spent on templates and AI-drafted replies pays for itself many times over."
        : "Your inbox is fairly lean. Bank the win and point automation at a bigger time sink.";

  const field = (
    label: string,
    id: string,
    value: number,
    set: (n: number) => void,
    min: number,
    max: number,
    suffix = "",
  ) => (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={id}>
        {label}: <strong>{value}{suffix}</strong>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        style={{ width: "100%", minHeight: 44 }}
      />
    </div>
  );

  return (
    <div>
      {field("Emails handled per day", "eta-count", emailsPerDay, setEmailsPerDay, 5, 200)}
      {field("Average minutes per email", "eta-minutes", minutesPerEmail, setMinutesPerEmail, 1, 15)}
      {field(
        "Roughly how much is routine (confirmations, FAQs, chasing)",
        "eta-routine",
        routineShare,
        setRoutineShare,
        0,
        100,
        "%",
      )}
      {field("Hourly value of that time ($)", "eta-value", hourlyValue, setHourlyValue, 30, 300)}

      <div role="status" aria-live="polite">
        <p>
          Email is costing you roughly{" "}
          <strong>{annualHours.toLocaleString("en-AU")} hours</strong> a year —
          about <strong>{weeksOfWork} full working weeks</strong> — worth{" "}
          <strong>${annualCost.toLocaleString("en-AU")}</strong>.
        </p>
        <p>
          The routine slice alone is{" "}
          <strong>${routineCost.toLocaleString("en-AU")}</strong> a year, and
          that&apos;s the part templates and AI drafting can take off your
          plate.
          <br />
          {verdict}
        </p>
      </div>
    </div>
  );
}
