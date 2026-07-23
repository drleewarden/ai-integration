# AI-Native Readiness Audit — a Claude Code skill

Point it at a repository and get a straight answer to one question: **how
ready is this codebase for AI coding agents?** It runs 14 evidence-based
checks, scores the repo on a four-level maturity ladder, and hands you a
polished PDF report with a prioritised improvement plan.

| Level | Name | What it means |
|-------|------|---------------|
| 0 | **Manual** | AI assistance is high-friction here |
| 1 | **Assisted** | AI tools can help a developer safely |
| 2 | **Collaborative** | Agents can implement changes with human review |
| 3 | **Autonomous** | Agents can take changes to production safely |

Every score cites real evidence — file paths, configs, command output. No
vibes, no guesswork.

## Install

Unzip into your Claude Code skills folder:

```bash
unzip ai-native-readiness-v1.zip -d ~/.claude/skills/
```

That's it. The skill lands at `~/.claude/skills/ai-native-readiness/`.

## Use

In Claude Code, either invoke it directly:

```
/ai-native-readiness
```

…and it will ask which repository to audit, or name the target up front:

```
Audit https://github.com/your-org/your-repo for AI readiness
Audit the repo at ~/dev/your-repo
```

The skill asks follow-up questions only when it genuinely needs to (private
repo authentication, or which app to audit in a monorepo). A public
single-app repo runs start-to-finish with zero extra questions.

## What you get

Written to `./ai-native-readiness/<repo-name>/`:

- `ai-native-readiness-report-YYYY-MM-DD.md` — the full report: level,
  scorecard, per-check findings, prioritised recommendations with effort
  estimates
- `ai-native-readiness-report-YYYY-MM-DD.pdf` — the same report, styled
  and ready to share
- `evidence-log-YYYY-MM-DD.md` — every command run and everything observed,
  so the scores are auditable

## Requirements

- **Claude Code** and **git** — that's the baseline
- **GitHub CLI (`gh`)**, signed in — only for private repos and the
  pull-request-history check
- **Docker** — only used if the target repo ships its own Docker setup
- **Google Chrome** (or Edge/Chromium/Brave/wkhtmltopdf) — for the PDF; if
  none is installed you still get the HTML and can print it from any browser

## Privacy

Everything runs on your machine. The skill never uploads your code, never
phones home, and never modifies the repository it audits. Anything
secret-shaped is redacted from the evidence log.

---

Built by [Creative Milk](https://www.creative-milk.com.au) — AI consulting for
Australian businesses. Want help acting on your report? Get in touch.
