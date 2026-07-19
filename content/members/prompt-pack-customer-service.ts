import type { GuideItem } from "@/lib/members/items";

const item: GuideItem = {
  slug: "prompt-pack-customer-service",
  title: "Prompt Pack: Customer Service Replies",
  description:
    "Copy-paste prompts for the hardest inbox moments — complaints, refund requests, delivery delays and negative reviews — that keep your tone warm and your answers consistent.",
  type: "guide",
  tier: "free",
  dateAdded: "2026-07-18",
  html: `
    <p>Customer service writing is hard because the stakes are emotional: one clumsy sentence in a refund reply costs more goodwill than a week of good service earns. These prompts are built to draft replies that are warm, specific and non-defensive — you review, personalise and send.</p>

    <h2>How to use this pack</h2>
    <p>Each prompt has a [SETUP] block you fill in once and reuse. Keep a version with your details saved in a note. Two rules apply to every prompt here:</p>
    <ul>
      <li><strong>Never paste customer personal details</strong> (full names, emails, payment info) into a tool you haven't approved for it. Describe the situation instead: "a customer who ordered two weeks ago".</li>
      <li><strong>The AI drafts, you decide.</strong> Read every reply as if you were the customer receiving it before you hit send.</li>
    </ul>

    <h2>1. The complaint reply</h2>
    <blockquote>
      <p>[SETUP] My business: [what you do]. My tone: warm, plain-spoken Australian English, no corporate phrases like "we apologise for any inconvenience".</p>
      <p>Draft a reply to a customer complaint. The situation: [describe what went wrong and what's true — don't hide anything from the AI]. What I can offer: [refund / redo / discount / explanation only].</p>
      <p>Requirements: acknowledge the specific problem in the first sentence, take responsibility without grovelling, state concretely what happens next and when, and end with one sentence that invites them to reply directly to me. Keep it under 150 words.</p>
    </blockquote>

    <h2>2. The refund request (when you're saying yes)</h2>
    <blockquote>
      <p>Draft a reply granting a refund. Situation: [why they asked]. Make it fast and gracious — no conditions, no guilt. Include: confirmation the refund is being processed, the timeframe [e.g. 3–5 business days], and one warm closing line that leaves the door open without asking for anything.</p>
    </blockquote>

    <h2>3. The refund request (when you're saying no)</h2>
    <blockquote>
      <p>Draft a reply declining a refund. Situation: [what happened and why the answer is no — e.g. outside the returns window, service already delivered]. Policy: [your actual policy in one line].</p>
      <p>Requirements: lead with what I CAN do [store credit / repair / discount on next order / nothing but an explanation], explain the reason once, clearly and without repeating it, and never blame the customer. Offer one concrete alternative. Under 130 words.</p>
    </blockquote>

    <h2>4. The delivery or timeline delay</h2>
    <blockquote>
      <p>Draft a proactive message telling a customer their [order/project] is delayed. New expected date: [date]. Reason: [honest one-line reason]. Requirements: lead with the new date (that's what they actually want to know), one sentence of reason without excuses, one sentence on what I'm doing to keep it on track, and an offer to answer questions. No "sorry for the inconvenience" — say what we're sorry for specifically.</p>
    </blockquote>

    <h2>5. The negative review response (public)</h2>
    <blockquote>
      <p>Draft a public reply to a negative review. The review says: [paste or summarise]. What actually happened from our side: [your honest version]. Requirements: this is written for the hundreds of future customers who will read it, not just the reviewer. Thank them for the specific feedback, state any factual correction once and neutrally, describe what we've changed or offered, and invite them to contact me directly by name. Never argue, never sarcasm, under 100 words.</p>
    </blockquote>

    <h2>6. The "where is my order/response?" chase</h2>
    <blockquote>
      <p>Draft a reply to a customer chasing an update. Status: [the real status]. Requirements: answer the question in the first sentence, give the next milestone and date, and add one line acknowledging that chasing us shouldn't have been necessary. Under 80 words.</p>
    </blockquote>

    <h2>Levelling up: your reply library</h2>
    <p>After a month of using these, you'll notice the same five situations cover most of your inbox. Save your best sent replies as templates — that library becomes the training material if you later automate first-draft replies with an AI assistant on your help inbox. That step-up is exactly what we cover in the Small Business Automation Playbook (Pro).</p>
  `,
};

export default item;
