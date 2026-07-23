# R5 — Reviewable change flow

**Level 1 · Assisted**

## What this measures

Whether changes land as small, reviewed units. Agent output is only safe
when a human can genuinely review it — a culture of thousand-line direct
pushes can't absorb agent contributions.

## Evidence to gather

- Recent PR history when available: `gh pr list --state merged --limit 20`
  and spot-check sizes (`gh pr view <n> --json additions,deletions`)
- Without platform access: `git log --merges --oneline -20` and
  `git show --stat` on a few merges for change size
- PR template (`.github/pull_request_template.md`), `CODEOWNERS`,
  review requirements
- Direct pushes to the default branch vs. merge commits in recent history

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Small, focused PRs with review are clearly the norm; conventions visible (template, CODEOWNERS, or consistent merge flow) |
| Partial | A PR flow exists but changes are routinely large, or review evidence is thin/unverifiable |
| Fail | Direct pushes to the default branch dominate; no review culture visible |
