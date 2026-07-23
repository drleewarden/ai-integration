# R1 — Version control hygiene

**Level 1 · Assisted**

## What this measures

Whether the repository's git history and branch discipline give an AI agent
(and its human reviewer) a trustworthy foundation: real incremental history,
a guarded default branch, and no secrets in tracked content.

## Evidence to gather

- `git log --oneline -30` — incremental commits vs. bulk "initial commit" dumps
- `git log --format=%s -50` — do messages carry intent, or are they "fix" / "wip"?
- Platform check when available:
  `gh api repos/{owner}/{repo}/branches/{default}/protection`
  (404 ⇒ unprotected; 403 ⇒ inconclusive — note it, don't penalise)
- Secret scan of tracked files: search tracked content for private-key
  headers (`BEGIN RSA`, `BEGIN OPENSSH`), `AWS_SECRET`, `api_key =`,
  committed `.env` files. Redact anything found before logging it.
- `.gitignore` covers env files, build output, dependency directories
- PR-merge signals: `git log --merges --oneline -20`

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Real incremental history, intent-bearing messages, default branch protected (or a PR-merge flow is evident), no secret-like tracked content, sane `.gitignore` |
| Partial | History and ignore rules are sound, but branch protection is absent or unverifiable, or commit messages are low-quality |
| Fail | Bulk-dump history, **or** secret-like values in tracked content (automatic Fail), **or** no `.gitignore` discipline |
