import { gettingPaidConfig } from "../getting-paid";
import { defaultAnswers } from "../types";

const base = () => defaultAnswers(gettingPaidConfig);

const dollars = (answers: Record<string, number>) =>
  Number(gettingPaidConfig.score(answers).headlineValue.replace(/[$,]/g, ""));

describe("getting-paid audit scoring", () => {
  it("defaults land in the medium band", () => {
    expect(gettingPaidConfig.score(base()).band).toBe("medium");
  });

  it("prompt invoicer with automation lands in the low band", () => {
    const result = gettingPaidConfig.score({
      invoicesPerMonth: 5,
      invoiceValue: 500,
      whenInvoice: 0,
      overduePct: 10,
      reminderHabit: 0,
    });
    expect(result.band).toBe("low");
  });

  it("slow invoicer who never chases lands in the high band", () => {
    const result = gettingPaidConfig.score({
      invoicesPerMonth: 40,
      invoiceValue: 5000,
      whenInvoice: 2,
      overduePct: 40,
      reminderHabit: 2,
    });
    expect(result.band).toBe("high");
  });

  it("zero overdue share means zero locked-up cash", () => {
    expect(dollars({ ...base(), overduePct: 0 })).toBe(0);
  });

  it("weaker chasing never reduces locked-up cash", () => {
    for (let i = 0; i < 2; i++) {
      expect(dollars({ ...base(), reminderHabit: i + 1 })).toBeGreaterThanOrEqual(
        dollars({ ...base(), reminderHabit: i }),
      );
    }
  });

  it("slower invoicing never reduces locked-up cash", () => {
    for (let i = 0; i < 2; i++) {
      expect(dollars({ ...base(), whenInvoice: i + 1 })).toBeGreaterThanOrEqual(
        dollars({ ...base(), whenInvoice: i }),
      );
    }
  });
});
