// Page copy/data for process -- extracted from page.tsx to keep the
// component readable. Edit copy here; edit layout in page.tsx.

export const failureModes = [
  {
    label: "No success metric defined upfront",
    body: '"We want to use AI" is not a brief. Projects without a measurable target can\'t be declared done -- and can\'t be called successful.',
  },
  {
    label: "Strategy without implementation",
    body: "Consultants produce roadmaps. Nobody builds the system. Businesses pay for a document and get nothing running.",
  },
  {
    label: "Technology without people",
    body: "A system can be technically perfect and still fail if the team doesn't adopt it. Most agencies deliver software. Nobody trains the humans.",
  },
  {
    label: "Vendor dependency",
    body: "Agencies that build on proprietary platforms leave clients locked in. When the agency relationship ends, the system stops.",
  },
];

export const stats = [
  { value: "50+", label: "Engagements delivered" },
  { value: "95%", label: "Outcome rate" },
  { value: "$2M+", label: "Revenue lifted" },
  { value: "6–8 wks", label: "Average delivery" },
];

export const timeline = [
  {
    period: "Week 0",
    label: "First call (30 mins)",
    body: "You describe the problem. We ask questions. We agree whether a Discovery Sprint makes sense. If it does, we send a proposal within 48 hours.",
  },
  {
    period: "Weeks 1–2",
    label: "Discovery Sprint",
    body: "Stakeholder interviews, process mapping, stack audit. We identify the system worth building. We agree the success metric. We deliver the go/no-go and Phase 2 proposal.",
  },
  {
    period: "Week 2–3",
    label: "Decision point",
    body: "You review the Phase 2 proposal. Fixed price, fixed scope, fixed timeline. You decide whether to proceed. There's no pressure -- the Discovery Sprint plan is yours regardless.",
  },
  {
    period: "Weeks 3–8",
    label: "Build & Integrate",
    body: "We build. Daily standups at the start. Weekly check-ins through the build. You see the system before it's live. We train the team in weeks 7–8.",
  },
  {
    period: "Week 8",
    label: "Launch",
    body: "System goes live in your stack. Outcome measurement begins from day one.",
  },
  {
    period: "Weeks 8–12",
    label: "30-day support window",
    body: "We stay close. Any issues, refinements, or adoption questions -- we're on it.",
  },
  {
    period: "Month 3+",
    label: "Managed Partnership (optional)",
    body: "If you want ongoing optimisation and a strategic AI partner, Phase 3 begins. If not, you run the system and we're available if you need us.",
  },
];

export const phase2Deliverables = [
  ["Live system", "Running in your stack, connected to your data"],
  ["IP transfer", "You own the code, the model, the documentation"],
  ["Team training", "Your team can use and manage the system independently"],
  ["Documentation", "Plain-English guide for users and your IT team"],
  ["30-day support", "We stay close for the first month after launch"],
  ["Outcome measurement", "Dashboard or report showing the metrics we agreed in Phase 1"],
];

export const phase1Deliverables = [
  ["Stakeholder interviews", "Understand the real problem, not just the stated one"],
  ["Process mapping", "Document current workflows and identify AI leverage points"],
  ["Stack audit", "Assess integration feasibility and surface any blockers"],
  ["Success metric definition", "Agree the measurable outcome we'll target"],
  ["Go/no-go recommendation", "Honest advice -- including if we think AI isn't the right answer"],
  ["Phase 2 proposal", "Fixed-price, scoped proposal ready to proceed if you choose"],
];
