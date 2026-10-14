"""Brand profile: colours, fonts, logos and business name for every document.

~/.creative-milk/brand.json is written by the setup skill from the user's brand folder
and their style notes. Anything missing falls back to the Creative Milk house style,
so the templates always render. Brand values are user-supplied, so every one is
checked against a strict pattern before it reaches CSS or HTML.
"""
import base64
import json
import mimetypes
import re
from html import escape
from pathlib import Path

from . import config

DEFAULTS = {
    "business_name": "Creative Milk",
    "colors": {
        "dark": "#0f1526", "dark_deep": "#0a0f1c", "accent": "#c9a84c", "accent_light": "#e8c96a",
        "accent_pale": "#f4e9c8", "accent_text": "#7a5c12", "background": "#faf8f4", "card": "#f6f4ef",
        "muted": "#4a4e60", "on_dark": "#f4efe4",
    },
    "fonts": {"display": None, "body": None},
    "logo_on_dark": None,
    "logo_on_light": None,
}

HEX_RE = re.compile(r"^#[0-9a-fA-F]{6}$")
# Font stacks only: names, quotes, commas, spaces, hyphens. Blocks `;`, `}`, `url(` and friends.
FONT_RE = re.compile(r"^[A-Za-z0-9 ,'\"-]{1,120}$")
LOGO_TYPES = {".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}
MAX_LOGO_BYTES = 2_000_000


class BrandError(Exception):
    pass


def load():
    b = json.loads(json.dumps(DEFAULTS))
    if config.BRAND_PATH.exists():
        user = json.loads(config.BRAND_PATH.read_text())
        for k, v in user.items():
            if isinstance(v, dict) and isinstance(b.get(k), dict):
                b[k].update({kk: vv for kk, vv in v.items() if vv})
            elif v:
                b[k] = v
    for k, v in b["colors"].items():
        if not HEX_RE.match(str(v)):
            raise BrandError(f"brand.json colors.{k} must be a #RRGGBB hex colour, got {v!r}")
    for k, v in b["fonts"].items():
        if v and not FONT_RE.match(v):
            raise BrandError(f"brand.json fonts.{k} has characters a font name can't contain")
    return b


def is_custom():
    return config.BRAND_PATH.exists()


def name():
    return load()["business_name"]


def _logo_file(path):
    p = Path(str(path)).expanduser()
    ext = p.suffix.lower()
    if ext not in LOGO_TYPES:
        raise BrandError(f"Logo {p.name}: use SVG, PNG or JPG")
    if not p.is_file():
        raise BrandError(f"Logo not found: {p}")
    if p.stat().st_size > MAX_LOGO_BYTES:
        raise BrandError(f"Logo {p.name} is over 2 MB; export a smaller copy")
    return p, ext


def logo_element(which, cls="logo"):
    """A complete <img> (custom logo) or <svg> (house logo) element for the templates.

    Custom logos go in as data: URIs inside <img>, never inlined as markup, so an SVG
    with scripts in it can't run when Chrome renders the PDF.
    """
    b = load()
    path = b.get(f"logo_{which}") or (b.get("logo_on_light") if which == "on_dark" else b.get("logo_on_dark"))
    cls_attr = f' class="{cls}"' if cls else ""
    if path:
        p, ext = _logo_file(path)
        data = base64.b64encode(p.read_bytes()).decode()
        return f'<img{cls_attr} alt="{escape(b["business_name"])}" src="data:{LOGO_TYPES[ext]};base64,{data}">'
    raw = (config.ASSETS_DIR / f"logo-{which.replace('_', '-')}.svg").read_text()
    inner = re.sub(r"^.*?<svg[^>]*>|</svg>\s*$", "", raw, flags=re.S)
    return f'<svg xmlns="http://www.w3.org/2000/svg"{cls_attr} viewBox="0 0 259 102">{inner}</svg>'


def signature_logo_png():
    """(filename, bytes, mime) for the inline email signature logo, or None if there is no PNG logo."""
    b = load()
    for key in ("signature_logo", "logo_on_dark", "logo_on_light"):
        if b.get(key):
            p, ext = _logo_file(b[key])
            if ext == ".png":  # Outlook won't show inline SVG, and the draft attaches it as image/png
                return p.name, p.read_bytes(), LOGO_TYPES[ext]
    if not is_custom():
        p = config.ASSETS_DIR / "email-signature-logo.png"
        return p.name, p.read_bytes(), "image/png"
    return None


# CSS variable names differ between the quote and invoice templates; map our palette onto each.
_VARS = {
    "quote": {"--ink": "dark", "--ink-deep": "dark_deep", "--gold": "accent", "--gold-bright": "accent_light",
              "--gold-pale": "accent_pale", "--gold-text": "accent_text", "--cream": "background", "--card": "card",
              "--slate": "muted"},
    "invoice": {"--midnight-ink": "dark", "--midnight-deep": "dark_deep", "--liquid-gold": "accent",
                "--gold-light": "accent_light", "--gold-pale": "accent_pale", "--milk-white": "background",
                "--off-white": "card", "--warm-cream": "card", "--slate-mid": "muted"},
}


# The few house-style colours the templates hardcode (tints and glows), re-derived from the palette.
_EXTRA = {
    "quote": (".cover{background:radial-gradient(90% 60% at 85% 18%, color-mix(in srgb, var(--ink) 80%, var(--gold)) 0%,"
              " var(--ink) 45%, var(--ink-deep) 100%);}"
              ".price{background:color-mix(in srgb, var(--ink) 60%, transparent);}"
              ".note b{color:var(--gold-text);}"),
    "invoice": (":root{--midnight-tint:color-mix(in srgb, var(--midnight-ink) 80%, var(--liquid-gold));}"
                ".band .glow{background:radial-gradient(circle, color-mix(in srgb, var(--liquid-gold) 22%, transparent) 0%,"
                " transparent 70%);}"
                ".meta{background:color-mix(in srgb, var(--liquid-gold) 50%, transparent);}"),
}


def css_override(kind):
    """A <style> block appended after the template's own, so brand values win."""
    b = load()
    if not is_custom():
        return ""
    decls = "".join(f"{var}:{b['colors'][key]};" for var, key in _VARS[kind].items())
    css = f":root{{{decls}}}" + _EXTRA[kind]
    if b["fonts"].get("body"):
        css += f"body{{font-family:{b['fonts']['body']}, -apple-system, Arial, sans-serif;}}"
    if b["fonts"].get("display"):
        css += f"h1,h2,h3{{font-family:{b['fonts']['display']}, Georgia, serif;}}"
    css += (".cover img.logo,.band img.logo{width:auto; max-width:210px; max-height:80px;}"
            ".foot img{width:auto; max-width:90px; max-height:34px;}")
    return f"<style>/* brand.json */{css}</style>"


def apply(html, kind):
    """Insert the override just before </head>."""
    return html.replace("</head>", css_override(kind) + "</head>", 1)
