# R13 — Safe failure and rollback

**Level 3 · Autonomous**

## What this measures

Whether a bad deploy is recoverable in minutes. Agents shipping to
production is only tolerable when the blast radius of a mistake is bounded
and the way back is fast and known.

## Evidence to gather

- Rollback mechanism: platform-native instant rollback (Vercel, Heroku
  releases), pipeline rollback jobs, versioned artefacts/images that can be
  re-pointed
- Documentation: is the rollback path written down anywhere?
- Blast-radius limiting: feature flags, staged/canary rollout config
- Database migrations: reversible (down-migrations) or expand-contract
  discipline? An irreversible migration makes "roll back" a lie.

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | A documented, workable rollback path exists, and rollouts are guarded (flags, canary, or staged) where the stack warrants it |
| Partial | Rollback is technically possible (platform-native) but undocumented and unexercised, or migrations undermine it |
| Fail | No path back — recovery means fixing forward under pressure |
