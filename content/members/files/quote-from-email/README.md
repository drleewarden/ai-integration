# Quote from Email - a Claude Code skill

Turns website enquiries in your Microsoft 365 inbox into branded quote PDFs
and threaded Outlook reply drafts. Claude reads the enquiry, asks you a few
follow-up questions (pages, SEO, how to address the client, a personal note),
renders the quote in your brand and drafts the reply with the PDF attached.
You review every draft before anything is sent: the skill has no permission
to send email.

## What's in the zip

| Folder | Purpose |
|--------|---------|
| `quote-from-email/` | The quoting skill, pricing defaults and quote template |
| `quote-invoice-setup/` | First-run setup: your mailbox, brand style and logo folder |

## Install

```bash
unzip quote-from-email-v1.zip -d ~/.claude/skills/
```

Both folders must sit side by side in `~/.claude/skills/`; the setup skill
runs commands from the sibling `quote-from-email` folder.

## First run

```
/quote-invoice-setup
```

It asks for the mailbox to scan, your brand style and your branding folder,
then builds a preview quote. Settings are saved in `~/.creative-milk/`, never
inside the skill folders, so updating the skill keeps them.

Connecting the mailbox needs a one-time Microsoft 365 app registration in
your own tenant (setup walks you through it). Sign-in uses the device-code
flow, so there is no client secret, and the refresh token is kept in the
macOS Keychain.

## Use

```
/quote-from-email
```

Or just ask: "any new enquiries?", "quote that email", "draft a quote for Sam".

## Requirements

- macOS (Keychain token storage)
- Python 3
- Google Chrome or Chromium (PDF rendering)
- The `claude` CLI on your PATH (enquiries are classified with a tool-less `claude -p`)

Pairs with the **Invoice Generator** skill, which bills straight from these quotes.
