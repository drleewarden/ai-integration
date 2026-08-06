// app/llms.txt/route.ts -- served at /llms.txt
//
// llms.txt (https://llmstxt.org) is the emerging convention AI assistants and
// AI search engines check for a machine-readable overview of a site. Insights
// links derive from the content registry, so new posts appear automatically.
// Facts here must stay consistent with /pricing and /pricingdata.

import { posts, displayTitle } from "@/lib/insights/posts";

const BASE_URL = "https://www.creative-milk.com.au";

export const dynamic = "force-static";

export function GET(): Response {
  const insightLinks = posts
    .map(
      (p) =>
        `- [${displayTitle(p)}](${BASE_URL}/insights/${p.slug}): ${p.description}`
    )
    .join("\n");

  const body = `# Creative Milk

> Creative Milk is an AI consultancy in South Melbourne, Australia. We build custom AI systems for Australian businesses — scoped around specific problems and measured by outcomes, not deliverables. Founder-led: clients work directly with the two founders, Craig and Darryn.

Key facts:
- Location: Level 7, 80 Dorcas Street, South Melbourne VIC 3205, Australia (works with businesses Australia-wide, remote-friendly)
- Contact: contact@creative-milk.com.au
- Engagement model: four phases, with two standalone entry points
  - Phase 1 — AI Tools Assessment: AUD $2K, 3 days. Maps recurring work to practical tools and systems, with a written four-day start plan. If it does not identify at least five hours per week to reclaim, the fee is returned.
  - Phase 2 — Discovery Sprint: AUD $5K–$15K, 1–2 weeks. Process audit, scoped system design, agreed success metrics, go/no-go recommendation, fixed-price Phase 3 proposal. No obligation to proceed.
  - Phase 3 — Build & Integrate: AUD $30K–$120K, 4–6 weeks. Production AI system built into your existing stack; change management and team training included as standard; full IP transfer on completion; 30-day post-launch support.
  - Phase 4 — Managed Partnership: AUD $5K–$15K/month, ongoing and optional. Monitoring, optimisation, monthly reporting, strategic advisory.
- Pricing is published openly; all prices in AUD
- Clients own everything: code, documentation, and models transfer on completion

## Services

- [Services](${BASE_URL}/services): The three-phase engagement model in detail, deliverables per phase
- [What we build](${BASE_URL}/what-we-build): Types of AI systems delivered (automation, custom tools, integrations)
- [Pricing](${BASE_URL}/pricing): Published pricing for all four phases, including the AI Tools Assessment guarantee and what moves the price within each range
- [Process](${BASE_URL}/process): How an engagement runs end to end
- [Work](${BASE_URL}/work): Case studies and past builds
- [For professional services firms](${BASE_URL}/for/professional-services): Industry-specific overview

## Tools

- [AI Readiness Assessment](${BASE_URL}/ai-readiness): Free 15-question assessment scoring a business's readiness for AI, with a personalised playbook
- [Opportunity Cost Calculator](${BASE_URL}/opportunity-cost): Estimates what manual processes cost a business per year

## Insights

${insightLinks}

## Company

- [About](${BASE_URL}/about): Who Creative Milk is and how the founders work
- [Clients](${BASE_URL}/clients): Who we work with
- [Contact](${BASE_URL}/contact): Enquiries — contact@creative-milk.com.au
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
