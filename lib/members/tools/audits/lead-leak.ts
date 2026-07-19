/**
 * Lead Leak Audit. Models the enquiries a business loses to slow or absent
 * responses. Leak rate is driven by response speed, worsened by after-hours
 * gaps and reduced by follow-up habits; dollars assume a 25% win rate on
 * the enquiries that would otherwise have been answered.
 */

import { formatAud, type AuditConfig } from "./types";

const WEEKS_PER_MONTH = 4.3;
const ASSUMED_WIN_RATE = 0.25;
const MIN_LEAK_RATE = 0.02;

/** Indexed by the responseTime option order below. */
const RESPONSE_LEAK = [0.05, 0.15, 0.3, 0.45];
/** Indexed by the afterHours option order below. */
const AFTER_HOURS_PENALTY = [0, 0.05, 0.15];
/** Indexed by the followUps option order below. */
const FOLLOW_UP_CREDIT = [0, 0.1, 0.2];

export const leadLeakConfig: AuditConfig = {
  slug: "lead-leak-audit",
  intro:
    "Five questions about how enquiries reach you and how fast they hear back. The result is the revenue those unanswered enquiries are worth every month.",
  questions: [
    {
      id: "enquiriesPerWeek",
      label: "New enquiries in a typical week",
      kind: "slider",
      min: 1,
      max: 50,
      step: 1,
      defaultValue: 10,
    },
    {
      id: "responseTime",
      label: "How quickly does a new enquiry usually hear back?",
      kind: "select",
      options: ["Under an hour", "Same day", "Next day", "Two or more days"],
      defaultValue: 1,
    },
    {
      id: "afterHours",
      label: "What happens to enquiries that arrive after hours?",
      kind: "select",
      options: [
        "Answered live or called back the same day",
        "Handled next business day",
        "Honestly, some get missed",
      ],
      defaultValue: 1,
    },
    {
      id: "followUps",
      label: "If an enquiry goes quiet, how many times do you follow up?",
      kind: "select",
      options: ["We don't", "Once", "Twice or more"],
      defaultValue: 0,
    },
    {
      id: "jobValue",
      label: "Average value of a job",
      kind: "slider",
      min: 100,
      max: 10000,
      step: 50,
      prefix: "$",
      defaultValue: 500,
    },
  ],
  score(answers) {
    const rate = Math.max(
      MIN_LEAK_RATE,
      RESPONSE_LEAK[answers.responseTime] +
        AFTER_HOURS_PENALTY[answers.afterHours] -
        FOLLOW_UP_CREDIT[answers.followUps],
    );
    const leakedPerMonth = answers.enquiriesPerWeek * WEEKS_PER_MONTH * rate;
    const dollars = Math.round(
      leakedPerMonth * answers.jobValue * ASSUMED_WIN_RATE,
    );
    const band = dollars < 1000 ? "low" : dollars <= 5000 ? "medium" : "high";
    return {
      headlineValue: formatAud(dollars),
      headlineLabel: "potential revenue leaking every month",
      band,
      verdict:
        band === "low"
          ? "You're holding onto most of your enquiries — keep the response habits that got you here."
          : band === "medium"
            ? "There's a real leak here. Faster first replies and one automated follow-up would recover most of it."
            : "This leak is costing you a hire's worth of revenue. Fixing response speed should jump the queue.",
      assumptions: `Assumes ${WEEKS_PER_MONTH} weeks per month and that you'd win ${ASSUMED_WIN_RATE * 100}% of the enquiries currently going cold.`,
    };
  },
  remediation: {
    copy: "The fix is a follow-up system that answers every enquiry instantly and chases twice — our starter guide walks you through it.",
    slug: "lead-follow-up-starter",
    isPro: false,
  },
};
