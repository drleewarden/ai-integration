"""Render the quote PDF and the Outlook-safe reply emails.

Every value derived from the inbound email (name, business, address) is passed
through html.escape before it touches a template. Reply wording is fixed text,
never model-generated, so an email cannot inject content into our reply.
"""
import re
import subprocess
from datetime import date, timedelta
from html import escape

from . import brand, config
from .pricing import money, timeline_label

NAVY, CREAM, GOLD, SLATE = "#0f1526", "#faf8f4", "#c9a84c", "#4a4e60"
DISPLAY = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
BODY = "Syne, 'Helvetica Neue', Arial, sans-serif"


def _fmt_date(d):
    return d.strftime("%-d %B %Y")


def _num(d):
    """Hours like 6.5 or 40, without trailing zeros."""
    return f"{d.normalize():f}"


def _short_money(d):
    return f"${d:,.0f}" if d == d.to_integral_value() else money(d)


def quote_html(q, client, quote_no, cfg, today=None):
    today = today or date.today()
    pages_label = "Single page" if q["pages"] == 1 else f"{q['pages']} pages"
    site = "single-page website" if q["pages"] == 1 else f"{q['pages']}-page website"
    timeline = timeline_label(q["total_days"])
    business = client.get("business") or client.get("name") or client["email"]

    phase_rows = "\n".join(
        f'<tr><td class="c">{i}</td><td><b>{escape(p["name"])}</b> <span class="scope">· {escape(p["scope"])}</span></td>'
        f'<td class="r">{_num(p["hours"])}</td><td class="r">{_short_money(p["amount"])}</td></tr>'
        for i, p in enumerate(q["phases"])
    )

    stats = [
        ("Pages", pages_label.split(" ")[0] if q["pages"] > 1 else "1", "single page" if q["pages"] == 1 else "pages in scope"),
        ("Timeline", timeline, f"{_num(q['total_days'])} days of development"),
        ("Investment", _short_money(q["subtotal"]), f"ex GST @ {_short_money(q['rate'])}/hr"),
        ("AI search", "Included" if q["seo"] else "Optional", "SEO, AEO and GEO setup" if q["seo"] else "add for one extra day"),
    ]
    stats_block = "".join(
        f'<div class="stat"><div class="k">{escape(k)}</div><div class="v">{escape(v)}</div><div class="s">{escape(s_)}</div></div>'
        for k, v, s_ in stats
    )

    sch = q["schedule"]
    pay_badge = {0: sch[0], 2: sch[1], 5: sch[2]}
    steps = [
        ("Deposit and kickoff", "The deposit secures your slot. We set up goals, the page list and a staging site."),
        ("First-draft concept", "We come back with high-fidelity concepts of the key pages, styled to your brand. You review and steer."),
        ("Design sign-off", "You approve the design. That locks the look and triggers the second instalment."),
        ("Content and media", "You send the copy, images and video you have. We shape, optimise and place them."),
        ("Build and review", "We build the pages on staging and walk you through them before launch."),
        ("Launch", "Final QA, domain and analytics, and the site goes live. The balance is due on launch."),
    ]
    steps_block = "".join(
        f'<div class="step"><div class="n">{i + 1}</div><div class="body"><div class="t"><span>{escape(t)}</span>'
        + (f'<span class="pay">Pay {pay_badge[i]["pct"]}% · {money(pay_badge[i]["amount"])} inc GST</span>' if i in pay_badge else "")
        + f'</div><div class="d">{escape(d)}</div></div></div>'
        for i, (t, d) in enumerate(steps)
    )
    pay_rows = "\n".join(
        f'<tr><td><b>{escape(cfg["payment_schedule"][i]["name"])}</b></td><td>{escape(cfg["payment_schedule"][i]["trigger"])}</td>'
        f'<td class="r">{s["pct"]}%</td><td class="r">{money(s["amount_ex"])}</td><td class="r">{money(s["amount"])}</td></tr>'
        for i, s in enumerate(sch)
    )

    assumptions = (
        f"figures in AUD at {_short_money(q['rate'])} per hour and {cfg['hours_per_day']} hours per day. "
        "You supply the copy, images and brand assets; copywriting and new photography are not included. "
        "One round of revisions per page; further changes are quoted at the hourly rate. "
        "Hosting, domains and third-party subscriptions are paid directly to the providers. "
        + ("" if q["seo"] else "SEO, AEO and GEO setup is not included and can be added for one extra day. ")
        + f"Timeline of {timeline} assumes content and feedback arrive promptly."
    )
    abn = cfg.get("abn", "").strip()
    fills = {
        "{{QUOTE_NO}}": escape(quote_no),
        "{{COVER_EYEBROW}}": f"Website build · Quote {escape(quote_no)}",
        "{{CLIENT_TITLE}}": escape(business),
        "{{COVER_TITLE}}": "Your new " + escape(site),
        "{{COVER_LEAD}}": "A fast, modern website built to your brand"
            + (", engineered for search and AI search so assistants and engines can read and recommend you" if q["seo"] else "")
            + ". The heavy lifting is done with AI, with our team directing and checking every step, so you get a "
            "quality build in a short timeframe at a clear, fixed price.",
        "{{PRICE_LABEL}}": escape(pages_label + (" · SEO, AEO and GEO" if q["seo"] else "")),
        "{{SUBTOTAL_SHORT}}": _short_money(q["subtotal"]),
        "{{PRICE_SUB}}": f"{_num(q['total_hours'])} hrs @ {_short_money(q['rate'])}/hr · {timeline} · ex GST",
        "{{PREPARED_FOR}}": escape(business) + (f" · {escape(client['name'])}" if client.get("name") and client.get("name") != business else ""),
        "{{QUOTE_DATE}}": _fmt_date(today),
        "{{VALID_UNTIL}}": _fmt_date(today + timedelta(days=cfg["valid_days"])),
        "{{RATE}}": _short_money(q["rate"]),
        "{{SCOPE_HEADING}}": "A " + escape(site) + (", ready for search and AI" if q["seo"] else ", built properly"),
        "{{SCOPE_INTRO}}": f"This quote covers the design, build and launch of a {escape(site)}"
            + (" with SEO, AEO and GEO setup so search engines and AI assistants can read and cite it" if q["seo"] else "")
            + f". It is {_num(q['total_days'])} days of development time, delivered in stages so you approve the design before we build.",
        "{{STATS_BLOCK}}": stats_block,
        "{{PHASE_ROWS}}": phase_rows,
        "{{TOTAL_HOURS}}": _num(q["total_hours"]),
        "{{SUBTOTAL}}": money(q["subtotal"]),
        "{{TOTAL}}": money(q["total"]),
        "{{ASSUMPTIONS}}": escape(assumptions),
        "{{PCT_SPLIT}}": " / ".join(str(s["pct"]) for s in sch),
        "{{STEPS_BLOCK}}": steps_block,
        "{{PAY_ROWS}}": pay_rows,
        "{{NEXT_STEP}}": f"reply to accept and we'll send the {sch[0]['pct']}% deposit invoice and book your kickoff. "
            f"This quote is valid until {_fmt_date(today + timedelta(days=cfg['valid_days']))}.",
        "{{FOOTER_LINE}}": f"{escape(business)} · Website build · Prepared by {escape(brand.name())}"
            + (f" · ABN {escape(abn)}" if abn else ""),
        "{{BUSINESS_NAME}}": escape(brand.name()),
        "{{LOGO_ON_DARK}}": brand.logo_element("on_dark"),
        "{{LOGO_ON_LIGHT}}": brand.logo_element("on_light", cls=""),
    }
    html = brand.apply((config.ASSETS_DIR / "quote-template.html").read_text(), "quote")
    for k, v in fills.items():
        html = html.replace(k, v)
    leftover = re.findall(r"\{\{[A-Z_0-9]+\}\}", html)
    if leftover:
        raise ValueError(f"Unfilled placeholders: {leftover}")
    return html


def render_pdf(html, out_pdf):
    tmp = out_pdf.with_suffix(".html")
    tmp.write_text(html)
    subprocess.run([str(config.SKILL_DIR / "scripts" / "render_pdf.sh"), str(tmp), str(out_pdf)],
                   check=True, capture_output=True)
    tmp.unlink()
    return out_pdf


def _email_shell(inner, cfg):
    """A plain, personal email: no banner or cards, so it reads like a person wrote it.
    The branded design lives in the attached PDF. Inline styles only, for Outlook."""
    return f"""<div style="font-family:Aptos, Calibri, Arial, sans-serif;font-size:11pt;line-height:1.5;color:#1a1a1a;">
{inner}
<p style="margin:0;">Kind regards,<br>{escape(cfg['signature_name'])}<br>{escape(cfg['signature_title'])}</p>
</div>"""


def _note_html(note):
    note = (note or "").strip()[:1000]
    if not note:
        return ""
    paras = "".join(f'<p style="margin:0 0 12px 0;">{escape(p.strip())}</p>' for p in note.split("\n\n") if p.strip())
    return paras + "\n"


def reply_quote_html(q, client, quote_no, cfg, note=None):
    """`note` is the user's own optional paragraph, typed in chat. Escaped like everything else."""
    first = escape(client.get("first_name") or "there")
    scope = "a single-page website" if q["pages"] == 1 else f"a {q['pages']}-page website"
    if q["seo"]:
        scope += ", including SEO, AEO and GEO setup"
    about = f" about a new website for {escape(client['business'])}" if client.get("business") else ""
    summary = "".join(f'<li style="margin:0 0 4px 0;">{escape(x)}</li>' for x in [
        f"{q['total_days'].normalize():f} days of development",
        f"{money(q['total'])} inc GST ({money(q['subtotal'])} plus GST)",
        "25% to start, 50% at design sign-off and 25% on launch",
    ])
    inner = f"""<p style="margin:0 0 12px 0;">Hi {first},</p>
<p style="margin:0 0 12px 0;">Thanks for getting in touch{about}. Based on what you've described, I've attached
quote {escape(quote_no)} for {escape(scope)}.</p>
{_note_html(note)}<p style="margin:0 0 4px 0;">In short:</p>
<ul style="margin:0 0 12px 0;padding-left:20px;">{summary}</ul>
<p style="margin:0 0 12px 0;">The full breakdown, timeline and payment schedule are in the PDF. The quote is valid for
{cfg['valid_days']} days. If you're happy to go ahead, just reply to this email and I'll send the deposit invoice and
book in a kickoff. If anything needs adjusting, let me know and I'll update it.</p>"""
    return _email_shell(inner, cfg)


INFO_QUESTIONS = {
    "pages": "How many pages will the site need? For example: home, about, services and contact.",
    "seo": "Would you like the site set up for search and AI search (SEO, AEO and GEO)? It adds one day.",
    "existing": "Do you have an existing website or examples of sites you like?",
}


def reply_info_html(client, cfg):
    first = escape(client.get("first_name") or "there")
    items = "".join(f'<li style="margin:0 0 6px 0;">{escape(q)}</li>' for q in INFO_QUESTIONS.values())
    inner = f"""<p style="margin:0 0 12px 0;">Hi {first},</p>
<p style="margin:0 0 12px 0;">Thanks for getting in touch. So I can put an accurate quote together, could you let me know:</p>
<ol style="margin:0 0 12px 0;padding-left:20px;">{items}</ol>
<p style="margin:0 0 12px 0;">Once I have those, I'll send a quote through, usually the same day.</p>"""
    return _email_shell(inner, cfg)


# Plain-text replies (the default). They read like an email the user typed themselves;
# the branded design lives only in the attached PDF. Plain text cannot carry markup,
# so nothing from the inbound email can inject formatting or links into the reply.

def _clean(s, limit=200):
    """Single line, no control characters: client-derived text goes into a fixed template."""
    return re.sub(r"[\x00-\x1f\x7f]+", " ", str(s or "")).strip()[:limit]


def _signature_text(cfg):
    return cfg["signoff"] + "\n\n" + "\n".join(cfg["signature_lines"])


def _note_text(note):
    paras = [re.sub(r"[\x00-\x09\x0b-\x1f\x7f]+", " ", p).strip() for p in (note or "").strip()[:1000].split("\n\n")]
    return "".join(p + "\n\n" for p in paras if p)


def _quote_body_text(q, client, quote_no, cfg, note=None):
    first = _clean(client.get("first_name"), 40) or "there"
    scope = "a single-page website" if q["pages"] == 1 else f"a {q['pages']}-page website"
    if q["seo"]:
        scope += ", including SEO, AEO and GEO setup"
    business = _clean(client.get("business"), 80)
    about = f" about a new website for {business}" if business else ""
    return (
        f"Hi {first},\n\n"
        f"Thanks for getting in touch{about}. Based on what you've described, I've attached quote "
        f"{_clean(quote_no, 30)} for {scope}.\n\n"
        f"{_note_text(note)}"
        "In short:\n"
        f"- {q['total_days'].normalize():f} days of development\n"
        f"- {money(q['total'])} inc GST ({money(q['subtotal'])} plus GST)\n"
        "- 25% to start, 50% at design sign-off and 25% on launch\n\n"
        f"The full breakdown, timeline and payment schedule are in the PDF. The quote is valid for {cfg['valid_days']} "
        "days. If you're happy to go ahead, just reply to this email and I'll send the deposit invoice and book in a "
        "kickoff. If anything needs adjusting, let me know and I'll update it.\n"
    )


def reply_quote_text(q, client, quote_no, cfg, note=None):
    return _quote_body_text(q, client, quote_no, cfg, note) + "\n" + _signature_text(cfg) + "\n"


def reply_quote_signed_html(q, client, quote_no, cfg, note=None):
    """The same wording as the text reply, as a plain-looking email with the user's signature block."""
    return _signed_html(_quote_body_text(q, client, quote_no, cfg, note), cfg)



def _info_body_text(client, cfg):
    first = _clean(client.get("first_name"), 40) or "there"
    items = "".join(f"{i}. {q}\n" for i, q in enumerate(INFO_QUESTIONS.values(), 1))
    return (
        f"Hi {first},\n\n"
        "Thanks for getting in touch. So I can put an accurate quote together, could you let me know:\n\n"
        f"{items}\n"
        "Once I have those, I'll send a quote through, usually the same day.\n"
    )


def reply_info_text(client, cfg):
    return _info_body_text(client, cfg) + "\n" + _signature_text(cfg) + "\n"


def reply_info_signed_html(client, cfg):
    return _signed_html(_info_body_text(client, cfg), cfg)


SIGNATURE_LOGO_CID = "cm-signature-logo"


def _text_to_html(text):
    """Escape everything, then: blank lines split paragraphs, '- ' lines become a bullet list."""
    out = []
    for para in text.strip().split("\n\n"):
        lines = para.split("\n")
        bullets = [l[2:] for l in lines if l.startswith("- ")]
        lead = [l for l in lines if not l.startswith("- ")]
        if lead:
            out.append(f'<p style="margin:0 0 12px 0;">{"<br>".join(escape(l) for l in lead)}</p>')
        if bullets:
            items = "".join(f'<li style="margin:0 0 4px 0;">{escape(b)}</li>' for b in bullets)
            out.append(f'<ul style="margin:-8px 0 12px 0;padding-left:20px;">{items}</ul>')
    return "\n".join(out)


def _signed_html(body_text, cfg):
    signoff = "<br>".join(escape(l) for l in cfg["signoff"].split("\n"))
    signature = _signature_block(cfg)
    return f"""<div style="font-family:Aptos, Calibri, Arial, sans-serif;font-size:11pt;line-height:1.5;color:#1a1a1a;">
{_text_to_html(body_text)}
<p style="margin:0 0 16px 0;">{signoff}</p>
</div>
{signature}"""



def _signature_block(cfg):
    """The HTML signature under the reply.

    A hand-made signature file in ~/.creative-milk (config `signature_html`) wins. Otherwise
    one is built from `signature_lines` and the brand colours: a dark panel, the logo
    (inline, by cid) when there is a raster logo, then the lines. Every line is escaped.
    """
    custom = cfg.get("signature_html")
    if custom and (config.USER_DIR / custom).is_file():
        return (config.USER_DIR / custom).read_text()
    b = brand.load()
    c = b["colors"]
    lines = [l for l in cfg.get("signature_lines") or [] if l.strip()]
    if not lines:
        return ""
    rows = f'<div style="font-size:16px;line-height:20px;font-weight:700;color:{c["on_dark"]};">{escape(lines[0])}</div>'
    if len(lines) > 1:
        rows += (f'<div style="padding-top:3px;font-size:10px;line-height:14px;font-weight:700;letter-spacing:1px;'
                 f'color:{c["accent"]};">{escape(lines[1])}</div>')
    rows += "".join(f'<div style="font-size:12px;line-height:17px;color:{c["on_dark"]};{"padding-top:8px;" if i == 0 else ""}">'
                    f'{escape(l)}</div>' for i, l in enumerate(lines[2:]))
    logo = ""
    if brand.signature_logo_png():
        logo = (f'<td style="padding:14px 18px;vertical-align:middle;width:150px;"><img src="cid:{SIGNATURE_LOGO_CID}" '
                f'width="150" alt="{escape(b["business_name"])}" style="display:block;width:150px;height:auto;border:0;"></td>'
                f'<td width="1" style="width:1px;background:{c["accent"]};font-size:1px;line-height:1px;">&nbsp;</td>')
    return (f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:520px;'
            f'border-collapse:collapse;background:{c["dark"]};font-family:Arial,Helvetica,sans-serif;"><tr>{logo}'
            f'<td style="padding:14px 18px;vertical-align:middle;">{rows}</td></tr></table>')
