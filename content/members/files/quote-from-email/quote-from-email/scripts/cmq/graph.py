"""Minimal Microsoft Graph client for the shared contact@ mailbox.

Auth: public-client device-code flow (no client secret exists to leak).
Delegated scope Mail.ReadWrite.Shared only: the user signs in as themselves and acts
on the shared mailbox he already has access to. Mail.Send is never requested,
so this code cannot send email even if asked to.

The refresh token is kept in the macOS Keychain and rotated on every refresh.
It is passed to `security` on stdin, never on the command line, so it does not
appear in the process list.
"""
import base64
from html import escape as html_escape
import json
import re
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request

GRAPH = "https://graph.microsoft.com/v1.0"
LOGIN = "https://login.microsoftonline.com"


class GraphError(Exception):
    pass


# Keychain

def _kc_get(cfg):
    kc = cfg["keychain"]
    r = subprocess.run(["security", "find-generic-password", "-a", kc["account"], "-s", kc["service"], "-w"],
                       capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else None


def _kc_set(cfg, token):
    kc = cfg["keychain"]
    if any(ch in token for ch in "\"\n\\"):
        raise GraphError("Unexpected characters in refresh token")
    cmd = f'add-generic-password -U -a "{kc["account"]}" -s "{kc["service"]}" -w "{token}"\n'
    r = subprocess.run(["security", "-i"], input=cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise GraphError("Could not store the refresh token in the Keychain")


# OAuth

def _post_form(url, fields):
    data = urllib.parse.urlencode(fields).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read() or b"{}")


def _require_app(cfg):
    g = cfg["graph"]
    if not g["tenant_id"] or not g["client_id"]:
        raise GraphError("graph.tenant_id and graph.client_id are empty in config.json. Register the app first (see SKILL.md).")
    return g


def device_login(cfg):
    """One-time interactive sign-in. Prints a code for the user to enter at microsoft.com/devicelogin."""
    g = _require_app(cfg)
    base = f"{LOGIN}/{g['tenant_id']}/oauth2/v2.0"
    dc = _post_form(f"{base}/devicecode", {"client_id": g["client_id"], "scope": " ".join(g["scopes"])})
    if "device_code" not in dc:
        raise GraphError(f"Device code request failed: {dc.get('error_description', dc)}")
    print(dc["message"])
    deadline = time.time() + int(dc.get("expires_in", 900))
    while time.time() < deadline:
        time.sleep(int(dc.get("interval", 5)))
        tok = _post_form(f"{base}/token", {
            "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
            "client_id": g["client_id"], "device_code": dc["device_code"],
        })
        if "refresh_token" in tok:
            _kc_set(cfg, tok["refresh_token"])
            print("Signed in. Refresh token stored in the Keychain.")
            return
        if tok.get("error") not in ("authorization_pending", "slow_down"):
            raise GraphError(f"Sign-in failed: {tok.get('error_description', tok)}")
    raise GraphError("Sign-in timed out")


class Graph:
    def __init__(self, cfg):
        self.cfg = cfg
        self.mbx = urllib.parse.quote(cfg["mailbox"])
        self._token, self._exp = None, 0

    def _access_token(self):
        if self._token and time.time() < self._exp - 60:
            return self._token
        g = _require_app(self.cfg)
        rt = _kc_get(self.cfg)
        if not rt:
            raise GraphError("No refresh token in the Keychain. Run: cmquote.py auth")
        tok = _post_form(f"{LOGIN}/{g['tenant_id']}/oauth2/v2.0/token", {
            "grant_type": "refresh_token", "client_id": g["client_id"],
            "refresh_token": rt, "scope": " ".join(g["scopes"]),
        })
        if "access_token" not in tok:
            raise GraphError(f"Token refresh failed: {tok.get('error_description', tok.get('error'))}")
        if tok.get("refresh_token"):
            _kc_set(self.cfg, tok["refresh_token"])
        self._token, self._exp = tok["access_token"], time.time() + int(tok.get("expires_in", 3600))
        return self._token

    def _req(self, method, url, body=None, headers=None):
        if not url.startswith("https://"):
            url = f"{GRAPH}{url}"
        if not url.startswith(GRAPH):
            raise GraphError("Refusing to call a non-Graph URL")
        h = {"Authorization": f"Bearer {self._access_token()}", "Content-Type": "application/json"}
        h.update(headers or {})
        data = json.dumps(body).encode() if body is not None else None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, data=data, method=method, headers=h), timeout=60) as r:
                    raw = r.read()
                    return json.loads(raw) if raw else {}
            except urllib.error.HTTPError as e:
                if e.code in (429, 503, 504) and attempt < 3:
                    time.sleep(int(e.headers.get("Retry-After", 2 ** attempt)))
                    continue
                detail = e.read().decode(errors="replace")[:300]
                raise GraphError(f"Graph {method} failed ({e.code}): {detail}") from None
        raise GraphError("Graph request retries exhausted")

    # Mail operations (read + draft only)

    def inbox_delta(self, delta_link=None):
        """Yield new/changed inbox messages; return the next deltaLink via the final item."""
        url = delta_link or (
            f"/users/{self.mbx}/mailFolders/inbox/messages/delta"
            "?$select=id,subject,from,replyTo,receivedDateTime,conversationId,categories,isDraft"
        )
        msgs = []
        while url:
            page = self._req("GET", url, headers={"Prefer": "odata.maxpagesize=50"})
            msgs.extend(m for m in page.get("value", []) if "@removed" not in m)
            url = page.get("@odata.nextLink")
            if "@odata.deltaLink" in page:
                return msgs, page["@odata.deltaLink"]
        return msgs, None

    def list_inbox(self, limit=10):
        """Newest inbox messages, metadata only (no bodies)."""
        limit = max(1, min(int(limit), 50))
        page = self._req(
            "GET",
            f"/users/{self.mbx}/mailFolders/inbox/messages?$top={limit}&$orderby=receivedDateTime%20desc"
            "&$select=id,subject,from,replyTo,receivedDateTime,conversationId,categories,isDraft,isRead,webLink",
        )
        return page.get("value", [])

    def get_message(self, msg_id):
        # Ids are passed in on the command line; quote them so one can never alter the request path.
        mid = urllib.parse.quote(msg_id, safe="")
        return self._req(
            "GET",
            f"/users/{self.mbx}/messages/{mid}"
            "?$select=id,subject,from,replyTo,body,conversationId,categories,internetMessageHeaders,receivedDateTime,isDraft,webLink",
            headers={"Prefer": 'outlook.body-content-type="text"'},
        )

    # Outlook marks the start of the quoted original with a divider: a line of underscores
    # in plain text, an <hr> before divRplyFwdMsg in HTML. Our text goes above it.
    _TEXT_QUOTE = "________________________________"

    def _get_draft(self, did, text):
        h = {"Prefer": 'outlook.body-content-type="text"'} if text else None
        return self._req("GET", f"/users/{self.mbx}/messages/{did}?$select=body,webLink,isDraft", headers=h)

    def _write_body(self, did, full, content, text, fresh):
        """Put `content` above the quoted original. `fresh` drafts hold only the quote so far."""
        body = full.get("body", {}).get("content", "")
        if text:
            i = body.find(self._TEXT_QUOTE)
            if i < 0 and not fresh:
                raise GraphError("Could not find the quoted original in the draft; not changing it")
            merged = content + "\n" + (body[i:] if i >= 0 else body)
        else:
            tag = re.search(r"<body[^>]*>", body, re.I)
            quoted = re.search(r"<hr[^>]*>\s*<div id=\"?divRplyFwdMsg", body, re.I) or \
                re.search(r"<div id=\"?divRplyFwdMsg", body, re.I)
            if fresh:
                merged = body[:tag.end()] + content + body[tag.end():] if tag else content + body
            elif tag and quoted:
                merged = body[:tag.end()] + content + body[quoted.start():]
            else:
                # The draft was saved as plain text earlier, so its quote has no HTML markers.
                # Rebuild the quote from the text version, escaped, under our HTML.
                plain = self._get_draft(did, text=True).get("body", {}).get("content", "")
                i = plain.find(self._TEXT_QUOTE)
                if i < 0:
                    raise GraphError("Could not find the quoted original in the draft; not changing it")
                quote_html = "<br>".join(html_escape(l) for l in plain[i:].splitlines())
                merged = (content + '<div style="font-family:Aptos, Calibri, Arial, sans-serif;font-size:11pt;">'
                          + quote_html + "</div>")
        self._req("PATCH", f"/users/{self.mbx}/messages/{did}",
                  body={"body": {"contentType": "Text" if text else "HTML", "content": merged}})

    def _attach(self, did, name, data, content_type, replace_prefix=None, cid=None):
        """Add a file to the draft. `replace_prefix` first removes our own earlier copies, nothing else."""
        if replace_prefix:
            for a in self._req("GET", f"/users/{self.mbx}/messages/{did}/attachments?$select=id,name").get("value", []):
                if a["name"].startswith(replace_prefix):
                    aid = urllib.parse.quote(a["id"], safe="")
                    self._req("DELETE", f"/users/{self.mbx}/messages/{did}/attachments/{aid}")
        att = {"@odata.type": "#microsoft.graph.fileAttachment", "name": name, "contentType": content_type,
               "contentBytes": base64.b64encode(data).decode()}
        if cid:
            att.update(isInline=True, contentId=cid)  # shown in the body via src="cid:..."
        self._req("POST", f"/users/{self.mbx}/messages/{did}/attachments", body=att)

    def _attach_all(self, did, attachment, inline, replace):
        if attachment:
            name, data = attachment
            self._attach(did, name, data, "application/pdf",
                         replace_prefix=name.split("_")[0] + "_" if replace else None)
        if inline:
            name, data, cid = inline
            self._attach(did, name, data, "image/png", replace_prefix=name if replace else None, cid=cid)

    def create_reply_draft(self, msg_id, content, attachment=None, text=False, inline=None, to=None):
        """Draft a reply in the original thread. `to` is the client address worked out by
        pipeline.client_address (the sender, or the website form's Reply-To); it is set
        explicitly so the draft never goes back to our own alias."""
        mid = urllib.parse.quote(msg_id, safe="")
        draft = self._req("POST", f"/users/{self.mbx}/messages/{mid}/createReply", body={})
        did = urllib.parse.quote(draft["id"], safe="")
        if to:
            self._req("PATCH", f"/users/{self.mbx}/messages/{did}",
                      body={"toRecipients": [{"emailAddress": {"address": to}}], "ccRecipients": []})
        full = self._get_draft(did, text)
        self._write_body(did, full, content, text, fresh=True)
        self._attach_all(did, attachment, inline, replace=False)
        return draft["id"], full.get("webLink")

    def update_reply_draft(self, draft_id, content, attachment=None, text=False, inline=None):
        """Replace our text in an existing reply draft, keeping the quoted original, and swap our files.
        Returns the webLink, or None if the draft no longer exists (sent or discarded)."""
        did = urllib.parse.quote(draft_id, safe="")
        try:
            full = self._get_draft(did, text)
        except GraphError as e:
            if "(404)" in str(e):
                return None
            raise
        if not full.get("isDraft"):
            return None
        self._write_body(did, full, content, text, fresh=False)
        self._attach_all(did, attachment, inline, replace=True)
        return full.get("webLink")

    def add_category(self, msg_id, existing, category):
        cats = list(dict.fromkeys([*existing, category]))
        mid = urllib.parse.quote(msg_id, safe="")
        self._req("PATCH", f"/users/{self.mbx}/messages/{mid}", body={"categories": cats})

