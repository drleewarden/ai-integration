# R12 — Automated deployment path

**Level 3 · Autonomous**

## What this measures

Whether a merged change reaches production through automation, with no
human performing manual steps in between. Autonomy ends wherever a person
has to SSH in and run something.

## Evidence to gather

- Deploy automation: CI workflow deploy stages, platform configs
  (`vercel.json`, `netlify.toml`, `fly.toml`, `render.yaml`), Kubernetes
  manifests + a pipeline that applies them, Terraform in CI
- Trigger: deploys on merge to the default branch or on tags?
- Environment promotion: staging → production path defined in config
- Docs describing manual deploy steps are evidence *against* this check

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Merge (or tag) → production is fully automated, visible in config |
| Partial | Automation exists but a manual step sits in the middle (hand-promotion, manual approval scripts, "run the deploy job yourself") |
| Fail | Deployment is a manual procedure |
