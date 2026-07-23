# R4 — Docs an agent can use

**Level 1 · Assisted**

## What this measures

Whether the written word in the repo actually helps: accurate setup, run,
and test instructions, plus agent-oriented context files that encode the
conventions a newcomer (human or AI) needs.

## Evidence to gather

- README: does it cover setup, run, and test? Spot-check the instructions
  against reality (do the named scripts/targets exist?)
- Agent context files: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules`,
  `CONTRIBUTING.md`, `docs/` — anything that encodes conventions
- Accuracy: docs referencing commands, paths, or services that no longer
  exist are worse than no docs
- Architecture notes or ADRs for the non-obvious decisions

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Accurate setup/run/test docs **and** an agent context file (or equivalent conventions doc) that matches the codebase |
| Partial | README covers the basics but is thin, partially stale, or there's no conventions/context documentation |
| Fail | Docs are missing, or materially wrong about how to build/run/test |
