# R8 — Meaningful test suite

**Level 2 · Collaborative**

## What this measures

Whether tests actually exercise the core logic. A meaningful suite is the
contract that lets a human trust an agent's change: green means something.

## Evidence to gather

- Test directories and file counts vs. source size — a 50,000-line app with
  six test files tells its own story
- Run the suite under the execution strategy and record the result
- Spot-check test bodies: real assertions on behaviour, or placeholder
  `expect(true).toBe(true)` ceremony?
- Coverage config/thresholds if present (don't require them)
- Which parts are covered: core domain logic, or only utilities?

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Core logic is covered by real assertions and the suite runs green |
| Partial | Tests exist but are thin, patchy, or slow to the point of being skipped — or the run was evaluator-limited and static evidence looks credible |
| Fail | No tests, placeholder tests, or a suite that fails on the default branch |
