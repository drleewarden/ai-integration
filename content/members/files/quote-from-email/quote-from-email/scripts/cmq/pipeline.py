"""End-to-end processing of one inbound email, and the inbox poller."""
import json
import re
import time
from datetime import datetime, timezone

from . import config, ledger
from .classify import classify
from .notify import notify
from .pricing import load_rates, money
from .render import quote_html, render_pdf, reply_info_html, reply_quote_html
from .triage import IGNORE, NEEDS_REVIEW, NEEDS_INFO, SIMPLE, triage

STATE_FILE = config.STATE_DIR / "processed.json"
EMAIL_RE = re.compile(r"^[^@\s<>\"']+@[^@\s<>\"']+\.[a-z]{2,}$", re.I)
REPLY_PREFIX = re.compile(r"^\s*(re|fw|fwd|aw|sv)\s*:", re.I)
AUTO_HEADERS = {"auto-submitted", "x-autoreply", "x-autorespond", "list-unsubscribe", "precedence"}


def client_address(msg, cfg):
    """Who the reply goes to: (name, address, via_form).

    hello@ is an alias of contact@, and the website form sends from it with the client's
    address in Reply-To. For those emails the client is the Reply-To; for everything else
    it is the sender. Returns an empty address when there is no one valid to reply to.
    """
    s = (msg.get("from") or {}).get("emailAddress", {})
    name, addr = (s.get("name") or "").strip(), (s.get("address") or "").strip().lower()
    if addr not in cfg.get("form_senders", []):
        return name, addr, False
    for r in msg.get("replyTo") or []:
        e = r.get("emailAddress", {})
        a = (e.get("address") or "").strip().lower()
        # Only an outside address counts; a Reply-To back to ourselves would loop.
        if EMAIL_RE.match(a) and a.split("@")[-1] not in cfg["own_domains"]:
            n = (e.get("name") or "").strip()
            return ("" if n.lower() == a or "@" in n else n), a, True
    return name, "", True


def _load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"delta_link": None, "processed": [], "conversations": [], "classified_at": []}


def _save_state(s):
    config.ensure_private_dir(config.STATE_DIR)
    s["processed"] = s["processed"][-2000:]
    s["conversations"] = s["conversations"][-2000:]
    STATE_FILE.write_text(json.dumps(s))


def _skip_reason(msg, headers, cfg, state):
    """Cheap filters before any model call."""
    _, sender, via_form = client_address(msg, cfg)
    if msg["id"] in state["processed"]:
        return "already processed"
    if msg.get("isDraft"):
        return "draft"
    if via_form and not sender:
        return "website form email without a Reply-To"
    if not EMAIL_RE.match(sender):
        return "no valid sender"
    if not via_form and sender.split("@")[-1] in cfg["own_domains"]:
        return "from our own domain"
    if REPLY_PREFIX.match(msg.get("subject") or "") or msg.get("conversationId") in state["conversations"]:
        return "reply in an existing thread"
    names = {h["name"].lower() for h in headers}
    if names & AUTO_HEADERS:
        auto = next((h["value"] for h in headers if h["name"].lower() == "auto-submitted"), "")
        if auto.lower() != "no":
            return "automated or bulk email"
    return None


def _rate_limited(state, cfg):
    now = time.time()
    state["classified_at"] = [t for t in state["classified_at"] if now - t < 3600]
    return len(state["classified_at"]) >= cfg["max_classifications_per_hour"]


def process(msg, cfg, graph=None, dry_run=False, log=print):
    """Classify, triage and (unless dry_run) draft + tag + notify. Returns a result dict."""
    sender_name, client_email, _ = client_address(msg, cfg)
    sender = {"name": sender_name}
    c = classify(sender_name, client_email, msg.get("subject", ""), msg.get("body", {}).get("content", ""), cfg)
    rates = load_rates(cfg)
    outcome, reasons, quote = triage(c, cfg, rates)
    log(f"  {outcome}: {c['summary'] if c else 'classification failed'}" + (f" ({'; '.join(reasons)})" if reasons else ""))
    if outcome == IGNORE:
        return {"outcome": outcome}

    client = {
        "email": client_email,
        "name": sender.get("name") or "",
        "first_name": (c or {}).get("client_first_name") or (sender.get("name") or "").split(" ")[0] or None,
        "business": (c or {}).get("business_name"),
    }
    row = {
        "received_at": msg.get("receivedDateTime") or datetime.now(timezone.utc).isoformat(),
        "client_name": client["name"], "business": client["business"] or "", "client_email": client_email,
        "request_type": (c or {}).get("request_type", ""), "outcome": outcome, "message_id": msg["id"],
    }
    out_dir = config.ensure_private_dir(cfg["quotes_dir"])
    result = {"outcome": outcome, "reasons": reasons, "client": client}
    draft_id = web_link = None

    if outcome == SIMPLE:
        quote_no = ledger.next_quote_no(cfg)
        slug = re.sub(r"[^a-z0-9]+", "-", (client["business"] or client_email.split("@")[0]).lower()).strip("-")[:40]
        pdf = render_pdf(quote_html(quote, client, quote_no, cfg), out_dir / f"{quote_no}_{slug}.pdf")
        reply = reply_quote_html(quote, client, quote_no, cfg)
        result.update(quote_no=quote_no, pdf=str(pdf), reply_html=reply, quote=quote)
        row.update(quote_no=quote_no, pages=quote["pages"], seo=quote["seo"],
                   total_ex_gst=str(quote["subtotal"]), total_inc_gst=str(quote["total"]))
        if not dry_run:
            draft_id, web_link = graph.create_reply_draft(msg["id"], reply, (pdf.name, pdf.read_bytes()), to=client_email)
        title = "Quote draft ready"
        scope = ("Single page" if quote["pages"] == 1 else f"{quote['pages']} pages") + (" + SEO/AEO/GEO" if quote["seo"] else "")
        subtitle = client["business"] or client["name"] or client_email
        message = f"{scope} · {quote['total_days'].normalize():f} days · {money(quote['total'])} inc GST"
    elif outcome == NEEDS_INFO:
        reply = reply_info_html(client, cfg)
        result.update(reply_html=reply)
        if not dry_run:
            draft_id, web_link = graph.create_reply_draft(msg["id"], reply, to=client_email)
        title, subtitle = "Info request drafted", client["business"] or client["name"] or client_email
        message = "Asked for page count and SEO preference. Review and send."
    else:  # NEEDS_REVIEW
        title, subtitle = "Enquiry needs you", client["business"] or client["name"] or client_email
        message = (c["summary"] if c else "Could not classify") + " | " + "; ".join(reasons)

    row.update(status={SIMPLE: "drafted", NEEDS_INFO: "info_requested", NEEDS_REVIEW: "needs_review"}[outcome],
               draft_id=draft_id or "")
    if dry_run:
        row["status"] = "dry_run_" + row["status"]
        (out_dir / "dry-run").mkdir(exist_ok=True)
        if "reply_html" in result:
            preview = out_dir / "dry-run" / f"{row.get('quote_no') or slug_safe(client_email)}_reply.html"
            preview.write_text(result["reply_html"])
            result["reply_preview"] = str(preview)
    else:
        graph.add_category(msg["id"], msg.get("categories", []), cfg["categories"][outcome])
    ledger.append(cfg, row)
    notify(title, subtitle, message, web_link if cfg["open_draft_on_ready"] else None)
    result.update(draft_id=draft_id, web_link=web_link)
    return result


def slug_safe(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:40]


def poll(cfg, graph, dry_run=False, log=print):
    """One poll cycle. First ever run only records a baseline, so old mail is never quoted."""
    state = _load_state()
    msgs, delta = graph.inbox_delta(state["delta_link"])
    if state["delta_link"] is None:
        state["delta_link"] = delta
        state["processed"].extend(m["id"] for m in msgs)
        _save_state(state)
        log(f"Baseline recorded ({len(msgs)} existing messages skipped). New mail from now on will be processed.")
        return
    for m in sorted(msgs, key=lambda m: m.get("receivedDateTime", "")):
        full = graph.get_message(m["id"])
        full["isDraft"] = m.get("isDraft")
        full["receivedDateTime"] = m.get("receivedDateTime")
        reason = _skip_reason(full, full.get("internetMessageHeaders") or [], cfg, state)
        if reason:
            log(f"skip {m.get('subject', '')[:60]!r}: {reason}")
            if reason != "already processed":
                state["processed"].append(m["id"])
            continue
        if _rate_limited(state, cfg):
            log("Rate limit reached; leaving the rest for the next cycle.")
            notify("Quote inbox busy", "Rate limit reached", "Over the hourly classification limit. Check contact@.")
            break
        log(f"process {full.get('subject', '')[:60]!r} from {full['from']['emailAddress']['address']}")
        state["classified_at"].append(time.time())
        try:
            process(full, cfg, graph, dry_run=dry_run, log=log)
        except Exception as e:  # one bad email must not stop the poller
            log(f"  ERROR: {type(e).__name__}: {e}")
            notify("Quote automation error", full.get("subject", "")[:60], f"{type(e).__name__}. See the poller log.")
        state["processed"].append(m["id"])
        if full.get("conversationId"):
            state["conversations"].append(full["conversationId"])
        _save_state(state)
    state["delta_link"] = delta or state["delta_link"]
    _save_state(state)
