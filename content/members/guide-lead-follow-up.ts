import type { GuideItem } from "@/lib/members/items";

const item: GuideItem = {
  slug: "lead-follow-up-starter",
  title: "Never Lose a Lead: Follow-Up Automation Starter",
  description:
    "A step-by-step starter workflow that acknowledges every enquiry instantly and follows up twice — with the exact email templates to use.",
  type: "guide",
  tier: "free",
  dateAdded: "2026-07-17",
  html: `
    <p>Most small businesses lose leads not because the work is bad, but because the follow-up never happens. Research consistently shows the first business to respond wins a disproportionate share of the work. This starter workflow makes sure you are always that business.</p>

    <h2>Step 1: Pick your trigger</h2>
    <p>Choose the single place most enquiries arrive. For most businesses that is the website contact form; for trades it is often a missed call. Start with one trigger — you can add more later. The workflow below assumes a contact form.</p>

    <h2>Step 2: The instant acknowledgment</h2>
    <p>Send this within a minute of the enquiry, automatically. Its job is to buy you time while sounding personal:</p>
    <blockquote>
      <p>Subject: Got your message — here's what happens next</p>
      <p>Hi [First name],</p>
      <p>Thanks for getting in touch. Your enquiry has landed with a real person (me), and I'll come back to you with a proper answer by [tomorrow / end of day].</p>
      <p>If it's urgent, call me directly on [phone].</p>
      <p>[Your name], [Business name]</p>
    </blockquote>

    <h2>Step 3: The two-day follow-up</h2>
    <p>Only sends if you haven't replied personally yet (most email tools can check this via a tag or list move):</p>
    <blockquote>
      <p>Subject: Still thinking about [service]?</p>
      <p>Hi [First name],</p>
      <p>Just making sure my earlier reply didn't get buried. If you're still weighing things up, the two questions I'd usually ask are: what's the timeframe, and what does a great outcome look like for you? Reply with those and I can give you a much sharper answer.</p>
    </blockquote>

    <h2>Step 4: The seven-day close-the-loop</h2>
    <blockquote>
      <p>Subject: Should I close your file?</p>
      <p>Hi [First name],</p>
      <p>I don't want to clutter your inbox. If the timing isn't right, no problem at all — reply "later" and I'll check back in a couple of months. If you've gone another way, that's fine too. And if you're ready to move, reply "let's talk" and I'll send times.</p>
    </blockquote>
    <p>This email routinely gets the highest reply rate of the three — people respond to a graceful exit.</p>

    <h2>Step 5: Wire it up</h2>
    <p>In <strong>Mailchimp</strong>: create an audience tag "new-enquiry", connect your form (native embed or via your form plugin), and build a Customer Journey triggered by the tag with the three emails at 0 minutes, 2 days and 7 days. Add an exit condition when you tag them "replied".</p>
    <p>In a <strong>CRM</strong> (HubSpot free tier, Pipedrive, etc.): the same three emails become an automated sequence on the "enquiry received" stage, with the sequence cancelled automatically when the deal moves stage.</p>

    <h2>What "done" looks like</h2>
    <p>Every enquiry gets a response within one minute, nobody waits more than two days without a touch, and dead leads close themselves out politely. Set a monthly reminder to skim the replies — the questions people ask are your next website FAQ.</p>
  `,
};

export default item;
