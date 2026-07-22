import type { GuideItem } from "@/lib/members/items";

const item: GuideItem = {
  slug: "meeting-to-actions",
  title: "The Meeting-to-Action-Items Prompt",
  description:
    "One well-tested workflow that turns any meeting transcript or scribbled notes into a clean action list, follow-up email and CRM update — in under two minutes.",
  type: "guide",
  tier: "free",
  dateAdded: "2026-07-18",
  html: `
    <p>Meetings create work in two places: the work you agreed to do, and the work of remembering what you agreed to do. The second kind is pure waste, and it's the easiest thing in your week to hand to AI. This guide gives you one prompt, three output formats, and the habit that makes it stick.</p>

    <h2>Step 1: Capture something — anything</h2>
    <p>The workflow works with whatever you've got: a transcript from Teams, Zoom or Google Meet, a voice memo you've had transcribed, or your own messy typed notes. Don't tidy them first — that's the AI's job. If your video tool offers transcription, switch it on by default and this step takes zero effort.</p>
    <p><strong>One caution before you paste:</strong> if the meeting covered sensitive client details, strip names or use a tool your business has approved for confidential material. (Our AI Usage Policy Template in this library covers how to set that rule for your team.)</p>

    <h2>Step 2: The prompt</h2>
    <p>Paste this, then paste your notes or transcript underneath it:</p>
    <blockquote>
      <p>You are my meeting assistant. Below is a raw transcript/notes from a meeting. Produce three things:</p>
      <p>1. ACTION ITEMS — a list where each line is: [Owner] — [specific action] — [deadline if mentioned, otherwise "no date agreed"]. Only include real commitments, not ideas that were floated.</p>
      <p>2. DECISIONS MADE — each decision in one sentence, with who made the call if it's clear.</p>
      <p>3. FOLLOW-UP EMAIL — a short, friendly email to the other attendees summarising the above, written in plain Australian English, ready to send. No corporate waffle.</p>
      <p>If anything important is ambiguous (an action with no owner, a decision that sounded tentative), list it under "NEEDS CLARIFYING" rather than guessing.</p>
    </blockquote>
    <p>The last line is the part most people skip and it matters most: telling the AI to flag ambiguity instead of papering over it is what makes the output trustworthy.</p>

    <h2>Step 3: The 60-second review</h2>
    <p>Read the action items against your memory of the meeting. You're checking two things: did it invent a commitment nobody made, and did it miss one made in passing? This takes a minute and it's non-negotiable — the AI drafts, you decide.</p>

    <h2>Step 4: Route the outputs</h2>
    <ul>
      <li><strong>Action items</strong> → straight into your task manager or a shared doc. If you use a CRM, paste the summary into the contact's activity notes so the next person who opens the record has context.</li>
      <li><strong>Follow-up email</strong> → send it within the hour. A same-day summary makes you look organised and quietly locks in what was agreed before memories drift.</li>
      <li><strong>Needs clarifying</strong> → these become the first line of your follow-up email: "One thing I want to confirm…"</li>
    </ul>

    <h2>Make it a habit</h2>
    <p>Save the prompt somewhere you can reach in two keystrokes — a text expander, a note pinned in your AI tool, or a saved project/custom instruction if your tool supports them. The whole workflow should cost you less than two minutes per meeting. Across a typical week of five or six meetings, that's an hour of admin gone and — more valuably — nothing agreed in a meeting ever quietly evaporating again.</p>
  `,
};

export default item;
