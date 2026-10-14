# Invoice Generator - a Claude Code skill

Creates branded, Australian-GST-ready tax invoice PDFs and logs each one in a
local Client Register Excel workbook. Say "invoice for $700 for the logo
refresh" and you get an A4 PDF in Downloads. If the job came from a quote made
with the Quote from Email skill, it bills from that quote's own figures.

## What's in the zip

| Folder | Purpose |
|--------|---------|
| `invoice/` | The invoicing skill and invoice template |
| `quote-invoice-setup/` | First-run setup: business details, brand style and logo |
| `quote-from-email/` | Shared library: config, branding and the Client Register workbook code that `invoice` imports |

`quote-from-email/` is included because the invoice skill depends on its
scripts. If you only invoice, you never need to connect a mailbox.

## Install

```bash
unzip invoice-generator-v1.zip -d ~/.claude/skills/
```

All three folders must sit side by side in `~/.claude/skills/`.

## First run

```
/quote-invoice-setup
```

Skip the mailbox step if you only want invoices. Your ABN is saved in
`~/.creative-milk/config.json` on your machine, never inside the skill
folders. Bank details are asked for on each invoice and are never invented.

## Use

```
/invoice
```

Or ask: "invoice Canine Code $1,200 for the website build", "mark CM-2026-002
as sent", "what have we invoiced Canine Code?".

## Requirements

- Python 3
- Google Chrome or Chromium (PDF rendering)
