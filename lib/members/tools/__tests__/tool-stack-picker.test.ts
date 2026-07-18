import { recommendStack } from "../tool-stack-picker";

describe("recommendStack", () => {
  it("always leads with a general AI assistant", () => {
    const picks = recommendStack("trades", "solo", "scheduling");
    expect(picks[0].category).toBe("General AI assistant");
  });

  it("includes a pick for the chosen time sink", () => {
    const picks = recommendStack("other", "solo", "invoicing");
    expect(picks.some((p) => p.category.includes("Accounting"))).toBe(true);
  });

  it("adds automation glue only for medium teams", () => {
    const glue = (i: ReturnType<typeof recommendStack>) =>
      i.some((p) => p.category === "Automation glue");
    expect(glue(recommendStack("trades", "solo", "scheduling"))).toBe(false);
    expect(glue(recommendStack("trades", "small", "scheduling"))).toBe(false);
    expect(glue(recommendStack("trades", "medium", "scheduling"))).toBe(true);
  });

  it("caps the stack at four and never duplicates a category", () => {
    for (const industry of ["trades", "professional-services", "retail", "hospitality", "health", "other"] as const) {
      for (const team of ["solo", "small", "medium"] as const) {
        for (const sink of ["email-admin", "scheduling", "invoicing", "marketing", "customer-questions", "quotes"] as const) {
          const picks = recommendStack(industry, team, sink);
          expect(picks.length).toBeGreaterThanOrEqual(3);
          expect(picks.length).toBeLessThanOrEqual(4);
          const cats = picks.map((p) => p.category);
          expect(new Set(cats).size).toBe(cats.length);
        }
      }
    }
  });
});
