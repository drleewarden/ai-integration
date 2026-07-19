import type { GuideItem } from "@/lib/members/items";

const item: GuideItem = {
  slug: "invoice-reminder-sequence",
  title: "The Polite Invoice Reminder Sequence",
  description:
    "Three ready-to-use reminder emails for 7, 14 and 21 days overdue — firm but warm — plus how to switch them on in Xero and MYOB.",
  type: "guide",
  tier: "free",
  dateAdded: "2026-07-17",
  html: `
    <p>Chasing money is the task business owners put off longest, which is exactly why it should be automated. The sequence below keeps the relationship warm while making sure the invoice never falls off anyone's radar — including yours.</p>

    <h2>Day 7 overdue: the friendly nudge</h2>
    <blockquote>
      <p>Subject: Invoice [number] — just checking it reached you</p>
      <p>Hi [First name],</p>
      <p>A quick one — invoice [number] for [amount] was due on [date] and I can't see it in yet. Odds are it's just slipped through, so here's the invoice again with payment details: [link].</p>
      <p>If it's already on its way, please ignore this. Thanks!</p>
    </blockquote>

    <h2>Day 14 overdue: the direct ask</h2>
    <blockquote>
      <p>Subject: Invoice [number] is now two weeks overdue</p>
      <p>Hi [First name],</p>
      <p>Following up on invoice [number] for [amount], now 14 days past due. Could you let me know when payment will be made, or give me a call if something about the invoice needs sorting?</p>
      <p>Here's the link again for convenience: [link].</p>
    </blockquote>

    <h2>Day 21 overdue: the formal notice</h2>
    <blockquote>
      <p>Subject: Overdue account — invoice [number]</p>
      <p>Hi [First name],</p>
      <p>Invoice [number] for [amount] is now three weeks overdue and I haven't heard back. I'd much rather sort this with a quick reply or phone call than escalate it. Please arrange payment by [date, 7 days out] or contact me to agree a plan.</p>
      <p>[Your name], [phone]</p>
    </blockquote>

    <h2>Switching it on in Xero</h2>
    <p>Business menu → Invoices → Invoice Reminders → turn on reminders. Xero gives you three slots — set them to 7, 14 and 21 days after due date and paste the templates in. Tick "include a link to the online invoice" so customers can pay from the email. You can exclude individual customers (do this for your best long-term clients if you prefer to call them).</p>

    <h2>Switching it on in MYOB</h2>
    <p>In MYOB Business: Sales settings → Reminders → enable automatic reminders and set the same 7/14/21 schedule. MYOB sends from its own address by default — set the reply-to as your accounts email so responses come back to you.</p>

    <h2>When to pick up the phone instead</h2>
    <p>Automation ends at day 21. If the formal notice gets no response within a week, call. A two-minute conversation resolves most stuck invoices — and tells you early when a customer is in real trouble, which no email sequence will.</p>
  `,
};

export default item;
