# R9 — Continuous integration

**Level 2 · Collaborative**

## What this measures

Whether every proposed change gets an automated build + lint + test verdict
before merge. CI is the referee between an agent's claim ("done, tests
pass") and reality.

## Evidence to gather

- CI configs: `.github/workflows/*.yml`, `.gitlab-ci.yml`,
  `bitbucket-pipelines.yml`, `azure-pipelines.yml`, `Jenkinsfile`
- Triggers: does it run on pull requests (not only on pushes to main)?
- Steps: build, lint, test all present in the gate?
- Recent outcomes when the platform API is reachable:
  `gh run list --limit 10` — green, or chronically red/flaky?

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | CI runs build + lint + test on every PR and recent runs are green |
| Partial | CI exists but gates only part of the story (e.g. build without tests), skips PRs, or is visibly flaky |
| Fail | No CI configuration |
