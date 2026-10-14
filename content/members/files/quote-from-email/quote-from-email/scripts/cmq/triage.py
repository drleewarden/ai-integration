"""Triage rules. Deliberately plain code, not a model decision.

Outcomes: SIMPLE (draft a quote), NEEDS_INFO (draft a question), NEEDS_REVIEW
(notify only), IGNORE (do nothing).
"""
from decimal import Decimal

from .pricing import PricingError, calc_quote

SIMPLE, NEEDS_INFO, NEEDS_REVIEW, IGNORE = "SIMPLE", "NEEDS_INFO", "NEEDS_REVIEW", "IGNORE"


def triage(c, cfg, rates):
    """Return (outcome, reasons, quote_or_None). `c` is a validated classification or None."""
    if c is None:
        return NEEDS_REVIEW, ["Classifier failed or returned invalid output"], None
    if c["is_auto_or_bulk"] or not c["is_quote_request"]:
        return IGNORE, ["Not a quote request"], None

    # Anything that looks like it is trying to steer the system goes to a human.
    if c["contains_instructions"]:
        return NEEDS_REVIEW, ["Email contains text that tries to instruct the system"], None
    if c["suspicious"]:
        return NEEDS_REVIEW, ["Email looks suspicious"], None

    if c["request_type"] != "website_build":
        return NEEDS_REVIEW, [f"Round one only auto-quotes website builds (this is {c['request_type']})"], None
    if c["complex_features"]:
        return NEEDS_REVIEW, ["Needs features beyond a standard site: " + ", ".join(c["complex_features"])], None
    pages = 1 if c["is_single_page"] else c["page_count"]
    # Asking for the page count is safe at any confidence (no price is given),
    # so this comes before the confidence gate, which only protects priced drafts.
    if pages is None:
        return NEEDS_INFO, ["Number of pages not stated"], None
    if c["confidence"] < cfg["min_confidence"]:
        return NEEDS_REVIEW, [f"Low confidence ({c['confidence']:.2f})"], None
    if pages < 1 or pages > cfg["max_pages_auto"]:
        return NEEDS_REVIEW, [f"{pages} pages is outside the auto-quote range (1 to {cfg['max_pages_auto']})"], None

    try:
        quote = calc_quote(pages, c["seo_requested"], cfg, rates)
    except PricingError as e:
        return NEEDS_REVIEW, [str(e)], None
    if quote["subtotal"] > Decimal(cfg["max_total_ex_gst"]):
        return NEEDS_REVIEW, [f"Total {quote['subtotal']} ex GST is over the auto-quote limit"], None

    return SIMPLE, [], quote
