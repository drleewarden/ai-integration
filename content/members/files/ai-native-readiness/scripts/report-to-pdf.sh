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
    if "$BROWSER" --headless --disable-gpu --no-pdf-header-footer \
      --print-to-pdf="$OUT_ABS" "file://$IN_ABS" 2>/dev/null; then
      echo "PDF written: $OUT_ABS"
      exit 0
    fi
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
