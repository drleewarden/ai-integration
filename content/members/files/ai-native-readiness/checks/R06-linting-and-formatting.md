# R6 — Linting and formatting

**Level 2 · Collaborative**

## What this measures

Whether style and static-analysis rules are configured **and enforced** —
not just installed. Enforced linting turns "does this look right?" review
noise into machine-checked facts, which is exactly the review load agents
add.

## Evidence to gather

- Linter/formatter configs: `.eslintrc*`/`eslint.config.*`, `.prettierrc*`,
  `ruff.toml`/`pyproject [tool.ruff]`, `.rubocop.yml`, `golangci.yml`, etc.
- Enforcement: a lint step in CI workflows, or pre-commit hooks
  (`.pre-commit-config.yaml`, `husky`, `lint-staged`)
- Run the lint command in check mode under the execution strategy if cheap
  (`npm run lint`, `ruff check`, etc.) and record the exit code
- Consistency: does the code actually follow the configured style?

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Linter and formatter configured, enforced in CI or hooks, and the codebase runs clean (or near-clean) |
| Partial | Configured but not enforced anywhere, or enforced but noisy with violations |
| Fail | No linting or formatting configuration at all |
