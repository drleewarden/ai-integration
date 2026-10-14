---
name: invoice
description: >-
  Generate a polished, client-ready invoice as a branded PDF (the user's own brand from
  quote-invoice-setup, or the Creative Milk house style) and log it in the Client Register Excel
  workbook. Use whenever someone wants to create, make, draft, or send an invoice, tax invoice,
  or bill - phrases like "invoice for $700 for X", "make an invoice", "bill this client", "create
  a tax invoice", "/invoice". When the job came from a quote (CM-Q-YYYY-NNN, made by
  quote-from-email), it looks the quote and any earlier invoices up in the workbook and bills from
  the quote's own figures - "invoice the Canine Code job", "the job for CM-Q-2026-001 is finished,
  invoice it". Also for "mark CM-2026-002 as sent" and "what have we invoiced Canine Code?".
  Handles Australian GST, multiple line items, payment terms and bank details; saves the A4 PDF
  to Downloads.
---

# invoice

Turn a short brief ("invoice $700 for 2 hours Copilot training", "the Canine Code job is
finished") into a designed, client-ready branded invoice PDF, and log it in the
Client Register workbook. Both correctness (the numbers, a valid tax invoice) and
presentation (the brand) matter.

## Prerequisites
- Chrome or Chromium (for PDF rendering via `scripts/render_pdf.sh`).
- Setup done once with the `quote-invoice-setup` skill: it saves the business name, brand (colours,
  fonts, logos) and folders in `~/.creative-milk/`. Without it, invoices use the Creative Milk house
  style. This skill uses code from the sibling `quote-from-email` skill in the same plugin.

## Bundled resources
- `scripts/cminvoice.py` - the main tool. `create` builds the PDF from a JSON spec and logs
  it; `lookup`, `next-no`, `record`, `mark-sent`, `mark-paid`, `status`. Prints JSON.
- `assets/template.html` - the branded invoice template (filled by `create`; don't hand-edit
  per job).
- `assets/logo-on-dark.svg`, `assets/logo-on-light.svg` - house-style logos, used only when `brand.json` has none.
- `scripts/render_pdf.sh` - HTML to A4 PDF via Chrome headless (called by `create`).

## The Client Register

Quotes and invoices are tracked in one local workbook, shared with the `quote-from-email`
skill (location: `register.dir` in `~/.creative-milk/config.json`, set during setup):

```
<register.dir>/
  Client Register.xlsx   "Quotes" sheet: one row per quote + invoicing summary
                         "Invoices" sheet: one row per invoice (quoted or not)
  Quotes/                quote PDFs + CM-Q-YYYY-NNN.json (written by quote-from-email)
  Invoices/              invoice PDFs and their HTML
```

The quote skill adds the quote when it builds and drafts it. `create` reads the workbook
before it builds anything, then adds or updates the invoice row. Invoice status moves
**Generated** (PDF built) -> **Sent** (only once the user says they sent it; nothing here sends
email) -> **Paid**. The quote row shows invoiced to date, outstanding, and the latest status
(or "Paid in full"). The user can open the workbook in Excel and add their own columns, which
are kept. Close it in Excel before running a command, so the save isn't lost.

## Workflow

Track these as todos so nothing gets skipped.

### 1. Look it up in the workbook first
Search by quote number, invoice number or client name:

```bash
python3 scripts/cminvoice.py lookup CM-Q-2026-001
python3 scripts/cminvoice.py lookup "canine"
```

For a quote number you get the client, scope, quoted totals, the payment stages (25% on
acceptance, 50% at design sign-off, 25% on launch, exact ex and inc GST), invoices already
raised against it, what's outstanding, `stages_not_invoiced` and `next_invoice_no`. A name
search returns the matching quote and invoice rows; if it finds a quote, look that up by
number.

Show the user what has already been invoiced, then ask (one AskUserQuestion) which stage this
invoice covers. Recommend the first of `stages_not_invoiced`, or `Balance of the project`
when the job is finished and earlier stages were never invoiced (the script bills exactly
what is outstanding). `Full project` bills the whole quote in one go. Never re-price a
quoted job: if the user wants a different amount, give your own `items` and say it differs
from the quote.

No quote (ad-hoc work)? Skip to step 2 with your own `bill_to` and `items`. It is still
logged in the Invoices sheet.

### 2. Gather what the spec needs
Ask for anything missing that materially changes the document:
- **ABN** - comes from `abn` in `~/.creative-milk/config.json`, so leave it out of the spec. If it
  isn't set and this is a tax invoice, ask the user and offer to save it with
  `cmquote.py setup-save` (`{"config": {"abn": "..."}}`). Never invent one.
- **Payment details** (`pay_rows`) - account name, BSB, account number (or PayPal/Stripe/
  "on request"). Ask the user; never invent bank details. The Reference row is added for you
  (invoice number, plus the quote number for a quoted job).
- **Terms** - default `Net 30`; the due date is worked out from `Net N`.
- **GST** - `exclusive` (default, adds 10%), `inclusive` (amounts include GST, GST = 1/11)
  or `none` (not GST-registered: header says "Invoice", no GST row). Only call it a tax
  invoice if the business is GST-registered; if unsure, ask. A valid Australian tax invoice
  shows the seller's ABN, the words "Tax Invoice", the GST amount and the date.

### 3. Create it
Write the spec in the session scratchpad and run `create`:

```json
{
  "quote_no": "CM-Q-2026-001",
  "stage": "On launch",
  "terms": "Net 14",
  "pay_rows": [["Account name", "<business name>"], ["BSB", "<bsb>"], ["Account number", "<acct>"]]
}
```

```bash
python3 scripts/cminvoice.py create spec.json
```

Optional keys: `invoice_no` (default: the workbook's existing invoice for this quote and
stage, otherwise `next_invoice_no`), `invoice_date` (default today), `due_date`, `gst`,
`bill_to` `{name, line1, line2}` (default from the quote: business, contact name, email),
`items` (default: one line from the quote for that stage). Items are
`{desc, sub, qty, unit, rate, rate_suffix}` or `{desc, sub, amount}`.

Ad-hoc example: `{"stage": "Copilot training", "bill_to": {...}, "items": [{"desc":
"Microsoft Copilot training", "qty": 2, "unit": "hrs", "rate": 350, "rate_suffix": "/ hr"}],
"pay_rows": [...]}`.

What `create` does with the workbook:
- **Same quote and stage already invoiced?** If it's still Generated, it rebuilds that
  invoice under the same number (`revised_existing: true`), never a second invoice. If it's
  Sent or Paid, it stops; only pass `--force` if the user confirms they are replacing it.
- Numbers come from the workbook, the Invoices folder and `~/Downloads` (older invoices),
  so they never collide.
- It saves `~/Downloads/<Business-Name>-Tax-Invoice-<NO>.pdf`, copies it into the register's
  `Invoices/` folder, and logs the row as **Generated** with the quote row's totals
  updated.

### 4. QA and deliver
Read the PDF and check: one page, no `{{` tokens, the figures match the JSON (`subtotal`,
`gst`, `total`), and the bill-to and stage are right. Hand it over with SendUserFile and
recap: client, stage, subtotal, GST, total, due date, and for a quoted job what's
`outstanding_inc_gst` afterwards. If `over_quote` is true, tell the user the invoices now add
up to more than the quote. Flag for a human check: GST registration (if it's a tax invoice)
and the bank details.

### 5. Mark it sent (only when the user says so)
The row says **Generated** until the user tells you they have emailed it:

```bash
python3 scripts/cminvoice.py mark-sent CM-2026-002            # --date YYYY-MM-DD if not today
```

Never mark an invoice Sent on your own judgement. When the client pays, `mark-paid` (the
`paid-invoice` skill does this with its receipts). Report `quote_invoice_status` and
`outstanding_inc_gst` back.

## Other commands

```bash
python3 scripts/cminvoice.py status [CM-Q-2026-001]   # workbook rows
python3 scripts/cminvoice.py next-no                  # next CM-YYYY-NNN
python3 scripts/cminvoice.py record CM-Q-2026-001 --invoice-no CM-2026-002 --stage "On launch (25%)" \
  --ex-gst 1100.00 --invoice-date 2026-10-12 --due-date 2026-10-26 --pdf FILE.pdf   # log a PDF made elsewhere
```

## Notes
- `from` in the spec (`{name, email}`) overrides the business name and mailbox shown as the sender.
- The workbook holds client names and emails (personal information). Keep to what is
  already there: never add phone numbers, bank details or email text to it.
- Never fabricate an ABN, bank/BSB/account number, or client details - ask.
- No em dashes anywhere in the output (house rule); `create` refuses text that has one.
- All spec text is HTML-escaped before it goes into the template.
- Australian English and AUD by default; adjust currency/tax if the client is offshore.
- To sync with Google Drive or OneDrive: set `register.dir` (via `setup-save`) to a synced folder
  and move the `Client Register` folder there.
