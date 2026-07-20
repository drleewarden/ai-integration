import { render, screen } from "@testing-library/react";
import ScoreDial from "@/app/components/members/ScoreDial";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("ScoreDial", () => {
  it("labels the dial with the full score sentence", () => {
    mockMatchMedia(true);
    render(<ScoreDial score={72} />);
    expect(
      screen.getByRole("img", { name: "Health score 72 out of 100" }),
    ).toBeInTheDocument();
  });
});
