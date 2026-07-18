import type { GuideItem } from "@/lib/members/items";

const item: GuideItem = {
  slug: "prompt-pack-sales",
  title: "Prompt Pack: Sales & Proposals",
  description:
    "Prompts that touch revenue directly — discovery-call prep, proposal drafting, objection handling and the follow-up sequence that stops deals going quiet.",
  type: "guide",
  tier: "pro",
  dateAdded: "2026-07-18",
  html: `
    <p>Marketing prompts save you time; sales prompts make you money. This pack covers the four moments that decide whether a deal closes: the preparation before the call, the proposal after it, the objection in the middle, and the follow-up that most businesses fumble. As always: no client personal details into unapproved tools, and every output gets your judgement before it gets sent.</p>

    <h2>1. Discovery-call prep</h2>
    <p>Ten minutes of AI-assisted prep changes the quality of a first call more than anything else you can do. Before the call:</p>
    <blockquote>
      <p>I run [your business, one line]. I have a discovery call with a [industry] business of roughly [size]. Their enquiry said: [paste enquiry, minus personal details].</p>
      <p>Give me: (1) the five problems a business like this most likely has that my service solves, ranked by how expensive they are to the client; (2) three opening questions that would surface which of those they actually have — questions that sound like curiosity, not a sales script; (3) the one thing a business like this is usually worried about when hiring someone like me, so I can raise it before they do.</p>
    </blockquote>
    <p>Point 3 is the sleeper: naming the client's unspoken worry ("you've probably been burned by someone who overpromised") builds more trust than any credential.</p>

    <h2>2. Post-call proposal draft</h2>
    <blockquote>
      <p>Below are my raw notes from a discovery call. Draft two sections of a proposal in my voice — plain Australian English, second person, confident but not salesy:</p>
      <p>"YOUR SITUATION" — their problem in their own words, showing we listened. Use the client's phrasing from my notes where possible.</p>
      <p>"WHAT SUCCESS LOOKS LIKE" — the outcome they described, made concrete and measurable where the notes support it. Do not invent numbers or promises that aren't in my notes; flag anywhere you were tempted to.</p>
      <p>[paste notes]</p>
    </blockquote>
    <p>The instruction not to invent numbers is load-bearing. An AI-drafted promise you didn't notice is still your promise.</p>

    <h2>3. The price objection</h2>
    <blockquote>
      <p>A prospect has replied: [paste their objection, e.g. "it's more than we budgeted"]. My price: [X]. What it covers: [one line]. My floor: I don't discount, but I can [reduce scope / phase the work / adjust payment terms].</p>
      <p>Draft a reply that: takes the objection seriously without immediately conceding, restates the cost of the problem we're solving (from their own stated situation: [one line]), and offers ONE alternative from my list above — not a menu. End with a question that moves the conversation forward. Under 140 words.</p>
    </blockquote>
    <p>"One alternative, not a menu" matters: a menu of concessions teaches prospects to negotiate; a single considered alternative teaches them you've thought about their situation.</p>

    <h2>4. The "gone quiet" sequence</h2>
    <p>Three messages, spaced 4, 10 and 21 days after the proposal. Generate all three at once so they escalate properly:</p>
    <blockquote>
      <p>A prospect received my proposal [X days] ago and has gone quiet. The proposal was for [one line]. Draft a three-message follow-up sequence for days 4, 10 and 21:</p>
      <p>Message 1: assume good faith — busy people forget. Add one new piece of value (an idea, an article, a relevant example), don't just "check in".</p>
      <p>Message 2: gently surface the real blocker. Offer the three most likely reasons deals stall (timing, budget, internal sign-off) and make each easy to admit to in one reply word.</p>
      <p>Message 3: the graceful close — "should I close your file?" energy. No guilt, an easy out, and one line that leaves the door open for next quarter.</p>
      <p>All three: plain Australian English, under 90 words each, no "just following up", no exclamation marks.</p>
    </blockquote>
    <p>Wire these into your email tool as a sequence that cancels automatically when the prospect replies (the same mechanics as our free lead follow-up guide) and "forgetting to follow up" disappears from your pipeline permanently.</p>

    <h2>5. Bonus: the win/loss review</h2>
    <p>Once a month, paste your closed-won and closed-lost notes (no names) with: <em>"What patterns separate the deals I won from the ones I lost? Be blunt. What should I change about my qualifying questions, proposals or follow-up?"</em> The prompts above improve your execution; this one improves your judgement — and after a quarter of them, your win rate tells you which advice was right.</p>
  `,
};

export default item;
