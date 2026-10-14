"""macOS notification for the user.

Text is passed to osascript as argv, never interpolated into the AppleScript
source, so a client name containing quotes cannot inject script.
"""
import subprocess

_SCRIPT = [
    "on run argv",
    "display notification (item 1 of argv) with title (item 2 of argv) subtitle (item 3 of argv) sound name \"Glass\"",
    "end run",
]


def notify(title, subtitle, message, open_url=None):
    args = ["osascript"]
    for line in _SCRIPT:
        args += ["-e", line]
    args += [message[:200], title[:80], subtitle[:80]]
    subprocess.run(args, capture_output=True)
    if open_url and open_url.startswith("https://outlook."):
        subprocess.run(["open", open_url], capture_output=True)
