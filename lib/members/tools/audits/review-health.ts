/**
 * Review & Reputation Health Check. Weighted score out of 100:
 * review count 0–25 (log scale, full marks at 100+), recency 0–20,
 * average rating 0–25 (linear 3.0→5.0), owner response rate 0–15,
 * asking habit 0–15. Unlike the dollar audits, a HIGH band here means
 * high risk (weak reputation), so band thresholds invert the score.
 */

import { type AuditConfig } from "./types";

const COUNT_MAX = 25;
const RECENCY_SCORES = [20, 14, 6, 0];
const RATING_MAX = 25;
const RESPONSE_SCORES = [15, 8, 0];
const ASK_SCORES = [15, 8, 0];

export const reviewHealthConfig: AuditConfig = {
  slug: "review-health-check",
  intro:
    "Five questions about your Google reviews. The result is a reputation score out of 100 — and where the easy points are.",
  questions: [
    {
      id: "reviewCount",
      label: "Google reviews you have today",
      kind: "slider",
      min: 0,
      max: 300,
      step: 1,
      defaultValue: 25,
    },
    {
      id: "recency",
      label: "When did the most recent one arrive?",
      kind: "select",
      options: ["This week", "This month", "Three or more months ago", "Can't remember"],
      defaultValue: 1,
    },
    {
      id: "rating",
      label: "Average star rating",
      kind: "slider",
      min: 3,
      max: 5,
      step: 0.1,
      defaultValue: 4.4,
    },
    {
      id: "responseRate",
      label: "How many reviews get a reply from you?",
      kind: "select",
      options: ["All of them", "Some of them", "We don't reply"],
      defaultValue: 1,
    },
    {
      id: "askHabit",
      label: "How often do you actually ask for a review?",
      kind: "select",
      options: ["After every job", "Sometimes", "We don't ask"],
      defaultValue: 1,
    },
  ],
  score(answers) {
    const countScore = Math.min(
      COUNT_MAX,
      (COUNT_MAX * Math.log10(answers.reviewCount + 1)) / 2,
    );
    const ratingScore = Math.min(
      RATING_MAX,
      Math.max(0, ((answers.rating - 3) / 2) * RATING_MAX),
    );
    const score = Math.round(
      countScore +
        RECENCY_SCORES[answers.recency] +
        ratingScore +
        RESPONSE_SCORES[answers.responseRate] +
        ASK_SCORES[answers.askHabit],
    );
    const band = score >= 80 ? "low" : score >= 55 ? "medium" : "high";
    return {
      headlineValue: `${score}/100`,
      headlineLabel: "reputation health score",
      band,
      verdict:
        band === "low"
          ? "Strong reputation. Your job now is consistency — keep reviews arriving so the recency never slips."
          : band === "medium"
            ? "Solid but leaking. You're likely losing jobs to competitors with fresher, more numerous reviews."
            : "Your reputation is costing you work right now — most buyers check reviews before they ever call.",
      assumptions:
        "Weights: review count 25, recency 20, rating 25, replying 15, asking habit 15. Full count marks at 100+ reviews.",
    };
  },
  remediation: {
    copy: "The businesses that win here ask after every job, automatically. The Review Request Machine is the full workflow — templates, timing and the n8n build.",
    slug: "review-request-machine",
    isPro: true,
  },
};
