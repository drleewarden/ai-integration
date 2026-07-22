import type { GuideItem } from "@/lib/members/items";

const item: GuideItem = {
  slug: "review-request-machine",
  title: "The Review Request Machine",
  description:
    "The full workflow for turning finished jobs into Google reviews on autopilot — templates, timing rules, and a step-by-step n8n build.",
  type: "guide",
  tier: "pro",
  dateAdded: "2026-07-17",
  html: `
    <p>Reviews are the highest-leverage marketing asset a local business owns, and almost nobody asks for them consistently. This workflow asks every happy customer, at the right moment, without you thinking about it — and quietly routes unhappy customers to you instead of to Google.</p>

    <h2>The trigger: job completion</h2>
    <p>The best moment to ask is 2–24 hours after the work is finished, while the experience is fresh. Your trigger is whatever marks a job "done" in your world: an invoice being paid, a job status change in your job management tool, or a calendar event ending. Pick the one that already happens reliably.</p>

    <h2>Your Google review link</h2>
    <p>Don't send people to "find us on Google". Get your direct review link: Google Business Profile → Ask for reviews (or share profile → get review link). The link opens the five-star dialog directly. Shorten it with your domain if you can ([yourbusiness].com.au/review redirect) — it looks better in an SMS.</p>

    <h2>The ask — SMS template</h2>
    <blockquote>
      <p>Hi [First name], it's [Your name] from [Business]. Thanks for having us today! If you were happy with the work, a quick Google review makes a huge difference to a small business like ours: [short link]. If anything wasn't right, just reply here and I'll fix it. Cheers!</p>
    </blockquote>

    <h2>The ask — email template</h2>
    <blockquote>
      <p>Subject: How did we do?</p>
      <p>Hi [First name],</p>
      <p>Thanks for choosing [Business] for [job]. If you're happy with how it went, would you take 60 seconds to leave us a Google review? It genuinely matters — most of our new customers find us through reviews from people like you: [link, as a button if your tool supports it].</p>
      <p>And if anything wasn't right, please reply to this email — I read every one and I'd rather fix it than not know.</p>
    </blockquote>

    <h2>Timing rules</h2>
    <ul>
      <li>Send SMS between 10am and 7pm only; email any time.</li>
      <li>One follow-up maximum, 5 days later, and only if they haven't clicked the link.</li>
      <li>Never ask the same customer more than once every 6 months, however many jobs you do for them.</li>
      <li>Don't offer incentives for reviews — it breaches Google's policies and Australian Consumer Law expectations around fake or misleading reviews.</li>
    </ul>

    <h2>Handling unhappy responses</h2>
    <p>Both templates deliberately invite unhappy customers to reply privately. Treat any reply within 48 hours as urgent: acknowledge, apologise for the experience (not conditionally), and offer a concrete fix. A complaint resolved well often becomes a five-star review two weeks later — and one you earned twice.</p>

    <h2>Building it in n8n, step by step</h2>
    <ol>
      <li><strong>Trigger node:</strong> Webhook (if your job tool can post on completion) or the Xero/QuickBooks trigger on "invoice paid". Test it with one real job before going further.</li>
      <li><strong>Filter node:</strong> pass only customers with a mobile number or email, and drop any customer tagged "no-marketing".</li>
      <li><strong>Wait node:</strong> fixed delay of 3 hours (keeps the ask same-day for morning jobs, next-morning for late ones when combined with the schedule check below).</li>
      <li><strong>IF node (quiet hours):</strong> check the current hour; if before 10am or after 7pm, route through a second Wait node until 10am.</li>
      <li><strong>Deduplication:</strong> a Data Store (or Google Sheet) keyed by customer phone/email with the last-asked date; IF node skips anyone asked in the last 180 days, then the store is updated for everyone who passes.</li>
      <li><strong>Send:</strong> Twilio (or ClickSend, popular in Australia) node for SMS with the template above; fall back to your email node (SMTP/Resend/Gmail) when there's no mobile.</li>
      <li><strong>Follow-up branch:</strong> Wait 5 days → IF no click (use a shortened link with click tracking, e.g. Switchy or your own redirect log) → send the email version once.</li>
    </ol>
    <p>Run it in n8n's test mode against yesterday's completed jobs before switching the trigger live. Expect a review from roughly one in four asks once it's humming — for a business finishing five jobs a week, that's a top-of-suburb Google profile within six months.</p>
  `,
};

export default item;
