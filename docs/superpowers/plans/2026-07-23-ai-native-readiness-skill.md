# AI-Native Readiness Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the original `ai-native-readiness` Claude Code skill as a members-area free download, wired into the existing registry/upload/download pipeline.

**Architecture:** Skill source lives in `content/members/files/ai-native-readiness/` (the upload script's source-of-truth directory). The site side is one registry entry plus one import — every page and API derives from `lib/members/items.ts`. The upload script gains structure-preserving zips for nested sources.

**Tech Stack:** Markdown skill files, Bash (PDF helper), Node 22 (`upload-member-files.mjs`), TypeScript + Jest for the registry.

## Global Constraints

- All skill content is **original** — no text, check names, level names, or templates from any third-party/internal package. Level names: Manual / Assisted / Collaborative / Autonomous. Check IDs R1–R14.
- Australian English in all user-facing copy.
- Registry conventions from `lib/members/items.ts`: `storagePath: "<slug>/<slug>-v1.zip"`, `fileName: "<slug>-v1.zip"`, `tier: "free"`, `dateAdded: "2026-07-23"`.
- Jest must be run with the Node 22 PATH prefix: `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH"`.
- The downloadable skill is read-only against target repos and must instruct redaction of secrets from evidence logs.
- Palette for the PDF stylesheet: midnight ink `#0f1526`, warm cream `#f5f0e8`, liquid gold `#c9a84c`.

---

### Task 1: Skill core — SKILL.md and README.md

**Files:**
- Create: `content/members/files/ai-native-readiness/SKILL.md`
- Create: `content/members/files/ai-native-readiness/README.md`

**Interfaces:**
- Produces: workflow references `checks/R01…R14` filenames, `templates/report-template.md`, `templates/report.css`, `scripts/report-to-pdf.sh` — Tasks 2–3 must use exactly these paths.

- [ ] **Step 1: Write SKILL.md** with YAML frontmatter (`name: ai-native-readiness`, trigger-rich description) and this workflow:
  1. **Target**: if no repo given, ask exactly one question (GitHub URL or local path). Local path → verify it exists and is a git repo. URL → clone with `gh repo clone` (if `gh auth status` succeeds) else `git clone`; on auth failure for a private repo, ask the user once how to authenticate (`gh auth login` or `GITHUB_TOKEN`). Never echo tokens.
  2. **Clarify only when needed**: multiple dependency manifests/workspaces → ask which app to audit (offer "whole repo"); otherwise no further questions.
  3. **Execution strategy** (before any check that runs commands): documented repo commands if the runtime is installed → repo's Docker if present *and* `docker info` succeeds → static evidence otherwise. Evaluator-limitation cap: a check limited this way scores at most Partial, never Fail for that reason alone. Record strategy in the evidence log first.
  4. **Evaluate R1–R14** reading each `checks/R##-*.md` before scoring; append evidence-log entries (commands run, observed, inferred, score) per check as you go; redact anything secret-like.
  5. **Score level**: highest level where every check at it and below is Pass or Partial. Fail blocks.
  6. **Report** from `templates/report-template.md` → `./ai-native-readiness/<repo-name>/ai-native-readiness-report-YYYY-MM-DD.md` (+ `evidence-log-YYYY-MM-DD.md`). Never overwrite an existing dated file — suffix `-2`.
  7. **PDF**: render the finished report as one standalone HTML file (author the HTML directly; inline `templates/report.css`), then run `scripts/report-to-pdf.sh <html> <pdf>`. If the script exits non-zero, tell the user the HTML is ready to print from any browser.
  8. **Present**: level, top three recommendations, output paths.
- [ ] **Step 2: Write README.md** — what it does, the four levels in one table, install (`unzip ai-native-readiness-v1.zip -d ~/.claude/skills/`), usage examples, requirements (Claude Code, git; optional `gh`, Docker, Chrome for the PDF), privacy note (runs entirely on your machine; nothing is uploaded), Creative Milk attribution + link.
- [ ] **Step 3: Commit** `git add -f content/members/files/ai-native-readiness && git commit -m "feat: ai-native-readiness skill core"` (check `.gitignore` — if `content/members/files/` is ignored for asset reasons, force-add; sources must be versioned).

### Task 2: The 14 check files

**Files:**
- Create: `content/members/files/ai-native-readiness/checks/R01-version-control-hygiene.md` … `R14-production-observability.md` (14 files)

**Interfaces:**
- Consumes: filenames referenced by Task 1's SKILL.md.
- Produces: each file has sections `## What this measures`, `## Evidence to gather` (concrete commands/globs), `## Scoring` (Pass/Partial/Fail table).

- [ ] **Step 1: Write R01 as the structural exemplar** (full file):

```markdown
# R1 — Version control hygiene

**Level 1 · Assisted**

## What this measures
Whether the repository's git history and branch discipline give an AI agent
(and its human reviewer) a trustworthy foundation: real incremental history,
a guarded default branch, and no secrets in tracked content.

## Evidence to gather
- `git log --oneline -30` — incremental commits vs. bulk "initial commit" dumps
- `git log --format=%s -50` — do messages carry intent?
- Platform check when available: `gh api repos/{owner}/{repo}/branches/{default}/protection` (404 ⇒ unprotected; 403 ⇒ inconclusive, note it)
- Secret scan of tracked files: grep tracked content for private-key headers,
  `AWS_SECRET`, `api_key =`, `.env` files committed; check `.gitignore` covers
  env files, build output, dependencies
- PR-merge signals in history: `git log --merges --oneline -20`

## Scoring
| Score | Criteria |
|-------|----------|
| Pass | Real incremental history, intent-bearing messages, default branch protected (or PR-merge flow evident), no secret-like tracked content, sane `.gitignore` |
| Partial | History and ignore rules are sound but branch protection is absent/unverifiable, or messages are low-quality |
| Fail | Bulk-dump history, or secret-like values in tracked content (automatic Fail), or no `.gitignore` discipline |
```

- [ ] **Step 2: Write R02–R14** in the same structure with this content:

| ID | Title (Level) | Measures / key evidence / scoring axis |
|----|---------------|----------------------------------------|
| R2 | One-command build and test (1) | Documented build+test commands exist and work. Evidence: README/Makefile/package scripts; lockfile presence and freshness; run the documented commands under the execution strategy. Pass = both run clean as documented; Partial = work with undocumented tweaks or evaluator-limited; Fail = no documented path or commands broken. |
| R3 | Navigable structure (1) | An agent can find where things live. Evidence: top-level layout, entry points, size outliers (`find` largest files), separation of concerns, dead directories. Pass = clear modular layout, no god-files; Partial = mostly clear with hotspots; Fail = monolithic files or opaque layout. |
| R4 | Docs an agent can use (1) | Setup/run/test documented; agent context files. Evidence: README sections, `CLAUDE.md`/`AGENTS.md`/`CONTRIBUTING.md`, doc accuracy vs. reality. Pass = accurate setup/run/test docs + agent context file; Partial = README covers basics only; Fail = missing or wrong. |
| R5 | Reviewable change flow (1) | Small, reviewed changes are the norm. Evidence: recent PR sizes/merge messages, PR template, CODEOWNERS, review conventions (`gh pr list --limit 20` when available). Pass = small focused PRs with review; Partial = PRs exist but large/unreviewed; Fail = direct-to-default pushes dominate. |
| R6 | Linting and formatting (2) | Configured *and enforced*. Evidence: linter/formatter configs, CI or hook enforcement, run in check mode if cheap. Pass = configured + enforced + clean; Partial = configured, not enforced or noisy; Fail = none. |
| R7 | Type safety (2) | Static types guard core paths. Evidence: language/`tsconfig` strictness, annotation coverage sampling, type-check in CI. Pass = typed core with strict settings; Partial = partial coverage or lax settings; Fail = untyped in a typed-ecosystem repo (dynamic-language repos without type tooling: judge by ecosystem norms, note it). |
| R8 | Meaningful test suite (2) | Tests exercise core logic. Evidence: test dirs, count vs. source size, run suite under execution strategy, spot-check assertions aren't placeholders. Pass = core logic covered, suite green; Partial = thin/patchy or evaluator-limited; Fail = absent or broken. |
| R9 | Continuous integration (2) | Every PR gets build+lint+test. Evidence: CI configs, triggers on PR, recent run outcomes when API available. Pass = full gate on PRs, recent runs green; Partial = CI exists but partial gate or flaky; Fail = none. |
| R10 | Reproducible environment (2) | A fresh machine (or agent sandbox) can match prod-like setup. Evidence: version pins (`.nvmrc`, `.tool-versions`, engines, container images), lockfiles, `.env.example` documenting required vars. Pass = pinned runtime + lockfile + env template; Partial = some pins missing; Fail = "works on my machine". |
| R11 | Dependency currency (2) | Frameworks/runtimes are supported versions. Evidence: manifest majors vs. current LTS/supported lines (use knowledge; note dates), lockfile age, update cadence in history/renovate/dependabot config. Pass = supported majors, visible update habit; Partial = lagging but supported; Fail = EOL runtime or abandoned majors. |
| R12 | Automated deployment path (3) | Merge → production without manual steps. Evidence: deploy workflows/platform configs (Vercel/Netlify/Fly/K8s manifests, pipeline deploy stages), environment promotion. Pass = automated deploy from default branch/tags; Partial = automation exists but manual steps in the middle; Fail = manual deployment. |
| R13 | Safe failure and rollback (3) | Bad deploys are recoverable fast. Evidence: rollback docs/scripts, platform-native rollback (e.g. Vercel instant rollback), feature flags, staged rollout config, migration down-paths. Pass = documented workable rollback + guarded rollouts where relevant; Partial = platform rollback exists but undocumented/untested; Fail = no path back. |
| R14 | Production observability (3) | Regressions get noticed. Evidence: error tracking/monitoring SDKs in code or config (Sentry, Datadog, OTel…), alerting config, health endpoints, structured logging. Pass = monitoring + alerting signals present; Partial = logging only or SDK without alerting evidence; Fail = nothing. |

- [ ] **Step 3: Commit** — `git commit -m "feat: ai-native-readiness check library (R1–R14)"`.

### Task 3: Templates and PDF script

**Files:**
- Create: `content/members/files/ai-native-readiness/templates/report-template.md`
- Create: `content/members/files/ai-native-readiness/templates/report.css`
- Create: `content/members/files/ai-native-readiness/scripts/report-to-pdf.sh` (chmod +x)

**Interfaces:**
- Consumes: paths fixed in Task 1.
- Produces: `report-to-pdf.sh <input.html> <output.pdf>`, exit 0 on success, exit 1 with a human message when no converter is found.

- [ ] **Step 1: report-template.md** — sections: title + metadata block (Repository, URL, Branch, Commit, Audited date, Audited by "ai-native-readiness v1"), Executive summary (level verdict sentence + what Partial means), Scorecard (table: check, level, score), The level ladder (0–3 table with reached-level marked), Findings per check (score, evidence summary, gap), Recommendations (prioritised: everything blocking the next level first, each with S/M/L effort), Effort rollup.
- [ ] **Step 2: report.css** — print-oriented stylesheet: warm cream page `#f5f0e8`, midnight ink text `#0f1526`, liquid gold accents `#c9a84c` (headings underline, scorecard header, level badge), system font stack + Georgia for headings, `@page { margin: 18mm }`, score colour coding (Pass green `#2e7d4f`, Partial gold `#c9a84c`, Fail `#b3402a`), avoid page-break inside findings blocks.
- [ ] **Step 3: report-to-pdf.sh**:

```bash
#!/usr/bin/env bash
# Render a standalone HTML report to PDF using whatever converter exists.
# Usage: report-to-pdf.sh <input.html> <output.pdf>
set -euo pipefail

IN="${1:?usage: report-to-pdf.sh <input.html> <output.pdf>}"
OUT="${2:?usage: report-to-pdf.sh <input.html> <output.pdf>}"
IN_ABS="$(cd "$(dirname "$IN")" && pwd)/$(basename "$IN")"
OUT_ABS="$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"

# 1) Chromium-family headless print (no extra dependencies on most machines)
for BROWSER in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium" \
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  "$(command -v google-chrome || true)" \
  "$(command -v chromium || true)" \
  "$(command -v chromium-browser || true)" \
  "$(command -v msedge || true)"; do
  if [ -n "$BROWSER" ] && [ -x "$BROWSER" ]; then
    "$BROWSER" --headless --disable-gpu --no-pdf-header-footer \
      --print-to-pdf="$OUT_ABS" "file://$IN_ABS" 2>/dev/null && {
      echo "PDF written: $OUT_ABS"; exit 0; }
  fi
done

# 2) Dedicated converters, if installed
if command -v wkhtmltopdf >/dev/null 2>&1; then
  wkhtmltopdf -q "$IN_ABS" "$OUT_ABS" && { echo "PDF written: $OUT_ABS"; exit 0; }
fi
if command -v weasyprint >/dev/null 2>&1; then
  weasyprint "$IN_ABS" "$OUT_ABS" && { echo "PDF written: $OUT_ABS"; exit 0; }
fi
if command -v pandoc >/dev/null 2>&1; then
  pandoc "$IN_ABS" -o "$OUT_ABS" && { echo "PDF written: $OUT_ABS"; exit 0; }
fi

echo "No PDF converter found (Chrome/Chromium/Edge/Brave, wkhtmltopdf, weasyprint, or pandoc)." >&2
echo "Open the HTML report in any browser and use Print → Save as PDF instead: $IN_ABS" >&2
exit 1
```

- [ ] **Step 4: Test the script** — write a one-line `<html><body>hi</body></html>` to the scratchpad, run the script against it. Expected: exit 0 and a valid PDF (`file out.pdf` → "PDF document") on this machine (Chrome present), or the graceful exit-1 message if not.
- [ ] **Step 5: Commit** — `git commit -m "feat: ai-native-readiness report template and PDF pipeline"`.

### Task 4: Structure-preserving zips in the upload script

**Files:**
- Modify: `scripts/upload-member-files.mjs:66-70`

**Interfaces:**
- Produces: nested source folders zip to archives containing `<slug>/…`; flat folders keep existing flat output.

- [ ] **Step 1: Replace the zip block**:

```js
for (const slug of slugs) {
  const zipName = `${slug}-${VERSION}.zip`;
  const zipPath = path.join(tmp, zipName);
  const srcDir = path.join(FILES_DIR, slug);
  const entries = readdirSync(srcDir, { withFileTypes: true });
  if (entries.some((e) => e.isDirectory())) {
    // Nested sources (e.g. skills with checks/, templates/) keep their
    // structure: the archive contains a single <slug>/ folder so it unzips
    // cleanly into ~/.claude/skills/.
    execFileSync("zip", ["-r", "-q", zipPath, slug], { cwd: FILES_DIR });
  } else {
    // -j flattens paths so the zip contains just the files, no folder nesting
    execFileSync("zip", ["-j", "-q", zipPath, ...entries.map((e) => path.join(srcDir, e.name))]);
  }
```

- [ ] **Step 2: Verify both modes** — build zips into the scratchpad by temporarily pointing a small harness at the two folder shapes, or simpler: run the real zip commands by hand for `ai-policy-template` (flat) and `ai-native-readiness` (nested) and `unzip -l` each. Expected: flat zip lists bare filenames; nested zip lists `ai-native-readiness/SKILL.md`, `ai-native-readiness/checks/…`.
- [ ] **Step 3: Commit** — `git commit -m "feat: structure-preserving zips for nested member downloads"`.

### Task 5: Registry entry (TDD)

**Files:**
- Create: `lib/members/__tests__/items.test.ts`
- Create: `content/members/ai-native-readiness.ts`
- Modify: `lib/members/items.ts` (import + array entry)

**Interfaces:**
- Consumes: `DownloadItem` from `@/lib/members/items`; `itemBySlug`.
- Produces: registry item slug `ai-native-readiness`.

- [ ] **Step 1: Failing test** `lib/members/__tests__/items.test.ts`:

```ts
import { itemBySlug } from "@/lib/members/items";

describe("ai-native-readiness registry entry", () => {
  it("is registered as a free download following storage conventions", () => {
    const item = itemBySlug("ai-native-readiness");
    expect(item).toBeDefined();
    if (!item || item.type !== "download") throw new Error("expected a download item");
    expect(item.tier).toBe("free");
    expect(item.fileName).toBe("ai-native-readiness-v1.zip");
    expect(item.storagePath).toBe("ai-native-readiness/ai-native-readiness-v1.zip");
  });
});
```

- [ ] **Step 2: Run it** — `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npx jest lib/members/__tests__/items.test.ts` → FAIL (item undefined).
- [ ] **Step 3: Implement** `content/members/ai-native-readiness.ts`:

```ts
import type { DownloadItem } from "@/lib/members/items";

const item: DownloadItem = {
  slug: "ai-native-readiness",
  title: "AI-Native Readiness Audit — Claude Code Skill",
  description:
    "A Claude Code skill that audits any repository for AI-agent readiness — 14 evidence-based checks, a four-level maturity score, and a polished PDF report. Unzip, invoke, point it at a repo.",
  type: "download",
  tier: "free",
  dateAdded: "2026-07-23",
  storagePath: "ai-native-readiness/ai-native-readiness-v1.zip",
  fileName: "ai-native-readiness-v1.zip",
};

export default item;
```

  In `lib/members/items.ts`: `import aiNativeReadiness from "@/content/members/ai-native-readiness";` (alphabetical position with the other imports) and add `aiNativeReadiness,` to the `items` array.
- [ ] **Step 4: Run tests** — same command → PASS; then full suite `npx jest` → all green.
- [ ] **Step 5: Commit** — `git commit -m "feat: register ai-native-readiness free download"`.

### Task 6: Ship — verify, upload, push

**Files:** none new.

- [ ] **Step 1:** `export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH" && npm run lint && npx jest && npm run build` → all green.
- [ ] **Step 2:** `node scripts/upload-member-files.mjs ai-native-readiness` → `✓ ai-native-readiness/ai-native-readiness-v1.zip`.
- [ ] **Step 3:** Final commit of anything outstanding; summarise level framework, files, and how to test the download end-to-end (sign in as free member → /members → download card).
