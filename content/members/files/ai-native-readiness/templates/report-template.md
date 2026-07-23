# AI-Native Readiness Report — {repo-name}

| | |
|---|---|
| **Repository** | {owner/repo or folder name} |
| **URL** | {https clone URL, or "local path"} |
| **Branch** | {audited branch} |
| **Commit** | {short hash at audit time} |
| **Audited** | {YYYY-MM-DD} |
| **Audited by** | ai-native-readiness v1 |

## Executive summary

**Level {N} — {Manual|Assisted|Collaborative|Autonomous}.**
{Two or three sentences: the verdict, what drives it, and the single most
valuable next move.}

A check scored **Partial** still counts toward the level — Partials are the
improvement backlog, not blockers. Only a **Fail** holds a level back.

## Scorecard

| Check | Level | Score |
|-------|-------|-------|
| R1 — Version control hygiene | 1 | {Pass/Partial/Fail} |
| R2 — One-command build and test | 1 | {…} |
| R3 — Navigable structure | 1 | {…} |
| R4 — Docs an agent can use | 1 | {…} |
| R5 — Reviewable change flow | 1 | {…} |
| R6 — Linting and formatting | 2 | {…} |
| R7 — Type safety | 2 | {…} |
| R8 — Meaningful test suite | 2 | {…} |
| R9 — Continuous integration | 2 | {…} |
| R10 — Reproducible environment | 2 | {…} |
| R11 — Dependency currency | 2 | {…} |
| R12 — Automated deployment path | 3 | {…} |
| R13 — Safe failure and rollback | 3 | {…} |
| R14 — Production observability | 3 | {…} |

## The level ladder

| Level | Name | Requires | Status |
|-------|------|----------|--------|
| 1 | Assisted | R1–R5 all ≥ Partial | {✓ reached / ✗ blocked by …} |
| 2 | Collaborative | Level 1 + R6–R11 all ≥ Partial | {…} |
| 3 | Autonomous | Level 2 + R12–R14 all ≥ Partial | {…} |

## Findings

{One block per check, R1–R14:}

### R{n} — {Check name} · {Pass/Partial/Fail}

**Evidence:** {two or three sentences citing the concrete files, configs,
or command results that drove the score.}

**Gap:** {what's missing to reach Pass — omit this line entirely for Pass.}

## Recommendations

{Ordered list. Everything blocking or weakening the next level first, then
the level after. For each item:}

1. **{Action}** — {one line on why it matters to an agent}. *Effort:
   {Small|Medium|Large}.*

## Effort rollup

| Priority | Recommendation | Effort |
|----------|----------------|--------|
| 1 | {…} | {S/M/L} |

**Overall:** {one sentence — e.g. "Two medium efforts stand between this
repo and Level 2."}
