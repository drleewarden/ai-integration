"""First-run setup: save the user's mailbox, business details and brand profile.

The setup skill gathers answers in chat and hands them over as one JSON spec:
  {"config": {...keys for ~/.creative-milk/config.json...},
   "brand":  {...keys for ~/.creative-milk/brand.json...}}
Everything is validated here before anything is written, and existing keys the spec
doesn't mention (for example the Graph app IDs) are kept.
"""
import json
import os
import re
from pathlib import Path

from . import brand, config

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
GUID_RE = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
# Keys a user may set. Anything else in the spec is rejected, so a typo can't silently do nothing.
CONFIG_KEYS = {"mailbox", "own_domains", "form_senders", "signature_name", "signature_title", "signoff",
               "signature_lines", "reply_format", "graph", "hourly_rate", "abn", "business_description",
               "quotes_dir", "register", "classifier_model"}
BRAND_KEYS = {"business_name", "style_influence", "brand_folder", "colors", "fonts", "logo_on_dark",
              "logo_on_light", "signature_logo", "notes"}


class SetupError(Exception):
    pass


def _read(path):
    return json.loads(path.read_text()) if path.exists() else {}


def _write_private(path, data):
    config.ensure_private_dir(path.parent)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2) + "\n")
    os.chmod(tmp, 0o600)
    tmp.replace(path)


def status():
    cfg = config.load()
    b = brand.load()
    g = cfg.get("graph") or {}
    return {
        "set_up": config.is_set_up(),
        "user_dir": str(config.USER_DIR),
        "mailbox": cfg.get("mailbox") or None,
        "mailbox_connected": bool(g.get("tenant_id") and g.get("client_id")),
        "custom_brand": brand.is_custom(),
        "business_name": b["business_name"],
        "brand_folder": b.get("brand_folder"),
        "logos": {k: b.get(k) for k in ("logo_on_dark", "logo_on_light", "signature_logo")},
        "quotes_dir": str(cfg["quotes_dir"]),
        "register_dir": (cfg.get("register") or {}).get("dir"),
        "hourly_rate": cfg.get("hourly_rate"),
    }


def _check_config(c):
    bad = set(c) - CONFIG_KEYS
    if bad:
        raise SetupError(f"Unknown config keys: {sorted(bad)}")
    mailbox = (c.get("mailbox") or "").strip().lower()
    if mailbox:
        if not EMAIL_RE.match(mailbox):
            raise SetupError(f"{mailbox!r} is not an email address")
        c["mailbox"] = mailbox
        c.setdefault("own_domains", [mailbox.split("@")[1]])
        c.setdefault("form_senders", [mailbox])
    for addr in c.get("form_senders", []):
        if not EMAIL_RE.match(addr):
            raise SetupError(f"form_senders: {addr!r} is not an email address")
    for k in ("tenant_id", "client_id"):
        v = (c.get("graph") or {}).get(k)
        if v and not GUID_RE.match(v):
            raise SetupError(f"graph.{k} should be a GUID like 00000000-0000-0000-0000-000000000000")
    if "hourly_rate" in c and not (isinstance(c["hourly_rate"], (int, float)) and 0 < c["hourly_rate"] < 10000):
        raise SetupError("hourly_rate should be a number of dollars per hour")
    if c.get("reply_format") not in (None, "html", "text"):
        raise SetupError('reply_format is "html" or "text"')
    return c


def save(spec_path):
    spec = json.loads(Path(spec_path).read_text())
    new_cfg = _check_config(dict(spec.get("config") or {}))
    new_brand = dict(spec.get("brand") or {})
    bad = set(new_brand) - BRAND_KEYS
    if bad:
        raise SetupError(f"Unknown brand keys: {sorted(bad)}")
    for k in ("logo_on_dark", "logo_on_light", "signature_logo", "brand_folder"):
        if new_brand.get(k):
            new_brand[k] = str(Path(new_brand[k]).expanduser().resolve())

    old_cfg, old_brand = _read(config.CONFIG_PATH), _read(config.BRAND_PATH)
    merged_cfg = config._merge(old_cfg, new_cfg)
    merged_brand = config._merge(old_brand, new_brand)

    # Validate the brand by loading it the way the renderers will, before it replaces the old one.
    _write_private(config.BRAND_PATH.with_name("brand.check.json"), merged_brand)
    real = config.BRAND_PATH
    try:
        config.BRAND_PATH = real.with_name("brand.check.json")
        brand.load()
        for which in ("on_dark", "on_light"):
            brand.logo_element(which)
        brand.signature_logo_png()
    except brand.BrandError as e:
        raise SetupError(str(e))
    finally:
        config.BRAND_PATH = real
        real.with_name("brand.check.json").unlink(missing_ok=True)

    _write_private(config.CONFIG_PATH, merged_cfg)
    if merged_brand:
        _write_private(config.BRAND_PATH, merged_brand)
    return status()
