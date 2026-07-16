// Page copy/data for pricing -- extracted from page.tsx to keep the
// component readable. Edit copy here; edit layout in page.tsx.

export const faqs = [
  {
    q: "Is there flexibility in the pricing?",
    a: "The price ranges reflect real variation in engagement complexity. A Discovery Sprint for a single process with a clean tech stack costs less than one scoping multiple integrations across a complex stack. Phase 2 pricing is fixed once Phase 1 is complete -- no surprises from that point. We don't negotiate on price for the same scope.",
  },
  {
    q: "Do we need to do all three phases?",
    a: "No. Each phase stands alone. The Discovery Sprint is a contained engagement -- you get a plan and a recommendation. Phase 2 requires Phase 1 because the scope and fixed price are determined there. Phase 3 is optional -- many clients run their system independently after Phase 2.",
  },
  {
    q: "What if the system doesn't hit the success metric?",
    a: "We define the success metrics together in Phase 1. If Phase 2 doesn't hit them, we stay involved until it does. That's part of what the 95% outcome rate means -- we don't declare something done until the outcome is real.",
  },
  {
    q: "Can we start with a smaller engagement?",
    a: "The Discovery Sprint is the entry point. At AUD $5,000–$15,000, it's the lowest-risk way to find out whether AI is the right answer for your specific problem, what it would cost to build, and what outcome you'd expect.",
  },
  {
    q: "What's your capacity?",
    a: "We take a limited number of engagements at any one time. If we're at capacity, we'll tell you when we can start and give you the option of being on the list. We don't rush engagements to fit more in -- that's how 95% outcome rates drop.",
  },
  {
    q: "Do you work with businesses outside Melbourne?",
    a: "Yes. Discovery Sprints are mostly remote -- we can run them anywhere. For Phase 2 builds requiring on-site work, we travel. We've worked with businesses across Australia.",
  },
];

export const phases = [
  {
    num: "Phase 01",
    title: "Discovery Sprint",
    price: "AUD $5K–$15K",
    meta: "1–2 weeks · Can stand alone",
    body: "The Discovery Sprint is a scoped investigation into your specific business problem. We spend 1–2 weeks understanding your processes, your stack, and the opportunity. We come out with a specific system design, agreed success metrics, a go/no-go recommendation, and a fixed-price Phase 2 proposal if we both want to proceed. The plan is yours -- no obligation to proceed with us.",
    priceNote: [
      "Lower ($5K): single process, clear brief, simple tech stack",
      "Upper ($15K): multiple processes, complex integrations, larger stakeholder group",
    ],
    deliverables: [
      "Process audit and opportunity map",
      "Scoped system design",
      "Agreed success metric",
      "Go/no-go recommendation with supporting rationale",
      "Fixed-price Phase 2 proposal (if applicable)",
      "The plan is yours -- no obligation to proceed with us",
    ],
  },
  {
    num: "Phase 02",
    title: "Build & Integrate",
    price: "AUD $30K–$120K",
    meta: "4–6 weeks · Requires Phase 1",
    body: "We build the system to the specification from Phase 1. Production-ready, integrated into your existing stack, with change management and team training included as standard. IP transfers to you on completion.",
    priceNote: [
      "Lower ($30K): single integration, defined scope, small team",
      "Upper ($120K): multiple integrations, complex data pipelines, larger team, extensive training",
    ],
    deliverables: [
      "Production AI system running in your stack",
      "Full IP transfer -- code, documentation, model",
      "Team training and adoption plan (standard)",
      "30-day post-launch support window",
      "Outcome measurement framework",
    ],
  },
  {
    num: "Phase 03",
    title: "Managed Partnership",
    price: "AUD $5K–$15K/mo",
    meta: "Ongoing · Optional",
    body: "Ongoing optimisation, performance monitoring, and strategic advisory. We stay close as the system processes real data and improves over time. Monthly reporting against Phase 1 success metrics. Direct access to Craig and Darryn. Typically a 3-month minimum, month-to-month thereafter.",
    priceNote: [
      "Lower ($5K/month): monitoring and reporting only, stable system",
      "Upper ($15K/month): active optimisation, model retraining, expansion planning",
    ],
    deliverables: [],
  },
];

export const reasons = [
  {
    num: "01",
    title: "It respects your time",
    body: "Professional services buyers make better decisions with real numbers. If our engagement costs are outside your budget, it's better for both of us to know before the first call.",
  },
  {
    num: "02",
    title: "It signals how we work",
    body: "Agencies that hide pricing often have flexible pricing -- meaning the price depends on what they think you'll pay. We don't work that way. Our prices reflect the scope and complexity of the work.",
  },
  {
    num: "03",
    title: "It creates better conversations",
    body: "When you know what things cost, we can have a real conversation about what's worth doing. The first call becomes about the problem -- not a quote request.",
  },
];
