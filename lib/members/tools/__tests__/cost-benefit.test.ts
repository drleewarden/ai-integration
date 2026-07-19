import {
  evaluateScenario,
  evaluateScenarios,
  type Scenario,
} from "../cost-benefit";

const base: Scenario = {
  id: "s1",
  name: "Invoice reminders",
  setupCost: 500,
  monthlyCost: 30,
  hoursSavedPerWeek: 2,
  hourlyValue: 85,
};

describe("evaluateScenario", () => {
  it("computes annual saving on 46 working weeks", () => {
    const r = evaluateScenario(base);
    expect(r.annualSaving).toBe(2 * 85 * 46); // 7820
    expect(r.annualRunningCost).toBe(360);
    expect(r.firstYearNet).toBe(7820 - 360 - 500);
    expect(r.ongoingYearNet).toBe(7820 - 360);
  });

  it("computes payback in whole months of net saving", () => {
    const r = evaluateScenario(base);
    // monthly net = (7820 - 360) / 12 ≈ 621.67 → ceil(500 / 621.67) = 1
    expect(r.paybackMonths).toBe(1);
  });

  it("is immediate with no setup cost", () => {
    expect(evaluateScenario({ ...base, setupCost: 0 }).paybackMonths).toBe(0);
  });

  it("never pays back when running cost exceeds saving", () => {
    const r = evaluateScenario({
      ...base,
      monthlyCost: 1000,
      hoursSavedPerWeek: 1,
      hourlyValue: 50,
    });
    expect(r.paybackMonths).toBeNull();
    expect(r.firstYearNet).toBeLessThan(0);
  });
});

describe("evaluateScenarios", () => {
  it("ranks by first-year net, best first", () => {
    const weak = { ...base, id: "weak", hoursSavedPerWeek: 1 };
    const strong = { ...base, id: "strong", hoursSavedPerWeek: 10 };
    const ranked = evaluateScenarios([weak, strong]);
    expect(ranked.map((r) => r.id)).toEqual(["strong", "weak"]);
  });
});
