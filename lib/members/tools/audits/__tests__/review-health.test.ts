import { reviewHealthConfig } from "../review-health";
import { defaultAnswers } from "../types";

const base = () => defaultAnswers(reviewHealthConfig);

const scoreOf = (answers: Record<string, number>) =>
  Number(reviewHealthConfig.score(answers).headlineValue.split("/")[0]);

describe("review-health audit scoring", () => {
  it("defaults land in the medium band", () => {
    const result = reviewHealthConfig.score(base());
    expect(result.band).toBe("medium");
  });

  it("strong profile scores 80+ (low band)", () => {
    const result = reviewHealthConfig.score({
      reviewCount: 150,
      recency: 0,
      rating: 4.8,
      responseRate: 0,
      askHabit: 0,
    });
    expect(result.band).toBe("low");
    expect(scoreOf({
      reviewCount: 150,
      recency: 0,
      rating: 4.8,
      responseRate: 0,
      askHabit: 0,
    })).toBeGreaterThanOrEqual(80);
  });

  it("weak profile lands in the high band", () => {
    const result = reviewHealthConfig.score({
      reviewCount: 3,
      recency: 3,
      rating: 3.5,
      responseRate: 2,
      askHabit: 2,
    });
    expect(result.band).toBe("high");
  });

  it("score is capped at 100 and floored at 0 conceptually", () => {
    const max = scoreOf({
      reviewCount: 300,
      recency: 0,
      rating: 5,
      responseRate: 0,
      askHabit: 0,
    });
    expect(max).toBeLessThanOrEqual(100);
    const min = scoreOf({
      reviewCount: 0,
      recency: 3,
      rating: 3,
      responseRate: 2,
      askHabit: 2,
    });
    expect(min).toBeGreaterThanOrEqual(0);
  });

  it("full count marks arrive at 100 reviews", () => {
    expect(scoreOf({ ...base(), reviewCount: 100 })).toBe(
      scoreOf({ ...base(), reviewCount: 300 }),
    );
  });

  it("staler recency never improves the score", () => {
    for (let i = 0; i < 3; i++) {
      expect(scoreOf({ ...base(), recency: i + 1 })).toBeLessThanOrEqual(
        scoreOf({ ...base(), recency: i }),
      );
    }
  });

  it("asking less never improves the score", () => {
    for (let i = 0; i < 2; i++) {
      expect(scoreOf({ ...base(), askHabit: i + 1 })).toBeLessThanOrEqual(
        scoreOf({ ...base(), askHabit: i }),
      );
    }
  });
});
