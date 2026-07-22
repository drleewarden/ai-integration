import { render } from "@testing-library/react";
import BandMeter from "@/app/components/members/tools/BandMeter";

describe("BandMeter", () => {
  it.each([
    ["low", "16.67%"],
    ["medium", "50%"],
    ["high", "83.33%"],
  ] as const)("places the marker for the %s band", (band, left) => {
    const { container } = render(<BandMeter band={band} />);
    const marker = container.querySelector(
      ".band-meter-marker",
    ) as HTMLElement;
    expect(marker.style.left).toBe(left);
  });

  it("is hidden from assistive tech (band is conveyed in the result text)", () => {
    const { container } = render(<BandMeter band="high" />);
    expect(
      (container.firstChild as HTMLElement).getAttribute("aria-hidden"),
    ).toBe("true");
  });
});
