/**
 * Creative Milk — AI Readiness assessment questions.
 *
 * 15 questions, 3 per pillar, 4 options each. Extracted verbatim from the v5
 * demo (CreativeMilkReadiness_v5.jsx) — do not edit text without also
 * updating the demo or you'll break the visual approval baseline.
 *
 * Option ordering is meaningful: index 0 is the lowest score (1 raw point),
 * index 3 is the highest (4 raw points). See scoring.ts.
 */

import type { Question } from './types';

export const QUESTIONS: readonly Question[] = [
  // ── Strategy ───────────────────────────────────────────────────────────
  {
    id: 'q1',
    pillar: 'strategy',
    text: "How well do you understand your organisation's AI strategy and vision?",
    options: [
      'Not aware of any AI strategy',
      "Heard about it but don't know details",
      'Understand the main goals and priorities',
      'Can articulate the strategy and how my role contributes',
    ],
  },
  {
    id: 'q2',
    pillar: 'strategy',
    text: 'How confident are you in identifying AI opportunities in your work?',
    options: [
      "Not confident — I don't see how AI applies to my work",
      'Somewhat confident — I can see a few obvious uses',
      'Confident — I regularly identify potential AI applications',
      'Very confident — I actively propose and evaluate AI initiatives',
    ],
  },
  {
    id: 'q3',
    pillar: 'strategy',
    text: 'How do you approach evaluating whether AI is the right solution for a task?',
    options: [
      "I don't evaluate — I use AI for everything or nothing",
      'I try AI and see if it helps',
      'I consider task complexity, data needs, and risks',
      'I systematically assess ROI, feasibility, and alignment with goals',
    ],
  },

  // ── Data ────────────────────────────────────────────────────────────────
  {
    id: 'q4',
    pillar: 'data',
    text: 'How well do you understand data quality requirements for AI systems?',
    options: [
      'No understanding of data requirements',
      'Basic awareness that AI needs data',
      'Understand data quality, bias, and representativeness issues',
      'Can assess data readiness and identify gaps for AI projects',
    ],
  },
  {
    id: 'q5',
    pillar: 'data',
    text: 'How do you handle sensitive or confidential data when using AI tools?',
    options: [
      "I don't think about data sensitivity",
      'I avoid sharing obviously sensitive data',
      'I follow basic data handling guidelines',
      'I carefully evaluate data policies and use appropriate tools for each data type',
    ],
  },
  {
    id: 'q6',
    pillar: 'data',
    text: 'How confident are you in preparing and structuring data for AI use?',
    options: [
      "Not confident — I don't know what AI needs",
      'Somewhat confident — I can provide basic information',
      'Confident — I understand context, formatting, and prompt structure',
      'Very confident — I can optimise data inputs for best AI outputs',
    ],
  },

  // ── Culture ─────────────────────────────────────────────────────────────
  {
    id: 'q7',
    pillar: 'culture',
    text: 'How would you describe your attitude toward AI adoption in your work?',
    options: [
      'Resistant — I prefer traditional methods',
      "Cautious — I'll use AI if required but prefer not to",
      "Open — I'm willing to learn and experiment",
      'Enthusiastic — I actively seek AI solutions and encourage others',
    ],
  },
  {
    id: 'q8',
    pillar: 'culture',
    text: 'How do you approach learning new AI tools and techniques?',
    options: [
      'I avoid learning new AI tools',
      'I learn only when absolutely necessary',
      'I regularly explore new AI capabilities',
      'I proactively upskill and share knowledge with colleagues',
    ],
  },
  {
    id: 'q9',
    pillar: 'culture',
    text: 'How do you balance AI assistance with human judgment in your work?',
    options: [
      'I either trust AI completely or not at all',
      "I'm unsure when to rely on AI vs human judgment",
      'I use AI as a tool but verify important decisions',
      'I strategically combine AI capabilities with human oversight and expertise',
    ],
  },

  // ── Technology ──────────────────────────────────────────────────────────
  {
    id: 'q10',
    pillar: 'technology',
    text: 'How familiar are you with different types of AI tools available today?',
    options: [
      'Not familiar with any AI tools',
      'Know about ChatGPT or similar chatbots',
      'Familiar with various AI tools for different purposes',
      'Deep understanding of AI capabilities, limitations, and tool selection',
    ],
  },
  {
    id: 'q11',
    pillar: 'technology',
    text: 'How confident are you in writing effective prompts for AI tools?',
    options: [
      "Not confident — I don't know how to communicate with AI",
      'Somewhat confident — I can get basic results',
      'Confident — I can craft prompts that get good results',
      'Very confident — I can optimise prompts for specific outcomes and iterate effectively',
    ],
  },
  {
    id: 'q12',
    pillar: 'technology',
    text: 'How do you stay current with AI technology developments?',
    options: [
      "I don't follow AI developments",
      'I occasionally hear about AI news',
      'I regularly read about AI trends and updates',
      'I actively research, experiment with, and evaluate new AI technologies',
    ],
  },

  // ── Governance ──────────────────────────────────────────────────────────
  {
    id: 'q13',
    pillar: 'governance',
    text: "How aware are you of your organisation's AI usage policies?",
    options: [
      'Not aware of any policies',
      "Know policies exist but haven't read them",
      'Familiar with the main guidelines',
      'Thoroughly understand and apply policies in my work',
    ],
  },
  {
    id: 'q14',
    pillar: 'governance',
    text: 'How do you approach ethical considerations when using AI?',
    options: [
      "I don't think about AI ethics",
      'I have basic awareness of AI bias and fairness',
      'I consider ethical implications before using AI',
      'I actively evaluate fairness, transparency, and accountability in AI use',
    ],
  },
  {
    id: 'q15',
    pillar: 'governance',
    text: 'How confident are you in identifying and escalating AI-related risks?',
    options: [
      "Not confident — I don't know what risks to look for",
      'Somewhat confident — I can spot obvious problems',
      'Confident — I can identify common AI risks and know when to escalate',
      'Very confident — I systematically assess risks and have clear escalation paths',
    ],
  },
];

/**
 * Map of pillar key → ordered list of question ids in that pillar.
 * Useful for the scoring engine and the playbook composer (which needs to
 * compare answers within a pillar to determine the weakness pattern).
 */
export const QUESTIONS_BY_PILLAR: Record<string, string[]> = QUESTIONS.reduce(
  (acc, q) => {
    if (!acc[q.pillar]) acc[q.pillar] = [];
    acc[q.pillar].push(q.id);
    return acc;
  },
  {} as Record<string, string[]>
);

/**
 * Validation: every pillar must have exactly 3 questions for the playbook
 * weakness-pattern logic to work. Run at module load.
 */
for (const pillar of Object.keys(QUESTIONS_BY_PILLAR)) {
  const count = QUESTIONS_BY_PILLAR[pillar].length;
  if (count !== 3) {
    throw new Error(
      `Pillar '${pillar}' has ${count} questions; expected exactly 3. ` +
        `If you add a 4th question to a pillar, update lib/readiness/scoring.ts ` +
        `and the weakness-pattern logic in lib/readiness/composer.ts.`
    );
  }
}
