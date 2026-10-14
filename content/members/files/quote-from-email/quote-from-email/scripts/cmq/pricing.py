"""Rates sync and quote arithmetic.

Round one prices website development time only. The hourly rate comes from the
website's lib/pricing.ts (HOURLY_RATE) so the quote can never disagree with the
published price. All arithmetic uses Decimal and happens here, never in the model.
"""
import json
import re
from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal

from . import config

HOURLY_RE = re.compile(
    r"export const HOURLY_RATE\s*=\s*\{.*?kind:\s*\"hourlyFrom\",\s*min:\s*(\d+)",
    re.DOTALL,
)
CENT = Decimal("0.01")


class PricingError(Exception):
    pass


def _source(cfg):
    """First pricing.ts that actually publishes HOURLY_RATE."""
    for path in cfg["pricing_sources"]:
        if path.exists() and HOURLY_RE.search(path.read_text()):
            return path
    return None


def sync_rates(cfg):
    src = _source(cfg)
    if src is None:
        raise PricingError(
            "No pricing.ts with HOURLY_RATE found in pricing_sources. "
            "Merge the website pricing PR or fix the paths in config.json."
        )
    rate = int(HOURLY_RE.search(src.read_text()).group(1))
    data = {
        "hourly_rate": rate,
        "source": str(src),
        "source_mtime": src.stat().st_mtime,
        "synced_at": datetime.now(timezone.utc).isoformat(),
    }
    config.ensure_private_dir(config.RATES_PATH.parent)
    config.RATES_PATH.write_text(json.dumps(data, indent=2))
    return data


def load_rates(cfg):
    """Return rates.json, re-syncing first if the website source changed since the last sync."""
    src = _source(cfg)
    if src is None and cfg.get("hourly_rate"):
        # No website pricing file to sync from: the rate set in config.json is the source of truth.
        return {"hourly_rate": cfg["hourly_rate"], "source": "config.json"}
    if config.RATES_PATH.exists():
        rates = json.loads(config.RATES_PATH.read_text())
        if src is None or src.stat().st_mtime <= rates.get("source_mtime", 0):
            return rates
    return sync_rates(cfg)


def money(d: Decimal) -> str:
    return f"${d.quantize(CENT):,.2f}"


def _days_label(days: Decimal) -> str:
    return f"{days.normalize():f} day" + ("" if days == 1 else "s")


HALF = Decimal("0.5")


def build_phases(build_hours: Decimal, seo: bool, cfg, rate: Decimal):
    """Split the build hours across the phases in config.json (shown on the quote).

    Each phase is rounded to the half hour; the "build" phase absorbs the
    remainder so the phases always sum to the quoted build hours exactly.
    """
    phases, used = [], Decimal(0)
    for p in cfg["build_phases"]:
        hrs = (build_hours * Decimal(str(p["share"])) / HALF).quantize(Decimal(1), ROUND_HALF_UP) * HALF
        phases.append({"name": p["name"], "scope": p["scope"], "hours": hrs, "absorb": p.get("absorb", False)})
        used += hrs
    absorber = next(p for p in phases if p["absorb"])
    absorber["hours"] += build_hours - used
    if seo:
        seo_hours = Decimal(str(cfg["seo_addon_days"])) * Decimal(cfg["hours_per_day"])
        phases.append({"name": "SEO, AEO and GEO setup",
                       "scope": "metadata, JSON-LD schema, llms.txt, sitemap, answer-ready content structure",
                       "hours": seo_hours, "absorb": False})
    for p in phases:
        p["amount"] = (p["hours"] * rate).quantize(CENT)
    return phases


def timeline_label(total_days: Decimal) -> str:
    """Calendar time including client review rounds, not just effort days."""
    weeks = 1 if total_days <= 3 else 2 if total_days <= 6 else 3
    return f"~{weeks} week" + ("" if weeks == 1 else "s")


def split_schedule(subtotal: Decimal, total: Decimal, steps):
    """Instalments, rounded to the cent; the last one absorbs any rounding so the
    schedule always adds up to the totals (ex and inc GST) exactly. Invoices reuse
    this, so a stage invoice always matches the figure on the quote."""
    schedule, alloc_inc, alloc_ex = [], Decimal(0), Decimal(0)
    for i, step in enumerate(steps):
        if i == len(steps) - 1:
            inc, ex = total - alloc_inc, subtotal - alloc_ex
        else:
            inc = (total * Decimal(step["pct"]) / 100).quantize(CENT, ROUND_HALF_UP)
            ex = (subtotal * Decimal(step["pct"]) / 100).quantize(CENT, ROUND_HALF_UP)
        alloc_inc += inc
        alloc_ex += ex
        schedule.append({"label": step["label"], "pct": step["pct"], "amount": inc, "amount_ex": ex})
    return schedule


def calc_quote(pages: int, seo: bool, cfg, rates):
    """Deterministic quote: lines, subtotal, GST, total, and a 25/50/25 schedule.

    Raises PricingError for anything outside the round-one rules, so a bad
    classification can never produce a priced draft.
    """
    page_days = cfg["page_days"]
    table_max = max(int(k) for k in page_days)
    # Pages past the table are priced per page (simple layout only), up to a sanity cap.
    if str(pages) not in page_days and not (table_max < pages <= cfg.get("max_pages_quotable", table_max)):
        raise PricingError(f"No day estimate for {pages} pages")

    rate = Decimal(rates["hourly_rate"])
    hpd = Decimal(cfg["hours_per_day"])
    lines = []

    extra_pages = max(pages - table_max, 0)
    base_days = Decimal(str(page_days[str(min(pages, table_max))]))
    build_hours = base_days * hpd + extra_pages * Decimal(str(cfg.get("extra_page_hours", 0)))
    build_days = build_hours / hpd
    sub = f"{_days_label(build_days)} of development: design, build, responsive testing and launch"
    if extra_pages:
        sub += (f". Includes {extra_pages} additional simple-layout page{'s' if extra_pages > 1 else ''}"
                f" at {Decimal(str(cfg['extra_page_hours'])).normalize():f} hours each")
    lines.append({
        "desc": "Website build: single page" if pages == 1 else f"Website build: {pages} pages",
        "sub": sub,
        "hours": build_hours,
        "rate": rate,
        "amount": (build_hours * rate).quantize(CENT),
    })

    if seo:
        seo_days = Decimal(str(cfg["seo_addon_days"]))
        seo_hours = seo_days * hpd
        lines.append({
            "desc": "SEO, AEO and GEO setup",
            "sub": f"{_days_label(seo_days)}: technical SEO, metadata, schema markup, llms.txt and AI search readiness",
            "hours": seo_hours,
            "rate": rate,
            "amount": (seo_hours * rate).quantize(CENT),
        })

    subtotal = sum((l["amount"] for l in lines), Decimal(0))
    gst = (subtotal * Decimal(str(cfg["gst_rate"]))).quantize(CENT, ROUND_HALF_UP)
    total = subtotal + gst

    schedule = split_schedule(subtotal, total, cfg["payment_schedule"])

    total_days = sum((l["hours"] for l in lines), Decimal(0)) / hpd
    return {
        "phases": build_phases(build_hours, seo, cfg, rate),
        "pages": pages,
        "seo": seo,
        "lines": lines,
        "subtotal": subtotal,
        "gst": gst,
        "total": total,
        "schedule": schedule,
        "total_days": total_days,
        "total_hours": total_days * hpd,
        "rate": rate,
    }
