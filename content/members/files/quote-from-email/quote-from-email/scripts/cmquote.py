#!/usr/bin/env python3
"""Email-to-quote automation (Creative Milk plugin).

Interactive steps (what the skill runs; each prints JSON):
  cmquote.py check [--limit N] [--all]          List new emails in the configured mailbox (metadata only)
  cmquote.py triage SRC                         Does this email need a quote? (no drafting)
  cmquote.py build SRC --pages N [--seo] [--first-name X] [--business Y] [--note TEXT] [--quote-no Q]
                                                Render the quote PDF and reply preview (no drafting)
  cmquote.py draft QUOTE_NO                     Create the Outlook reply draft with the PDF attached
  cmquote.py draft-info MSG_ID [--first-name X] Draft the "a few questions first" reply
  cmquote.py register-sync                      Copy every real quote into the Client Register workbook
  SRC is a Graph message id from `check`, or a tests/emails/*.json file for an offline run.

Setup and utilities:
  cmquote.py setup-status            Is this machine set up? Mailbox, brand and folders (JSON)
  cmquote.py setup-save SPEC.json    Save mailbox, business and brand answers (the setup skill writes SPEC)
  cmquote.py auth                    One-time Microsoft sign-in (device code)
  cmquote.py sync-rates              Pull the hourly rate from the website's lib/pricing.ts
  cmquote.py poll [--dry-run]        Check contact@ once and process new enquiries (launchd runs this)
  cmquote.py test FILE.json          Run a sample email through the whole pipeline without Outlook
  cmquote.py quote --pages N [--seo] Price a build directly and print the numbers
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from cmq import config, pricing  # noqa: E402
from cmq.pipeline import poll, process  # noqa: E402


def _graph(cfg, required=True):
    """Graph client, or None when the app registration is not filled in yet."""
    if not (cfg["graph"]["tenant_id"] and cfg["graph"]["client_id"]):
        if required:
            sys.exit("Microsoft Graph is not set up yet: graph.tenant_id and graph.client_id are empty in "
                     f"{config.CONFIG_PATH}. Run the quote-invoice-setup skill (Connect the mailbox).")
        return None
    from cmq.graph import Graph
    return Graph(cfg)


def _print_json(obj):
    print(json.dumps(obj, indent=2, default=str))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("auth")
    sub.add_parser("setup-status")
    ss = sub.add_parser("setup-save")
    ss.add_argument("spec", type=Path)
    sub.add_parser("sync-rates")
    p = sub.add_parser("poll")
    p.add_argument("--dry-run", action="store_true", help="classify and render, but create no drafts or categories")
    t = sub.add_parser("test")
    t.add_argument("file", type=Path)
    q = sub.add_parser("quote")
    q.add_argument("--pages", type=int, required=True)
    q.add_argument("--seo", action="store_true")
    c = sub.add_parser("check")
    c.add_argument("--limit", type=int, default=10)
    c.add_argument("--all", action="store_true", help="also list handled, own-domain and reply emails")
    tr = sub.add_parser("triage")
    tr.add_argument("src")
    b = sub.add_parser("build")
    b.add_argument("src")
    b.add_argument("--pages", type=int, required=True)
    b.add_argument("--seo", action="store_true")
    b.add_argument("--first-name")
    b.add_argument("--business")
    b.add_argument("--note", help="optional paragraph from the user, added to the reply")
    b.add_argument("--quote-no", help="rebuild an earlier quote for the same email, keeping its number")
    d = sub.add_parser("draft")
    d.add_argument("quote_no")
    di = sub.add_parser("draft-info")
    di.add_argument("msg_id")
    di.add_argument("--first-name")
    sub.add_parser("register-sync")
    args = ap.parse_args()
    if args.cmd in ("setup-status", "setup-save"):
        from cmq import brand, setup
        try:
            _print_json(setup.status() if args.cmd == "setup-status" else setup.save(args.spec))
        except (setup.SetupError, brand.BrandError, ValueError) as e:
            sys.exit(f"error: {e}")
        return

    cfg = config.load()
    if args.cmd in ("check", "triage", "build", "draft", "draft-info", "poll") and not config.is_set_up():
        sys.exit(f"Not set up yet: no {config.CONFIG_PATH}. Run the quote-invoice-setup skill first.")

    if args.cmd == "register-sync":
        from cmq import interactive as ix
        _print_json(ix.register_sync(cfg))
        return

    if args.cmd in ("check", "triage", "build", "draft", "draft-info"):
        from cmq import interactive as ix
        from cmq.graph import GraphError
        from cmq.pricing import PricingError
        try:
            if args.cmd == "check":
                _print_json(ix.check(cfg, _graph(cfg), args.limit, args.all))
            elif args.cmd == "triage":
                _print_json(ix.triage_one(cfg, args.src, _graph(cfg, required=False)))
            elif args.cmd == "build":
                _print_json(ix.build(cfg, args.src, _graph(cfg, required=False), args.pages, args.seo,
                                     args.first_name, args.business, args.note, args.quote_no))
            elif args.cmd == "draft":
                _print_json(ix.draft(cfg, _graph(cfg), args.quote_no))
            else:
                _print_json(ix.draft_info(cfg, _graph(cfg), args.msg_id, args.first_name))
        except (ix.StepError, PricingError, GraphError) as e:
            sys.exit(f"error: {e}")
        return

    if args.cmd == "auth":
        from cmq.graph import device_login
        device_login(cfg)
    elif args.cmd == "sync-rates":
        r = pricing.sync_rates(cfg)
        print(f"Hourly rate ${r['hourly_rate']}/hr from {r['source']}")
    elif args.cmd == "poll":
        from cmq.graph import Graph
        poll(cfg, Graph(cfg), dry_run=args.dry_run)
    elif args.cmd == "test":
        # Test runs get their own ledger and numbering so they never consume real quote numbers.
        cfg["quotes_dir"] = cfg["quotes_dir"] / "test-runs"
        e = json.loads(args.file.read_text())
        msg = {"id": f"test-{args.file.stem}", "subject": e["subject"], "categories": [],
               "from": {"emailAddress": {"name": e["from_name"], "address": e["from_email"]}},
               "body": {"content": e["body"]}}
        print(f"test {args.file.name}: {e['subject']!r}")
        r = process(msg, cfg, graph=None, dry_run=True)
        for k in ("quote_no", "pdf", "reply_preview"):
            if r.get(k):
                print(f"  {k}: {r[k]}")
    elif args.cmd == "quote":
        qq = pricing.calc_quote(args.pages, args.seo, cfg, pricing.load_rates(cfg))
        for l in qq["lines"]:
            print(f"{l['desc']:<32} {l['hours']:>5}h  {pricing.money(l['amount']):>12}")
        print(f"{'Subtotal':<39} {pricing.money(qq['subtotal']):>12}\n{'GST':<39} {pricing.money(qq['gst']):>12}"
              f"\n{'Total':<39} {pricing.money(qq['total']):>12}")
        for s in qq["schedule"]:
            print(f"  {s['pct']}% {s['label'].lower():<30} {pricing.money(s['amount']):>12}")


if __name__ == "__main__":
    main()
