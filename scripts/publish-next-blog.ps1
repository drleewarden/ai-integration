<#
.SYNOPSIS
    Publishes the next Creative Milk blog post to the Next.js repo.
    Scheduled to run every Monday and Thursday via Windows Task Scheduler.

.DESCRIPTION
    - Reads source blog files from content/blogs/ in the repo
    - Checks app/insights/ to find what has already been published
    - Picks the next unpublished blog in sequential order (blog-01, blog-02, ...)
    - Extracts CSS + HTML from the .html file and metadata from the .md file
    - Creates app/insights/{slug}/page.tsx and data.json
    - Commits and pushes to the Craig branch
#>

$ErrorActionPreference = "Stop"

# ── Config ────────────────────────────────────────────────────────────────────
$repoDir    = "C:\Users\craig.wilson\OneDrive - Gannett Company, Incorporated\Craig - Pics + Files\AI\GitHub\ai-integration"
$contentDir = "$repoDir\content\blogs"
$pagesDir   = "$repoDir\app\insights"
$branch     = "Craig"
$logFile    = "$repoDir\scripts\publish-blog.log"

# ── Logging ───────────────────────────────────────────────────────────────────
function Log {
    param([string]$msg, [string]$level = "INFO")
    $ts   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "$ts  [$level]  $msg"
    Write-Host $line
    Add-Content -Path $logFile -Value $line -Encoding UTF8
}

Log "====== Blog publish run starting ======"

# ── 1. Validate directories ───────────────────────────────────────────────────
foreach ($dir in @($contentDir, $pagesDir)) {
    if (-not (Test-Path $dir)) {
        Log "Directory not found: $dir" "ERROR"
        exit 1
    }
}

# ── 2. Collect source blogs sorted by number ─────────────────────────────────
$sourceBlogs = Get-ChildItem "$contentDir\blog-*.md" | Sort-Object Name

if ($sourceBlogs.Count -eq 0) {
    Log "No source blog .md files found in $contentDir" "ERROR"
    exit 1
}

Log "Found $($sourceBlogs.Count) source blogs"

# ── 3. Check what's already published ────────────────────────────────────────
$publishedNums = @()
if (Test-Path $pagesDir) {
    $publishedNums = Get-ChildItem $pagesDir -Directory |
        Where-Object { $_.Name -match '^blog-(\d+)' } |
        ForEach-Object { [int]($_.Name -split '-')[1] }
}

Log "Already published blog numbers: $($publishedNums -join ', ')"

# ── 4. Find the next unpublished blog ─────────────────────────────────────────
$nextMd = $null
foreach ($md in $sourceBlogs) {
    # Extract the two-digit number from e.g. "blog-01-why-ai-fails"
    if ($md.BaseName -match '^blog-(\d+)') {
        $num = [int]$Matches[1]
        if ($publishedNums -notcontains $num) {
            $nextMd = $md
            break
        }
    }
}

if ($null -eq $nextMd) {
    Log "All $($sourceBlogs.Count) blogs are already published. Nothing to do."
    exit 0
}

$slug    = $nextMd.BaseName                          # e.g. "blog-01-why-ai-fails"
$numStr  = ($slug -split '-')[1]                     # e.g. "01"
$numInt  = [int]$numStr

Log "Next blog to publish: $slug (blog $numInt of $($sourceBlogs.Count))"

# ── 5. Parse metadata from .md ────────────────────────────────────────────────
$mdRaw = Get-Content $nextMd.FullName -Raw -Encoding UTF8

$title    = ($mdRaw -split "`n" | Where-Object { $_ -match '^# ' }                          | Select-Object -First 1) -replace '^# ', ''
$metaDesc = ($mdRaw -split "`n" | Where-Object { $_ -match '^\*\*Meta description:\*\*' }   | Select-Object -First 1) -replace '^\*\*Meta description:\*\* ', ''
$category = ($mdRaw -split "`n" | Where-Object { $_ -match '^\*\*Category:\*\*' }           | Select-Object -First 1) -replace '^\*\*Category:\*\* ', ''
$readTime = ($mdRaw -split "`n" | Where-Object { $_ -match '^\*\*Estimated read time:\*\*' }| Select-Object -First 1) -replace '^\*\*Estimated read time:\*\* ', ''

if (-not $title)    { Log "Could not parse title from $($nextMd.Name)" "WARN" }
if (-not $metaDesc) { Log "Could not parse meta description from $($nextMd.Name)" "WARN" }

$pageTitle = if ($title) { "$title | Creative Milk Insights" } else { "Blog Post $numInt | Creative Milk Insights" }
$pageDesc  = if ($metaDesc) { $metaDesc } else { "AI implementation insights from Creative Milk." }

Log "  Title:    $title"
Log "  Category: $category"
Log "  ReadTime: $readTime"

# ── 6. Find and read the matching .html file ──────────────────────────────────
# Match by number prefix (blog-04-*.html) to handle filename mismatches
$htmlFile = Get-ChildItem "$contentDir\blog-$numStr-*.html" | Select-Object -First 1

if ($null -eq $htmlFile) {
    Log "HTML file not found for blog-$numStr in $contentDir" "ERROR"
    exit 1
}

Log "  HTML file: $($htmlFile.Name)"
$htmlRaw = Get-Content $htmlFile.FullName -Raw -Encoding UTF8

# Extract <style> block
$cssContent = ""
if ($htmlRaw -match '(?s)<style>(.*?)</style>') {
    $cssContent = $Matches[1].Trim()
}

# Extract <body> content
$bodyContent = ""
if ($htmlRaw -match '(?s)<body>(.*?)</body>') {
    $bodyContent = $Matches[1].Trim()
} else {
    # Fallback: use everything after </head>
    $bodyContent = ($htmlRaw -split '(?i)</head>',2)[-1] -replace '(?i)</?body[^>]*>', ''
}

if (-not $bodyContent) {
    Log "Could not extract body content from $($htmlFile.Name)" "ERROR"
    exit 1
}

# ── 7. Build data.json using ConvertTo-Json (handles all escaping) ────────────
$dataObj = [ordered]@{
    slug     = $slug
    num      = $numInt
    title    = $pageTitle
    description = $pageDesc
    category = $category
    readTime = $readTime
    css      = $cssContent
    html     = $bodyContent
}

$dataJson = $dataObj | ConvertTo-Json -Depth 3

# ── 8. Write the Next.js page files ──────────────────────────────────────────
$outDir = "$pagesDir\$slug"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

# data.json
$dataJson | Out-File -FilePath "$outDir\data.json" -Encoding utf8 -NoNewline

# page.tsx — metadata is hardcoded for Next.js static analysis
$pageTsx = @"
import type { Metadata } from "next";
import data from "./data.json";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "$($pageTitle -replace '"', '\"')",
  description: "$($pageDesc -replace '"', '\"')",
};

export default function BlogPost() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <main id="main" style={{ paddingTop: "68px" }}>
        <style dangerouslySetInnerHTML={{ __html: data.css }} />
        <div dangerouslySetInnerHTML={{ __html: data.html }} />
      </main>
      <Footer />
    </>
  );
}
"@

$pageTsx | Out-File -FilePath "$outDir\page.tsx" -Encoding utf8 -NoNewline

Log "  Wrote: app/insights/$slug/page.tsx"
Log "  Wrote: app/insights/$slug/data.json"

# ── 9. Git commit and push ────────────────────────────────────────────────────
Set-Location $repoDir

# Make sure we're on the right branch
$currentBranch = (git rev-parse --abbrev-ref HEAD)
if ($currentBranch -ne $branch) {
    Log "Switching to branch $branch (was on $currentBranch)"
    git checkout $branch | ForEach-Object { Log "  git: $_" }
}

git add "app/insights/$slug"
if ($LASTEXITCODE -ne 0) { Log "git add failed (exit $LASTEXITCODE)" "ERROR"; exit 1 }
Log "  git: staged app/insights/$slug"

$shortTitle = if ($title.Length -gt 60) { $title.Substring(0, 57) + "..." } else { $title }
$commitMsg  = "feat(blog): publish blog-$numStr -- $shortTitle"

git commit -m $commitMsg
if ($LASTEXITCODE -ne 0) { Log "git commit failed (exit $LASTEXITCODE)" "ERROR"; exit 1 }
Log "  git: committed"

git push origin $branch
if ($LASTEXITCODE -ne 0) { Log "git push failed (exit $LASTEXITCODE)" "ERROR"; exit 1 }

Log "  Pushed blog-$numStr to origin/$branch"
Log "====== Blog publish run complete ======"
exit 0
