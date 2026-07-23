# AI-Native Readiness Audit — downloadable Claude Code skill

**Date:** 2026-07-23
**Status:** Approved (design agreed in session before writing)

## Purpose

A free members-area download: a self-contained Claude Code skill called
`ai-native-readiness` that audits any repository for readiness to work with
AI coding agents. The member unzips it into `~/.claude/skills/`, invokes it,
gives a repo URL (or local path), answers only the questions the skill
genuinely needs, and receives a levelled markdown report plus a styled PDF.

All content is written from scratch for Creative Milk. Nothing is copied
from third-party or employer-internal material: the check wording, level
names, scoring rules, report template, and scripts are original.

## User experience (the person who downloads it)

1. Install: `unzip ai-native-readiness-v1.zip -d ~/.claude/skills/` — the
   zip contains a single `ai-native-readiness/` folder so this lands as
   `~/.claude/skills/ai-native-readiness/`.
2. Invoke in Claude Code: `/ai-native-readiness` (or "audit this repo for
   AI readiness").
3. The skill asks **one** opening question if no repo was given: GitHub URL
   or local path.
4. Follow-up questions are asked **only when needed**: private repo with no
   working `gh` auth / `GITHUB_TOKEN`; ambiguous target app in a monorepo;
   non-default branch. A public repo with defaults gets zero follow-ups.
5. The skill evaluates 14 checks (below), citing evidence for every score.
6. Outputs, in `./ai-native-readiness/<repo-name>/`:
   - `ai-native-readiness-report-YYYY-MM-DD.md`
   - `evidence-log-YYYY-MM-DD.md`
   - `ai-native-readiness-report-YYYY-MM-DD.pdf`
7. Chat summary: level, top three recommendations, link to the files.

## The framework (original)

Maturity ladder — how far AI agents can safely go in this codebase:

| Level | Name | Meaning |
|-------|------|---------|
| 0 | **Manual** | Level 1 not yet reached; AI assistance is high-friction |
| 1 | **Assisted** | AI tools can help a developer safely (R1–R5) |
| 2 | **Collaborative** | Agents can implement changes with human review (R1–R11) |
| 3 | **Autonomous** | Agents can take changes to production safely (R1–R14) |

Each check scores **Pass / Partial / Fail** with cited evidence. A level is
reached when every check at that level *and below* is Pass or Partial —
only a Fail blocks a level. Partials are the improvement backlog.

### Checks

**Level 1 — Assisted**
- **R1 Version control hygiene** — git history is real (not bulk dumps),
  default branch is protected or PR-reviewed by convention, no secrets or
  credential-like values tracked, sane `.gitignore`.
- **R2 One-command build and test** — documented commands exist and work
  deterministically; lockfiles present and honoured.
- **R3 Navigable structure** — modular layout, discoverable entry points,
  no god-files; an agent can find where things live without tribal
  knowledge.
- **R4 Docs an agent can use** — README covers setup/run/test; agent
  context files (`CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`) or equivalent.
- **R5 Reviewable change flow** — small focused PRs are the norm; commit
  messages carry intent; PR template or review conventions visible.

**Level 2 — Collaborative**
- **R6 Linting and formatting** — configured, consistent, enforced (CI or
  hooks), not just installed.
- **R7 Type safety** — static typing (or type-checking) covers the core
  code paths; strictness signals.
- **R8 Meaningful test suite** — tests exercise core logic, runnable
  locally, not just placeholders.
- **R9 Continuous integration** — CI runs build + lint + tests on every PR.
- **R10 Reproducible environment** — pinned runtime versions (`.nvmrc`,
  `.tool-versions`, container images), lockfiles, documented env vars with
  an example file.
- **R11 Dependency currency** — supported framework/runtime versions; no
  EOL majors; a dependency update habit is visible.

**Level 3 — Autonomous**
- **R12 Automated deployment path** — merges deploy through automation
  (pipeline/platform), not manual steps.
- **R13 Safe failure and rollback** — a documented, workable rollback path;
  staged rollout or feature flags where relevant.
- **R14 Production observability** — monitoring/logging/alerting exists and
  is reachable enough that regressions get noticed.

### Evidence and execution strategy

Read-only: the skill never modifies the target repo. Every score cites
files, configs, or command output — no guessed capabilities. Execution
degrades gracefully instead of hard-blocking:

1. Use the repo's documented commands if the runtime is available locally.
2. Else, if the repo ships Docker assets **and** Docker is running, use them.
3. Else score from static evidence (CI configs, lockfiles, docs) and mark
   the limitation in the evidence log; a check capped by evaluator
   limitations scores at most Partial, never Fail-for-that-reason-alone.

## Skill package layout

```
content/members/files/ai-native-readiness/   (source of truth, in this repo)
  SKILL.md              # workflow: prompt → clarify → evaluate → report → PDF
  README.md             # what it is, install, usage, requirements
  checks/R01-version-control-hygiene.md … R14-production-observability.md
  templates/report-template.md
  templates/report.css  # print stylesheet (Creative Milk palette)
  scripts/report-to-pdf.sh
```

Each `checks/R##-*.md` file: what the check means, what to look for
(commands and file patterns), and the Pass/Partial/Fail scoring table.
`SKILL.md` stays lean and defers per-check detail to these files.

### PDF pipeline

1. The skill renders the finished report as a standalone styled HTML file
   (it authored the report, so it writes the HTML directly — no markdown
   converter dependency), inlining `templates/report.css`.
2. `scripts/report-to-pdf.sh <report.html> <out.pdf>` locates a
   Chromium-based browser (Chrome, Edge, Chromium, Brave — macOS app paths
   and PATH) and runs `--headless --print-to-pdf`. Fallbacks in order:
   `wkhtmltopdf`, `weasyprint`, `pandoc`. If none exist, the script exits
   non-zero with a clear message and the skill tells the user the HTML is
   ready to print-to-PDF from any browser.

## Site integration

- **Registry entry** `content/members/ai-native-readiness.ts`:
  `type: "download"`, `tier: "free"`, `dateAdded: "2026-07-23"`,
  `storagePath: "ai-native-readiness/ai-native-readiness-v1.zip"`,
  `fileName: "ai-native-readiness-v1.zip"`. Imported in
  `lib/members/items.ts`. Index page, `[slug]` page, gated download route,
  and activity tracking all derive from the registry — no other site code.
- **Upload script change** (`scripts/upload-member-files.mjs`): current
  behaviour flat-zips (`zip -j`), which would destroy the skill's folder
  structure. Change: when a source folder contains subdirectories, zip
  recursively from `content/members/files/` so the archive holds
  `<slug>/…` and unzips as one folder. Flat folders keep the existing
  flat-zip behaviour, so already-published artefacts are unchanged.
- **Upload**: `node scripts/upload-member-files.mjs ai-native-readiness`
  (reads Supabase URL + service-role key from `.env.local`; key never
  printed).

## Testing

- Existing Jest suites must stay green (`lib/members/__tests__/*`).
- Add a small registry test asserting the new item exists, is a free
  download, and its `storagePath`/`fileName` follow the
  `<slug>/<slug>-v1.zip` convention.
- Manual verification: build zip, `unzip -l` shows the single-folder
  layout; upload succeeds; `next build` passes.

## Out of scope

- Bitbucket / Azure DevOps support (GitHub + local paths only, v1).
- A combined PDF of evidence log + report (report-only PDF).
- Any change to the private local simplification of the employer-internal
  package (that idea is dropped; this product is a clean-room original).
