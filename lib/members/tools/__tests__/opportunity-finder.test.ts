import { PROCESSES, rankOpportunities } from "../opportunity-finder";

describe("rankOpportunities", () => {
  it("defines 8 processes with unique ids", () => {
    expect(PROCESSES).toHaveLength(8);
    expect(new Set(PROCESSES.map((p) => p.id)).size).toBe(8);
  });

  it("returns at most 3 opportunities, highest payoff first", () => {
    const result = rankOpportunities(
      {
        "invoice-chasing": 5,
        "lead-follow-up": 10,
        scheduling: 2,
        "faq-support": 8,
      },
      90,
    );
    expect(result.length).toBeLessThanOrEqual(3);
    const factor = { low: 1, medium: 2, high: 4 };
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1];
      const cur = result[i];
      // payoff = annualCost / effortFactor must be non-increasing
      expect(prev.annualCost / factor[prev.effort]).toBeGreaterThanOrEqual(
        cur.annualCost / factor[cur.effort],
      );
    }
  });

  it("computes annual cost as hours * value * 46 weeks", () => {
    const [top] = rankOpportunities({ "invoice-chasing": 4 }, 100);
    expect(top.annualCost).toBe(4 * 100 * 46);
  });

  it("ignores zero-hour and unknown processes", () => {
    expect(
      rankOpportunities({ "invoice-chasing": 0, "made-up": 10 }, 90),
    ).toHaveLength(0);
  });

  it("returns empty for no input", () => {
    expect(rankOpportunities({}, 90)).toEqual([]);
  });

  it("every process carries a blueprint description", () => {
    for (const p of PROCESSES) expect(p.blueprint.length).toBeGreaterThan(20);
  });
});
