import { leadLeakConfig } from "../lead-leak";
import { defaultAnswers } from "../types";

const base = () => defaultAnswers(leadLeakConfig);

describe("lead-leak audit scoring", () => {
  it("defaults land in the medium band with a credible figure", () => {
    const result = leadLeakConfig.score(base());
    expect(result.band).toBe("medium");
    expect(result.headlineValue).toMatch(/^\$[\d,]+$/);
  });

  it("small, responsive business lands in the low band", () => {
    const result = leadLeakConfig.score({
      enquiriesPerWeek: 2,
      responseTime: 0,
      afterHours: 0,
      followUps: 2,
      jobValue: 100,
    });
    expect(result.band).toBe("low");
  });

  it("high-volume slow responder lands in the high band", () => {
    const result = leadLeakConfig.score({
      enquiriesPerWeek: 50,
      responseTime: 3,
      afterHours: 2,
      followUps: 0,
      jobValue: 10000,
    });
    expect(result.band).toBe("high");
  });

  const dollars = (answers: Record<string, number>) =>
    Number(leadLeakConfig.score(answers).headlineValue.replace(/[$,]/g, ""));

  it("slower response never reduces the leak", () => {
    for (let i = 0; i < 3; i++) {
      expect(dollars({ ...base(), responseTime: i + 1 })).toBeGreaterThanOrEqual(
        dollars({ ...base(), responseTime: i }),
      );
    }
  });

  it("more follow-ups never increase the leak", () => {
    for (let i = 0; i < 2; i++) {
      expect(dollars({ ...base(), followUps: i + 1 })).toBeLessThanOrEqual(
        dollars({ ...base(), followUps: i }),
      );
    }
  });

  it("leak rate never drops below the floor", () => {
    // Best-possible habits still leak a little.
    const result = leadLeakConfig.score({
      enquiriesPerWeek: 50,
      responseTime: 0,
      afterHours: 0,
      followUps: 2,
      jobValue: 10000,
    });
    expect(Number(result.headlineValue.replace(/[$,]/g, ""))).toBeGreaterThan(0);
  });
});
