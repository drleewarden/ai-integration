import type { GuideItem } from "@/lib/members/items";

const item: GuideItem = {
  slug: "client-onboarding-kit",
  title: "The Client Onboarding Automation Kit",
  description:
    "The end-to-end blueprint: enquiry to proposal to contract to kickoff, with the exact automation recipes and email templates for every hand-off in between.",
  type: "guide",
  tier: "pro",
  dateAdded: "2026-07-18",
  html: `
    <p>Winning a client and then onboarding them badly is like nailing the job interview and turning up late on day one. The fix isn't working harder in the gaps — it's wiring the gaps shut. This kit maps the five hand-offs between "yes" and "underway", and gives you the automation recipe and email template for each.</p>

    <h2>The five hand-offs</h2>
    <ol>
      <li>Enquiry → qualified lead</li>
      <li>Qualified lead → proposal sent</li>
      <li>Proposal accepted → contract signed</li>
      <li>Contract signed → paid and scheduled</li>
      <li>Scheduled → kickoff complete</li>
    </ol>
    <p>Every client that goes quiet does so <em>between</em> these stages, not during them. Automate the hand-offs and the pipeline stops leaking.</p>

    <h2>Hand-off 1: Enquiry → qualified lead</h2>
    <p><strong>Recipe:</strong> Contact form submission triggers (a) an instant acknowledgment email and (b) a link to a short qualification form — three questions: rough budget range, timeframe, and what a great outcome looks like. In Zapier/Make: form tool → email step → CRM contact created with answers attached.</p>
    <blockquote>
      <p>Subject: Quick one before we talk</p>
      <p>Hi [First name] — thanks for getting in touch. So our first conversation is useful rather than generic, could you answer three quick questions? Takes under two minutes: [link]. Once that's in, I'll come back with times to talk.</p>
    </blockquote>
    <p>Leads who complete the form close at a dramatically higher rate — and the ones who don't have qualified themselves out at zero cost to you.</p>

    <h2>Hand-off 2: Qualified lead → proposal sent</h2>
    <p><strong>Recipe:</strong> Keep a proposal template with five variable sections: the client's goal (their words, from the qualification form), scope, timeline, investment, next step. Use AI to draft the goal and scope sections from your call notes — paste the notes with: <em>"Draft the 'Your situation' and 'Proposed scope' sections of a proposal from these notes, in my voice, second person, no jargon."</em> Target: proposal out within 48 hours of the call, and say so on the call — it's a differentiator.</p>
    <p><strong>The nudge:</strong> if the proposal isn't opened within 3 days (proposal tools like Better Proposals, PandaDoc or Qwilr all track this), an automated check-in goes out:</p>
    <blockquote>
      <p>Subject: Did the proposal land alright?</p>
      <p>Hi [First name] — just confirming the proposal arrived and opens properly on your end. If anything in it raises questions, a 10-minute call is usually faster than email — here's my calendar: [link].</p>
    </blockquote>

    <h2>Hand-off 3: Accepted → signed</h2>
    <p><strong>Recipe:</strong> Acceptance triggers the contract immediately — same day, ideally same hour. E-signature tools (DocuSign, Annature, or your proposal tool's built-in signing) all connect to Zapier/Make: proposal accepted → contract sent from template → reminder at day 3 and day 7 if unsigned. The template only needs the same five variables as the proposal, so this step can be fully hands-off.</p>

    <h2>Hand-off 4: Signed → paid and scheduled</h2>
    <p><strong>Recipe:</strong> Signature triggers two things at once: the deposit invoice (Xero/MYOB/QuickBooks via the same automation) and a booking link for the kickoff meeting. Payment of the deposit — not the signature — is what flips the project to "confirmed" in your pipeline.</p>
    <blockquote>
      <p>Subject: Two quick things and we're underway</p>
      <p>Hi [First name] — brilliant, contract's in. Two things to lock it in: the deposit invoice is attached (due [date]), and here's the link to book our kickoff: [link]. Once both are done you'll get a welcome pack with everything you need. Looking forward to this.</p>
    </blockquote>

    <h2>Hand-off 5: Scheduled → kickoff complete</h2>
    <p><strong>Recipe:</strong> Deposit paid triggers the welcome pack — one email, three things only: what happens in the first two weeks, exactly what you need from them (files, access, decisions) with a due date, and who to contact about what. Resist the urge to send more; onboarding overwhelm is as damaging as silence. Set an automated task for yourself at day 7: "check [client] has sent their materials" — chasing materials late is the number-one cause of project delays, and it's preventable with one reminder.</p>

    <h2>Build order</h2>
    <p>Don't build all five at once. Sequence: hand-off 1 (biggest leak, easiest build), then 4 (fastest cash-flow impact), then 2, 3, 5. Each is an afternoon's work in Zapier or Make with the templates above. Within a month the entire journey from enquiry to kickoff runs on rails — and every client's first impression of working with you is "these people have their act together".</p>

    <h2>Measure one number</h2>
    <p>Days from enquiry to deposit paid. Write down your current average before you start (be honest — check your last five clients). Most businesses that implement this kit cut it by half or more, and speed here compounds: faster onboarding means fewer cold feet, fewer competing quotes, and revenue landing weeks earlier.</p>
  `,
};

export default item;
