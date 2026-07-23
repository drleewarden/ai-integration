# R11 — Dependency currency

**Level 2 · Collaborative**

## What this measures

Whether the frameworks and runtime are on supported versions. Agents are
trained overwhelmingly on current APIs; an EOL framework means the agent's
instincts are wrong and every suggestion needs archaeology.

## Evidence to gather

- Manifest majors vs. the currently supported lines for the runtime and key
  frameworks (state the comparison and date it — e.g. "Node 14 manifest;
  Node 14 has been EOL since April 2023")
- Lockfile age: `git log -1 --format=%cs -- <lockfile>`
- Update habit: Renovate/Dependabot config, or dependency-bump commits in
  recent history
- Known-vulnerable pins if an audit command is cheap to run
  (`npm audit --omit=dev`, `pip-audit`) — advisory only, don't gate on it

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Supported runtime and framework majors, and a visible update habit (bot config or regular bump commits) |
| Partial | Lagging a major or two but still in support, or updates happen but rarely |
| Fail | EOL runtime or framework majors, or dependencies untouched for years |
