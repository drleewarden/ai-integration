/**
 * Quote Turnaround Audit. Slow quotes lose winnable work: each turnaround
 * tier carries a relative win-rate decay, and the headline is the extra
 * revenue available by quoting same-day — current monthly won revenue
 * scaled by decay/(1 − decay).
 */

import { formatAud, type AuditConfig } from "./types";

/** Indexed by the turnaround option order below. */
const WIN_DECAY = [0, 0.15, 0.35];

export const quoteTurnaroundConfig: AuditConfig = {
  slug: "quote-turnaround-audit",
  intro:
    "Four questions about your quoting. The result is the revenue that slow turnaround is likely costing you each month.",
  questions: [
    {
      id: "quotesPerMonth",
      label: "Quotes you send in a typical month",
      kind: "slider",
      min: 1,
      max: 50,
      step: 1,
      defaultValue: 10,
    },
    {
      id: "quoteValue",
      label: "Average quote value",
      kind: "slider",
      min: 200,
      max: 50000,
      step: 100,
      prefix: "$",
      defaultValue: 3000,
    },
    {
      id: "turnaround",
      label: "How long does a quote usually take to go out?",
      kind: "select",
      options: ["Same day", "Two to three days", "A week or more"],
      defaultValue: 1,
    },
    {
      id: "winRate",
      label: "Share of quotes you currently win (%)",
      kind: "slider",
      min: 10,
      max: 90,
      step: 1,
      defaultValue: 40,
    },
  ],
  score(answers) {
    const decay = WIN_DECAY[answers.turnaround];
    const wonPerMonth =
      answers.quotesPerMonth * answers.quoteValue * (answers.winRate / 100);
    const lost = Math.round((wonPerMonth * decay) / (1 - decay));
    const band = lost < 2000 ? "low" : lost <= 8000 ? "medium" : "high";
    return {
      headlineValue: formatAud(lost),
      headlineLabel: "revenue slow quoting likely costs you each month",
      band,
      verdict:
        band === "low"
          ? "You quote fast — that speed is quietly winning you work. Protect it as you grow."
          : band === "medium"
            ? "Being first back with a number wins jobs. Templated, semi-automated quotes would claw most of this back."
            : "At this volume, quote speed is one of your biggest growth levers — the winnable work is going to whoever replies first.",
      assumptions:
        "Assumes win rates decay 15% relatively at 2–3 day turnaround and 35% at a week-plus, versus quoting same-day.",
    };
  },
  remediation: {
    copy: "The Small Business Automation Playbook covers quote automation end to end — picking the template, wiring it up, and shipping it inside a week.",
    slug: "automation-playbook",
    isPro: true,
  },
};
