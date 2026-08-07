"use client";

import { useEffect } from "react";

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command failed");
}

export default function PromptCopyEnhancer({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const handleClick = async (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>(
        "[data-copy-prompt-button]",
      );
      if (!button || !root.contains(button)) return;

      const prompt = button.closest<HTMLElement>("[data-copy-prompt]");
      const code = prompt?.querySelector("code");
      const status = prompt?.querySelector<HTMLElement>(
        "[data-copy-prompt-status]",
      );
      if (!code?.textContent || !status) return;

      try {
        await copyText(code.textContent.trim());
        button.textContent = "Copied";
        status.textContent = "Prompt copied to clipboard.";
      } catch {
        button.textContent = "Copy failed";
        status.textContent = "Select the prompt text and copy it manually.";
      }

      window.setTimeout(() => {
        button.textContent = "Copy prompt";
        status.textContent = "";
      }, 2400);
    };

    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, [rootId]);

  return null;
}
