import { quoteTurnaroundConfig } from "../quote-turnaround";
import { defaultAnswers } from "../types";

const base = () => defaultAnswers(quoteTurnaroundConfig);

const dollars = (answers: Record<string, number>) =>
  Number(
    quoteTurnaroundConfig.score(answers).headlineValue.replace(/[$,]/g, ""),
  );

describe("quote-turnaround audit scoring", () => {
  it("defaults land in the medium band", () => {
    expect(quoteTurnaroundConfig.score(base()).band).toBe("medium");
  });

  it("same-day quoting costs nothing (low band)", () => {
    const result = quoteTurnaroundConfig.score({ ...base(), turnaround: 0 });
    expect(result.band).toBe("low");
    expect(dollars({ ...base(), turnaround: 0 })).toBe(0);
  });

  it("high-volume week-plus quoting lands in the high band", () => {
    const result = quoteTurnaroundConfig.score({
      quotesPerMonth: 30,
      quoteValue: 10000,
      turnaround: 2,
      winRate: 40,
    });
    expect(result.band).toBe("high");
  });

  it("slower turnaround never reduces the cost", () => {
    for (let i = 0; i < 2; i++) {
      expect(dollars({ ...base(), turnaround: i + 1 })).toBeGreaterThanOrEqual(
        dollars({ ...base(), turnaround: i }),
      );
    }
  });

  it("cost scales with quote volume", () => {
    expect(dollars({ ...base(), quotesPerMonth: 20 })).toBeGreaterThan(
      dollars({ ...base(), quotesPerMonth: 5 }),
    );
  });
});
