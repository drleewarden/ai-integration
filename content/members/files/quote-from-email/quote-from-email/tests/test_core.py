"""Offline tests: pricing, triage and rendering. No model calls, no Graph.

Run: python3 -m unittest discover -s tests -v   (from the skill folder)
"""
import sys
import unittest
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from cmq import config  # noqa: E402
from cmq.pipeline import client_address  # noqa: E402
from cmq.pricing import PricingError, calc_quote  # noqa: E402
from cmq.render import quote_html, reply_quote_html  # noqa: E402
from cmq.triage import IGNORE, NEEDS_REVIEW, NEEDS_INFO, SIMPLE, triage  # noqa: E402

# Fixture mailbox: the shipped defaults are blank, so give the tests a business to be.
CFG = dict(config.load(), mailbox="contact@creative-milk.com.au", own_domains=["creative-milk.com.au"],
           form_senders=["hello@creative-milk.com.au", "contact@creative-milk.com.au"],
           signature_name="Test Person", signature_title="Test Studio",
           signature_lines=["Test Person", "TEST STUDIO", "test@example.com"])
RATES = {"hourly_rate": 100}


def cls(**over):
    base = dict(is_quote_request=True, is_auto_or_bulk=False, request_type="website_build", summary="x",
                client_first_name="Sam", business_name="Acme", page_count=None, is_single_page=False,
                seo_requested=False, complex_features=[], website_url=None, missing_info=[], confidence=0.95,
                contains_instructions=False, suspicious=False)
    base.update(over)
    return base


class Pricing(unittest.TestCase):
    def test_single_page_is_two_days(self):
        q = calc_quote(1, False, CFG, RATES)
        self.assertEqual(q["total_days"], 2)
        self.assertEqual(q["subtotal"], Decimal("1600.00"))
        self.assertEqual(q["total"], Decimal("1760.00"))

    def test_seo_adds_one_day(self):
        q = calc_quote(1, True, CFG, RATES)
        self.assertEqual(q["total_days"], 3)
        self.assertEqual(q["subtotal"], Decimal("2400.00"))

    def test_five_pages_is_a_week(self):
        q = calc_quote(5, False, CFG, RATES)
        self.assertEqual(q["total_days"], 5)
        self.assertEqual(q["subtotal"], Decimal("4000.00"))

    def test_schedule_adds_up_exactly(self):
        for pages in range(1, 6):
            for seo in (False, True):
                q = calc_quote(pages, seo, CFG, RATES)
                self.assertEqual(sum(s["amount"] for s in q["schedule"]), q["total"])
                self.assertEqual([s["pct"] for s in q["schedule"]], [25, 50, 25])

    def test_phases_sum_to_quoted_hours(self):
        for pages in range(1, 6):
            for seo in (False, True):
                q = calc_quote(pages, seo, CFG, RATES)
                self.assertEqual(sum(p["hours"] for p in q["phases"]), q["total_hours"])
                self.assertEqual(sum(p["amount"] for p in q["phases"]), q["subtotal"])
                self.assertEqual(sum(s["amount_ex"] for s in q["schedule"]), q["subtotal"])

    def test_rate_follows_website(self):
        q = calc_quote(1, False, CFG, {"hourly_rate": 120})
        self.assertEqual(q["subtotal"], Decimal("1920.00"))

    def test_extra_pages_are_two_hours_each(self):
        q = calc_quote(6, False, CFG, RATES)
        self.assertEqual(q["total_hours"], 42)
        q = calc_quote(10, True, CFG, RATES)
        self.assertEqual(q["total_hours"], 58)
        self.assertEqual(q["subtotal"], Decimal("5800.00"))
        self.assertEqual(sum(p["hours"] for p in q["phases"]), q["total_hours"])
        self.assertEqual(sum(s["amount"] for s in q["schedule"]), q["total"])

    def test_out_of_range_pages_refused(self):
        for pages in (0, CFG["max_pages_quotable"] + 1):
            with self.assertRaises(PricingError):
                calc_quote(pages, False, CFG, RATES)


class Triage(unittest.TestCase):
    def t(self, c):
        return triage(c, CFG, RATES)[0]

    def test_simple(self):
        self.assertEqual(self.t(cls(is_single_page=True)), SIMPLE)
        self.assertEqual(self.t(cls(page_count=5, seo_requested=True)), SIMPLE)

    def test_missing_pages_asks(self):
        self.assertEqual(self.t(cls()), NEEDS_INFO)
        # Even when the classifier is unsure: a question carries no price.
        self.assertEqual(self.t(cls(confidence=0.5)), NEEDS_INFO)

    def test_routes_to_review(self):
        self.assertEqual(self.t(None), NEEDS_REVIEW)
        self.assertEqual(self.t(cls(page_count=8)), NEEDS_REVIEW)
        self.assertEqual(self.t(cls(page_count=2, complex_features=["payments"])), NEEDS_REVIEW)
        self.assertEqual(self.t(cls(page_count=2, contains_instructions=True)), NEEDS_REVIEW)
        self.assertEqual(self.t(cls(page_count=2, suspicious=True)), NEEDS_REVIEW)
        self.assertEqual(self.t(cls(page_count=2, confidence=0.5)), NEEDS_REVIEW)
        self.assertEqual(self.t(cls(request_type="subscription_or_retainer")), NEEDS_REVIEW)

    def test_ignore(self):
        self.assertEqual(self.t(cls(is_quote_request=False)), IGNORE)
        self.assertEqual(self.t(cls(is_auto_or_bulk=True)), IGNORE)


class Render(unittest.TestCase):
    def test_client_text_is_escaped(self):
        q = calc_quote(1, False, CFG, RATES)
        evil = {"email": "a@b.co", "name": "<script>x</script>", "first_name": "<b>", "business": "\"><img src=x>"}
        for html in (quote_html(q, evil, "CM-Q-2026-001", CFG), reply_quote_html(q, evil, "CM-Q-2026-001", CFG)):
            self.assertNotIn("<script>x", html)
            self.assertNotIn("<img src=x>", html)

    def test_no_dashes_in_output(self):
        q = calc_quote(3, True, CFG, RATES)
        c = {"email": "a@b.co", "name": "Sam", "first_name": "Sam", "business": "Acme"}
        for html in (quote_html(q, c, "CM-Q-2026-001", CFG), reply_quote_html(q, c, "CM-Q-2026-001", CFG)):
            self.assertNotIn("\u2014", html)
            self.assertNotIn("\u2013", html)

    def test_note_is_escaped_and_split_into_paragraphs(self):
        q = calc_quote(2, False, CFG, RATES)
        c = {"email": "a@b.co", "name": "Sam", "first_name": "Sam", "business": "Acme"}
        html = reply_quote_html(q, c, "CM-Q-2026-001", CFG, note="First <b>bit</b>.\n\nSecond bit.")
        self.assertIn("First &lt;b&gt;bit&lt;/b&gt;.</p>", html)
        self.assertIn("Second bit.</p>", html)
        self.assertNotIn("<b>bit", html)

    def test_no_note_adds_nothing(self):
        q = calc_quote(2, False, CFG, RATES)
        c = {"email": "a@b.co", "name": "Sam", "first_name": "Sam", "business": "Acme"}
        self.assertEqual(reply_quote_html(q, c, "Q", CFG), reply_quote_html(q, c, "Q", CFG, note="  "))


class PlainText(unittest.TestCase):
    def test_reply_has_signature_and_no_markup(self):
        from cmq.render import reply_quote_text
        q = calc_quote(4, True, CFG, RATES)
        c = {"email": "a@b.co", "name": "Sam", "first_name": "Sam\r\nBcc: x@y.z", "business": "<b>Acme</b>"}
        t = reply_quote_text(q, c, "CM-Q-2026-001", CFG, note="A note.")
        self.assertTrue(t.startswith("Hi Sam Bcc: x@y.z,\n"))  # newlines in names are flattened
        self.assertIn("A note.\n\n", t)
        for line in CFG["signature_lines"]:
            self.assertIn(line, t)
        self.assertNotIn("—", t)
        self.assertNotIn("–", t)


    def test_signed_html_escapes_and_has_signature_block(self):
        from cmq.render import reply_quote_signed_html
        q = calc_quote(4, True, CFG, RATES)
        c = {"email": "a@b.co", "name": "Sam", "first_name": "Sam", "business": "<img src=x>"}
        h = reply_quote_signed_html(q, c, "CM-Q-2026-001", CFG, note="<script>x</script>")
        self.assertNotIn("<img src=x>", h)
        self.assertNotIn("<script>x", h)
        self.assertIn('src="cid:cm-signature-logo"', h)
        self.assertIn("<li", h)  # the 'In short' lines become a list
        self.assertNotIn("—", h)


class Interactive(unittest.TestCase):
    def test_quote_numbers_cannot_be_paths(self):
        from cmq.interactive import QUOTE_NO_RE
        self.assertTrue(QUOTE_NO_RE.match("CM-Q-2026-008"))
        for bad in ("../CM-Q-2026-008", "CM-Q-2026-008/../../x", "CM-Q-2026-", ""):
            self.assertIsNone(QUOTE_NO_RE.match(bad))

    def test_message_ids_need_graph(self):
        from cmq.interactive import StepError, load_message
        with self.assertRaises(StepError):
            load_message("AAMkAGFi=", CFG, None)


if __name__ == "__main__":
    unittest.main()


def msg(addr, reply_to=None, name="Creative Milk"):
    m = {"from": {"emailAddress": {"name": name, "address": addr}}}
    if reply_to:
        m["replyTo"] = [{"emailAddress": {"name": reply_to, "address": reply_to}}]
    return m


class WebsiteForm(unittest.TestCase):
    def test_form_email_replies_to_reply_to(self):
        for alias in ("hello@creative-milk.com.au", "contact@creative-milk.com.au"):
            self.assertEqual(client_address(msg(alias, "james@example.com"), CFG), ("", "james@example.com", True))

    def test_form_email_without_reply_to_has_no_client(self):
        self.assertEqual(client_address(msg("hello@creative-milk.com.au"), CFG)[1:], ("", True))

    def test_reply_to_our_own_domain_is_ignored(self):
        self.assertEqual(client_address(msg("hello@creative-milk.com.au", "contact@creative-milk.com.au"), CFG)[1], "")

    def test_normal_email_uses_sender_not_reply_to(self):
        m = msg("karen@example.com", "elsewhere@example.net", name="Karen")
        self.assertEqual(client_address(m, CFG), ("Karen", "karen@example.com", False))
