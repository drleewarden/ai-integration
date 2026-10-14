#!/usr/bin/env bash
# Builds the quote-from-email and invoice-generator member downloads.
# The invoice skill imports code from its sibling quote-from-email folder, and
# both rely on quote-invoice-setup, so each zip ships the folders it needs.
# Upload the outputs to the private member-files bucket at each item's storagePath.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FILES="$ROOT/content/members/files"
OUT="${1:-$ROOT/dist/members}"
mkdir -p "$OUT"

build() {
  local name="$1"; shift
  local stage
  stage="$(mktemp -d)"
  trap 'rm -rf "$stage"' RETURN
  for dir in "$@"; do cp -R "$dir" "$stage/"; done
  rm -f "$OUT/$name"
  (cd "$stage" && zip -qrX "$OUT/$name" . -x '*/__pycache__/*' '*.DS_Store')
  echo "$OUT/$name"
}

build quote-from-email-v1.zip \
  "$FILES/quote-from-email/README.md" \
  "$FILES/quote-from-email/quote-from-email" \
  "$FILES/quote-from-email/quote-invoice-setup"

build invoice-generator-v1.zip \
  "$FILES/invoice-generator/README.md" \
  "$FILES/invoice-generator/invoice" \
  "$FILES/quote-from-email/quote-from-email" \
  "$FILES/quote-from-email/quote-invoice-setup"
