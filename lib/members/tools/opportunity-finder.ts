/**
 * Ranking engine for the Automation Opportunity Finder. Pure and
 * deterministic: annual cost = hours/week * hourly value * 46 working
 * weeks; payoff = annual cost discounted by implementation effort.
 */

export interface ProcessDef {
  id: string;
  label: string;
  effort: "low" | "medium" | "high";
  blueprint: string;
}

export interface Opportunity {
  id: string;
  label: string;
  annualCost: number;
  effort: "low" | "medium" | "high";
  blueprint: string;
}

const WORKING_WEEKS = 46;
const EFFORT_FACTOR = { low: 1, medium: 2, high: 4 } as const;

export const PROCESSES: ProcessDef[] = [
  {
    id: "invoice-chasing",
    label: "Chasing unpaid invoices",
    effort: "low",
    blueprint:
      "Automated reminder emails at 7, 14 and 21 days overdue, straight from your accounting software.",
  },
  {
    id: "lead-follow-up",
    label: "Following up new enquiries",
    effort: "low",
    blueprint:
      "Instant acknowledgment plus a scheduled follow-up sequence for every new enquiry, so no lead goes cold.",
  },
  {
    id: "scheduling",
    label: "Booking and rescheduling appointments",
    effort: "low",
    blueprint:
      "A self-serve booking page with automatic reminders — cuts no-shows and back-and-forth email.",
  },
  {
    id: "faq-support",
    label: "Answering the same customer questions",
    effort: "medium",
    blueprint:
      "An AI assistant trained on your FAQs answers common questions; anything unusual is handed to you.",
  },
  {
    id: "quotes-proposals",
    label: "Writing quotes and proposals",
    effort: "medium",
    blueprint:
      "Templated proposals filled from a short form, drafted by AI in your voice for you to approve.",
  },
  {
    id: "data-entry",
    label: "Re-typing data between systems",
    effort: "medium",
    blueprint:
      "Connect the two systems so records flow automatically — no re-keying, no transcription errors.",
  },
  {
    id: "social-content",
    label: "Creating social media content",
    effort: "medium",
    blueprint:
      "Repurpose one piece of work (a job, a review, a blog post) into a month of scheduled posts.",
  },
  {
    id: "reporting",
    label: "Compiling reports",
    effort: "high",
    blueprint:
      "A live dashboard that pulls the numbers automatically, replacing the monthly copy-paste ritual.",
  },
];

export function rankOpportunities(
  hoursByProcess: Record<string, number>,
  hourlyValue: number,
): Opportunity[] {
  return PROCESSES.filter((p) => (hoursByProcess[p.id] ?? 0) > 0)
    .map((p) => ({
      id: p.id,
      label: p.label,
      annualCost: Math.round(hoursByProcess[p.id] * hourlyValue * WORKING_WEEKS),
      effort: p.effort,
      blueprint: p.blueprint,
    }))
    .sort(
      (a, b) =>
        b.annualCost / EFFORT_FACTOR[b.effort] -
        a.annualCost / EFFORT_FACTOR[a.effort],
    )
    .slice(0, 3);
}
