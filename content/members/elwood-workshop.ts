import type { GuideItem } from "@/lib/members/items";

const item: GuideItem = {
  slug: "elwood-workshop",
  title: "Elwood Workshop",
  description:
    "Your guide to what we'll discuss in Elwood: practical AI fundamentals, finding the right workflows, building one live, and measuring whether it works.",
  type: "guide",
  tier: "free",
  dateAdded: "2026-08-07",
  html: `
    <p>This workshop is a practical walk-through of where AI can genuinely help a small business right now. We’ll keep the jargon out, work from real business tasks, and build a working example together so you leave knowing what to try next.</p>

    <h2>What we’ll discuss</h2>

    <h3>Why AI matters now</h3>
    <p>We’ll start with the state of AI for small business in 2026: what is hype, what is useful, and where businesses are already seeing meaningful results.</p>

    <h3>AI fundamentals, without the jargon</h3>
    <p>We’ll unpack what large language models actually do, where they are strong, where they fall over, and the three things you need to understand before putting them into a business workflow.</p>

    <h3>Finding the wins in your workflow</h3>
    <p>You’ll learn how to spot repetitive, low-judgement tasks that AI handles well. During a live exercise, you’ll map your own week and identify one useful opportunity worth testing.</p>

    <h3>Building a workflow live</h3>
    <p>We’ll build a real AI-assisted workflow from scratch in the room. The example will be chosen on the day based on what the group needs most, so you can see the decisions, setup and refinement process, not just the finished result.</p>

    <h3>Prompt: install Grill Me and use it on yourself</h3>
    <p>This exercise helps you find the right problem before you build anything. Paste the prompt below into Codex, Claude Code or another assistant that supports agent skills. It will guide you through reviewing and installing Matt Pocock’s <a href="https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md" target="_blank" rel="noreferrer">Grill Me skill</a>, then use it to interview you about your own work.</p>
    <blockquote>
      <p><strong>Help me safely install and run Matt Pocock’s Grill Me skill from https://github.com/mattpocock/skills.</strong></p>
      <p>First, open and review the source for both skills before installing anything:</p>
      <ol>
        <li>skills/productivity/grill-me/SKILL.md</li>
        <li>skills/productivity/grilling/SKILL.md</li>
      </ol>
      <p>Explain in plain English what each skill will do, where it will be installed and whether it requests permissions or can modify files. Wait for my approval before running installation commands.</p>
      <p>After I approve, check that Node.js and npm are available. Install only these two skills from their public source using the supported skill installer. If a terminal command is required, use:</p>
      <p><code>npx skills add https://github.com/mattpocock/skills --skill grill-me</code></p>
      <p><code>npx skills add https://github.com/mattpocock/skills --skill grilling</code></p>
      <p>Show me the installation result. Verify that both <strong>grill-me</strong> and <strong>grilling</strong> are discoverable by my assistant. If my assistant needs a new turn, restart or new session before detecting installed skills, tell me exactly what to do and stop until I confirm it is ready. Do not use a different repository or install unrelated skills.</p>
      <p>Once both skills are available, run <strong>grill-me</strong> on me with this objective:</p>
      <p>“Help me identify the best first AI workflow for my own work. Interview me about what I do, the tasks I repeat, where time is lost, what frustrates customers or colleagues, what information I handle, what must remain human, and what a useful result would look like. Challenge vague answers and unsupported assumptions. For every question, give me your recommended answer or an example before asking me to decide.”</p>
      <p>Ask only one question at a time and wait for my answer. Explore each important branch before moving on. Do not build or automate anything during the interview. When we agree that the interview is complete, give me:</p>
      <ol>
        <li>My three strongest AI workflow opportunities, ranked by value, feasibility and risk.</li>
        <li>The single workflow you recommend I test first, with your reasoning.</li>
        <li>The current baseline I should measure before changing the workflow.</li>
        <li>A small first experiment I can complete within seven days.</li>
        <li>The main privacy, quality and human-review safeguards I need.</li>
        <li>The unanswered questions or assumptions that still need checking.</li>
      </ol>
      <p>Write naturally, avoid generic AI language and never use em dashes.</p>
    </blockquote>

    <h3>Prompt: build a daily email workflow</h3>
    <p>Paste the prompt below into an AI assistant that supports scheduled tasks and has permission to access your email. It will create a daily 10:00 am workflow that reviews your inbox, prepares replies for approval and produces a branded HTML report.</p>
    <blockquote>
      <p><strong>Create a scheduled task named daily-inbox-review that runs every day at 10:00 am in my local timezone.</strong></p>
      <p>On each run, use my connected email service to review every inbox email received since the previous successful run, plus older unread messages and unresolved messages that still require action. Do not scan Spam, Trash, deleted items or my full historical mailbox unless I explicitly approve it.</p>
      <p>For each relevant email:</p>
      <ol>
        <li>Classify it as urgent, action required, waiting, informational, newsletter, receipt or suspected spam.</li>
        <li>Extract the sender, subject, received time, requested action, deadline and a concise plain-English summary.</li>
        <li>Identify any risk, missing information or commitment I should review.</li>
        <li>For messages that need a response, prepare a concise reply in professional Australian English. Match the tone of the sender while remaining clear and warm.</li>
      </ol>
      <p>Never send an email automatically. Save replies as drafts when the email connector supports drafts. Otherwise, include the complete proposed reply in the report for my approval. Never invent facts, prices, availability, deadlines, attachments or commitments. Flag uncertainty and sensitive matters for manual review. Do not draft replies to newsletters, automated notifications, receipts or suspected spam.</p>
      <p>Before saving any draft, run a final AI-slop check. Remove every em dash and rewrite the sentence using a comma, colon, semicolon, parentheses or a full stop. Remove generic openings such as “I hope this email finds you well,” unnecessary summaries of the sender’s message, repetitive conclusions, excessive enthusiasm, vague filler, inflated claims, robotic transitions, needless headings and phrases such as “delve,” “leverage,” “game changer,” “seamless,” “robust,” “in today’s fast-paced world” or “please do not hesitate.” Vary sentence length, use natural contractions where appropriate and make the reply sound like a capable person wrote it specifically for that recipient. Keep useful detail, but delete anything that does not help answer the message. Read the finished draft once more and rewrite any line that still sounds templated or generated by AI.</p>
      <p>Create or replace a standalone HTML file named <strong>daily-inbox-report.html</strong> in the current workspace. Match the Creative Milk interface: warm cream page background, midnight ink header and text, liquid gold accents, Syne-style sans-serif typography, generous spacing, thin borders and accessible contrast. Do not use em dashes.</p>
      <p>The report must include:</p>
      <ol>
        <li>A summary showing the run time, messages reviewed, replies drafted and urgent items.</li>
        <li>An Urgent and Action Required section first.</li>
        <li>A card for each relevant email with its category, sender, subject, summary, deadline and proposed reply.</li>
        <li>Separate Waiting, Informational and Skipped sections.</li>
        <li>A clear notice that all replies require human approval before sending.</li>
      </ol>
      <p>Use semantic HTML and responsive CSS. Escape all email content before inserting it into HTML so message text cannot inject scripts or markup. Do not load remote scripts, tracking pixels, external images or email attachments. Preserve the previous report if the email service is unavailable, and show the error and recovery steps instead of replacing it with an empty report.</p>
      <p>A run is successful only when the inbox review is complete, every proposed reply is saved as a draft or included in the report, the HTML file opens correctly on desktop and mobile, and no email has been sent.</p>
    </blockquote>

    <h3>Measuring impact</h3>
    <p>We’ll cover what to track in week 1, week 4 and week 12. Before you begin, record a simple baseline: how long the task takes now, how often it happens, who does it, what their time costs, and how much rework or delay it creates.</p>

    <h3>Week 1: time saved versus cost</h3>
    <p>Measure the workflow while it is still new. Track the old time per task, the new time per task (including checking and correcting the AI’s work), and the number of times the workflow ran.</p>
    <ul>
      <li><strong>Net time saved:</strong> (old time − new time) × number of runs.</li>
      <li><strong>Value of time saved:</strong> net hours saved × the person’s realistic hourly employment cost.</li>
      <li><strong>Week 1 cost:</strong> tool fees plus the time spent setting up, learning and fixing the workflow.</li>
      <li><strong>Quality check:</strong> record errors, rework and anything that still needs human judgement.</li>
    </ul>
    <p>Do not expect setup week to produce a perfect return. The useful question is whether each run is getting faster without quality dropping.</p>

    <h3>Week 4: calculate a realistic ROI</h3>
    <p>After four weeks, use actual usage rather than estimates. Add the value of time saved and any measurable gains, such as faster response times, extra capacity, fewer mistakes or additional revenue. Then subtract the full monthly cost.</p>
    <p><strong>Monthly ROI:</strong> ((monthly benefit − monthly cost) ÷ monthly cost) × 100.</p>
    <p>Include software, human review, maintenance and a fair share of the original setup time in the cost. Compare the result with your original baseline, check whether people are consistently using the workflow, and calculate the break-even point. A positive ROI is only valuable if quality and customer experience remain steady or improve.</p>
    <p><a href="/members/roi-quick-check"><strong>Open the AI ROI Quick Check</strong></a> to calculate whether the workflow stacks up using your actual time, cost and frequency.</p>

    <h3>Week 12: improve, scale or stop</h3>
    <p>At week 12, look for a sustained trend rather than one strong week. Review total net hours saved, total financial return, output quality, adoption, reliability and any new risks or bottlenecks.</p>
    <ul>
      <li><strong>Scale it</strong> when the return is repeatable, quality is controlled and the team actually uses it.</li>
      <li><strong>Improve it</strong> when the opportunity is sound but review time, errors or poor adoption are reducing the value.</li>
      <li><strong>Stop it</strong> when the full cost continues to outweigh the benefit or the workflow creates unacceptable risk.</li>
    </ul>
    <p>If the result is stable, annualise the 12-week net benefit to estimate its business value. Keep checking it quarterly as costs, tools and behaviour change.</p>

    <h3>Questions and what to do tomorrow</h3>
    <p>We’ll finish with open Q&amp;A and help you choose one concrete next step to take when you return to work.</p>

    <h2>What to bring</h2>
    <ul>
      <li>A laptop and charger.</li>
      <li>One repetitive task from your working week.</li>
      <li>Any examples, notes or source material connected to that task.</li>
      <li>Your questions about where AI could, or should not, fit in your business.</li>
    </ul>

    <h2>What you should leave with</h2>
    <ul>
      <li>A plain-English understanding of what today’s AI tools can and cannot do.</li>
      <li>A simple way to identify worthwhile automation opportunities.</li>
      <li>A working example of an AI-assisted business workflow.</li>
      <li>A measurement plan for checking whether your first experiment is worthwhile.</li>
      <li>One specific action to take next.</li>
    </ul>
  `,
};

export default item;
