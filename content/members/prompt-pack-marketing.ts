import type { GuideItem } from "@/lib/members/items";

const item: GuideItem = {
  slug: "prompt-pack-marketing",
  title: "Prompt Pack: Small Business Marketing",
  description:
    "Ten copy-paste AI prompts for the marketing jobs every small business puts off — service pages, review responses, newsletters and more.",
  type: "guide",
  tier: "free",
  dateAdded: "2026-07-17",
  html: `
    <p>Each prompt below is ready to paste into Claude or ChatGPT. Replace the [bracketed] parts, and always give the AI one example of your existing writing so it can match your voice. The one-line note under each prompt tells you why it's built the way it is.</p>

    <h2>1. Service page rewrite</h2>
    <blockquote><p>Rewrite this service page for a [type of business] in [suburb/city]. Audience: [who buys this]. Keep it under 300 words, lead with the customer's problem rather than our history, include one specific proof point, and end with a single clear call to action. Keep my tone: [paste a paragraph you've written]. Here's the current page: [paste].</p></blockquote>
    <p><em>Why it works: constraints (length, structure, one CTA) are what separate usable copy from AI waffle.</em></p>

    <h2>2. Google Business Profile post</h2>
    <blockquote><p>Write a 100-word Google Business Profile post about [recent job/offer/news] for [business type] in [location]. Conversational, no hashtags, no exclamation marks, end with one action ("Call", "Book online"). Mention [suburb] naturally once.</p></blockquote>
    <p><em>Why it works: GBP posts rank locally — the single natural suburb mention is the point.</em></p>

    <h2>3. Customer announcement email</h2>
    <blockquote><p>Write an email to existing customers announcing [change: new service / price change / new hours]. Get the key fact into the first sentence, explain what it means for them (not for us), keep it under 150 words, and end with how to ask questions. Warm but not gushing.</p></blockquote>
    <p><em>Why it works: front-loading the fact respects the 8 seconds most customers give an email.</em></p>

    <h2>4. Social post from a customer win</h2>
    <blockquote><p>Turn this into a social post: [describe the job and outcome in 2–3 plain sentences]. Structure: the problem the customer had, what we did, the result. No salesy language, no "we're thrilled". End with a soft invitation, not a pitch. Give me a version for Facebook and a shorter one for Instagram.</p></blockquote>
    <p><em>Why it works: problem–action–result is the only social format that markets without sounding like marketing.</em></p>

    <h2>5. FAQ generator</h2>
    <blockquote><p>Here are 10 real questions customers have asked us: [paste]. Group them, then write clear 2–3 sentence answers for a website FAQ page. Reading level: plain Australian English, year 8. Where an answer depends on circumstances, say what it usually costs/takes and what changes it.</p></blockquote>
    <p><em>Why it works: real questions beat imagined ones — and FAQ pages feed both Google and AI assistants.</em></p>

    <h2>6. Local SEO description</h2>
    <blockquote><p>Write a 150–160 character meta description for this page: [paste page or summary]. It must include [main service] and [location], read like a sentence a human would click, and not start with the business name.</p></blockquote>
    <p><em>Why it works: 160 characters is the truncation limit; the click-worthy sentence is what lifts you above competitors.</em></p>

    <h2>7. Review response — positive</h2>
    <blockquote><p>Write a 2–3 sentence reply to this 5-star review: [paste]. Thank them by first name, mention one specific detail from their review so it doesn't read as a template, and don't pitch anything.</p></blockquote>
    <p><em>Why it works: the specific detail signals to future readers that reviews here are real and read.</em></p>

    <h2>8. Review response — negative</h2>
    <blockquote><p>Write a reply to this negative review: [paste]. Acknowledge the specific complaint without arguing or making excuses, state one concrete thing we're doing about it, and invite them to contact [name] directly on [phone/email]. Calm, professional, no legal-sounding language. Under 80 words.</p></blockquote>
    <p><em>Why it works: the reply is really written for the hundred future customers reading over the reviewer's shoulder.</em></p>

    <h2>9. Monthly newsletter</h2>
    <blockquote><p>Draft our monthly customer newsletter from these raw notes: [3–5 bullet points of news, jobs, tips]. Structure: one useful tip first (lead with value), then news, then one gentle offer. Under 250 words total, subject line included — make the subject about the tip, not about us.</p></blockquote>
    <p><em>Why it works: newsletters get opened for the reader's benefit, not your news — the tip-first structure earns the open.</em></p>

    <h2>10. Ad copy variations</h2>
    <blockquote><p>Write 5 variations of ad copy for [offer] aimed at [audience] in [location]. For each: headline under 30 characters, description under 90 characters. Vary the angle across the five: price, speed, trust/reviews, local, and risk-reversal (guarantee). Plain language, no clickbait.</p></blockquote>
    <p><em>Why it works: you're not asking for one great ad — you're generating the five angles to A/B test.</em></p>
  `,
};

export default item;
