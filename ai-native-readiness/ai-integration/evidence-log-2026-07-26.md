# Evidence log — ai-integration — 2026-07-26

## Execution strategy
**Strategy:** Native. Node v22.9.0 via nvm (matches `.nvmrc` / `engines` requirement of Node 22.x); npm 10.8.3. `docker info` → unavailable (not needed; repo ships no Docker assets).
**Note:** Working tree audited in place on branch `feat/cta-boxes` (1 commit ahead of `main`, a styling-only commit). Branch checkout avoided — shared checkout in active use. Default-branch-specific evidence (log history, PRs) read via git/gh directly.

## R1 — Version control hygiene
**Commands run:** `git log --oneline -30` → exit 0, incremental feature/fix/docs commits; `git log --merges --oneline -15` → exit 0, PRs #4–#18 merged; `gh api .../branches/main/protection` → HTTP 404 "Branch not protected"; `git grep` secret patterns → no hits; `git ls-files | grep .env` → none tracked.
**Observed:** Conventional-commit-style messages with scopes and intent (e.g. "feat(members): member_activity table with RLS"). Consistent PR-merge flow. `.gitignore` covers env files, build output, node_modules, `.pem`, plus local planning docs. `package-lock.json` is deliberately ignored (relevant to R2/R10). No secret-shaped tracked content.
**Inferred:** PR flow substitutes for branch protection per the check's bar; protection itself is off.
**Score:** Pass

## R2 — One-command build and test
**Commands run:** `npm run build` → exit 0, Next.js production build clean (40+ routes); `npx jest --ci` → exit 0, 30 suites / 253 tests passed in 2.2s.
**Observed:** Scripts documented in `package.json` and README/CLAUDE.md (`dev`, `build`, `lint`, `test`). `engines: node 22.x` + `.nvmrc`. **No lockfile committed — `package-lock.json` is explicitly listed in `.gitignore`.** Jest emitted a cosmetic haste-map collision from a leftover `.claude/worktrees/` copy.
**Inferred:** Builds are not deterministic across machines/CI without a lockfile; caret ranges resolve at install time.
**Score:** Partial

## R3 — Navigable structure
**Commands run:** `wc -l` over app/lib TS(X) → exit 0, largest file 1,487 lines; `find app -type d` → exit 0.
**Observed:** Clear App Router layout: route groups `(main)`/`(dark-nav)`/`(members)` for shared chrome, `app/api/*` per route, domain logic isolated in `lib/` (readiness scoring pipeline, supabase clients), content in `content/insights/*.json`, marketing copy in sibling `data.ts` files. Entry points follow Next.js conventions. One outlier: `app/(site)/opportunity-cost/CalculatorClient.tsx` at 1,487 lines; `workshop-melbourne/page.tsx` at 1,182 (mostly JSX/copy). ~27k lines total.
**Inferred:** Two oversized page components are copy-heavy JSX rather than tangled logic; no god-files holding core logic hostage.
**Score:** Pass

## R4 — Docs an agent can use
**Commands run:** `head README.md`; `wc -l CLAUDE.md AGENTS.md` → 93 + 127 lines; `git ls-files | grep .env` → empty; `ls .env.example` → exists on disk only.
**Observed:** README covers stack, prerequisites, setup, dev commands. CLAUDE.md (Claude Code) and AGENTS.md (Codex) both present, encode architecture, conventions, env vars, and gotchas. Two accuracy gaps: (1) README says "see `.env.example`" but the file is untracked — the `.env*` gitignore pattern swallows it, so a fresh clone has no env template; (2) CLAUDE.md describes the test suite as three suites with thin coverage, but 30 suites / 253 tests exist.
**Inferred:** Docs are strong for the machine they were written on; a fresh agent sandbox hits the missing env template immediately.
**Score:** Partial

## R5 — Reviewable change flow
**Commands run:** `gh pr list --state merged --limit 12 --json number,additions,deletions` → exit 0.
**Observed:** All recent work lands via PRs (#8–#20). Sizes are bimodal: many small focused PRs (+7/-2, +11/-11, +12/-6) but several very large ones (#17 +10,246/-9; #11 +4,357; #9 +2,150). No `.github/` directory → no PR template, no CODEOWNERS. Solo-maintainer repo; merges appear self-approved.
**Inferred:** The PR discipline exists as a flow, not as a review gate; large feature PRs would be hard to genuinely review.
**Score:** Partial

## R6 — Linting and formatting
**Commands run:** `npm run lint` → exit 1, "1934 problems (276 errors, 1658 warnings)"; grouped flagged files by directory.
**Observed:** ESLint 9 flat config (`eslint.config.mjs`) with next/core-web-vitals + TypeScript rules. Of 28 flagged files, 24 are in untracked `.claude/worktrees/` leftovers; tracked code has only 4 files with issues (an `<img>` warning, a `require()` in jest.config.js, etc.). No enforcement anywhere: no CI, no husky/lint-staged/pre-commit. No formatter (Prettier) config.
**Inferred:** Tracked codebase is near-clean, but the documented lint command exits non-zero as-run (worktree noise not ignored) and nothing enforces lint on merge.
**Score:** Partial

## R7 — Type safety
**Commands run:** `cat tsconfig.json`; suppression grep over app/ lib/ → 3 loose-`any` hits, 1 `@ts-ignore`/`@ts-expect-error` total.
**Observed:** `strict: true` TypeScript across the codebase; path alias configured; `next build` (which type-checks) passed clean in R2. Suppression density is near zero for ~27k lines.
**Inferred:** none.
**Score:** Pass

## R8 — Meaningful test suite
**Commands run:** `npx jest --ci` (R2) → 30 suites / 253 tests green in 2.2s; `find` test files → 30; assertion grep → 381 `expect()` calls.
**Observed:** Coverage spans the core domain (readiness scoring pipeline, members access rules, dial math) and the API surface (send-email, stripe-webhook, members-download, security-headers audit). Real behavioural assertions, no placeholder tests spotted. Suite is fast (2.2s), so no skip incentive.
**Inferred:** CLAUDE.md's "coverage is thin" note is outdated; the suite is credible for this codebase's size.
**Score:** Pass

## R9 — Continuous integration
**Commands run:** `ls .github/workflows` → "No such file or directory".
**Observed:** No `.github/` directory at all; no GitHub Actions, no other CI config (no .gitlab-ci.yml, Jenkinsfile, etc.). Nothing runs build/lint/test on PRs — the 14 merged PRs landed ungated.
**Inferred:** Vercel builds on push provide a de-facto build check only; lint and tests are never enforced.
**Score:** Fail

## R10 — Reproducible environment
**Commands run:** `ls .env.example` → exists on disk, but `git ls-files | grep .env` → empty (untracked); lockfile check → none committed.
**Observed:** Runtime pinned twice (`.nvmrc` 22, `engines: 22.x`). Env vars thoroughly documented — `.env.example` is well-commented and CLAUDE.md/AGENTS.md list required vars — but the template file itself is gitignored by the `.env*` pattern, so it never reaches a fresh clone. No lockfile committed (deliberate `.gitignore` entry). No devcontainer/Compose.
**Inferred:** A fresh agent sandbox gets the right Node but a floating dependency tree and no env template file.
**Score:** Partial

## R11 — Dependency currency
**Commands run:** manifest review; `git log` grep for bump commits → none in last 40.
**Observed:** As of 2026-07-26: Next.js 15.5.15, React 19.2.5, Node 22.x, Tailwind v4, ESLint 9, Jest 30 — all current-or-supported majors. Tailwind pinned to a 4.0.0-alpha.29 prerelease. No Renovate/Dependabot (no `.github/`), no visible bump-commit habit, and no lockfile to date-check. `npm audit` not runnable without a lockfile.
**Inferred:** Versions are fresh because the project is young and actively developed, not because an update process exists.
**Score:** Partial

## R12 — Automated deployment path
**Commands run:** `gh api repos/drleewarden/ai-integration/deployments` → exit 0, vercel[bot] Production deployments on main pushes, Preview per branch (latest 2026-07-23).
**Observed:** Vercel git integration deploys every merge to main to Production automatically and every branch push to a Preview URL. README/CLAUDE.md document Vercel as the platform. No manual deploy steps documented anywhere.
**Inferred:** Config lives platform-side (`.vercel/` gitignored), but the deployment API history proves the automation end-to-end.
**Score:** Pass

## R13 — Safe failure and rollback
**Commands run:** grep for rollback docs across README/CLAUDE.md/AGENTS.md/docs → none; migration inspection.
**Observed:** Vercel provides platform-native instant rollback (re-point to previous immutable deployment), but no rollback path is documented in the repo. Supabase migrations are forward-only — no down-migrations; repo history shows migration state drift (bootstrap SQLs exist because 0001 fails on fresh projects). No feature flags or staged rollout.
**Inferred:** App-layer rollback is one click but unexercised and undocumented; a bad migration cannot be rolled back, only fixed forward.
**Score:** Partial

## R14 — Production observability
**Commands run:** grep package.json for monitoring SDKs → none; `grep -rl console.error app/api` → 10 files.
**Observed:** No error tracking (no Sentry/Datadog/OTel/Rollbar), no alerting config, no uptime checks, no health endpoint. Server-side errors go to `console.error` only (visible in Vercel function logs to whoever goes looking). GTM/GA4 is product analytics, not observability.
**Inferred:** A production regression would only be noticed by a user reporting it or someone browsing Vercel logs.
**Score:** Fail
