import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PromptCopyEnhancer from "@/app/components/members/PromptCopyEnhancer";

describe("PromptCopyEnhancer", () => {
  it("copies only the exact code-block text", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });

    render(
      <>
        <div id="guide-root">
          <div data-copy-prompt>
            <button type="button" data-copy-prompt-button>
              Copy prompt
            </button>
            <pre>
              <code>{"First line\n\nSecond line"}</code>
            </pre>
            <span data-copy-prompt-status aria-live="polite" />
          </div>
        </div>
        <PromptCopyEnhancer rootId="guide-root" />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("First line\n\nSecond line");
      expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
      expect(screen.getByText("Prompt copied to clipboard.")).toBeTruthy();
    });
  });
});
