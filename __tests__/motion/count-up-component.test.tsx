import { render, screen } from "@testing-library/react";
import CountUp from "@/app/components/motion/CountUp";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("CountUp", () => {
  it("shows the final value immediately under reduced motion", () => {
    mockMatchMedia(true);
    render(<CountUp value={88} />);
    // Both the visible digits and the sr-only copy carry the final value.
    const spans = screen.getAllByText("88");
    expect(spans).toHaveLength(2);
  });

  it("always exposes the stable final value to screen readers", () => {
    mockMatchMedia(false);
    const { container } = render(<CountUp value={42} />);
    const srOnly = container.querySelector(".sr-only");
    expect(srOnly).toHaveTextContent("42");
  });
});
