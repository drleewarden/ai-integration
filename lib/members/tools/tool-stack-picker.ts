/**
 * Recommendation engine for the AI Tool Stack Picker. Pure and
 * deterministic: a base pick everyone gets, plus picks keyed off the
 * user's biggest time sink, industry and team size, deduplicated by
 * category and capped at four so the output stays a starter stack,
 * not a shopping list.
 */

export interface StackPick {
  category: string;
  examples: string;
  why: string;
}

export const INDUSTRIES = [
  { id: "trades", label: "Trades & home services" },
  { id: "professional-services", label: "Professional services & consulting" },
  { id: "retail", label: "Retail & e-commerce" },
  { id: "hospitality", label: "Hospitality & events" },
  { id: "health", label: "Health & wellbeing" },
  { id: "other", label: "Something else" },
] as const;

export const TEAM_SIZES = [
  { id: "solo", label: "Just me" },
  { id: "small", label: "2–5 people" },
  { id: "medium", label: "6–20 people" },
] as const;

export const TIME_SINKS = [
  { id: "email-admin", label: "Email and general admin" },
  { id: "scheduling", label: "Booking and rescheduling appointments" },
  { id: "invoicing", label: "Invoicing and chasing payments" },
  { id: "marketing", label: "Marketing and social media content" },
  { id: "customer-questions", label: "Answering the same customer questions" },
  { id: "quotes", label: "Writing quotes and proposals" },
] as const;

export type IndustryId = (typeof INDUSTRIES)[number]["id"];
export type TeamSizeId = (typeof TEAM_SIZES)[number]["id"];
export type TimeSinkId = (typeof TIME_SINKS)[number]["id"];

const BASE_PICK: StackPick = {
  category: "General AI assistant",
  examples: "Claude, ChatGPT",
  why: "The swiss-army knife: drafting, summarising, brainstorming and first-pass replies. Get the paid tier of one — it becomes the desk drawer everything else sits beside.",
};

const SINK_PICKS: Record<TimeSinkId, StackPick> = {
  "email-admin": {
    category: "AI-assisted inbox",
    examples: "the AI features already inside Gmail or Outlook",
    why: "Before buying anything new, switch on drafting and summarising where your email already lives — it handles the routine half of the inbox for no extra spend.",
  },
  scheduling: {
    category: "Self-serve booking",
    examples: "Calendly, Square Appointments",
    why: "A booking page with automatic reminders kills the back-and-forth email and cuts no-shows — usually the fastest win on this list.",
  },
  invoicing: {
    category: "Accounting with automatic reminders",
    examples: "Xero, MYOB",
    why: "Automated payment reminders at 7, 14 and 21 days overdue chase politely and relentlessly, so you never have to write that awkward email again.",
  },
  marketing: {
    category: "Email marketing & scheduling",
    examples: "Mailchimp, Buffer",
    why: "Pair your AI assistant (drafts the content) with a scheduler (ships it on time) and a month of marketing becomes a two-hour batch session.",
  },
  "customer-questions": {
    category: "Website FAQ assistant",
    examples: "Tidio, Chatbase",
    why: "An assistant trained on your own FAQs answers the repetitive questions around the clock and hands the unusual ones to you.",
  },
  quotes: {
    category: "Proposal & quoting",
    examples: "Qwilr, PandaDoc",
    why: "Templated proposals filled from a short form — with open-tracking so you know when to follow up — turn a two-hour job into twenty minutes.",
  },
};

const INDUSTRY_PICKS: Record<IndustryId, StackPick | null> = {
  trades: {
    category: "Job management",
    examples: "ServiceM8, Tradify",
    why: "Quotes, scheduling, job cards and invoicing in one place, built for trades — plus missed-call text-back so after-hours enquiries stop going to your competitors.",
  },
  "professional-services": {
    category: "Lightweight CRM",
    examples: "HubSpot (free tier), Pipedrive",
    why: "When the work is relationships, a CRM is the memory: every enquiry, follow-up and proposal in one pipeline instead of scattered across your inbox.",
  },
  retail: {
    category: "Review & reputation management",
    examples: "the review tools inside Google Business Profile, Judge.me",
    why: "For retail, reviews are the marketing that compounds — automate the ask after every sale and the stars accumulate on their own.",
  },
  hospitality: {
    category: "Reservations & waitlist",
    examples: "SevenRooms, OpenTable",
    why: "Automated bookings, reminders and waitlists recover the revenue that no-shows and unanswered phones quietly leak.",
  },
  health: {
    category: "Practice management",
    examples: "Cliniko, Halaxy",
    why: "Bookings, reminders, notes and payments in one compliant place — health businesses should automate here first, not with general-purpose tools.",
  },
  other: {
    category: "Lightweight CRM",
    examples: "HubSpot (free tier), Pipedrive",
    why: "Whatever the industry, a simple pipeline of who enquired and what happens next is the automation foundation everything else plugs into.",
  },
};

const TEAM_PICK: StackPick = {
  category: "Automation glue",
  examples: "Zapier, Make",
  why: "With a team this size, the wins move from personal productivity to connected workflows — these connect the tools above so hand-offs happen without anyone remembering to do them.",
};

export function recommendStack(
  industry: IndustryId,
  teamSize: TeamSizeId,
  timeSink: TimeSinkId,
): StackPick[] {
  const picks: StackPick[] = [BASE_PICK, SINK_PICKS[timeSink]];

  const industryPick = INDUSTRY_PICKS[industry];
  if (industryPick) picks.push(industryPick);

  if (teamSize === "medium") picks.push(TEAM_PICK);

  // Dedup by category (e.g. industry and time sink can both point at a CRM).
  const seen = new Set<string>();
  return picks
    .filter((p) => {
      if (seen.has(p.category)) return false;
      seen.add(p.category);
      return true;
    })
    .slice(0, 4);
}
