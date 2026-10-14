"""Offline tests for the Client Register, the stdlib xlsx writer and invoice creation.

Uses a temporary register folder, so the real workbook is never touched.
Run: python3 -m unittest discover -s tests -v   (from the skill folder)
"""
import json
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from cmq import config, register, xlsx  # noqa: E402


def build_info(tmp, quote_no="CM-Q-2026-007", test=False):
    pdf = Path(tmp) / f"{quote_no}_acme.pdf"
    pdf.write_bytes(b"%PDF-1.4 quote")
    return {"quote_no": quote_no, "test": test, "message_id": "AAMk-secret",
            "client": {"email": "sam@acme.test", "name": "=HYPERLINK(\"http://x\")", "first_name": "Sam",
                       "business": "Acme"},
            "pages": 4, "seo": True, "days": "5.5", "subtotal_ex_gst": "4400.00", "gst": "440.00",
            "total_inc_gst": "4840.00", "pdf": str(pdf), "reply_preview": "", "note": "private note"}


class Register(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.cfg = dict(config.load(), register={"dir": str(Path(self.tmp.name) / "Client Register"),
                                                  "file": "Client Register.xlsx"},
                        quotes_dir=Path(self.tmp.name) / "local")

    def tearDown(self):
        self.tmp.cleanup()

    def invoice_pdf(self, no):
        p = Path(self.tmp.name) / f"Creative-Milk-Tax-Invoice-{no}.pdf"
        p.write_bytes(b"%PDF-1.4 invoice")
        return p

    def test_quote_lands_in_register_without_message_ids(self):
        out = register.record_quote(self.cfg, build_info(self.tmp.name), "Built")
        rec = json.loads(Path(out["quote_record"]).read_text())
        self.assertNotIn("AAMk-secret", json.dumps(rec))
        self.assertNotIn("private note", json.dumps(rec))
        self.assertTrue(Path(out["quote_pdf"]).exists())
        self.assertEqual([s["inc_gst"] for s in rec["schedule"]], ["1210.00", "2420.00", "1210.00"])
        q = register.load(self.cfg)["Quotes"][0]
        self.assertEqual((q["Quote No"], q["Inc GST"], q["Invoice Status"]), ("CM-Q-2026-007", "4840.00", "Not invoiced"))

    def test_test_runs_are_refused(self):
        with self.assertRaises(register.RegisterError):
            register.record_quote(self.cfg, build_info(self.tmp.name, test=True), "Built")

    def test_rebuild_updates_the_same_row(self):
        register.record_quote(self.cfg, build_info(self.tmp.name), "Built")
        register.record_quote(self.cfg, build_info(self.tmp.name), "Drafted")
        rows = register.load(self.cfg)["Quotes"]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["Quote Status"], "Drafted")

    def test_invoice_lifecycle(self):
        register.record_quote(self.cfg, build_info(self.tmp.name), "Drafted")
        no = register.next_invoice_no(self.cfg, 2026)
        register.record_invoice(self.cfg, "CM-Q-2026-007", no, "On acceptance (25%)", "1100.00", "110.00",
                                "2026-10-12", "2026-10-19", self.invoice_pdf(no))
        q = register.load(self.cfg)["Quotes"][0]
        self.assertEqual(q["Invoice Status"], "Generated: On acceptance (25%)")
        self.assertEqual(q["Outstanding Inc GST"], "3630.00")

        register.set_invoice_status(self.cfg, no, register.SENT, "2026-10-13")
        inv = register.load(self.cfg)["Invoices"][0]
        self.assertEqual((inv["Status"], inv["Sent Date"]), ("Sent", "2026-10-13"))
        # A sent invoice can't be silently regenerated.
        with self.assertRaises(register.RegisterError):
            register.record_invoice(self.cfg, "CM-Q-2026-007", no, "x", "1100.00", "110.00",
                                    "2026-10-12", "2026-10-19", self.invoice_pdf(no))
        self.assertNotEqual(register.next_invoice_no(self.cfg, 2026), no)

    def test_paid_in_full(self):
        register.record_quote(self.cfg, build_info(self.tmp.name), "Drafted")
        register.record_invoice(self.cfg, "CM-Q-2026-007", "CM-2026-050", "Full project", "4400.00", "440.00",
                                "2026-10-12", "2026-11-11", self.invoice_pdf("CM-2026-050"))
        register.set_invoice_status(self.cfg, "CM-2026-050", register.PAID, "2026-10-20")
        self.assertEqual(register.load(self.cfg)["Quotes"][0]["Invoice Status"], "Paid in full")

    def test_bad_numbers_and_paths_refused(self):
        register.record_quote(self.cfg, build_info(self.tmp.name), "Built")
        for bad in ("../x", "CM-Q-2026-001", "INV1"):
            with self.assertRaises(register.RegisterError):
                register.record_invoice(self.cfg, "CM-Q-2026-007", bad, "x", "1", "0", "2026-10-12",
                                        "2026-10-12", self.invoice_pdf("CM-2026-001"))
        with self.assertRaises(register.RegisterError):
            register.quote_record(self.cfg, "../../etc/passwd")

    def test_user_columns_survive(self):
        register.record_quote(self.cfg, build_info(self.tmp.name), "Built")
        data = register.load(self.cfg)
        data["_headers"]["Quotes"].append("Follow up")
        data["Quotes"][0]["Follow up"] = "Call Friday"
        register.save(self.cfg, data)
        register.record_quote(self.cfg, build_info(self.tmp.name), "Drafted")
        self.assertEqual(register.load(self.cfg)["Quotes"][0]["Follow up"], "Call Friday")


def _load_cminvoice():
    import importlib.util
    path = Path(__file__).resolve().parents[2] / "invoice" / "scripts" / "cminvoice.py"  # sibling skill in the plugin
    spec = importlib.util.spec_from_file_location("cminvoice", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class CreateInvoice(Register):
    """cminvoice create: reads the workbook first, renders, logs. PDF rendering is stubbed."""

    def setUp(self):
        super().setUp()
        self.ci = _load_cminvoice()
        self.out = Path(self.tmp.name) / "out"
        self.out.mkdir()
        self.ci.subprocess.run = lambda cmd, **kw: Path(cmd[-1]).write_bytes(b"%PDF-1.4")
        register.record_quote(self.cfg, build_info(self.tmp.name), "Drafted")

    def spec(self, **over):
        s = {"quote_no": "CM-Q-2026-007", "stage": "On acceptance", "abn": "00 000 000 000",
             "invoice_date": "2026-10-12", "terms": "Net 7", "pay_rows": [["Account name", "Creative Milk"]]}
        s.update(over)
        return s

    def test_stage_invoice_uses_quote_figures_and_logs_it(self):
        r = self.ci.build_invoice(self.cfg, self.spec(), out_dir=self.out)
        self.assertEqual((r["ex_gst"], r["gst"], r["inc_gst"], r["due_date"]), ("1100.00", "110.00", "1210.00", "2026-10-19"))
        self.assertTrue(Path(r["invoice_pdf"]).exists())
        html = Path(r["html"]).read_text()
        self.assertIn("&lt;", "&lt;")  # sanity
        self.assertNotIn("{{", html)
        self.assertIn("CM-Q-2026-007", html)
        self.assertNotIn("=HYPERLINK(\"", html)  # client text escaped
        q = register.load(self.cfg)["Quotes"][0]
        self.assertEqual(q["Invoice Status"], "Generated: On acceptance (25%)")

    def test_same_stage_revises_instead_of_duplicating(self):
        first = self.ci.build_invoice(self.cfg, self.spec(), out_dir=self.out)
        again = self.ci.build_invoice(self.cfg, self.spec(), out_dir=self.out)
        self.assertEqual(first["invoice_no"], again["invoice_no"])
        self.assertTrue(again["revised_existing"])
        self.assertEqual(len(register.load(self.cfg)["Invoices"]), 1)
        register.set_invoice_status(self.cfg, first["invoice_no"], register.SENT)
        with self.assertRaises(register.RegisterError):
            self.ci.build_invoice(self.cfg, self.spec(), out_dir=self.out)

    def test_balance_is_what_is_left(self):
        self.ci.build_invoice(self.cfg, self.spec(), out_dir=self.out)
        r = self.ci.build_invoice(self.cfg, self.spec(stage="Balance"), out_dir=self.out)
        self.assertEqual(r["inc_gst"], "3630.00")
        self.assertEqual(register.load(self.cfg)["Quotes"][0]["Outstanding Inc GST"], "0.00")

    def test_lookup_by_client_name(self):
        self.ci.build_invoice(self.cfg, self.spec(), out_dir=self.out)
        found = self.ci.lookup(self.cfg, "acme")
        self.assertEqual(len(found["quotes"]), 1)
        self.assertEqual(len(found["invoices"]), 1)

    def test_unquoted_invoice_is_logged_too(self):
        r = self.ci.build_invoice(self.cfg, {"stage": "Copilot training", "abn": "00 000 000 000",
                                             "bill_to": {"name": "Danone", "line1": "Pat Lee", "line2": "p@x.test"},
                                             "items": [{"desc": "Copilot training", "qty": 2, "unit": "hrs", "rate": 350}],
                                             "pay_rows": []}, out_dir=self.out)
        self.assertEqual(r["inc_gst"], "770.00")
        inv = register.find(self.cfg, r["invoice_no"])["invoices"][0]
        self.assertEqual((inv["Quote No"], inv["Business"]), ("", "Danone"))

    def test_bank_details_are_never_invented(self):
        s = self.spec()
        del s["pay_rows"]
        with self.assertRaises(register.RegisterError):
            self.ci.build_invoice(self.cfg, s, out_dir=self.out)


class Xlsx(unittest.TestCase):
    def test_round_trip_and_formula_text_is_inline_string(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "t.xlsx"
            xlsx.write(p, [("S", [["A", "B"], ["=1+1", 12.5]], [1], [10, 10])])
            self.assertEqual(xlsx.read(p)["S"], [["A", "B"], ["=1+1", 12.5]])
            with zipfile.ZipFile(p) as z:
                self.assertNotIn("<f>", z.read("xl/worksheets/sheet1.xml").decode())


if __name__ == "__main__":
    unittest.main()
