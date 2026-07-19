/**
 * Getting-Paid Audit. Estimates cash locked up in overdue invoices:
 * monthly invoiced amount × overdue share, scaled by how invoices are
 * chased (reminder drag) and how promptly they're sent in the first
 * place (delay factor).
 */

import { formatAud, type AuditConfig } from "./types";

/** Indexed by the reminderHabit option order below. */
const REMINDER_DRAG = [0.5, 1.0, 1.5];
/** Indexed by the whenInvoice option order below. */
const DELAY_FACTOR = [1.0, 1.15, 1.35];

export const gettingPaidConfig: AuditConfig = {
  slug: "getting-paid-audit",
  intro:
    "Five questions about how you invoice and chase. The result is the cash likely sitting in overdue invoices right now.",
  questions: [
    {
      id: "invoicesPerMonth",
      label: "Invoices you send in a typical month",
      kind: "slider",
      min: 1,
      max: 100,
      step: 1,
      defaultValue: 12,
    },
    {
      id: "invoiceValue",
      label: "Average invoice value",
      kind: "slider",
      min: 100,
      max: 20000,
      step: 100,
      prefix: "$",
      defaultValue: 1500,
    },
    {
      id: "whenInvoice",
      label: "When does the invoice actually go out?",
      kind: "select",
      options: [
        "Same day as the job",
        "Within the week",
        "When I get to it",
      ],
      defaultValue: 1,
    },
    {
      id: "overduePct",
      label: "Share of invoices that end up overdue",
      kind: "slider",
      min: 0,
      max: 80,
      step: 1,
      defaultValue: 20,
    },
    {
      id: "reminderHabit",
      label: "How do overdue invoices get chased?",
      kind: "select",
      options: [
        "Automated reminders",
        "Manually, when I remember",
        "They mostly don't",
      ],
      defaultValue: 1,
    },
  ],
  score(answers) {
    const lockedUp = Math.round(
      answers.invoicesPerMonth *
        answers.invoiceValue *
        (answers.overduePct / 100) *
        REMINDER_DRAG[answers.reminderHabit] *
        DELAY_FACTOR[answers.whenInvoice],
    );
    const band =
      lockedUp < 2000 ? "low" : lockedUp <= 10000 ? "medium" : "high";
    return {
      headlineValue: formatAud(lockedUp),
      headlineLabel: "cash likely locked up in overdue invoices",
      band,
      verdict:
        band === "low"
          ? "Your money comes in close to on time — whatever you're doing, keep doing it."
          : band === "medium"
            ? "That's real working capital stuck in other people's accounts. Three polite automated reminders would free most of it."
            : "You're effectively lending customers five figures interest-free. Automating reminders is the highest-return fix on this site.",
      assumptions:
        "Estimate scales your overdue share by how invoices are chased (automated ×0.5, manual ×1, never ×1.5) and how promptly they're sent (same day ×1 through ×1.35).",
    };
  },
  remediation: {
    copy: "The Polite Invoice Reminder Sequence gives you the three reminder emails — firm but warm — and how to switch them on in Xero or MYOB.",
    slug: "invoice-reminder-sequence",
    isPro: false,
  },
};
