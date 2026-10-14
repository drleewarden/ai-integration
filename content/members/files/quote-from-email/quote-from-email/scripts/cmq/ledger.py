"""quotes-ledger.csv: one row per handled enquiry.

Stores name, business and email only. No phone numbers, no email body text.
"""
import csv
from datetime import datetime

from .config import ensure_private_dir

FIELDS = ["quote_no", "received_at", "client_name", "business", "client_email", "request_type",
          "outcome", "pages", "seo", "total_ex_gst", "total_inc_gst", "status", "message_id", "draft_id"]


def _path(cfg):
    return ensure_private_dir(cfg["quotes_dir"]) / "quotes-ledger.csv"


def next_quote_no(cfg, year=None):
    year = year or datetime.now().year
    prefix = f"CM-Q-{year}-"
    path = _path(cfg)
    n = 0
    if path.exists():
        with open(path) as f:
            for row in csv.DictReader(f):
                qn = row.get("quote_no", "")
                if qn.startswith(prefix) and qn[len(prefix):].isdigit():
                    n = max(n, int(qn[len(prefix):]))
    return f"{prefix}{n + 1:03d}"


def append(cfg, row):
    path = _path(cfg)
    new = not path.exists()
    with open(path, "a", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS, extrasaction="ignore")
        if new:
            w.writeheader()
        w.writerow({k: row.get(k, "") for k in FIELDS})
