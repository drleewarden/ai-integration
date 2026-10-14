"""Step-by-step quoting, driven by the user through the skill: check -> triage -> build -> draft.

Nothing runs in the background, and nothing is drafted until the user has seen the
PDF and said yes.

The email body is only ever read by the tool-less classifier (classify.py). These
commands return structured fields and the classifier's one-line summary, never the
raw body, so text inside an email cannot steer the session running the skill.
"""
import csv
import json
import re
from pathlib import Path

from . import brand, config, ledger, register
from .classify import classify
from .pipeline import REPLY_PREFIX, _load_state, _save_state, client_address, slug_safe
from .pricing import calc_quote, load_rates
from .render import (SIGNATURE_LOGO_CID, quote_html, render_pdf, reply_info_signed_html, reply_info_text,
                     reply_quote_signed_html, reply_quote_text)
from .triage import NEEDS_INFO, SIMPLE, triage

QUOTE_NO_RE = re.compile(r"^CM-Q-\d{4}-\d{3,}$")


class StepError(Exception):
    pass


def _test_dir(cfg):
    return cfg["quotes_dir"] / "test-runs"


def _pending_dir(base):
    return config.ensure_private_dir(base / "pending")


def load_message(src, cfg, graph):
    """`src` is a Graph message id, or a tests/emails/*.json file for an offline run.

    Returns (msg, is_test). Test runs use their own folder and numbering so they never
    consume real quote numbers.
    """
    p = Path(src)
    if src.endswith(".json") and p.is_file():
        e = json.loads(p.read_text())
        return {"id": f"test-{p.stem}", "subject": e["subject"], "categories": [], "webLink": None,
                "from": {"emailAddress": {"name": e["from_name"], "address": e["from_email"]}},
                "replyTo": [{"emailAddress": {"name": "", "address": e["reply_to"]}}] if e.get("reply_to") else [],
                "body": {"content": e["body"]}}, True
    if graph is None:
        raise StepError("Microsoft Graph is not configured, so only tests/emails/*.json files can be used")
    return graph.get_message(src), False


def _sender(msg, cfg):
    """(name, address) of the client. Website form emails (hello@/contact@) use their Reply-To."""
    name, addr, via_form = client_address(msg, cfg)
    if via_form and not addr:
        raise StepError("This website form email has no client Reply-To address, so there is no one to reply to")
    return name, addr


def _handled_ids(cfg):
    """Message ids that already have a draft or info request, from the ledger and poller state."""
    ids = set(_load_state()["processed"])
    path = cfg["quotes_dir"] / "quotes-ledger.csv"
    if path.exists():
        with open(path) as f:
            ids |= {r["message_id"] for r in csv.DictReader(f) if r.get("status") in ("drafted", "info_requested")}
    return ids


def check(cfg, graph, limit=10, show_all=False):
    """List the newest inbox emails with a status. Metadata only, no bodies."""
    handled = _handled_ids(cfg)
    out = []
    for m in graph.list_inbox(limit):
        name, addr, via_form = client_address(m, cfg)
        subject = (m.get("subject") or "")[:120]
        if m["id"] in handled:
            status = "already handled"
        elif m.get("isDraft"):
            status = "draft"
        elif via_form and not addr:
            status = "website form email without a Reply-To"
        elif not via_form and addr.split("@")[-1] in cfg["own_domains"]:
            status = "from our own domain"
        elif REPLY_PREFIX.match(subject):
            status = "reply in an existing thread"
        else:
            status = "new"
        if status == "new" or show_all:
            out.append({"id": m["id"], "received": m.get("receivedDateTime"), "from_name": name[:80],
                        "from_email": addr, "subject": subject, "is_read": m.get("isRead"),
                        "status": status, "via_website_form": via_form, "web_link": m.get("webLink")})
    return out


def triage_one(cfg, src, graph):
    """Does this email need a quote? Classifier + plain-code triage, no drafting."""
    msg, is_test = load_message(src, cfg, graph)
    name, addr = _sender(msg, cfg)
    c = classify(name, addr, msg.get("subject", ""), msg.get("body", {}).get("content", ""), cfg)
    outcome, reasons, quote = triage(c, cfg, load_rates(cfg))
    c = c or {}
    pages = 1 if c.get("is_single_page") else c.get("page_count")
    return {
        "message_id": msg["id"], "test": is_test, "subject": (msg.get("subject") or "")[:120],
        "outcome": outcome, "reasons": reasons,
        "summary": c.get("summary") or "Could not classify",
        "request_type": c.get("request_type"),
        "client": {"name": name[:80], "email": addr, "first_name": c.get("client_first_name"),
                   "business": c.get("business_name")},
        "suggested": {"pages": pages, "seo": c.get("seo_requested", False)},
        "complex_features": c.get("complex_features", []), "missing_info": c.get("missing_info", []),
        "confidence": c.get("confidence"),
        "flags": {"contains_instructions": c.get("contains_instructions", False),
                  "suspicious": c.get("suspicious", False)},
        "indicative_total_inc_gst": str(quote["total"]) if quote else None,
        "web_link": msg.get("webLink"),
    }


def build(cfg, src, graph, pages, seo, first_name=None, business=None, note=None, quote_no=None):
    """Render the quote PDF and the reply preview from the user's answers. Creates no draft."""
    msg, is_test = load_message(src, cfg, graph)
    base = _test_dir(cfg) if is_test else cfg["quotes_dir"]
    name, addr = _sender(msg, cfg)
    # The user chose these numbers, so the classifier's confidence gate does not apply,
    # but the price table limits do: calc_quote refuses pages outside page_days.
    quote = calc_quote(pages, seo, cfg, load_rates(cfg))
    name = name or (first_name or "").strip()[:40]
    client = {"email": addr, "name": name,
              "first_name": (first_name or "").strip()[:40] or name.split(" ")[0] or None,
              "business": (business or "").strip()[:80] or None}

    pending = _pending_dir(base)
    if quote_no:
        # Revision of an earlier build: keep the number, but only for the same email.
        if not QUOTE_NO_RE.match(quote_no):
            raise StepError(f"Not a quote number: {quote_no!r}")
        prev = pending / f"{quote_no}.json"
        if not prev.exists() or json.loads(prev.read_text())["message_id"] != msg["id"]:
            raise StepError(f"{quote_no} was not built for this email, so it cannot be reused")
    else:
        cfg_for_numbers = dict(cfg, quotes_dir=base)
        quote_no = ledger.next_quote_no(cfg_for_numbers)
        # Reserve the number straight away so a second build cannot take it.
        ledger.append(cfg_for_numbers, {"quote_no": quote_no, "client_name": name, "business": client["business"] or "",
                                        "client_email": addr, "request_type": "website_build", "outcome": SIMPLE,
                                        "pages": pages, "seo": seo, "total_ex_gst": str(quote["subtotal"]),
                                        "total_inc_gst": str(quote["total"]), "status": "built",
                                        "message_id": msg["id"]})

    slug = slug_safe(client["business"] or addr.split("@")[0])
    out_dir = config.ensure_private_dir(base)
    pdf = render_pdf(quote_html(quote, client, quote_no, cfg), out_dir / f"{quote_no}_{slug}.pdf")
    # A plain-looking email ending in the user's signature block ("html"), or pure text ("text").
    if cfg.get("reply_format") == "text":
        reply_path = pending / f"{quote_no}_reply.txt"
        reply_path.write_text(reply_quote_text(quote, client, quote_no, cfg, note=note))
    else:
        reply_path = pending / f"{quote_no}_reply.html"
        reply_path.write_text(reply_quote_signed_html(quote, client, quote_no, cfg, note=note))
    result = {"quote_no": quote_no, "test": is_test, "message_id": msg["id"], "client": client,
              "pages": pages, "seo": seo, "days": str(quote["total_days"].normalize()),
              "subtotal_ex_gst": str(quote["subtotal"]), "gst": str(quote["gst"]), "total_inc_gst": str(quote["total"]),
              "pdf": str(pdf), "reply_preview": str(reply_path), "note": (note or "").strip()[:1000]}
    (pending / f"{quote_no}.json").write_text(json.dumps(result, indent=2))
    if not is_test:
        result["register"] = _to_register(cfg, result, "Built")
    return result


def _to_register(cfg, build_info, status):
    """Best effort: the quote still works if the Client Register can't be written; the skill reports it."""
    try:
        return {"ok": True, **register.record_quote(cfg, build_info, status)}
    except (register.RegisterError, OSError) as e:
        return {"ok": False, "error": str(e)}


def _mark_handled(msg_id, conversation_id):
    state = _load_state()
    state["processed"].append(msg_id)
    if conversation_id:
        state["conversations"].append(conversation_id)
    _save_state(state)


def _signature_logo(cfg):
    """The inline logo the HTML signature points at (cid), or None when the brand has no raster logo."""
    logo = brand.signature_logo_png()
    return (logo[0], logo[1], SIGNATURE_LOGO_CID) if logo else None


def _existing_draft_id(cfg, quote_no, build_info):
    """The draft made for this quote earlier, from the build record or the ledger."""
    if build_info.get("draft_id"):
        return build_info["draft_id"]
    path = cfg["quotes_dir"] / "quotes-ledger.csv"
    if path.exists():
        with open(path) as f:
            ids = [r["draft_id"] for r in csv.DictReader(f) if r.get("quote_no") == quote_no and r.get("draft_id")]
        if ids:
            return ids[-1]
    return None


def draft(cfg, graph, quote_no):
    """Create the threaded Outlook reply draft with the built PDF attached. Never sends."""
    if not QUOTE_NO_RE.match(quote_no or ""):
        raise StepError(f"Not a quote number: {quote_no!r}")
    side = cfg["quotes_dir"] / "pending" / f"{quote_no}.json"
    if not side.exists():
        if (_test_dir(cfg) / "pending" / f"{quote_no}.json").exists():
            raise StepError(f"{quote_no} is a test run. Test quotes are never drafted in Outlook.")
        raise StepError(f"No build found for {quote_no}. Run build first.")
    b = json.loads(side.read_text())
    pdf, reply = Path(b["pdf"]), Path(b["reply_preview"])
    msg = graph.get_message(b["message_id"])
    _, live_addr = _sender(msg, cfg)
    if live_addr != b["client"]["email"]:
        raise StepError(f"{quote_no} was built for a different address than this email now gives. Rebuild it first.")
    attachment = (pdf.name, pdf.read_bytes())
    text = reply.suffix == ".txt"
    inline = None if text else _signature_logo(cfg)
    # Re-drafting a quote updates its existing draft rather than leaving a second one behind.
    draft_id, web_link = _existing_draft_id(cfg, quote_no, b), None
    if draft_id:
        web_link = graph.update_reply_draft(draft_id, reply.read_text(), attachment, text=text, inline=inline)
    if not web_link:
        # The reply goes to whoever sent the original; Graph's createReply fixes the recipient.
        draft_id, web_link = graph.create_reply_draft(b["message_id"], reply.read_text(), attachment, text=text, inline=inline,
                                                       to=b["client"]["email"])
    b["draft_id"] = draft_id
    side.write_text(json.dumps(b, indent=2))
    graph.add_category(b["message_id"], msg.get("categories", []), cfg["categories"][SIMPLE])
    c = b["client"]
    ledger.append(cfg, {"quote_no": quote_no, "received_at": msg.get("receivedDateTime", ""), "client_name": c["name"],
                        "business": c["business"] or "", "client_email": c["email"], "request_type": "website_build",
                        "outcome": SIMPLE, "pages": b["pages"], "seo": b["seo"], "total_ex_gst": b["subtotal_ex_gst"],
                        "total_inc_gst": b["total_inc_gst"], "status": "drafted", "message_id": b["message_id"],
                        "draft_id": draft_id})
    _mark_handled(b["message_id"], msg.get("conversationId"))
    return {"quote_no": quote_no, "draft_id": draft_id, "web_link": web_link, "to": c["email"],
            "register": _to_register(cfg, b, "Drafted")}


def register_sync(cfg):
    """Backfill the Client Register from every real quote built on this Mac."""
    drafted = set()
    path = cfg["quotes_dir"] / "quotes-ledger.csv"
    if path.exists():
        with open(path) as f:
            drafted = {r["quote_no"] for r in csv.DictReader(f) if r.get("status") == "drafted"}
    out = []
    for side in sorted((cfg["quotes_dir"] / "pending").glob("CM-Q-*.json")):
        b = json.loads(side.read_text())
        status = "Drafted" if b.get("draft_id") or b["quote_no"] in drafted else "Built"
        out.append({"quote_no": b["quote_no"], "status": status, "register": _to_register(cfg, b, status)})
    return out


def draft_info(cfg, graph, msg_id, first_name=None):
    """Draft the fixed 'a few questions before I can quote' reply. No prices."""
    msg = graph.get_message(msg_id)
    name, addr = _sender(msg, cfg)
    client = {"email": addr, "name": name, "first_name": (first_name or "").strip()[:40] or name.split(" ")[0] or None}
    if cfg.get("reply_format") == "text":
        draft_id, web_link = graph.create_reply_draft(msg_id, reply_info_text(client, cfg), text=True, to=addr)
    else:
        draft_id, web_link = graph.create_reply_draft(msg_id, reply_info_signed_html(client, cfg),
                                                      inline=_signature_logo(cfg), to=addr)
    graph.add_category(msg_id, msg.get("categories", []), cfg["categories"][NEEDS_INFO])
    ledger.append(cfg, {"received_at": msg.get("receivedDateTime", ""), "client_name": name, "client_email": addr,
                        "request_type": "website_build", "outcome": NEEDS_INFO, "status": "info_requested",
                        "message_id": msg_id, "draft_id": draft_id})
    _mark_handled(msg_id, msg.get("conversationId"))
    return {"draft_id": draft_id, "web_link": web_link, "to": addr}
