"""Client Register: quotes and the invoices raised against them, in one Excel workbook.

A local folder for now (config.json -> register.dir). Point register.dir at a Google
Drive for desktop folder later and the same files sync to Drive:

  ~/Documents/Client Register/   (default; the setup skill sets register.dir)
    Client Register.xlsx    sheet "Quotes": one row per quote, with an invoicing summary
                            sheet "Invoices": one row per invoice, keyed to its quote number
    Quotes/                 quote PDFs + CM-Q-YYYY-NNN.json (the record invoices are built from)
    Invoices/               invoice PDFs

Only real quotes go here, never test runs. The register holds name, business and
email only (no message ids, no email text), the same rule as the local ledger.
Cells are written as inline strings, so a client name like "=HYPERLINK(...)" is shown
as text and never evaluated as a formula.
"""
import json
import re
import shutil
from datetime import date, datetime
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation
from pathlib import Path

from . import config, xlsx
from .pricing import CENT, split_schedule

QUOTE_NO_RE = re.compile(r"^CM-Q-\d{4}-\d{3,}$")
INVOICE_NO_RE = re.compile(r"^CM-\d{4}-\d{3,}$")
_INVOICE_IN_NAME = re.compile(r"CM-(\d{4})-(\d{3,})")

QUOTES, INVOICES = "Quotes", "Invoices"
QUOTE_COLS = ["Quote No", "Quote Date", "Client", "Business", "Email", "Scope", "Ex GST", "GST", "Inc GST",
              "Quote Status", "Quote PDF", "Invoiced Inc GST", "Outstanding Inc GST", "Invoice Status",
              "Last Invoice", "Notes"]
INVOICE_COLS = ["Invoice No", "Quote No", "Client", "Business", "Stage", "Invoice Date", "Due Date", "Ex GST",
                "GST", "Inc GST", "Status", "Sent Date", "Paid Date", "Invoice PDF", "Notes"]
MONEY = {"Ex GST", "GST", "Inc GST", "Invoiced Inc GST", "Outstanding Inc GST"}
DATES = {"Quote Date", "Invoice Date", "Due Date", "Sent Date", "Paid Date"}
WIDTHS = {"Quote No": 16, "Invoice No": 14, "Client": 24, "Business": 24, "Email": 30, "Scope": 22, "Stage": 24,
          "Quote PDF": 36, "Invoice PDF": 40, "Notes": 40}
# Invoice lifecycle. "Generated" = PDF built; "Sent" only once the user confirms they sent it.
GENERATED, SENT, PAID = "Generated", "Sent", "Paid"


class RegisterError(Exception):
    pass


# ---------- location ----------

def drive_folder(cfg):
    """The register folder (config.json -> register.dir), created private to this user
    because it holds client names and emails."""
    folder = Path((cfg.get("register") or {}).get("dir", "~/Documents/Client Register")).expanduser()
    config.ensure_private_dir(folder)
    for sub in ("Quotes", "Invoices"):
        config.ensure_private_dir(folder / sub)
    return folder


def register_path(cfg):
    return drive_folder(cfg) / (cfg.get("register") or {}).get("file", "Client Register.xlsx")


# ---------- load / save ----------

def _norm(col, v):
    if col in DATES and isinstance(v, float):
        return xlsx.serial_to_iso(v)  # Google Sheets turned a typed date into a serial
    if isinstance(v, float):
        return f"{v:.2f}" if col in MONEY else (str(int(v)) if v.is_integer() else str(v))
    return str(v).strip()


def load(cfg):
    """{"Quotes": [row dicts], "Invoices": [...], "_headers": {sheet: header list}}.

    Columns the user adds in Google Sheets are kept and written back after ours.
    """
    path = register_path(cfg)
    data = {QUOTES: [], INVOICES: [], "_headers": {QUOTES: list(QUOTE_COLS), INVOICES: list(INVOICE_COLS)}}
    if not path.exists():
        return data
    try:
        sheets = xlsx.read(path)
    except Exception as e:  # corrupt or mid-sync file: stop rather than overwrite it
        raise RegisterError(f"Could not read {path.name} ({e}). If it is open in Excel or still syncing, try again shortly.")
    for name, base in ((QUOTES, QUOTE_COLS), (INVOICES, INVOICE_COLS)):
        rows = sheets.get(name) or []
        if not rows:
            continue
        header = [str(h).strip() for h in rows[0]]
        data["_headers"][name] = base + [h for h in header if h and h not in base]
        for r in rows[1:]:
            if not any(str(v).strip() for v in r):
                continue
            data[name].append({h: _norm(h, r[i]) if i < len(r) else "" for i, h in enumerate(header) if h})
    return data


def _cell(col, v):
    if col in MONEY and v not in ("", None):
        return float(_dec(v))
    return "" if v is None else str(v)


def save(cfg, data):
    sheets = []
    for name in (QUOTES, INVOICES):
        headers = data["_headers"][name]
        rows = [headers] + [[_cell(h, r.get(h, "")) for h in headers] for r in data[name]]
        money = [i for i, h in enumerate(headers) if h in MONEY]
        widths = [WIDTHS.get(h, 14) for h in headers]
        sheets.append((name, rows, money, widths))
    xlsx.write(register_path(cfg), sheets)


def _dec(v):
    try:
        return Decimal(str(v).replace("$", "").replace(",", "")).quantize(CENT, ROUND_HALF_UP)
    except InvalidOperation:
        raise RegisterError(f"Not an amount: {v!r}")


def _find(rows, key, value):
    return next((r for r in rows if r.get(key) == value), None)


# ---------- quotes ----------

def _scope(pages, seo):
    s = "Single page website" if int(pages) == 1 else f"{pages} page website"
    return s + (" + SEO, AEO and GEO" if str(seo).lower() in ("true", "1", "yes") else "")


def record_quote(cfg, build, status):
    """Copy the quote PDF and record into the register folder and upsert its row.

    `build` is the result of interactive.build (or its pending/*.json). Test runs are refused.
    """
    if build.get("test"):
        raise RegisterError("Test runs are never written to the Client Register")
    qn = build["quote_no"]
    if not QUOTE_NO_RE.match(qn):
        raise RegisterError(f"Not a quote number: {qn!r}")
    folder = drive_folder(cfg)
    pdf = Path(build["pdf"])
    drive_pdf = folder / "Quotes" / pdf.name
    if pdf.exists() and pdf.resolve() != drive_pdf.resolve():
        shutil.copy2(pdf, drive_pdf)

    rec_path = folder / "Quotes" / f"{qn}.json"
    old = json.loads(rec_path.read_text()) if rec_path.exists() else {}
    subtotal, total = _dec(build["subtotal_ex_gst"]), _dec(build["total_inc_gst"])
    c = build["client"]
    record = {
        "quote_no": qn,
        "quoted_at": old.get("quoted_at") or date.today().isoformat(),
        "client": {"name": c.get("name"), "first_name": c.get("first_name"), "business": c.get("business"),
                   "email": c.get("email")},
        "pages": build["pages"], "seo": build["seo"], "scope": _scope(build["pages"], build["seo"]),
        "subtotal_ex_gst": str(subtotal), "gst": str(_dec(build["gst"])), "total_inc_gst": str(total),
        "schedule": [{"label": s["label"], "pct": s["pct"], "ex_gst": str(s["amount_ex"]),
                      "inc_gst": str(s["amount"])} for s in split_schedule(subtotal, total, cfg["payment_schedule"])],
        "quote_pdf": f"Quotes/{pdf.name}",
    }
    rec_path.write_text(json.dumps(record, indent=2))

    data = load(cfg)
    row = _find(data[QUOTES], "Quote No", qn)
    if row is None:
        row = {"Quote No": qn}
        data[QUOTES].append(row)
    row.update({"Quote Date": row.get("Quote Date") or record["quoted_at"], "Client": c.get("name") or "",
                "Business": c.get("business") or "", "Email": c.get("email") or "", "Scope": record["scope"],
                "Ex GST": record["subtotal_ex_gst"], "GST": record["gst"], "Inc GST": record["total_inc_gst"],
                "Quote Status": status, "Quote PDF": record["quote_pdf"]})
    _refresh_quote(data, qn)
    save(cfg, data)
    return {"register": str(register_path(cfg)), "quote_record": str(rec_path), "quote_pdf": str(drive_pdf)}


def quote_record(cfg, quote_no):
    """The stored quote an invoice is built from: the register's record, then the local build,
    then the spreadsheet row itself (for quotes typed straight into the workbook)."""
    if not QUOTE_NO_RE.match(quote_no or ""):
        raise RegisterError(f"Not a quote number: {quote_no!r}")
    p = drive_folder(cfg) / "Quotes" / f"{quote_no}.json"
    if p.exists():
        return json.loads(p.read_text())
    local = cfg["quotes_dir"] / "pending" / f"{quote_no}.json"
    if local.exists():
        record_quote(cfg, json.loads(local.read_text()), "Built")  # backfill the register, then use it
        return json.loads(p.read_text())
    row = _find(load(cfg)[QUOTES], "Quote No", quote_no)
    if row and row.get("Ex GST") and row.get("Inc GST"):
        subtotal, total = _dec(row["Ex GST"]), _dec(row["Inc GST"])
        return {"quote_no": quote_no, "quoted_at": row.get("Quote Date"), "scope": row.get("Scope") or "",
                "client": {"name": row.get("Client"), "first_name": None, "business": row.get("Business"),
                           "email": row.get("Email")},
                "subtotal_ex_gst": str(subtotal), "gst": str(total - subtotal), "total_inc_gst": str(total),
                "schedule": [{"label": s["label"], "pct": s["pct"], "ex_gst": str(s["amount_ex"]),
                              "inc_gst": str(s["amount"])}
                             for s in split_schedule(subtotal, total, cfg["payment_schedule"])],
                "quote_pdf": row.get("Quote PDF") or ""}
    raise RegisterError(f"No quote {quote_no} in the Client Register or in {cfg['quotes_dir']}")


# ---------- invoices ----------

def _refresh_quote(data, quote_no):
    """Recompute a quote row's invoicing summary from its invoices."""
    row = _find(data[QUOTES], "Quote No", quote_no)
    if row is None:
        return
    invs = sorted((i for i in data[INVOICES] if i.get("Quote No") == quote_no), key=lambda i: i["Invoice No"])
    invoiced = sum((_dec(i["Inc GST"]) for i in invs if i.get("Inc GST")), Decimal(0))
    row["Invoiced Inc GST"] = str(invoiced) if invs else ""
    row["Outstanding Inc GST"] = str(_dec(row["Inc GST"]) - invoiced) if row.get("Inc GST") and invs else ""
    if not invs:
        row["Invoice Status"], row["Last Invoice"] = "Not invoiced", ""
        return
    last = invs[-1]
    row["Last Invoice"] = last["Invoice No"]
    all_paid = all(i.get("Status") == PAID for i in invs)
    if all_paid and row.get("Inc GST") and invoiced >= _dec(row["Inc GST"]):
        row["Invoice Status"] = "Paid in full"
    else:
        row["Invoice Status"] = f"{last.get('Status')}: {last.get('Stage') or last['Invoice No']}"


def invoices_for(cfg, quote_no):
    return [i for i in load(cfg)[INVOICES] if i.get("Quote No") == quote_no]


def next_invoice_no(cfg, year=None):
    """CM-YYYY-NNN, one past the highest seen in the workbook, the register's Invoices folder
    and ~/Downloads (invoices made before the register existed)."""
    year = year or date.today().year
    seen = [i["Invoice No"] for i in load(cfg)[INVOICES]]
    seen += [p.name for p in (drive_folder(cfg) / "Invoices").glob("*.pdf")]
    seen += [p.name for p in (Path.home() / "Downloads").glob("*Invoice-CM-*.pdf")]
    n = max((int(m.group(2)) for s in seen for m in [_INVOICE_IN_NAME.search(s)]
             if m and int(m.group(1)) == year), default=0)
    return f"CM-{year}-{n + 1:03d}"


def find(cfg, term):
    """Search the workbook: an exact quote or invoice number, or part of a client/business/email."""
    data, t = load(cfg), (term or "").strip().lower()
    if not t:
        raise RegisterError("Nothing to search for")
    hit = lambda r, cols: any(t == (r.get(c) or "").lower() if c.endswith("No") else t in (r.get(c) or "").lower()
                              for c in cols)
    quotes = [q for q in data[QUOTES] if hit(q, ("Quote No", "Client", "Business", "Email"))]
    qnos = {q["Quote No"] for q in quotes}
    invoices = [i for i in data[INVOICES]
                if i.get("Quote No") in qnos or hit(i, ("Invoice No", "Quote No", "Client", "Business"))]
    return {"quotes": quotes, "invoices": invoices}


def existing_invoice(cfg, quote_no, stage):
    """The invoice already raised for this quote and stage, if any (stages match on their quote label)."""
    stage = (stage or "").strip().lower()
    for i in load(cfg)[INVOICES]:
        s = (i.get("Stage") or "").lower()
        if i.get("Quote No") == quote_no and stage and (s == stage or s.startswith(stage) or stage.startswith(s)):
            return i
    return None


def record_invoice(cfg, quote_no, invoice_no, stage, ex_gst, gst, invoice_date, due_date, pdf, force=False,
                   client=None):
    """Add (or revise) an invoice row and copy its PDF into the register. Status: Generated.

    quote_no may be empty for a job that was never quoted; then `client` ({name, business})
    fills the row.
    """
    if not INVOICE_NO_RE.match(invoice_no or ""):
        raise RegisterError(f"Not an invoice number: {invoice_no!r} (expected CM-YYYY-NNN)")
    rec = quote_record(cfg, quote_no) if quote_no else None
    pdf = Path(pdf).expanduser()
    if pdf.suffix.lower() != ".pdf" or not pdf.is_file():
        raise RegisterError(f"Invoice PDF not found: {pdf}")
    for d in (invoice_date, due_date):
        datetime.strptime(d, "%Y-%m-%d")  # ValueError on a bad date
    ex, g = _dec(ex_gst), _dec(gst)
    inc = ex + g
    quote_no = quote_no or ""

    data = load(cfg)
    row = _find(data[INVOICES], "Invoice No", invoice_no)
    if row and row.get("Quote No", "") != quote_no:
        raise RegisterError(f"{invoice_no} is already recorded against {row.get('Quote No') or 'another client'}")
    if row and row.get("Status") in (SENT, PAID) and not force:
        raise RegisterError(f"{invoice_no} is already {row['Status']}. Issue a new invoice number, or pass "
                            "--force if the user confirms they are replacing the sent copy.")

    folder = drive_folder(cfg)
    dest = folder / "Invoices" / pdf.name
    if pdf.resolve() != dest.resolve():
        shutil.copy2(pdf, dest)
    if row is None:
        row = {"Invoice No": invoice_no}
        data[INVOICES].append(row)
    c = (rec or {}).get("client") or client or {}
    row.update({"Quote No": quote_no, "Client": c.get("name") or "", "Business": c.get("business") or "",
                "Stage": (stage or "").strip()[:60], "Invoice Date": invoice_date, "Due Date": due_date,
                "Ex GST": str(ex), "GST": str(g), "Inc GST": str(inc), "Status": GENERATED, "Sent Date": "",
                "Paid Date": "", "Invoice PDF": f"Invoices/{pdf.name}"})
    if rec and _find(data[QUOTES], "Quote No", quote_no) is None:
        record_quote(cfg, {**rec, "pdf": str(folder / rec["quote_pdf"]), "pages": rec.get("pages", 1),
                           "seo": rec.get("seo", False)}, "Built")
        data = _merge_after_quote_write(cfg, data)
    if quote_no:
        _refresh_quote(data, quote_no)
    save(cfg, data)

    out = {"invoice_no": invoice_no, "quote_no": quote_no or None, "status": GENERATED, "ex_gst": str(ex),
           "gst": str(g), "inc_gst": str(inc), "invoice_pdf": str(dest), "register": str(register_path(cfg))}
    if rec:
        invoiced = sum((_dec(i["Inc GST"]) for i in data[INVOICES] if i.get("Quote No") == quote_no), Decimal(0))
        out.update(quote_total_inc_gst=rec["total_inc_gst"], invoiced_inc_gst=str(invoiced),
                   outstanding_inc_gst=str(_dec(rec["total_inc_gst"]) - invoiced),
                   over_quote=invoiced > _dec(rec["total_inc_gst"]))
    return out


def _merge_after_quote_write(cfg, pending):
    """record_quote saved the quote row; reload it and keep our unsaved invoice rows."""
    fresh = load(cfg)
    fresh[INVOICES] = pending[INVOICES]
    return fresh


def set_invoice_status(cfg, invoice_no, status, when=None):
    """Mark an invoice Sent or Paid (the user confirms; nothing here sends anything)."""
    if status not in (SENT, PAID):
        raise RegisterError(f"Unknown status {status!r}")
    when = when or date.today().isoformat()
    datetime.strptime(when, "%Y-%m-%d")
    data = load(cfg)
    row = _find(data[INVOICES], "Invoice No", invoice_no)
    if row is None:
        raise RegisterError(f"{invoice_no} is not in the register. Record it first.")
    row["Status"] = status
    if status == SENT:
        row["Sent Date"] = when
    else:
        row["Paid Date"] = when
        row["Sent Date"] = row.get("Sent Date") or ""
    if row.get("Quote No"):
        _refresh_quote(data, row["Quote No"])
    save(cfg, data)
    q = _find(data[QUOTES], "Quote No", row.get("Quote No")) or {}
    return {"invoice_no": invoice_no, "quote_no": row.get("Quote No") or None, "status": status, "date": when,
            "quote_invoice_status": q.get("Invoice Status"), "outstanding_inc_gst": q.get("Outstanding Inc GST")}
