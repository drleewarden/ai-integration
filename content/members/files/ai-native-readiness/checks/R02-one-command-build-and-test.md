# R2 — One-command build and test

**Level 1 · Assisted**

## What this measures

Whether an agent can build the project and run its tests from documented
commands, deterministically. If a human needs tribal knowledge to get a
green build, an agent has no chance.

## Evidence to gather

- Documented commands: README setup/build/test sections, `Makefile` targets,
  `package.json` scripts, `pyproject.toml`, `justfile`, etc.
- Lockfile presence and consistency (`package-lock.json`, `yarn.lock`,
  `pnpm-lock.yaml`, `poetry.lock`, `go.sum`, `Cargo.lock`)
- Run the documented build and test commands under the chosen execution
  strategy (native → Docker → static; see SKILL.md Step 3) and record exit
  codes
- Signs of non-determinism: unpinned "latest" tags, network fetches during
  build, commands that depend on globally installed tools

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Documented build and test commands both run clean, exactly as documented, with lockfiles honoured |
| Partial | Commands work only with undocumented tweaks, or lockfiles are missing/stale, or verification was evaluator-limited (static evidence looks sound) |
| Fail | No documented build/test path, or the documented commands are broken |
