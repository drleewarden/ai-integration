/**
 * Creative Milk — AI Readiness Playbook Content Library
 *
 * Version: 1.0
 * Status: Full library for v1.0 launch. No MVP path — reader experience
 * must be finished on launch (per spec).
 *
 * Structure mirrors the composer-types.ts key format exactly.
 * Same inputs → same composition → same content. Deterministic.
 *
 * Key format reference:
 *   honest_read:{band}
 *   tomorrow:{pillar}:{pattern}
 *   pillar_diag:{pillar}:{tier}
 *   focus:{pillar}:wrong:{pattern}
 *   focus:{pillar}:fix:{pattern}
 *   focus:{pillar}:scale:{tier}           tier = early | mid | late
 *   kit:{pillar}:{pattern}
 *   kit:{pillar}:reinforce
 *   trap:band:{band}:{0|1}
 *   trap:pillar:{pillar}:{0|1}
 *   path:{band}:self | hire | partner
 *   about:creative_milk
 *   cta:{band}
 *   cited:productivity
 *   cited:governance
 *
 * Bands:     starting_out | foundational | developing | ai_ready | ai_leader
 * Pillars:   strategy | data | culture | technology | governance
 * Patterns:  q1_low | q2_low | q3_low | composite
 * Scale tier: early (starting_out + foundational) | mid (developing) | late (ai_ready + ai_leader)
 *
 * Voice: Confident-accessible. Direct. No buzzwords. Short sentences for
 * impact, longer for nuance. Name the problem before the solution.
 * Specific outcomes over vague claims.
 */

export const CONTENT_SCHEMA_VERSION = 1;

export const library: Record<string, string> = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 2 — HONEST READS (5 bands × 1 = 5 blocks, ~180–220 words each)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  'honest_read:starting_out': `Your score puts you in the Starting Out band — and that's a more honest position than most businesses admit to being in.

What that looks like in practice: AI is something you've heard about, probably tried once or twice, and haven't yet made a real decision about. The team is watching. There are questions about where to start, whether it's relevant to your specific work, and whether the cost and complexity is worth it. None of those questions are unreasonable.

Most businesses at this level make one of two mistakes: they either do nothing and wait for the hype to settle, or they let one enthusiastic person run an unchecked experiment that ends in a data incident or a pile of unusable outputs. This playbook is designed to help you avoid both.

The honest truth about Starting Out: the gap between here and Foundational is not technical. It's a set of decisions — what you'll use, what you won't, and who's responsible. That takes four to six weeks of deliberate work, not a transformation programme. The rest of this playbook is specific to what that looks like for you.`,

  'honest_read:foundational': `Your score puts you in the Foundational band — you've got working knowledge but no system.

What that looks like in practice: a few people on your team using AI tools, mostly ChatGPT or Copilot, mostly for individual tasks. Useful, sometimes impressive, but uneven. The wins are happening in pockets. The losses — the wasted prompts, the policy near-misses, the time spent re-learning the same lessons across people — are happening too, but no one's tracking them.

This is the position most Australian businesses are in right now. It's also the position with the steepest near-term gains available. The gap between Foundational and Developing is usually six to twelve weeks of deliberate work — not a huge investment, but it has to be deliberate. Drift won't get you there.

The problem with Foundational isn't a lack of tools. You probably have access to everything you need already. The problem is that there's no shared way of working with those tools. No consistent inputs, no agreed standards, no one accountable for improving the collective approach. Fix that — systematically, not heroically — and the same tools start producing materially better results. The rest of this playbook is about what that looks like specifically for you.`,

  'honest_read:developing': `Your score puts you in the Developing band — you've moved past experimentation and into something more intentional.

What that looks like in practice: AI is being used regularly, not just by one or two people, and there's some consistency in how it gets used. You probably have a few high-value use cases that are genuinely working. But there are still gaps — between the parts of the business that have adopted AI and the parts that haven't, between what's documented and what's just in people's heads, between the tools you're using and the infrastructure that would make them reliable at scale.

Developing is a transitional band. The ceiling is higher than Foundational, but so is the risk of stalling. The businesses that get stuck here are usually those who treat their early wins as proof the job is done. They're not. They're proof the foundation is worth building on.

The move from Developing to AI Ready is usually about systematising what's working — turning individual skill into shared capability, turning ad hoc use into reliable process. That's six to twelve weeks of focused work if you're deliberate about it. The rest of this playbook is specific to what that work looks like for your situation.`,

  'honest_read:ai_ready': `Your score puts you in the AI Ready band — this is a meaningful position. Most businesses haven't reached it.

What that looks like in practice: AI is genuinely embedded in how your team works. There are real systems — not just tools — and people know how to use them. You've solved problems that most businesses are still arguing about: data handling, policy, quality control, shared knowledge. The capability is real.

The risk at AI Ready is a different kind than the risks below it. It's not "are we using AI?" — you are. It's "are we using it on the right things?" and "are we building capacity or dependency?" Businesses at this level sometimes lose ground not by going backwards but by staying still while the landscape moves. The tools change. The best use cases evolve. The team's capabilities need to keep growing.

The move from AI Ready to AI Leader is less about fixing gaps and more about extending intentionally — identifying where AI can change the economics of your work, not just the efficiency of it. That's a strategic question as much as a technical one. The rest of this playbook is specific to where your current edges are and what to do about them.`,

  'honest_read:ai_leader': `Your score puts you in the AI Leader band — you're in the top tier of businesses we assess, and that reflects genuine, deliberate work.

What that looks like in practice: AI is not an add-on to your business. It's embedded in how you deliver, how you make decisions, and increasingly how you're structured. Your team isn't just using tools — they're building capability. You have policies, processes, and a culture that treats AI as a serious discipline, not a productivity shortcut.

The challenge at AI Leader isn't catching up. It's staying ahead of your own systems. At this level, the biggest risks tend to be internal: capability concentrated in a few people, processes that were right six months ago but haven't been updated, tools that have evolved faster than your team's understanding of them. None of these are crises. But they compound quietly.

What distinguishes the businesses that maintain their lead from those that slide back is a discipline around review — regularly asking whether what's working is still the best version of it. This playbook identifies where those reviews are most due for your specific situation. The gains available here are incremental, but the base is large enough that incremental still adds up to something material.`,


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 2 — TOMORROW MORNING CALLOUTS
  // 5 pillars × 4 patterns = 20 keys (spec says 15, but composite makes 20
  // since we have q1_low, q2_low, q3_low, composite per pillar)
  // Each: one action-specific sentence. Opens with "If you only do one
  // thing this week..."
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Strategy
  'tomorrow:strategy:q1_low': `If you only do one thing this week, decide — and write down — one thing you will use AI for deliberately this quarter and why, and one thing you won't and why. Two sentences each. Share it with whoever needs to know.`,
  'tomorrow:strategy:q2_low': `If you only do one thing this week, spend 30 minutes listing three specific tasks in your work that involve repetitive drafting, summarising, or formatting — these are your first AI candidates.`,
  'tomorrow:strategy:q3_low': `If you only do one thing this week, before using AI for your next task, spend two minutes asking: does this task need accuracy, speed, or creativity — and is AI actually the right tool for that need?`,
  'tomorrow:strategy:composite': `If you only do one thing this week, write a one-paragraph "AI point of view" for your business: one thing you'll use AI for deliberately, and one thing you won't — and share it with whoever needs to know.`,

  // Data
  'tomorrow:data:q1_low': `If you only do one thing this week, identify one dataset your business relies on and write down in plain English whether it's clean, consistent, and complete enough for an AI tool to use reliably.`,
  'tomorrow:data:q2_low': `If you only do one thing this week, list every AI tool your team currently uses and check each one's data policy — specifically whether it trains on submitted content by default.`,
  'tomorrow:data:q3_low': `If you only do one thing this week, pick your most common AI use case and write down every piece of context about your business that's relevant to it — the background the AI currently doesn't have. That document is your starting point.`,
  'tomorrow:data:composite': `If you only do one thing this week, audit the information you're currently feeding into AI tools and write down what's missing — what your AI can't see that would make its outputs materially better.`,

  // Culture
  'tomorrow:culture:q1_low': `If you only do one thing this week, find one task you're currently doing manually and run it through an AI tool — just to see what it produces, with no pressure to use the result.`,
  'tomorrow:culture:q2_low': `If you only do one thing this week, find one person on your team who's using AI effectively and ask them to show you what they're doing and why it's working.`,
  'tomorrow:culture:q3_low': `If you only do one thing this week, identify one recent piece of AI-generated work and check it against what you know to be true — get in the habit of verifying before publishing or acting.`,
  'tomorrow:culture:composite': `If you only do one thing this week, have a 15-minute team conversation about AI: what people are using, what's working, and what one shared norm you could adopt this month.`,

  // Technology
  'tomorrow:technology:q1_low': `If you only do one thing this week, spend 45 minutes with one AI tool — not to complete a task, but just to understand what it can do by asking it about itself and trying three different types of request.`,
  'tomorrow:technology:q2_low': `If you only do one thing this week, take one prompt you've already used and rewrite it with three times as much context — be specific about who you are, what you need, and what good output looks like — then compare the results.`,
  'tomorrow:technology:q3_low': `If you only do one thing this week, read one piece of AI industry news that's relevant to your sector and consider what it would mean for your business if it became mainstream in the next 12 months.`,
  'tomorrow:technology:composite': `If you only do one thing this week, pick the AI tool you use most and spend 90 minutes reading its documentation — specifically the features you haven't tried yet.`,

  // Governance
  'tomorrow:governance:q1_low': `If you only do one thing this week, write a one-paragraph AI policy for your business — what data never goes into an AI tool, who's accountable for AI outputs, and what to do if something feels wrong.`,
  'tomorrow:governance:q2_low': `If you only do one thing this week, read the AI usage policy that exists in your business (or if there isn't one, decide who should write it and when).`,
  'tomorrow:governance:q3_low': `If you only do one thing this week, list the three biggest risks of using AI incorrectly in your specific work — then write down who you'd tell if one of those risks materialised.`,
  'tomorrow:governance:composite': `If you only do one thing this week, write down three questions your business currently can't answer about its AI use — who's using what, what data is being shared, and what happens when something goes wrong — then decide who owns finding the answers.`,


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 3 — PILLAR DIAGNOSTICS
  // 5 pillars × 3 tiers = 15 blocks, each ~60–80 words
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Strategy
  'pillar_diag:strategy:deep_gap': `The signal here is that AI use in your business is either absent or reactive — responding to tools that appear rather than making deliberate choices about which problems AI should solve. Without a point of view on strategy, you're more likely to adopt the wrong tools, in the wrong order, for the wrong reasons. The businesses that make the fastest progress here are those that make decisions about AI explicitly, even when those decisions are small.`,

  'pillar_diag:strategy:moderate_gap': `You have a working sense of where AI applies to your work, but the evaluation is still mostly intuitive. You're using AI where it's obvious, potentially missing it where it isn't, and sometimes applying it to tasks where it adds noise rather than value. Developing a more deliberate framework — even a simple one — for deciding when AI is the right tool would pay off in fewer wasted hours and better-quality outputs.`,

  'pillar_diag:strategy:strong': `Strategy is a genuine strength. You have a clear point of view on what AI is for in your business, you evaluate opportunities with some rigour, and you're not chasing every new tool. Protect this by keeping the framework alive — revisiting your AI priorities quarterly as capabilities change, and making sure the discipline you've built doesn't erode as AI use grows and the temptation to let it sprawl increases.`,

  // Data
  'pillar_diag:data:deep_gap': `The signal here is that AI is being fed scattered, inconsistent inputs. Customer data lives in one place, project data in another, knowledge in people's heads. Every AI use right now is being held back by what the tool can actually see — which isn't much. Fix this and the same tools start producing materially better outputs without changing the tools at all.`,

  'pillar_diag:data:moderate_gap': `You understand that data quality matters for AI, and you're taking some care with what you share and how. But there are gaps — probably in how consistently context is provided to AI tools, how sensitive data is handled across different team members, or how prepared your underlying data is for more advanced use. These gaps are producing outputs that are usable but not as good as they could be.`,

  'pillar_diag:data:strong': `Data is a genuine strength. You understand what AI needs to perform well, you handle sensitive information carefully, and you're providing good context in your prompts. Protect this by keeping your data handling practices documented and shared — as AI use grows and more people interact with these tools, the standards you've set need to travel with them rather than living in your head.`,

  // Culture
  'pillar_diag:culture:deep_gap': `The signal here is resistance or passivity — AI either feels threatening, irrelevant, or not worth the learning curve. That's a legitimate position to hold, but it's becoming a competitive one. The businesses that are pulling ahead on AI aren't doing so because they have better tools — they're doing so because they have teams who are genuinely curious, willing to experiment, and honest about what's working. Shifting that culture is a leadership job, not a technology one.`,

  'pillar_diag:culture:moderate_gap': `There's openness to AI on your team, but it's unevenly distributed. Some people are getting real value from it; others are sceptical, untrained, or just not exposed. The risk at this level isn't resistance — it's fragility. AI capability concentrated in one or two people is a retention risk and a knowledge-sharing problem. The goal is moving from individual skill to team capability.`,

  'pillar_diag:culture:strong': `Culture is a genuine strength. Your team approaches AI with curiosity, shares what's working, and applies appropriate human judgment rather than treating AI outputs as gospel. Protect this by making the norms explicit — written down, not just modelled by you. As the team grows or changes, the culture you've built needs to be transmissible, not just observable.`,

  // Technology
  'pillar_diag:technology:deep_gap': `The signal here is that the tools are under-leveraged or misunderstood. You're likely using one or two AI tools at a surface level — asking basic questions, getting generic outputs, and not yet understanding why the results are inconsistent. The gap isn't about having the wrong tools. It's about not yet knowing how to get the right things out of the tools you have.`,

  'pillar_diag:technology:moderate_gap': `You're using AI tools with some competence, but there's likely a ceiling you haven't broken through yet. Prompts are working, but not reliably. You know about a broader range of tools than you're actually using. Staying current feels like effort rather than habit. The move from here to strong is mostly about deliberate practice — not new tools, but deeper skill with the ones that matter most for your work.`,

  'pillar_diag:technology:strong': `Technology is a genuine strength. You have a broad, current understanding of AI tools, you can write effective prompts, and you stay informed without being distracted by every new release. Protect this by sharing what you know — your team's overall capability is limited by its weakest users, not its strongest, and your knowledge has more leverage if it's distributed.`,

  // Governance
  'pillar_diag:governance:deep_gap': `The signal here is that AI use is happening without guardrails. No written policy, no clarity on what data can and can't be shared with AI tools, no agreed approach to handling AI outputs before they go out the door. This isn't a theoretical risk — it's a live one. Most AI governance failures aren't discovered during audits. They're discovered when something goes wrong. The cost of writing a policy now is a few hours. The cost of not having one is harder to predict.`,

  'pillar_diag:governance:moderate_gap': `You have some awareness of AI governance — there's probably a policy that exists in some form, and you think about ethics and data sensitivity at least occasionally. But it's not consistent. Different people have different interpretations of the rules. The ethical considerations happen ad hoc rather than systematically. This is the governance equivalent of locking the front door but leaving the back window open.`,

  'pillar_diag:governance:strong': `Governance is a genuine strength. You have a written AI policy, you apply ethical consideration to AI decisions, and you know what to do when something doesn't feel right. Protect this by treating the policy as a living document — updating it as tools evolve and new risks emerge, and making sure new team members are genuinely onboarded to it rather than just handed a document.`,


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGES 4–6 — FOCUS AREAS
  // 5 pillars × 4 patterns × 3 block types (wrong / fix / scale) = 60 blocks
  // Plus scale has 3 tiers (early / mid / late) = 5 × 3 = 15 scale blocks
  // Total: 5 × (4+4) + 5×3 = 40 wrong+fix + 15 scale = 55 blocks
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── STRATEGY ─────────────────────────────────────────────────────────────

  // Q1 low: no awareness of AI strategy
  'focus:strategy:wrong:q1_low': `You don't yet have a point of view on what AI is for in your business — and the absence of that view is itself a decision, made by default rather than deliberately. What tends to happen without a strategy is either paralysis ("we'll wait and see") or scatter ("everyone does their own thing"). Both are expensive. Paralysis means you're falling behind competitors who are making real gains. Scatter means effort is being wasted on tools that don't connect to anything, and the lessons learned by one person never reach the rest of the team. A strategy doesn't need to be a document. It can be a conversation that produces a shared position. But it needs to happen.`,

  'focus:strategy:fix:q1_low': `Build a one-page AI point of view for your business. Not a technology roadmap — a set of decisions about what AI is for here.

- **Week 1:** List every function in your business (sales, ops, delivery, finance, marketing, etc.). For each, write one sentence on the most obvious AI candidate task. Don't filter yet — just generate the list.
- **Week 2:** Narrow to three AI applications that you'll actively pursue this quarter. For each, write down the metric you'll use to know if it's working (time saved, quality improved, errors reduced).
- **Week 3:** Write one sentence on what you will NOT use AI for, and why. This is as important as the yes list — it sets a quality standard and prevents drift.
- **Week 4:** Share this with your team. It doesn't need to be formal. A Slack message or a 15-minute meeting is enough. The goal is a shared position, not a strategy document.

This process typically takes three to four hours of thinking spread across a month. What it produces is clarity — which is what every subsequent AI decision depends on.`,

  // Q2 low: can't spot AI opportunities
  'focus:strategy:wrong:q2_low': `You're using AI for the obvious tasks but not yet seeing it as a lens for examining your work more broadly. This means you're getting some value from AI, but you're probably leaving most of it on the table. The businesses that get the most from AI aren't using better tools — they're using the same tools but asking a better question before they start: "Is there a part of this task that is repetitive, information-processing, or pattern-matching?" Those three categories cover an enormous amount of knowledge-work. Developing the habit of asking that question changes what you see.`,

  'focus:strategy:fix:q2_low': `Build the habit of opportunity-spotting by running a structured audit of your most common tasks.

- **Week 1:** List your ten most time-consuming recurring tasks. For each, classify it: is the core work repetitive, information-processing, or pattern-matching? Those are AI-suited. Is it relationship-based, judgment-heavy, or context-dependent in ways AI can't access? Those are not.
- **Week 2:** Pick the two or three tasks that scored highest on the first list and run an experiment. Don't aim for perfection — aim for a usable first output. Note where AI helped and where you had to compensate.
- **Week 3:** Based on the experiments, write a simple decision rule for your team: "We use AI for [x types of tasks]. We don't for [y types]." One sentence each is fine.
- **Week 4:** Share the rule and the experiments. Other people on your team have their own task lists — the rule helps them spot opportunities you haven't seen.

The goal isn't to automate everything. It's to develop a reliable eye for where AI earns its place.`,

  // Q3 low: no evaluation framework
  'focus:strategy:wrong:q3_low': `You're using AI reactively rather than evaluatively — trying it and seeing what happens, rather than deciding upfront whether it's the right tool for the job. This produces inconsistent outcomes. Sometimes AI saves time; sometimes it creates rework because the output needs heavy correction. Sometimes the quality is genuinely better; sometimes it's generically plausible but specifically wrong. Without a framework for deciding when AI adds value, you can't systematically improve your hit rate. You're relying on feel, which doesn't transfer to the rest of your team and doesn't improve reliably over time.`,

  'focus:strategy:fix:q3_low': `Build a simple three-question evaluation process for AI use, and run every new use case through it before committing.

- **Question 1 — What's the cost of being wrong?** If the AI produces something inaccurate or low-quality, what happens? High-stakes outputs (client communications, financial summaries, legal documents) need more human oversight than low-stakes ones (internal notes, draft ideas, research summaries).
- **Question 2 — Does AI have what it needs?** AI performs well when it has good inputs: relevant context, clear instructions, and accurate background information. If you can't provide that, the output will be generic regardless of how good the tool is.
- **Question 3 — Is the effort of using AI less than the effort of not using it?** This sounds obvious, but writing a good prompt for a complex task can take longer than doing the task directly. The break-even point varies by task.

Run this three-question check for your next ten AI uses. You'll quickly build a mental model of where AI consistently earns its place in your specific work — and where it doesn't.`,

  // Composite: across-the-board strategy weakness
  'focus:strategy:wrong:composite': `Your strategy pillar shows weakness across the board — not just in one area. You don't yet have a clear sense of what AI is for in your business, struggle to identify where it applies, and evaluate its use mostly by feel. The compounding effect of these gaps is significant: without a strategy, AI adoption defaults to whatever the most enthusiastic person in the room decides. Without opportunity-spotting, value gets left on the table. Without evaluation, time gets wasted on the wrong things. None of these is catastrophic individually. Together, they make AI use unpredictable — which makes it hard to improve and even harder to build on.`,

  'focus:strategy:fix:composite': `The fix for across-the-board strategy weakness is sequential. Don't try to address all three gaps at once.

- **Week 1–2:** Start with a 90-minute workshop (solo or with your leadership team). Answer three questions: What three tasks in our business are the most obvious AI candidates? What does success look like — time, quality, cost? What won't we use AI for, and why? Write down the answers. This gives you a working AI position without a strategy document.
- **Week 3:** Run one experiment based on the three candidates you identified. Pick the lowest-stakes one. Run it for a week. Track what happened.
- **Week 4:** Based on the experiment, update your working position. Add or remove one item from each list. Share the updated version with your team.

The goal at this stage isn't sophistication — it's a shared, written position that you can iterate from. That exists nowhere in your business right now, and its absence is the root cause of most of your current AI friction.`,

  // Scale blocks — Strategy
  'focus:strategy:scale:early': `At Developing level, the point-of-view document evolves into a simple AI roadmap — a quarterly list of what you're building, what you're experimenting with, and what you're watching. That takes the strategy from a position into a practice. Most businesses fixing the strategy gap recover 2–4 hours per person per week once their team is working on the right AI tasks rather than the loudest ones.`,

  'focus:strategy:scale:mid': `At AI Ready level, strategy becomes a competitive differentiator. You're not just deciding what to use — you're identifying AI applications that are specific enough to your business model that competitors can't easily replicate them. The focus shifts from "are we using AI?" to "are we using it on the problems that matter most?" That question gets harder and more valuable as capabilities improve.`,

  'focus:strategy:scale:late': `At AI Leader level, strategy is an ongoing discipline rather than a periodic exercise. You're running a quarterly review of your AI roadmap, retiring things that aren't working, and investing deliberately in the applications that are changing your economics. The goal at this level is compound advantage — each capability built enables the next one, and the gap between you and less deliberate competitors grows.`,


  // ── DATA ──────────────────────────────────────────────────────────────────

  // Q4 low: no understanding of data quality
  'focus:data:wrong:q1_low': `You don't yet see data as a constraint on your AI outputs — but it is the constraint. Every AI tool you use can only be as good as the information it's given. When your data is scattered, incomplete, or inconsistent, the AI's output reflects that. A well-structured prompt sent to ChatGPT with no business context produces a generic answer. The same prompt with specific, accurate, relevant data produces something genuinely useful. The difference has nothing to do with the model and everything to do with the inputs. Right now you're asking an expert for advice without telling them anything about your situation. They're doing their best, but their best is limited by what you've given them.`,

  'focus:data:fix:q1_low': `Build a basic data inventory for your AI use — not a database, just an honest map of what information you have and whether it's fit for purpose.

- **Week 1:** List the five types of information your AI tools currently use. For each: Is it accurate? Is it complete? Is it consistent across your team? Score each on a simple 1–3 scale.
- **Week 2:** For the lowest-scoring items, identify the root cause. Is it held in people's heads? Spread across multiple systems? Never been written down? The diagnosis tells you the fix.
- **Week 3:** Fix one. Choose the data gap that's limiting your highest-value AI use case and spend a week closing it — even partially. A 60% fix to your most important input is worth more than a 100% fix to a marginal one.
- **Week 4:** Document what you did. One page. This becomes your starting point for the data work that comes next.

Better data quality doesn't require new tools or new systems. It requires decision-making about which data matters and discipline about keeping it accurate.`,

  // Q5 low: treating AI like a Google search with sensitive data
  'focus:data:wrong:q2_low': `You're treating AI tools like a Google search — pasting information in without thinking much about where it goes or what happens to it. That's understandable; the interface invites it. But the risk is real. Most free-tier AI tools use submitted content to improve their models unless you opt out — which means customer data, financial information, or sensitive business context you paste into a prompt may not stay private. And once it's out, it's out. This isn't a reason to stop using AI. It's a reason to know which tools handle which types of data, and to make that call deliberately rather than by default.`,

  'focus:data:fix:q2_low': `Audit your current AI tool use and build a simple data handling rule for your team.

- **Week 1:** List every AI tool your team uses. For each, look up its data retention and training policy (usually in the terms of service or a dedicated privacy page). Classify each tool: "safe for sensitive data" / "general use only" / "needs further review."
- **Week 2:** Map your common data types (customer names, financial figures, internal strategy documents, personal information) to the appropriate tier of tool. Write it down in one page.
- **Week 3:** Share this with your team. Not as a lecture — as a practical guide. "Here's what we use, here's what goes where, here's why." Five minutes in a team meeting is enough.
- **Week 4:** Add it to your onboarding materials. Every new person who joins and uses AI tools should see this before they start.

The goal isn't to restrict AI use. It's to make the decisions deliberately rather than by accident — which protects you, your clients, and your business.`,

  // Q6 low: generic outputs because generic inputs
  'focus:data:wrong:q3_low': `Your AI outputs are generic because your inputs are generic. You're pasting raw questions into ChatGPT and getting back generic answers — because there's no context about your business, your customers, or your work in what you're sending. Most people in your position assume "AI just isn't very good at this" when actually the AI hasn't been given the information it needs to be good at it. The fix is upstream of the prompt. It's not about using different words — it's about including the background that turns a generic question into a specific one. An AI that knows your pricing, your typical clients, your service model, and your tone of voice produces fundamentally different outputs than one that knows none of those things.`,

  'focus:data:fix:q3_low': `Build a "context pack" for your AI work — one document per recurring use case that contains the relevant facts the AI needs.

- **Week 1:** Pick your three most common AI use cases (proposals, customer emails, sales follow-ups, whatever applies). For each, write a 1-page context pack: your services and pricing, your typical client profile, examples of past work you're happy with, and your tone of voice in plain English.
- **Week 2:** Use them. Paste the relevant context pack into every prompt before the question. Note what's now better and what's still missing. Add to the packs as you go.
- **Week 3:** Share the packs with one teammate. Get them using the same context. Refine based on their feedback — what was missing for them is probably missing for others too.
- **Week 4:** Decide which packs need to live in a shared location (a Google Doc, a shared drive folder, a Notion page) and which are fine as personal templates.

The same model (ChatGPT, Claude, Copilot) will produce noticeably better work within two weeks. No new tools, no new spending — just better inputs.`,

  // Composite: across-the-board data weakness
  'focus:data:wrong:composite': `Your data pillar shows weakness across all three dimensions — understanding, safety, and preparation. You don't yet have a clear view of what AI needs from your data, you're not consistently careful about what you share, and the context you're providing in prompts is too thin to produce reliably useful outputs. These three problems compound: poor inputs produce poor outputs, which makes AI feel unreliable, which reduces investment in getting the inputs right. The cycle is fixable, but it needs to be broken deliberately rather than left to drift.`,

  'focus:data:fix:composite': `Address all three data gaps in sequence over four weeks.

- **Week 1 — Map your data landscape.** List the information types your business works with. Classify each: is it sensitive (customer PII, financials, confidential strategy)? Is it structured (in a CRM, spreadsheet, or database)? Is it documented at all? This map is the foundation for everything that follows.
- **Week 2 — Fix the safety gap first.** Review your AI tools' data policies. Write a one-page guide: what goes where, and what never goes into an AI tool without explicit approval. Share it with your team this week.
- **Week 3 — Build one context pack.** Pick your most common AI use case and write the background document your AI tool needs — services, client profile, examples, tone. Use it for every prompt this week and observe the difference.
- **Week 4 — Document and share.** Put the data policy guide and the context pack somewhere your team can find them. These two documents are your entire data infrastructure for now — simple, but real.

The businesses that get AI working reliably have almost always done this work. It's not glamorous, but it's what the quality depends on.`,

  // Scale blocks — Data
  'focus:data:scale:early': `At Developing level, context packs evolve into a knowledge base your AI tools can read directly — connected to your CRM, your past work, your documentation. The AI starts working with full context every time without anyone having to paste it in. That's a 6–8 week project done properly, but the context-pack discipline is what makes it pay off when you get there. Most businesses fixing data foundations recover 2–4 hours per person per week once AI tools are working with quality inputs rather than generic ones.`,

  'focus:data:scale:mid': `At AI Ready level, your data infrastructure becomes a genuine competitive asset. You're not just feeding AI better prompts — you're connecting it to live business data, running it against your actual customer history, and using it to surface patterns that a human reviewer would miss. The quality difference between AI working with rich, accurate business context and AI working with generic prompts is not marginal. It's the difference between a useful tool and a transformative one.`,

  'focus:data:scale:late': `At AI Leader level, data strategy is inseparable from AI strategy. You're thinking about what data you need to collect now to enable AI applications that aren't yet ready to build. You have data quality standards, review cycles, and ownership — not as overhead, but as the infrastructure that makes everything else reliable. The businesses that maintain an AI advantage long-term are invariably the ones that treat their data as a strategic asset rather than an operational byproduct.`,


  // ── CULTURE ───────────────────────────────────────────────────────────────

  // Q7 low: resistant to AI
  'focus:culture:wrong:q1_low': `There's resistance to AI in your business — either your own, your team's, or both. That's worth taking seriously rather than dismissing. Resistance to AI usually has one of three sources: concern about quality ("I don't trust it"), concern about relevance ("it doesn't apply to what we do"), or concern about displacement ("it might take my job"). All three are legitimate enough to address directly. The problem is that unaddressed resistance doesn't stay neutral — it becomes a blocker. While competitors experiment and iterate, a resistant team watches. The gap that feels philosophical now becomes operational within twelve months.`,

  'focus:culture:fix:q1_low': `Address the resistance directly — not by dismissing it, but by running a structured conversation about it.

- **Week 1:** Have a 30-minute team conversation (or a solo reflection if you're a sole trader) with a specific agenda: What would have to be true about AI for it to be worth using here? What would have to be true for it not to be worth it? This surfaces the actual objections rather than letting them stay vague.
- **Week 2:** Run one low-stakes experiment specifically chosen to address the dominant objection. If the concern is quality, pick a task where quality is easy to verify. If it's relevance, pick the task most similar to your core work. If it's displacement, pick a task that frees up time for higher-value work.
- **Week 3:** Review the experiment honestly. What was better? What was worse? What surprised you? Write it down — even two paragraphs.
- **Week 4:** Share the result with the team. The goal isn't "look, AI is great." It's "here's what we actually found." An honest outcome, even a mixed one, builds more trust than a cheerleading campaign.

Resistance that's examined tends to soften. Resistance that's managed tends to harden.`,

  // Q8 low: avoids learning new AI tools
  'focus:culture:wrong:q2_low': `Your team isn't investing in AI learning — and as a result, capability isn't growing. You're using the same tools at the same level you were using them six months ago, while the tools themselves have improved significantly and competitors who are investing in learning are pulling ahead. The gap isn't between your team and AI experts. It's between deliberate learners and passive users. Deliberate learners spend an hour a week experimenting. Passive users stick to what they know. Over a year, those hours compound into a significant capability gap.`,

  'focus:culture:fix:q2_low': `Build a lightweight learning rhythm into your team's working week.

- **Week 1:** Identify one person on your team (or yourself) who's most open to AI learning. Make them the designated experimenter for the next month — not a full-time AI person, just someone who spends one hour a week deliberately trying something new and reporting back.
- **Week 2:** Set up a simple knowledge-sharing mechanism. A Slack channel, a shared note, a monthly 15-minute team update — whatever fits your culture. The format matters less than the habit.
- **Week 3:** Pick one AI skill to develop this month as a team. Prompting, specific tool features, a new use case. One focused thing, not a curriculum.
- **Week 4:** Review what was learned and what to focus on next month. Rotate the experimenter role if the team is big enough to spread the load.

One hour a week of deliberate AI practice, shared across a team, compounds fast. You don't need a training programme. You need a habit.`,

  // Q9 low: imbalanced AI vs human judgment
  'focus:culture:wrong:q3_low': `Your team hasn't yet developed a reliable sense of when to trust AI and when to override it. This shows up in two directions: over-trusting (publishing AI outputs without checking, making decisions based on AI summaries without verifying the source) and under-trusting (dismissing AI outputs that would actually be useful, doing work manually because "I'm not sure I can rely on it"). Both are expensive. Over-trust creates errors and reputation risk. Under-trust leaves capability on the table. The goal isn't a rule about when to trust AI — it's a team-level instinct that develops through deliberate practice and honest conversation about what's working.`,

  'focus:culture:fix:q3_low': `Build the verification habit and the trust calibration at the same time.

- **Week 1:** Identify two recent AI outputs your team used — one where you checked it carefully, one where you used it more directly. For each: what were the stakes? What was the quality? Was the level of checking appropriate? Write this down.
- **Week 2:** Create a simple internal rule based on stakes, not source. "High-stakes outputs (client-facing, financial, legal) always get human review before use. Low-stakes outputs (internal drafts, research summaries, rough ideas) use your judgment." One sentence. Share it with the team.
- **Week 3:** Run one week deliberately applying the rule. When someone uses an AI output for a high-stakes purpose, add one step: read the whole thing, not just the headline.
- **Week 4:** Debrief. Did the rule work? Did anything surprise you? Update it based on what you found.

Trust in AI tools isn't binary — it's calibrated through use. The teams that get this right have a shared sense of what AI is reliable for, built through honest review of what's actually happened.`,

  // Composite: across-the-board culture weakness
  'focus:culture:wrong:composite': `Your culture pillar shows weakness across the board — attitude, learning, and judgment are all underdeveloped. This is the most systemic of the five gaps, because culture is what every other change depends on. You can build the best data infrastructure and governance policy in the world, but if the team doesn't engage with AI genuinely and thoughtfully, those systems don't get used. And culture doesn't change through announcements — it changes through experience, modelling, and conversation. The good news is that culture is also the fastest pillar to move when it's approached directly.`,

  'focus:culture:fix:composite': `Culture change at this level requires a deliberate leadership intervention, not a policy.

- **Week 1:** Have an honest team conversation about AI. Not a presentation, a conversation. What's the current attitude? What are the real concerns? What would make people more open to experimenting? Listen more than you speak. Write down what you hear.
- **Week 2:** Based on the conversation, remove the biggest barrier. If it's "we don't have time," carve out one hour a week explicitly. If it's "we don't know what to try," give everyone one specific task to run through AI this week. If it's "we don't trust the quality," set up a review step that addresses the concern directly.
- **Week 3:** Model the behaviour you want to see. Use AI visibly, share what you tried, report honestly on what worked and what didn't. Teams take their cues from leadership on what's legitimate to do.
- **Week 4:** Celebrate a specific example. Find one thing someone on your team did with AI this month that produced a better outcome. Name it, share it, and make clear that this is the kind of thing you want to see more of.

Culture change is slow until it tips. The tipping point is usually a concrete, visible win that makes the investment feel real to people who were on the fence.`,

  // Scale blocks — Culture
  'focus:culture:scale:early': `At Developing level, culture becomes a structural advantage. Teams that have genuinely bought in to AI aren't just using it more — they're using it better, sharing learnings, and iterating faster than teams where AI is imposed rather than adopted. Most businesses that fix culture gaps recover 2–4 hours per person per week — not just from AI efficiency, but from reduced friction and rework. The learning investment pays back quickly.`,

  'focus:culture:scale:mid': `At AI Ready level, culture is what protects your AI investment. Capability doesn't erode if people are engaged, curious, and honest about what's working. It does erode if AI use becomes rote — same tools, same prompts, same level of engagement month after month. The teams that maintain their advantage are those that treat AI as a discipline: something you can always get better at, something worth talking about, something that deserves honest review.`,

  'focus:culture:scale:late': `At AI Leader level, culture is a recruiting and retention differentiator. People who want to do ambitious, high-quality work with AI want to be on teams that take it seriously. Your culture — the way your team talks about AI, learns from it, and holds each other to high standards — is now part of your employer brand. Protect it explicitly: in how you hire, how you onboard, and how you lead.`,


  // ── TECHNOLOGY ────────────────────────────────────────────────────────────

  // Q10 low: not familiar with AI tool landscape
  'focus:technology:wrong:q1_low': `You're not yet familiar with the AI tool landscape — and as a result, you're either not using AI at all, or using one tool (probably ChatGPT) for everything, whether it's the best fit or not. The AI tool space has diversified rapidly. There are now tools purpose-built for writing, coding, research, customer communication, image generation, document processing, and dozens of other categories. Using a general-purpose chatbot for a specialised task is like using a Swiss Army knife when what you need is a chef's knife — it works, sort of, but you're not getting the best outcome available. The first step is knowing what's out there.`,

  'focus:technology:fix:q1_low': `Build a working knowledge of the tool landscape through deliberate exploration — not by trying everything, but by understanding the categories.

- **Week 1:** Spend 90 minutes mapping the major AI tool categories relevant to your work. Writing assistants. Research tools. Document processors. Meeting transcription. Image generation. Code assistants. For each category, identify one tool to evaluate (not necessarily use — just understand).
- **Week 2:** Try two tools you've never used before on a real task. Not a toy task — something from your actual work. Compare the output to what you'd get from your current tool.
- **Week 3:** Based on what you found, update your tool set. Drop one tool you're using out of habit if you found something better. Add one new tool for a use case you're currently handling manually.
- **Week 4:** Share what you found with your team. A 10-minute overview of "what's out there and what we've decided to use" is more valuable than a research report — it's a decision that the team can act on.

The goal isn't to stay current with every new release. It's to have a working map of the categories that matter for your work, and a habit of revisiting it quarterly.`,

  // Q11 low: can't write effective prompts
  'focus:technology:wrong:q2_low': `You're getting basic results from AI tools but not good ones — and the gap is almost certainly in how you're prompting. Most people start with prompts that are too short, too vague, or too passive. "Write a proposal for a client" produces generic output because the AI doesn't know who the client is, what the proposal is for, what tone you want, or what the proposal needs to achieve. Better prompts aren't magic — they're just more specific. They give the AI a role, a context, a task, and a format. Once you understand that structure, the improvement in output quality is immediate and consistent.`,

  'focus:technology:fix:q2_low': `Learn the four-part prompt structure and practice it deliberately for four weeks.

- **Week 1 — Role + Context:** Add two things to every prompt this week: a role ("Act as an experienced copywriter...") and a context ("...writing for a B2B professional services firm that works with mid-sized manufacturers"). Just these two additions will noticeably improve output quality.
- **Week 2 — Task + Constraints:** Add a specific task ("Write a one-page executive summary of...") and constraints ("Keep it under 300 words. No jargon. Lead with the problem we solved, not our company history."). The constraints are where most of the quality control lives.
- **Week 3 — Format + Examples:** Start specifying the format you want ("Return this as three bullet points" / "Write this as a professional email" / "Give me three options, not one.") and, where possible, include an example of good output ("Here's a summary I wrote last month that I'm happy with — match this style.").
- **Week 4 — Iterate:** For your most important use case, write three different versions of the same prompt and compare the outputs. The goal isn't to find the perfect prompt — it's to develop the instinct for what changes output quality.

Prompting is a learnable skill. Most people who think "AI isn't very good at this" have never moved past a one-line request.`,

  // Q12 low: doesn't follow AI developments
  'focus:technology:wrong:q3_low': `You're not keeping up with AI developments — and the pace of change is fast enough that this matters. AI tools are releasing major capability updates monthly, not annually. Things that weren't possible six months ago are now standard features. Things that required expensive specialist work are now accessible to any team with a subscription. Without some awareness of what's changing, you're making decisions based on the AI landscape as it existed when you last paid attention — which is increasingly different from how it actually is.`,

  'focus:technology:fix:q3_low': `Build a lightweight AI monitoring habit that takes 20–30 minutes a week.

- **Week 1:** Subscribe to two sources that cover AI in a way that's relevant to business use (not just tech news). Ben's Bites and The Rundown AI are good starting points. Set aside 20 minutes on Friday to read whatever came through that week.
- **Week 2:** Pick one tool you're already using and spend 30 minutes reading its release notes or changelog from the last three months. Most AI tools have added significant features in recent months — you may be missing capabilities you're paying for.
- **Week 3:** Identify one recent AI development that's relevant to your industry specifically. Write two sentences on what it would mean for your work if it became mainstream.
- **Week 4:** Set a quarterly calendar reminder to do a tool audit — a 90-minute review of whether your current tool set is still the best available for your use cases. This doesn't mean switching tools every quarter; it means making an informed decision about whether to switch.

The goal isn't to track every announcement. It's to ensure that the decisions you're making about AI are based on current information rather than outdated assumptions.`,

  // Composite: across-the-board technology weakness
  'focus:technology:wrong:composite': `Your technology pillar shows weakness across all three dimensions — tool knowledge, prompting skill, and staying current. These compound in a specific way: limited tool knowledge means you default to one or two familiar tools; poor prompting means those tools underperform even for the use cases they're built for; not staying current means the gap between what you're doing and what's possible keeps growing. The result is a consistent experience of AI as mediocre — which reinforces the conclusion that it's not worth investing in, which perpetuates all three gaps.`,

  'focus:technology:fix:composite': `Address the technology gaps in order of leverage: prompting first, then tool knowledge, then current awareness.

- **Week 1–2 — Prompting.** This has the highest immediate impact. Add role, context, task, and constraints to every prompt. Compare outputs before and after. The improvement will be significant and will make the case for the other investments.
- **Week 3 — Tool audit.** Spend 90 minutes mapping what you have and what you're missing. For your two or three most important use cases, is there a better tool than what you're using? Research it, try it, decide.
- **Week 4 — Current awareness.** Set up a 20-minute weekly reading habit. Pick two sources, commit to reading them for a month before evaluating whether they're useful.

These three investments, done in sequence over four weeks, will meaningfully change your experience of AI tools — from occasional and unreliable to regular and useful. That shift in experience is what motivates the ongoing investment.`,

  // Scale blocks — Technology
  'focus:technology:scale:early': `At Developing level, technology skill becomes a team asset rather than an individual one. You're training people on prompting, maintaining a shared library of effective prompts for common use cases, and making deliberate decisions about your tool stack rather than letting it grow by default. Most businesses fixing technology gaps recover 2–4 hours per person per week once the team is prompting effectively and using tools that fit their actual use cases.`,

  'focus:technology:scale:mid': `At AI Ready level, technology is about integration rather than just skill. You're connecting AI tools to your systems, building workflows where AI handles one step and humans handle the next, and evaluating tools based on their API capabilities and integration potential — not just their chat interface. The technology ceiling is much higher than most businesses have reached.`,

  'focus:technology:scale:late': `At AI Leader level, technology strategy is a genuine competitive function. You have a tool portfolio that's been deliberately curated, a prompting library that captures your team's best work, and a process for evaluating new tools against real criteria rather than hype. You're also building on top of AI tools — not just using them — which gives you capabilities that aren't available off the shelf.`,


  // ── GOVERNANCE ────────────────────────────────────────────────────────────

  // Q13 low: no awareness of AI policies
  'focus:governance:wrong:q1_low': `There are no AI usage policies in your business that people are aware of — which means every person using an AI tool is making their own decisions about what's acceptable, what data can be shared, and what can be published without review. This isn't a theoretical risk. It's a live one that gets realised in predictable ways: a team member pastes client data into a free AI tool that logs it, an AI-generated document goes out to a client without fact-checking, someone uses AI for a task where the output needs to be verifiably human-produced. None of these are catastrophic individually. Together they create liability, reputational risk, and the kind of incident that's much harder to recover from than it is to prevent.`,

  'focus:governance:fix:q1_low': `Write a one-page AI policy and make it findable. This is four hours of work.

- **Part 1 — Data rules.** What types of data must never go into an AI tool (customer PII, financial details, confidential strategy)? What can go in with care? What's unrestricted? One paragraph.
- **Part 2 — Output rules.** Which types of AI output must be reviewed by a human before use (client-facing content, financial summaries, legal documents)? Which can be used more directly? One paragraph.
- **Part 3 — Accountability.** Who's responsible for AI quality in your business? Who do you escalate to if something feels wrong? This can be one person in a small team. Just name them.
- **Part 4 — Review date.** AI moves fast. This policy needs a six-month review built in. Add it to your calendar now.

Share it in your team Slack/email this week. You don't need a launch event — just put it somewhere findable and let people know it exists. The existence of a written policy changes behaviour even before anyone reads it carefully.`,

  // Q14 low: no ethical consideration
  'focus:governance:wrong:q2_low': `You're not yet applying ethical consideration to your AI use — which means decisions about AI are being made on convenience rather than principle. This matters in practical ways: AI systems can produce biased outputs that favour certain groups and disadvantage others; AI-generated content can be factually wrong in confident-sounding ways that are easy to miss; AI tools used in hiring, lending, or performance assessment can encode and amplify existing biases at scale. You don't need a philosophy degree to navigate this. You need a habit of asking, before using AI for a consequential task: who could be affected by a bad output here, and what would we do if it happened?`,

  'focus:governance:fix:q2_low': `Build an ethics check into your AI workflow — not as a bureaucratic step, but as a professional habit.

- **Week 1:** Write three questions that apply to every significant AI use in your business: (1) Could this output harm or disadvantage anyone if it's wrong or biased? (2) Is the AI being used transparently — do relevant stakeholders know? (3) Who's accountable for this output? Put these questions somewhere visible.
- **Week 2:** Apply the questions to the AI tasks you did last week. Not to stop them — just to see whether you'd have answered them the same way if you'd been asked in advance.
- **Week 3:** Identify the one AI use case in your business with the highest ethical stakes. Write a one-paragraph note on what could go wrong and what your current mitigation is.
- **Week 4:** Share the note with anyone else who uses AI for that task. Not as a warning — as a shared understanding of what careful use looks like for this specific case.

Ethical AI use is mostly a matter of asking the right questions before acting rather than after something goes wrong. The habit is simple. The failure to build it is where most problems originate.`,

  // Q15 low: can't identify or escalate AI risks
  'focus:governance:wrong:q3_low': `You can't consistently identify AI-related risks or escalate them when something goes wrong. This is the last line of defence in any governance system — and right now it's not functioning. Risk identification means recognising when an AI output might be wrong, biased, or inappropriate before it causes harm. Escalation means knowing who to tell and what to do. Without these, governance exists on paper but not in practice. The policy document doesn't protect you if the people using AI can't spot the situations where the policy is being breached.`,

  'focus:governance:fix:q3_low': `Build the risk recognition and escalation capability through a combination of education and practice.

- **Week 1:** Write a list of the five most common AI risks in your specific type of work. For a services business, these typically include: hallucinated facts, biased outputs, inappropriate data handling, plagiarism/IP issues, and over-reliance on AI judgment for decisions that require human accountability. For each, write one example of what it looks like in practice.
- **Week 2:** Share the list with your team. Ask them to add any risks you've missed. The conversation that results is more valuable than the document.
- **Week 3:** Add a risk check to your AI workflow for high-stakes tasks. Before finalising AI-assisted work that goes to a client or a decision-maker, one person asks: "Is there anything in here that could be wrong, biased, or inappropriate?" Not a formal audit — just a pause and a question.
- **Week 4:** Establish a simple escalation path. Who do people go to if they find a risk? What happens next? Write it in two sentences and add it to the policy document.

Risk management at this level is not about eliminating AI errors — they happen and always will. It's about having enough awareness to catch the important ones before they matter.`,

  // Composite: across-the-board governance weakness
  'focus:governance:wrong:composite': `Your governance pillar shows weakness across all three dimensions — policy, ethics, and risk. This is the gap with the most binary failure profile: in the other pillars, weak performance mostly means you're leaving value on the table. In governance, it means you're accumulating risk that's invisible until it becomes an incident. A data breach, a client complaint about AI-generated content, an employment decision that's later challenged as discriminatory — these events tend to happen suddenly and have effects that compound. The cost of building governance properly now is a few weeks of focused work. The cost of not building it is harder to predict, but reliably worse.`,

  'focus:governance:fix:composite': `Build all three governance foundations in sequence. Don't try to do them simultaneously.

- **Week 1 — Policy.** Write the one-page AI policy. Data rules, output rules, accountability, review date. Share it. This establishes the framework for everything else.
- **Week 2 — Ethics.** Add the three ethics questions to your AI workflow (who's affected if this is wrong? Is it transparent? Who's accountable?). Apply them to your three highest-stakes AI use cases.
- **Week 3 — Risk.** Write the five most common AI risks in your type of work. Add a risk check to your high-stakes output process. Establish a two-sentence escalation path and add it to the policy.
- **Week 4 — Test.** Run a simple scenario with your team: "Here's a situation where AI produced something problematic. What would we do?" This shouldn't be theoretical — pick a plausible scenario from your actual work. The conversation reveals what's working and what isn't.

Businesses without written AI governance typically discover the gap during an incident, not before. Four weeks of focused work prevents most of the incidents that matter.`,

  // Scale blocks — Governance
  'focus:governance:scale:early': `At Developing level, governance becomes proactive rather than reactive. You're not just responding to risks — you're reviewing AI use quarterly to check whether the policy is keeping pace with how the tools and team are actually being used. Businesses without a written AI policy typically discover the gap during an incident, not before. The avoided cost of that incident is the return on the governance investment.`,

  'focus:governance:scale:mid': `At AI Ready level, governance is a quality assurance function as much as a risk function. You have systematic reviews of AI outputs in high-stakes areas, a policy that's been tested against real situations, and a team that applies ethical consideration without prompting. The goal at this level is making governance as low-friction as possible while maintaining the protection it provides.`,

  'focus:governance:scale:late': `At AI Leader level, governance is a differentiator. Your clients, your team, and your partners know that AI use in your business is thoughtful, documented, and accountable. That trust is worth protecting. It's built through consistent action over time and eroded quickly by a single visible failure. Keep the policy current, keep the ethics practice alive, and treat governance review as a leadership responsibility rather than an administrative one.`,


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CITED CLAIMS (2 blocks)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  'cited:productivity': `Most businesses fixing this recover 2–4 hours per person per week — a 5–10% time saving — once AI tools are working with quality inputs and a capable team behind them. (Sources: itbrief.com.au, "AI tools slash labour time for four out of five firms"; St. Louis Fed, "Impact of Generative AI on Work Productivity," Feb 2025.)`,

  'cited:governance': `Businesses without a written AI policy typically discover the gap during an incident, not before. The cost of policy-writing is measured in hours. The cost of a data breach, a client complaint, or a regulatory inquiry is not.`,


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 7 — STARTING KIT ACTIONS
  // 5 pillars × 4 patterns + 5 pillars × 1 reinforce = 25 blocks
  // Each: ~50–80 words with a specific deliverable
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Strategy kit actions
  'kit:strategy:q1_low': `**Write your AI point of view.** A single page: three AI applications you'll invest in this quarter, one thing you won't use AI for and why, and the principle that guides the calls. Share it with your team by end of the week. *Deliverable: one-page AI position document, shared with the team.*`,

  'kit:strategy:q2_low': `**Run an opportunity audit.** Take your ten most common recurring tasks and classify each: is the core work repetitive, information-processing, or pattern-matching (AI-suited), or is it judgment-heavy, relationship-based, or context-dependent in ways AI can't access (not AI-suited)? *Deliverable: ranked list of your top three AI opportunities for this quarter.*`,

  'kit:strategy:q3_low': `**Build your evaluation habit.** Before your next ten uses of AI, ask three questions: What's the cost of being wrong? Does AI have what it needs to do this well? Is the effort of using AI less than the effort of not using it? Document the answers for the first three cases. *Deliverable: written evaluation notes for three AI tasks, shared with whoever else uses AI in your team.*`,

  'kit:strategy:composite': `**Run a 90-minute strategy session.** Solo or with your leadership team: list your AI candidates, narrow to three, and write one sentence on what you won't use AI for. Then share the output. This is the entire AI strategy foundation your business needs right now — simple, written, shared. *Deliverable: one-page AI strategy summary distributed to your team.*`,

  'kit:strategy:reinforce': `**Review your AI strategy quarterly.** Schedule 60 minutes this month to ask: Are the three AI applications we committed to still the right ones? Are they working? Has anything changed that should change our position? Retire what isn't working. Add what's emerged. *Deliverable: updated AI strategy document with a quarterly review date set in your calendar.*`,

  // Data kit actions
  'kit:data:q1_low': `**Map your data landscape.** List the five types of information your AI tools currently use. For each, score data quality on a 1–3 scale across accuracy, completeness, and consistency. Identify the one gap that's most limiting your best AI use case. *Deliverable: one-page data quality map, with the highest-priority gap flagged for action.*`,

  'kit:data:q2_low': `**Audit your AI tools' data policies.** For every AI tool your team uses, check its data retention and training policy. Classify each: safe for sensitive data, general use only, or needs review. Write a one-page guide on what goes where. Share it this week. *Deliverable: data handling guide shared with your team, referenced in onboarding for new staff.*`,

  'kit:data:q3_low': `**Build your first context pack.** Pick your single most common AI use case. Write a one-page background document: your services and pricing, your typical client profile, examples of past work you're happy with, your tone of voice. Use it in every prompt this week and refine based on what's still missing. *Deliverable: one complete, tested context pack, ready to share with your team.*`,

  'kit:data:composite': `**Build a data foundation in three steps.** Week one: map your data landscape and identify the biggest quality gap. Week two: write the data handling guide for your AI tools. Week three: build one context pack for your most important use case. These three documents are your entire data infrastructure for now — simple but real. *Deliverable: data landscape map, data handling guide, and one context pack.*`,

  'kit:data:reinforce': `**Run a data quality review.** Revisit your context packs and data handling guide. Are they still accurate? Have new tools or use cases been added? Is anyone on your team working without the right context? Update what's outdated, fill any gaps, and make sure the documents are in a shared location everyone knows about. *Deliverable: updated context packs and data handling guide, with a review date set for next quarter.*`,

  // Culture kit actions
  'kit:culture:q1_low': `**Run an honest team conversation about AI.** Not a presentation — a conversation. What's the current attitude? What are the real concerns? What would make people more open to experimenting? Listen more than you speak. Write down what you hear and decide on one concrete action based on it. *Deliverable: written notes from the conversation and one specific commitment to change something.*`,

  'kit:culture:q2_low': `**Build a learning habit.** Identify the person on your team most open to AI learning and make them the designated experimenter for the next month — one hour a week, one new thing tried, one update to the team. Set up a simple channel or shared note for sharing what's found. *Deliverable: named experimenter, sharing mechanism in place, first update shared by end of the month.*`,

  'kit:culture:q3_low': `**Establish your verification norm.** Write a single rule your team will apply to AI outputs: "High-stakes outputs (client-facing, financial, legal) always get human review before use." Share it this week. For the next month, apply it consistently and note any cases where it caught something that would otherwise have gone out. *Deliverable: written norm shared with the team, with one example of it working documented by end of the month.*`,

  'kit:culture:composite': `**Run a month-long culture shift.** Week one: honest conversation, written concerns, one commitment. Week two: remove the biggest barrier to experimenting. Week three: model the behaviour — use AI visibly and share what happened honestly. Week four: celebrate one specific win from someone on your team. *Deliverable: visible, repeated leadership action on AI culture — the deliverable is behaviour, not a document.*`,

  'kit:culture:reinforce': `**Codify your team's AI norms.** Write down the three things your team does well with AI — the practices, habits, or standards that have developed organically and are worth keeping. Put them somewhere findable and reference them when onboarding new people. Make the culture transmissible, not just observable. *Deliverable: one-page "how we use AI here" document, shared with the team and added to onboarding materials.*`,

  // Technology kit actions
  'kit:technology:q1_low': `**Map the tool landscape.** Spend 90 minutes categorising the AI tools relevant to your work: writing, research, document processing, meeting transcription, image generation, code. For each category, identify one tool to evaluate. Try two unfamiliar tools on real tasks this week and compare the output to your current approach. *Deliverable: tool landscape map with two new tools evaluated and a decision on whether to adopt either.*`,

  'kit:technology:q2_low': `**Master the four-part prompt.** For the next two weeks, use this structure on every AI task: Role ("Act as...") + Context ("...for a business that...") + Task ("Write/summarise/analyse...") + Constraints ("Under X words, no jargon, lead with..."). Compare outputs before and after. *Deliverable: written prompt template for your three most common AI use cases, tested and refined.*`,

  'kit:technology:q3_low': `**Build a monitoring habit.** Subscribe to two AI newsletters relevant to business use. Set 20 minutes on Friday to read what came through. Once a month, spend 30 minutes reading your most-used tool's changelog — the features you haven't tried yet. Set a quarterly tool audit in your calendar. *Deliverable: two newsletter subscriptions, a standing Friday reading slot, and a quarterly tool audit scheduled.*`,

  'kit:technology:composite': `**Build technology skills in order: prompting first, then tools, then awareness.** Week one and two: apply the four-part prompt structure to everything. Week three: audit your tool set and evaluate one alternative. Week four: set up your monitoring habit. Each investment makes the next one more valuable. *Deliverable: prompt templates for your top use cases, updated tool set, and a monitoring routine in place.*`,

  'kit:technology:reinforce': `**Deepen your strongest tool.** Pick the AI tool you use most. Spend 90 minutes reading its documentation — specifically the features you haven't tried. Find three capabilities you've been missing. Run them on real work this week. Then share what you found with your team. *Deliverable: three new features identified and tested, with a written summary shared with the team.*`,

  // Governance kit actions
  'kit:governance:q1_low': `**Write your AI policy.** Four parts: what data never goes into AI tools, which outputs need human review before use, who's accountable for AI quality, and a six-month review date. One page is enough. Share it in your team channel or email this week and add it to your onboarding materials. *Deliverable: one-page AI policy, shared with the team, referenced in onboarding.*`,

  'kit:governance:q2_low': `**Build your ethics habit.** Write three questions to apply before every significant AI use: Could this output harm someone if it's wrong? Is it transparent — do affected parties know? Who's accountable for this output? Apply them to your three highest-stakes AI use cases this week. *Deliverable: three ethics questions written down, applied to three specific use cases, and shared with anyone else making the same types of AI-assisted decisions.*`,

  'kit:governance:q3_low': `**Build your risk radar.** List the five most common AI risks in your type of work. Add a risk check to your process for high-stakes AI tasks: one person asks "Is there anything here that could be wrong, biased, or inappropriate?" Write a two-sentence escalation path — who do people go to and what happens next — and add it to your policy. *Deliverable: risk list, risk check process, and escalation path, all added to the AI policy document.*`,

  'kit:governance:composite': `**Build governance in sequence over four weeks.** Week one: write and share the policy. Week two: add the three ethics questions to your workflow. Week three: build the risk list and escalation path. Week four: run a team scenario exercise — "here's an AI situation, what do we do?" — and identify what your governance still doesn't cover. *Deliverable: complete one-page AI policy with ethics and risk frameworks integrated.*`,

  'kit:governance:reinforce': `**Run a governance review.** Pull out your AI policy and read it against how your team is actually working. Has anything changed — new tools, new use cases, new team members — that the policy doesn't cover? Update it. Resurface it with the team. Make sure new people are genuinely onboarded to it, not just handed the document. *Deliverable: updated AI policy with a new review date, re-shared with the full team.*`,


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 8 — COMMON TRAPS
  // Band library: 5 bands × 2 traps = 10 blocks
  // Pillar library: 5 pillars × 2 traps = 10 blocks
  // Total: 20 blocks, each ~30–50 words (name + 1 sentence + why it matters)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Band traps — Starting Out
  'trap:band:starting_out:0': `**The "We'll Wait and See" Trap.** Deciding not to decide about AI because the technology is still evolving. Every month of waiting is a month of learning that your competitors are getting instead — and the gap compounds.`,

  'trap:band:starting_out:1': `**The One Brave Volunteer.** Letting the one person who's excited about AI own all the AI work, rather than building shared capability. When they leave, everything leaves with them. And they will leave.`,

  // Band traps — Foundational
  'trap:band:foundational:0': `**The Tool-of-the-Week Cycle.** You install a new AI tool every fortnight, get excited, use it twice, abandon it. The fix isn't fewer tools — it's getting genuinely good at one before adding another.`,

  'trap:band:foundational:1': `**Policy by Email Thread.** "I think we agreed we shouldn't put customer data in ChatGPT?" Your AI policy lives in a Slack message from June. Write it down. One page is enough.`,

  // Band traps — Developing
  'trap:band:developing:0': `**The Pocket Win That Stayed in the Pocket.** One part of your business is doing impressive things with AI. The rest of the business doesn't know about it. Isolated wins don't compound. Shared wins do.`,

  'trap:band:developing:1': `**Confusing Activity with Progress.** You're using AI constantly but can't name three specific outcomes that are materially better because of it. If you can't measure it, you can't improve it — and you can't justify the investment when someone asks.`,

  // Band traps — AI Ready
  'trap:band:ai_ready:0': `**The Capability Plateau.** You've reached a level that feels good and stopped pushing. AI tools, use cases, and team skills have all been static for six months. Standing still in a moving field is the same as going backwards.`,

  'trap:band:ai_ready:1': `**The Expert Bottleneck.** AI requests route through one or two people who are "good at it" rather than being handled by the people who know the work. The bottleneck limits scale and concentrates risk. Distribute the capability.`,

  // Band traps — AI Leader
  'trap:band:ai_leader:0': `**The Infrastructure That Outlived Its Purpose.** You built a workflow or system six months ago that made sense then. The tools have changed, the use case has evolved, but the process is still running. Review cycles exist for a reason.`,

  'trap:band:ai_leader:1': `**Assuming the Lead Is Safe.** Being ahead in AI feels more secure than it is. The businesses catching up are learning from your public work, hiring people who've seen what works, and moving faster because they're following rather than pioneering. Staying ahead requires deliberate effort.`,

  // Pillar traps — Strategy
  'trap:pillar:strategy:0': `**The Prompt Library Mirage.** You've saved 50 prompts in a shared folder. No one uses them because they're decontextualised — prompts only work when the person using them understands why they're structured the way they are. Share the thinking, not just the prompt.`,

  'trap:pillar:strategy:1': `**Optimising the Wrong Thing.** You've used AI to make an existing process faster without asking whether the process should exist at all. Speed is a multiplier — it makes good processes better and bad processes worse, faster.`,

  // Pillar traps — Data
  'trap:pillar:data:0': `**Garbage In, Sophisticated Out.** Your prompts are excellent. Your data is scattered. The AI produces confident, well-structured answers that are specifically wrong because it's working from incomplete or inconsistent inputs. Quality of outputs is a data problem before it's a prompting problem.`,

  'trap:pillar:data:1': `**The Private-Data Reflex.** You're so cautious about data privacy that you're withholding context that would be entirely safe to include — and your AI outputs are generic as a result. The goal is appropriate caution, not maximum caution.`,

  // Pillar traps — Culture
  'trap:pillar:culture:0': `**The Lone Champion.** One person on your team is doing all the interesting AI work. When they leave, it leaves with them. Make AI someone's job for a quarter, but build the team's capability deliberately.`,

  'trap:pillar:culture:1': `**The Forced Adoption Problem.** Someone decided the team would use AI, issued instructions, and checked the box. The team nods in meetings and reverts to old methods afterward. Adoption driven by mandate is fragile. Adoption driven by demonstrated value is durable.`,

  // Pillar traps — Technology
  'trap:pillar:technology:0': `**The Model Upgrade Distraction.** Every time a new model releases, you spend a week evaluating it and half a week migrating. Meanwhile, you're using 30% of the previous model's capabilities. Depth beats breadth almost every time in AI tool use.`,

  'trap:pillar:technology:1': `**Prompting for the First Draft.** You've built a solid prompting habit, but you're still using AI outputs as first drafts that need significant rework — when better prompts would produce outputs that only need light editing. The ceiling on your current prompting is higher than you've reached.`,

  // Pillar traps — Governance
  'trap:pillar:governance:0': `**The Policy That No One Has Read.** You have an AI policy. It's in a shared drive somewhere. New team members are handed the link. No one who actually uses AI day-to-day could tell you what it says. A policy that isn't known isn't protecting you.`,

  'trap:pillar:governance:1': `**The Ethics Check That Happens After.** You review AI outputs for bias and accuracy after they've been used or sent — rather than before. At that point, the damage is already done. Build the check into the workflow, not the retrospective.`,


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 9 — WHERE THIS USUALLY GOES NEXT (PATH FRAMINGS)
  // 5 bands × 3 paths = 15 blocks, each ~80–100 words
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Starting Out
  'path:starting_out:self': `**Self-implement.** At Starting Out, this is usually the right first move. The foundations — a position, a policy, a couple of experiments — don't require outside help. They require someone in your business to make decisions and follow through. The risk is choosing the wrong starting point. This makes sense when: you have someone internally who can commit 2–3 hours a week to it for the next month, and you're comfortable with the starting point this playbook has identified.`,

  'path:starting_out:hire': `**Hire internally.** Not yet. At Starting Out, hiring an AI specialist before you know what you need is expensive. You'll end up with someone doing work that isn't connected to your actual problems, and you won't have enough context to evaluate whether they're doing it well. This makes sense when: you've done 3–6 months of deliberate work and have identified a specific, recurring AI function that needs dedicated time.`,

  'path:starting_out:partner': `**Bring in a partner.** This makes sense for Starting Out businesses that want to get to Foundational faster than self-implementation allows, or that don't have internal capacity to drive it. A good partner gets you to a working foundation in 4–6 weeks rather than 3–6 months of stop-start effort. This makes sense when: you want structured progress, not DIY iteration, and you can commit to a defined engagement rather than ad hoc advice.`,

  // Foundational
  'path:foundational:self': `**Self-implement.** This is viable at Foundational — you have enough foundation to build from. The risk is pace: self-implementation tends to drift when competing priorities appear. If you go this route, the single most important thing is a named owner and a weekly hour committed to it. This makes sense when: there's someone in your business who genuinely wants to own this, has the time to do it properly, and has the judgment to make good calls with the guidance in this playbook.`,

  'path:foundational:hire': `**Hire internally.** Not yet — but you're getting closer to the point where it makes sense. Once you've moved to Developing through self-implementation, an internal hire becomes a natural next step to maintain the pace. This makes sense when: AI use is generating enough value that dedicating headcount to it has a clear business case, and you have specific AI functions that need ongoing ownership rather than periodic attention.`,

  'path:foundational:partner': `**Bring in a partner.** This is often the fastest path from Foundational to Developing for a business that wants to move quickly without dedicating internal resource to the transition. A good partner brings structure, a clear starting point, and accountability for the outcome. This makes sense when: you've tried self-implementation and stalled, or you want to accelerate past Developing and are willing to invest to get there.`,

  // Developing
  'path:developing:self': `**Self-implement.** You have enough foundation and capability to continue self-implementing, and for most Developing businesses this is the right choice. The challenge at this stage is specificity — the next moves are more specific and more varied than the early ones, and knowing which to prioritise requires good judgment about your business. This makes sense when: you have a clear picture of what's next (based on this playbook), someone who owns it, and the time to execute.`,

  'path:developing:hire': `**Hire internally.** At Developing, this starts to make real sense — particularly if AI use is generating consistent value and you're finding that the person informally driving it is doing so on top of a full-time role. An internal hire consolidates the work, builds institutional knowledge, and provides continuity as AI keeps evolving. This makes sense when: AI is generating measurable business value, the informal AI lead is stretched, and there's a clear 12-month mandate for the role.`,

  'path:developing:partner': `**Bring in a partner.** This is valuable at Developing for two specific situations: you've got a complex build ahead of you (a specific AI integration or automation project) that's beyond your team's current technical capability, or you want a structured review of your AI approach before committing to the next phase. This makes sense when: the next move is sufficiently complex or high-stakes that independent expertise would reduce the risk of getting it wrong.`,

  // AI Ready
  'path:ai_ready:self': `**Self-implement.** You're capable of self-implementing the next phase — you have the foundation, the skills, and the judgment. The risk at AI Ready is less about capability and more about prioritisation. There are many directions you could take AI; not all of them have equal returns. Self-implementing well at this stage means being disciplined about choosing the highest-value moves rather than the most interesting ones. This makes sense when: you have a clear view of your next priority and the internal bandwidth to execute it properly.`,

  'path:ai_ready:hire': `**Hire internally.** At AI Ready, an internal hire is often the right call — particularly if AI is now central enough to your operations that it deserves dedicated ownership. The question is what kind of hire: a generalist who can drive AI strategy across the business, or a specialist who can build in a specific area. The answer depends on which gap is most limiting your progress. This makes sense when: AI is a consistent source of value, internal capacity to drive it is genuinely constrained, and you have a 12-month mandate that justifies the investment.`,

  'path:ai_ready:partner': `**Bring in a partner.** For AI Ready businesses, a partner relationship is most valuable when you're working on something specific and complex — a major workflow automation, a data integration, a custom AI build — rather than for general AI support. You have enough capability to run the programme yourself; a partner adds expertise in specific areas you don't have internally. This makes sense when: there's a defined project with a clear scope, and the outcome is specific enough that you'd know whether it worked.`,

  // AI Leader
  'path:ai_leader:self': `**Self-implement.** At AI Leader, you're capable of driving the next phase internally, and for many of the moves ahead, you should. You know your business better than any outside party, and the work at this level is increasingly context-specific. The risk is confirmation bias — continuing to invest in what's worked rather than questioning whether the next move should look different. This makes sense when: the next priority is clear, you have internal capability to execute it, and you have a structured review process to check your direction.`,

  'path:ai_leader:hire': `**Hire internally.** For AI Leaders, internal hiring is often the move that enables the next phase of compounding. What you hire depends on the gap: a technical AI specialist to build more sophisticated integrations, a data engineer to improve your AI's information environment, or a people leader to systematise AI capability development across a growing team. This makes sense when: a specific gap in internal capability is the primary constraint on progress, and the value of closing it exceeds the cost of the hire.`,

  'path:ai_leader:partner': `**Bring in a partner.** At AI Leader, partner relationships work best when they're specific and complementary — you bring the business context and the foundation; they bring a capability you don't have and don't need to build permanently. Think: a specialist to build one ambitious project, an external perspective on your current approach, or an advisory relationship that keeps your thinking challenged. This makes sense when: there's a specific, complex problem that would benefit from outside expertise, and you're clear on what you need from the relationship.`,


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 10 — ABOUT CREATIVE MILK
  // Fixed. One block.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  'about:creative_milk': `**Who we are.** Creative Milk is an AI solutions agency. We work with Australian businesses to build AI capability that actually performs — systems, workflows, and team knowledge that produce real outcomes, not demos. We're not a software company, a staffing agency, or a platform. We're a team of people who build things and measure whether they worked.

**What we do.** We work across strategy, implementation, and capability building — depending on where a business is and what it needs next. Some clients come to us with a specific problem to solve. Some come to rebuild AI foundations that weren't built well the first time. Some come to scale what's already working. The engagement depends on the situation; the standard is the same regardless.

**Our view.** Most AI projects fail not because the technology is wrong but because the foundation is weak — the strategy is vague, the data is messy, the team doesn't know how to use the tools properly, and no one is accountable for the outcome. We fix foundations. We build systems that run without us. And we're honest when a client's problem isn't one we're the right fit for. That's not a disclaimer — it's how we prefer to work.`,


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE 11 — CTA BLOCKS (5 bands × 1 = 5 blocks, ~80 words each)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  'cta:starting_out': `**Book a 30-minute call.** If you're at Starting Out, this call is about figuring out where to start — specifically, for your business, not in general. We'll look at your pillar scores, your actual situation, and give you a concrete answer on what the first move should be. It's a working conversation, not a sales pitch. If we're not the right fit, we'll tell you that too — and point you toward what is. Book the call at the link below, or reach out directly if you'd prefer to start there.`,

  'cta:foundational': `**Book a 30-minute call.** If you're at Foundational, this call is about closing the gap to Developing in the most direct way available for your specific situation. We'll work through your pillar scores, identify the highest-leverage moves, and give you an honest view on whether you're better off self-implementing or getting outside help to accelerate. It's a working conversation, not a sales pitch. If we're not the right fit, we'll tell you. Book the call below, or reach out directly.`,

  'cta:developing': `**Book a 30-minute call.** If you're at Developing, this call is about identifying what's limiting your progress to AI Ready and what the fastest path through those limits looks like for you. We'll look at what's working, what isn't, and what the realistic next moves are — including whether there's a specific project or integration that would unlock the next phase. A working conversation, not a pitch. Book below, or get in touch directly.`,

  'cta:ai_ready': `**Book a 30-minute call.** If you're at AI Ready, this call is about scaling what works and identifying the next meaningful investment. You've built real capability — the question is where it creates the most value from here. We'll look at your current approach, your strongest areas, and where the next phase of compounding is most likely to come from. A working conversation, not a pitch. Book at the link below.`,

  'cta:ai_leader': `**Book a 30-minute call.** If you're at AI Leader, this call is about maintaining and extending a lead that's worth protecting. We'll look at where capability is concentrated, where your approach might be due for review, and whether there are specific projects or investments that would compound what you've built. We work with AI Leader businesses selectively — not every engagement is the right fit, and we'll tell you honestly if this one isn't. Book below.`,

};

/**
 * Type-safe content getter. Returns the block text for a given key,
 * or throws if the key doesn't exist in the library — so missing content
 * fails loudly at development time rather than silently at render time.
 */
export function getContent(key: string): string {
  const value = library[key];
  if (value === undefined) {
    throw new Error(
      `Content library: no entry for key "${key}". ` +
      `Check composer output against library keys. ` +
      `Schema version: ${CONTENT_SCHEMA_VERSION}.`
    );
  }
  return value;
}

/**
 * Soft getter. Returns the block text or undefined if not found.
 * Use in render contexts where a graceful fallback is preferable to a crash.
 */
export function tryGetContent(key: string): string | undefined {
  return library[key];
}

/**
 * Returns every key in the library.
 * Used by completeness checks to verify the library covers all
 * keys the composer can emit.
 */
export function allLibraryKeys(): string[] {
  return Object.keys(library);
}
