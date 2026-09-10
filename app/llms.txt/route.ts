// app/llms.txt/route.ts -- served at /llms.txt
//
// Optional, experimental site summary. This is not a search ranking control.
// Keep facts in the linked public pages; avoid duplicating changing prices.

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

> Creative Milk builds custom AI agents, workflow automations and specialised business websites for Australian businesses. Website: https://www.creative-milk.com.au.

Contact: contact@creative-milk.com.au. See the public pages below for current service scope, pricing and examples.

## Services

- [Services](${BASE_URL}/services): The three-phase engagement model in detail, deliverables per phase
- [Specialised websites](${BASE_URL}/specialised-websites): Business website strategy, design and development, with links to selected work
- [Website portfolio](https://websites.creative-milk.com.au): Selected websites and digital products Darryn Lee-Warden helped bring to life
- [What we build](${BASE_URL}/what-we-build): Types of AI systems delivered (automation, custom tools, integrations)
- [AI automation Melbourne](${BASE_URL}/ai-automation-melbourne): Custom AI agents and multi-step workflow automation for Melbourne small and mid-sized businesses
- [Pricing](${BASE_URL}/pricing): Published pricing for all three phases with what moves the price within each range
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
- [Contact](${BASE_URL}/contact): Enquiries: contact@creative-milk.com.au
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
