# R3 — Navigable structure

**Level 1 · Assisted**

## What this measures

Whether an agent can find where things live without tribal knowledge:
modular layout, discoverable entry points, and no god-files that hold the
whole application hostage.

## Evidence to gather

- Top-level directory layout — does it communicate the architecture?
- Entry points discoverable from manifests (`main`, `scripts`, framework
  conventions like `app/` or `src/index.*`)
- Size outliers: `find . -name '*.<ext>' -not -path '*/node_modules/*' | xargs wc -l | sort -rn | head -15`
  — files over ~1,000 lines deserve a look; several over ~2,000 is a smell
- Separation of concerns: routes vs. logic vs. data access vs. UI
- Dead weight: abandoned directories, duplicated trees, `old/` or `backup/` folders

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Clear modular layout, obvious entry points, responsibilities separated, no god-files |
| Partial | Mostly navigable with a few oversized hotspots or muddled areas |
| Fail | Monolithic files carry the core logic, or the layout is opaque without insider knowledge |
