#!/usr/bin/env python3
"""Branded invoices (Creative Milk plugin), tracked in the Client Register workbook.

  cminvoice.py lookup TERM            Search the workbook: a quote number (adds its stages and
                                      what's outstanding), an invoice number, or part of a client name
  cminvoice.py next-no                Next free CM-YYYY-NNN
  cminvoice.py create SPEC.json [--force]
                                      Build the invoice PDF from the spec (filling gaps from the quote and
                                      the invoices already in the workbook), save it to ~/Downloads and
                                      log it in the workbook as Generated
  cminvoice.py record QUOTE_NO --invoice-no N --stage TEXT --ex-gst X [--no-gst]
               --invoice-date D --due-date D --pdf FILE [--force]
                                      Log a PDF made some other way
  cminvoice.py mark-sent INVOICE_NO [--date YYYY-MM-DD]   Only after the user confirms they sent it
  cminvoice.py mark-paid INVOICE_NO [--date YYYY-MM-DD]
  cminvoice.py status [QUOTE_NO]      Workbook rows (everything, or one quote and its invoices)

Every command prints JSON. The register code and its location (config.json -> register)
are shared with the quote-from-email skill, so quotes and invoices land in one workbook.
"""
import argparse
import json
import re
import subprocess
import sys
from datetime import date, timedelta
from decimal import ROUND_HALF_UP, Decimal
from html import escape
from pathlib import Path

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent / "assets"
QUOTE_SCRIPTS = HERE.parents[1] / "quote-from-email" / "scripts"  # sibling skill in this plugin
sys.path.insert(0, str(QUOTE_SCRIPTS))

from cmq import brand, config, register  # noqa: E402
from cmq.pricing import CENT  # noqa: E402

BALANCE, FULL = "Balance of the project", "Full project"


def _print(obj):
    print(json.dumps(obj, indent=2, default=str))


def money(d):
    return f"${Decimal(d).quantize(CENT, ROUND_HALF_UP):,.2f}"


def _num(x):
    x = Decimal(str(x))
    return f"{x.normalize():f}" if x == x.to_integral() else f"{x}"


def _fmt_date(iso, long=False):
    return date.fromisoformat(iso).strftime(f"%-d %{'B' if long else 'b'} %Y")


# ---------- lookup ----------

def quote_summary(cfg, quote_no):
    rec = register.quote_record(cfg, quote_no)
    invs = register.invoices_for(cfg, quote_no)
    inv_inc = sum((Decimal(i["Inc GST"]) for i in invs if i.get("Inc GST")), Decimal(0))
    inv_ex = sum((Decimal(i["Ex GST"]) for i in invs if i.get("Ex GST")), Decimal(0))
    done = [(i.get("Stage") or "").lower() for i in invs]
    return {
        "quote": rec,
        "invoices": [{k: i.get(k) for k in ("Invoice No", "Stage", "Invoice Date", "Inc GST", "Status")}
                     for i in invs],
        "invoiced_ex_gst": str(inv_ex), "invoiced_inc_gst": str(inv_inc),
        "outstanding_ex_gst": str(Decimal(rec["subtotal_ex_gst"]) - inv_ex),
        "outstanding_inc_gst": str(Decimal(rec["total_inc_gst"]) - inv_inc),
        # Stage names start with the quote's schedule label, e.g. "On launch (25%)".
        "stages_not_invoiced": [s["label"] for s in rec["schedule"]
                                if not any(d.startswith(s["label"].lower()) for d in done)],
        "next_invoice_no": register.next_invoice_no(cfg),
    }


def lookup(cfg, term):
    if register.QUOTE_NO_RE.match(term):
        return quote_summary(cfg, term)
    found = register.find(cfg, term)
    if not found["quotes"] and not found["invoices"]:
        raise register.RegisterError(f"Nothing in the Client Register matches {term!r}")
    return {**found, "next_invoice_no": register.next_invoice_no(cfg)}


# ---------- create ----------

def _stage_lines(cfg, spec, summary):
    """Default line item and amount for a quoted stage, from the quote's own figures."""
    rec, stage = summary["quote"], (spec.get("stage") or "").strip()
    if not stage:
        raise register.RegisterError("Which stage is this invoice for? Set stage to one of "
                                     f"{[s['label'] for s in rec['schedule']]}, {BALANCE!r} or {FULL!r}")
    scope = rec.get("scope") or "Website build"
    for s in rec["schedule"]:
        if stage.lower().startswith(s["label"].lower()):
            label = f"{s['label']} ({s['pct']}%)"
            return label, Decimal(s["inc_gst"]) - Decimal(s["ex_gst"]), [{
                "desc": scope, "sub": f"{label} of quote {rec['quote_no']}", "amount": s["ex_gst"]}]
    if stage.lower().startswith("balance"):
        ex = Decimal(summary["outstanding_ex_gst"])
        if ex <= 0:
            raise register.RegisterError(f"{rec['quote_no']} is already fully invoiced")
        return BALANCE, None, [{"desc": scope, "sub": f"Balance of quote {rec['quote_no']}", "amount": str(ex)}]
    if stage.lower().startswith("full"):
        return FULL, Decimal(rec["gst"]), [{"desc": scope, "sub": f"Quote {rec['quote_no']}",
                                            "amount": rec["subtotal_ex_gst"]}]
    return stage, None, None  # a custom stage: the spec must give its own items


def build_invoice(cfg, spec, force=False, out_dir=None):
    qn = spec.get("quote_no") or None
    summary = quote_summary(cfg, qn) if qn else None
    stage, quote_gst, quote_items = (_stage_lines(cfg, spec, summary) if summary
                                     else ((spec.get("stage") or "Invoice").strip(), None, None))
    items = spec.get("items") or quote_items
    if not items:
        raise register.RegisterError("No line items: add items to the spec")

    # Look in the workbook first: an invoice already raised for this quote and stage is
    # revised under its own number, never duplicated.
    existing = register.existing_invoice(cfg, qn, stage) if qn else None
    invoice_no = spec.get("invoice_no")
    if existing:
        if existing.get("Status") in (register.SENT, register.PAID) and not force:
            raise register.RegisterError(f"{qn} {stage} was already invoiced as {existing['Invoice No']} "
                                         f"({existing['Status']}). Pass --force only if the user is replacing it.")
        if invoice_no and invoice_no != existing["Invoice No"] and not force:
            raise register.RegisterError(f"{qn} {stage} is already invoiced as {existing['Invoice No']}; "
                                         "revise that one instead of raising a second invoice")
        invoice_no = invoice_no or existing["Invoice No"]
    invoice_no = invoice_no or register.next_invoice_no(cfg)
    if not register.INVOICE_NO_RE.match(invoice_no):
        raise register.RegisterError(f"Not an invoice number: {invoice_no!r}")

    # Money in Decimal so subtotal + GST always ties out.
    rows, subtotal = [], Decimal(0)
    for it in items:
        if "rate" in it:
            qty, rate = Decimal(str(it.get("qty", 1))), Decimal(str(it["rate"]))
            amt = (qty * rate).quantize(CENT, ROUND_HALF_UP)
            qty_txt = f"{_num(qty)} {it.get('unit', '')}".strip()
            rate_txt = f"{money(rate)} {it.get('rate_suffix', '')}".strip()
        else:
            amt = Decimal(str(it["amount"])).quantize(CENT, ROUND_HALF_UP)
            qty_txt, rate_txt = "1", money(amt)
        subtotal += amt
        rows.append((it["desc"], it.get("sub", ""), qty_txt, rate_txt, amt))

    gst_mode = spec.get("gst", "exclusive")
    if gst_mode == "exclusive":
        # A quoted stage keeps the quote's own GST split, so it matches the quote to the cent.
        tax = quote_gst if (quote_gst is not None and not spec.get("items")) else \
            (subtotal * Decimal(str(cfg["gst_rate"]))).quantize(CENT, ROUND_HALF_UP)
        ex, total = subtotal, subtotal + tax
    elif gst_mode == "inclusive":
        total = subtotal
        tax = (total / 11).quantize(CENT, ROUND_HALF_UP)
        ex = total - tax
    elif gst_mode == "none":
        tax, ex, total = Decimal(0), subtotal, subtotal
    else:
        raise register.RegisterError("gst must be exclusive, inclusive or none")

    abn = (spec.get("abn") or cfg.get("abn") or "").strip()
    if gst_mode != "none" and not abn:
        raise register.RegisterError("A tax invoice needs your ABN: run setup (or add abn to the spec), or set gst to none")
    if "pay_rows" not in spec:
        raise register.RegisterError("Add pay_rows (Account name, BSB, Account number...) to the spec. "
                                     "Ask the user; never invent bank details.")

    inv_date = spec.get("invoice_date") or date.today().isoformat()
    terms = spec.get("terms") or "Net 30"
    m = re.match(r"(?i)net\s*(\d+)$", terms.strip())
    due = spec.get("due_date") or (date.fromisoformat(inv_date) + timedelta(days=int(m.group(1)) if m else 30)).isoformat()

    client = (summary["quote"]["client"] if summary else {}) or {}
    bill = spec.get("bill_to") or {
        "name": client.get("business") or client.get("name") or "",
        "line1": client.get("name") if client.get("business") else "",
        "line2": client.get("email") or ""}
    if not bill.get("name"):
        raise register.RegisterError("No bill_to: add the client's name to the spec")

    html = _render_html(cfg, invoice_no, gst_mode, abn, inv_date, due, terms, bill, rows, subtotal, tax, total,
                        spec, qn)
    doc_type = "Tax Invoice" if gst_mode != "none" else "Invoice"
    biz = re.sub(r"[^A-Za-z0-9]+", "-", brand.name()).strip("-") or "Business"
    stem = f"{biz}-{doc_type.replace(' ', '-')}-{invoice_no}"
    work = register.drive_folder(cfg) / "Invoices"
    html_path = work / f"{stem}.html"
    html_path.write_text(html)
    pdf_path = Path(out_dir or Path.home() / "Downloads") / f"{stem}.pdf"
    subprocess.run(["bash", str(HERE / "render_pdf.sh"), str(html_path), str(pdf_path)], check=True,
                   stdout=subprocess.DEVNULL)

    logged = register.record_invoice(cfg, qn, invoice_no, stage, ex, tax, inv_date, due, pdf_path, force=force,
                                     client=None if qn else {"name": bill.get("line1") or bill["name"],
                                                             "business": bill["name"] if bill.get("line1") else ""})
    return {**logged, "revised_existing": bool(existing), "stage": stage, "doc_type": doc_type,
            "bill_to": bill, "invoice_date": inv_date, "due_date": due, "subtotal": str(subtotal),
            "total": str(total), "pdf": str(pdf_path), "html": str(html_path)}


def _render_html(cfg, no, gst_mode, abn, inv_date, due, terms, bill, rows, subtotal, tax, total, spec, qn):
    tpl = brand.apply((ASSETS / "template.html").read_text(), "invoice")
    tpl = re.sub(r"<!--.*?-->", "", tpl, flags=re.S)  # template notes aren't part of the document
    # Every piece of spec/quote text is escaped: client names come from emails, so treat them as untrusted.
    line_tpl = re.search(r"(\s*<tr>\s*<td>\s*<div class=\"desc\">.*?</tr>)", tpl, flags=re.S).group(1)
    lines = "".join(line_tpl.replace("{{DESC}}", escape(d)).replace("{{DESC_SUB}}", escape(s))
                    .replace("{{QTY}}", escape(q)).replace("{{RATE}}", escape(r)).replace("{{AMOUNT}}", money(a))
                    for d, s, q, r, a in rows)
    tpl = tpl.replace(line_tpl, lines)
    if gst_mode == "none":
        tpl = re.sub(r"\s*<tr><td class=\"lbl\">\{\{TAX_LABEL\}\}</td>.*?</tr>", "", tpl)

    frm = spec.get("from") or {}
    from_name = escape(frm.get("name") or brand.name())
    from_email = escape(frm.get("email") or cfg.get("mailbox") or "")
    doc_type = "Tax Invoice" if gst_mode != "none" else "Invoice"
    pay = "".join(f'<div class="row"><span class="rk">{escape(str(k))}</span><span class="rv">{escape(str(v))}</span></div>'
                  for k, v in spec["pay_rows"])
    ref = f"{no} / {qn}" if qn else no
    pay += f'<div class="row"><span class="rk">Reference</span><span class="rv">{escape(ref)}</span></div>'
    fields = {
        "LOGO_ON_DARK": brand.logo_element("on_dark"), "LOGO_ON_LIGHT": brand.logo_element("on_light", cls=""),
        "BUSINESS_NAME": escape(brand.name()),
        "DOC_TYPE": doc_type, "INVOICE_NO": escape(no),
        "ABN_BLOCK": f"ABN <strong>{escape(abn)}</strong>" if abn else "",
        "INVOICE_DATE": _fmt_date(inv_date), "TERMS": escape(terms), "DUE_DATE": _fmt_date(due),
        "AMOUNT_DUE": money(total),
        "FROM_NAME": from_name, "FROM_LINE_1": f"ABN {escape(abn)}" if abn else "", "FROM_LINE_2": from_email,
        "BILL_NAME": escape(bill["name"]), "BILL_LINE_1": escape(bill.get("line1") or ""),
        "BILL_LINE_2": escape(bill.get("line2") or ""),
        "SUBTOTAL": money(subtotal), "TAX_LABEL": "GST (10%)", "TAX_AMOUNT": money(tax),
        "TOTAL_LABEL": "Total (incl. GST)" if gst_mode != "none" else "Total", "TOTAL": money(total),
        "PAY_ROWS": pay,
        "PAYMENT_TERMS_MSG": (f"Please pay <strong>{money(total)}</strong> by <strong>{_fmt_date(due, True)}</strong>, "
                              f"quoting <strong style=\"white-space:nowrap\">{escape(no)}</strong> as the reference."),
        "FROM_EMAIL": from_email,
        "FOOTER_LINE": f"{doc_type} · {escape(no)} · {from_name}" + (f" · ABN {escape(abn)}" if abn else ""),
    }
    for k, v in fields.items():
        tpl = tpl.replace("{{" + k + "}}", v)
    left = re.findall(r"\{\{\w+\}\}", tpl)
    if left:
        raise register.RegisterError(f"Unfilled placeholders: {left}")
    if "—" in tpl or "–" in tpl:
        raise register.RegisterError("Em/en dash in the invoice text (house rule). Rephrase the spec.")
    return tpl


# ---------- CLI ----------

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("lookup").add_argument("term")
    sub.add_parser("next-no")
    c = sub.add_parser("create")
    c.add_argument("spec", type=Path)
    c.add_argument("--force", action="store_true", help="replace an invoice already marked Sent/Paid")
    r = sub.add_parser("record")
    r.add_argument("quote_no")
    r.add_argument("--invoice-no", required=True)
    r.add_argument("--stage", required=True, help='e.g. "On launch (25%%)" or "Full project"')
    r.add_argument("--ex-gst", required=True, help="amount before GST, e.g. 1100.00")
    r.add_argument("--no-gst", action="store_true", help="not a tax invoice: GST is 0")
    r.add_argument("--invoice-date", required=True)
    r.add_argument("--due-date", required=True)
    r.add_argument("--pdf", required=True)
    r.add_argument("--force", action="store_true", help="replace an invoice already marked Sent/Paid")
    for name in ("mark-sent", "mark-paid"):
        m = sub.add_parser(name)
        m.add_argument("invoice_no")
        m.add_argument("--date")
    sub.add_parser("status").add_argument("quote_no", nargs="?")
    args = ap.parse_args()
    cfg = config.load()

    try:
        if args.cmd == "lookup":
            _print(lookup(cfg, args.term))
        elif args.cmd == "next-no":
            _print({"next_invoice_no": register.next_invoice_no(cfg)})
        elif args.cmd == "create":
            _print(build_invoice(cfg, json.loads(args.spec.read_text()), force=args.force))
        elif args.cmd == "record":
            ex = Decimal(args.ex_gst.replace("$", "").replace(",", "")).quantize(CENT)
            gst = Decimal(0) if args.no_gst else (ex * Decimal(str(cfg["gst_rate"]))).quantize(CENT, ROUND_HALF_UP)
            if not args.no_gst:
                # A quoted stage reuses the quote's own split, so its total matches the quote to the cent.
                for s in register.quote_record(cfg, args.quote_no)["schedule"]:
                    if Decimal(s["ex_gst"]) == ex:
                        gst = Decimal(s["inc_gst"]) - ex
                        break
            _print(register.record_invoice(cfg, args.quote_no, args.invoice_no, args.stage, ex, gst,
                                           args.invoice_date, args.due_date, args.pdf, force=args.force))
        elif args.cmd in ("mark-sent", "mark-paid"):
            status = register.SENT if args.cmd == "mark-sent" else register.PAID
            _print(register.set_invoice_status(cfg, args.invoice_no, status, args.date))
        else:
            data = register.load(cfg)
            if args.quote_no:
                data = {"Quotes": [q for q in data["Quotes"] if q.get("Quote No") == args.quote_no],
                        "Invoices": [i for i in data["Invoices"] if i.get("Quote No") == args.quote_no]}
            data.pop("_headers", None)
            _print({"register": str(register.register_path(cfg)), **data})
    except (register.RegisterError, ValueError, ArithmeticError, KeyError, subprocess.CalledProcessError) as e:
        sys.exit(f"error: {e}")


if __name__ == "__main__":
    main()
