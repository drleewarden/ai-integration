---
name: ai-native-readiness
description: Audit any repository for AI-agent readiness. Use when the user asks to audit, assess, score, or evaluate a repo for AI readiness, agent readiness, AI-native maturity, or "how ready is this codebase for AI agents". Prompts for a repo URL or local path, asks only the clarifying questions it needs, evaluates 14 evidence-based checks, and produces a levelled markdown report plus a styled PDF.
---

# AI-Native Readiness Audit

Score how ready a repository is for AI coding agents on a four-level ladder,
back every score with evidence, and deliver a markdown report plus a PDF.

| Level | Name | Meaning |
|-------|------|---------|
| 0 | **Manual** | Level 1 not yet reached — AI assistance is high-friction |
| 1 | **Assisted** | AI tools can help a developer safely (R1–R5) |
| 2 | **Collaborative** | Agents can implement changes with human review (R1–R11) |
| 3 | **Autonomous** | Agents can take changes to production safely (R1–R14) |

A level is reached when every check at that level **and below** scores Pass
or Partial. Only a Fail blocks a level; Partials are the improvement backlog.

## Ground rules

- **Read-only.** Never modify the target repository — no file edits, no
  config changes, no test scaffolding. Cloning and running its documented
  build/test/lint commands is fine.
- **Evidence or it didn't happen.** Every score cites file paths, config
  excerpts, or command output. Never guess a capability.
- **Redact secrets.** Before writing any command output into the evidence
  log, replace anything token-, key-, or password-shaped with `[REDACTED]`.
  Never record the contents of `.env` files.
- **Ask only what you cannot determine yourself.** One question at a time.

## Step 1 — Get the target repository

If the user already named a repo or path, use it. Otherwise ask exactly one
question:

> Which repository should I audit? Give me a GitHub URL or a local path.

- **Local path** → confirm it exists and `git -C <path> rev-parse` succeeds.
  Use it in place; do not copy it.
- **GitHub URL** → clone into a working directory:
  1. If `gh auth status` succeeds: `gh repo clone <owner>/<repo>`.
  2. Otherwise `git clone <url>` (works for public repos, or private ones
     when `GITHUB_TOKEN` is exported — never print the token).
  3. If the clone fails with an auth error, ask the user once how they want
     to authenticate (run `gh auth login`, or export `GITHUB_TOKEN`), then
     retry. If it still fails, stop and report the blocker — do not score
     anything.

## Step 2 — Clarify only when needed

Look before you ask. Then ask **only** if genuinely ambiguous:

- **Multiple applications** (several dependency manifests at different
  levels, workspace/monorepo config): list what you found and ask which app
  to audit — offer "the whole repo" as an option. Single-app repos: don't ask.
- **Branch**: audit the default branch unless the user said otherwise. Don't
  ask.

A public single-app repo with defaults gets zero follow-up questions.

## Step 3 — Choose an execution strategy

Some checks (R2, R6, R8) want commands run. Decide the strategy **before**
evaluating, and record it as the first entry in the evidence log:

1. **Native** — the repo's documented commands, if the required runtime is
   installed locally (check `node --version`, `python3 --version`, etc.
   against what the repo needs).
2. **Docker** — if the repo ships Docker/Compose assets *and* `docker info`
   succeeds, use the repo's own containers for build/test/lint.
3. **Static** — otherwise, score from static evidence: CI configs, lockfiles,
   docs, test-directory inspection.

**Evaluator-limitation cap:** when a check can't be fully verified because
of the evaluator's environment (missing runtime, no Docker), score it from
static evidence and cap it at **Partial** — never Fail a check solely
because *you* couldn't run it. Note the limitation in the evidence log.

## Step 4 — Evaluate the 14 checks

Work through R1–R14 in order. For each check:

1. Read its file in `checks/` (R01–R14) — it defines what the check
   measures, the evidence to gather, and the Pass/Partial/Fail bar.
2. Gather the evidence (searches, file reads, safe commands).
3. Score it, then **immediately** append an entry to the evidence log —
   don't batch entries at the end:

```markdown
## R<n> — <check name>
**Commands run:** `<command>` → exit <code>, <one-line result>
**Observed:** <what you directly saw>
**Inferred:** <judgement calls, or "none">
**Score:** Pass | Partial | Fail
```

Check files, in evaluation order:

- `checks/R01-version-control-hygiene.md`
- `checks/R02-one-command-build-and-test.md`
- `checks/R03-navigable-structure.md`
- `checks/R04-docs-an-agent-can-use.md`
- `checks/R05-reviewable-change-flow.md`
- `checks/R06-linting-and-formatting.md`
- `checks/R07-type-safety.md`
- `checks/R08-meaningful-test-suite.md`
- `checks/R09-continuous-integration.md`
- `checks/R10-reproducible-environment.md`
- `checks/R11-dependency-currency.md`
- `checks/R12-automated-deployment-path.md`
- `checks/R13-safe-failure-and-rollback.md`
- `checks/R14-production-observability.md`

Evaluate **all 14 regardless of early failures** — the gap list is the
product, not just the level.

## Step 5 — Score the level

Highest level where every check at it and below is Pass or Partial:

- All of R1–R5 ≥ Partial → at least **Level 1 Assisted**
- …and all of R6–R11 ≥ Partial → at least **Level 2 Collaborative**
- …and all of R12–R14 ≥ Partial → **Level 3 Autonomous**
- Any Fail in R1–R5 → **Level 0 Manual** (lead the report with those gaps)

## Step 6 — Write the report

Fill in `templates/report-template.md`. Output goes to
`./ai-native-readiness/<repo-name>/` (create it if needed):

- `ai-native-readiness-report-YYYY-MM-DD.md`
- `evidence-log-YYYY-MM-DD.md`

Use today's date. Never overwrite an existing dated file — append `-2`
(then `-3`) before `.md` if the name is taken. Recommendations are ordered
by level: everything blocking the next level first, each with a Small /
Medium / Large effort tag and a one-line "why it matters to an agent".

## Step 7 — Generate the PDF

1. Render the finished report as **one standalone HTML file** in the same
   output directory (same basename, `.html`). You wrote the report, so write
   the HTML directly — no converter needed. Inline the entire contents of
   `templates/report.css` in a `<style>` tag. Use semantic HTML (`h1`–`h3`,
   `table`, `section`) and add class names the stylesheet defines:
   `score-pass`, `score-partial`, `score-fail`, `level-badge`, `finding`.
2. Run: `bash scripts/report-to-pdf.sh <report>.html <report>.pdf`
3. If the script exits non-zero, tell the user the HTML report is ready and
   any browser's Print → Save as PDF will produce the same document. Don't
   treat this as a failure of the audit.

## Step 8 — Present the findings

In chat, give: the level (with one-sentence justification), the top three
recommendations, and the paths to the report, evidence log, and PDF. Offer
to walk through any check's evidence.
