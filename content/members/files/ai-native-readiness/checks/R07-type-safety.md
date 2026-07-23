# R7 — Type safety

**Level 2 · Collaborative**

## What this measures

Whether static types guard the core code paths. Types are the cheapest
reviewer an agent's output will ever get: whole classes of mistakes die at
compile time instead of in review or production.

## Evidence to gather

- Language and config: `tsconfig.json` (`strict`, `noImplicitAny`),
  `mypy.ini`/`pyproject [tool.mypy]`, Sorbet config, or an inherently
  statically-typed language (Go, Rust, Kotlin, Swift, C#)
- Annotation coverage: sample core modules — are signatures typed, or is it
  `any`/untyped dicts all the way down?
- Type-check step in CI, or type errors suppressed
  (`@ts-ignore`/`# type: ignore` density)
- For dynamic-language repos with no typing tooling: judge against the
  ecosystem norm and say so explicitly in the evidence log

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Core paths are statically typed with strict-leaning settings, and type-checking is part of the workflow |
| Partial | Types exist but coverage is patchy, settings are lax, or suppressions are common |
| Fail | Untyped codebase in an ecosystem where typing is standard practice |
