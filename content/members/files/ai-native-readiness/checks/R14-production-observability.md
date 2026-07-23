# R14 — Production observability

**Level 3 · Autonomous**

## What this measures

Whether a regression would actually get noticed. If nobody (and no thing)
is watching production, autonomous shipping is gambling, not engineering.

## Evidence to gather

- Error tracking / monitoring SDKs in code or config: Sentry, Datadog,
  New Relic, OpenTelemetry, Application Insights, Rollbar
- Alerting evidence: alert rules in config, uptime checks, on-call tooling
  references
- Health endpoints (`/health`, `/healthz`, readiness probes)
- Structured logging (a logging library with levels and context, not bare
  `print`/`console.log` scattered through the code)

## Scoring

| Score | Criteria |
|-------|----------|
| Pass | Monitoring/error tracking is wired in **and** something alerts on it (rules, uptime checks, or paging config) |
| Partial | An SDK or structured logging exists, but no alerting evidence — problems are visible only to whoever goes looking |
| Fail | No monitoring, no error tracking, unstructured logging only |
