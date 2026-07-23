# R10 — Reproducible environment

**Level 2 · Collaborative**

## What this measures

Whether a fresh machine — or an agent's sandbox — can reproduce the working
environment from what's in the repo. "Works on my machine" is fatal to
agents, who only ever have a fresh machine.

## Evidence to gather

- Runtime pins: `.nvmrc`, `.node-version`, `.tool-versions`,
  `.python-version`, `engines` in `package.json`, pinned base images in
  Dockerfiles
- Lockfiles committed and consistent with manifests
- Environment variables documented: `.env.example` / `.env.sample` naming
  every required variable (values absent, of course)
- Dev-environment definition: devcontainer, Docker Compose for local dev,
  or a scripted setup that a fresh clone can run

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Pinned runtime + committed lockfiles + documented env vars (template file); a fresh clone has a scripted path to a working setup |
| Partial | Most pieces present but with gaps — e.g. lockfile but no runtime pin, or env vars discoverable only by reading code |
| Fail | No pins, no lockfile discipline, or required configuration is undocumented tribal knowledge |
