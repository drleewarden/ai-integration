"""Load config and resolve paths. No secrets are read here.

Two layers, so the plugin can be updated without losing anyone's settings:
  - config.default.json, shipped in the plugin: pricing, phases, payment schedule.
  - ~/.creative-milk/config.json, written by the setup skill: mailbox, signature,
    business details and folders. Keys here override the defaults.
The user folder (override with CM_HOME) also holds brand.json, state/ and rates.json.
"""
import json
import os
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG_PATH = SKILL_DIR / "config.default.json"
ASSETS_DIR = SKILL_DIR / "assets"

USER_DIR = Path(os.path.expanduser(os.environ.get("CM_HOME", "~/.creative-milk")))
CONFIG_PATH = USER_DIR / "config.json"
BRAND_PATH = USER_DIR / "brand.json"
STATE_DIR = USER_DIR / "state"
RATES_PATH = USER_DIR / "rates.json"


class NotSetUp(Exception):
    pass


def _merge(base, over):
    out = dict(base)
    for k, v in over.items():
        out[k] = _merge(out[k], v) if isinstance(v, dict) and isinstance(out.get(k), dict) else v
    return out


def is_set_up():
    return CONFIG_PATH.exists()


def load():
    with open(DEFAULT_CONFIG_PATH) as f:
        cfg = json.load(f)
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            cfg = _merge(cfg, json.load(f))
    cfg["quotes_dir"] = Path(os.path.expanduser(cfg["quotes_dir"]))
    cfg["pricing_sources"] = [Path(os.path.expanduser(p)) for p in cfg.get("pricing_sources", [])]
    return cfg


def ensure_private_dir(path: Path):
    """Create a directory readable only by the current user (quotes hold client emails)."""
    path.mkdir(parents=True, exist_ok=True)
    os.chmod(path, 0o700)
    return path
