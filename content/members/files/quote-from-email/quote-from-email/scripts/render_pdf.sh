#!/usr/bin/env bash
# render_pdf.sh: render a self-contained HTML file to a print-ready A4 PDF.
# Usage: render_pdf.sh <input.html> <output.pdf>
# Relies on Chrome's headless print pipeline (respects @page, background colours,
# CSS page counters). No external CSS/JS; inline everything (incl. logo SVGs).
set -euo pipefail

IN="${1:?usage: render_pdf.sh <input.html> <output.pdf>}"
OUT="${2:?usage: render_pdf.sh <input.html> <output.pdf>}"

# Locate a Chrome/Chromium binary across platforms.
CHROME=""
for c in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium" \
  "$(command -v google-chrome 2>/dev/null || true)" \
  "$(command -v google-chrome-stable 2>/dev/null || true)" \
  "$(command -v chromium 2>/dev/null || true)" \
  "$(command -v chromium-browser 2>/dev/null || true)"; do
  if [ -n "$c" ] && [ -x "$c" ]; then CHROME="$c"; break; fi
done
if [ -z "$CHROME" ]; then
  echo "ERROR: no Chrome/Chromium found. Install Chrome or set the path manually." >&2
  exit 1
fi

# Absolute file:// URL so relative refs resolve.
ABS="$(cd "$(dirname "$IN")" && pwd)/$(basename "$IN")"

"$CHROME" --headless --disable-gpu --no-pdf-header-footer --no-margins \
  --print-to-pdf="$OUT" "file://$ABS" >/dev/null 2>&1 || {
    # Older Chrome builds use a different flag name for suppressing headers.
    "$CHROME" --headless --disable-gpu --print-to-pdf-no-header --no-margins \
      --print-to-pdf="$OUT" "file://$ABS" >/dev/null 2>&1
  }

[ -f "$OUT" ] && echo "Wrote $OUT ($(du -h "$OUT" | cut -f1))" || { echo "ERROR: render failed" >&2; exit 1; }
