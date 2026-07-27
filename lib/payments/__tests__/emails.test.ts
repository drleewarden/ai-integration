import {
  formatAmount,
  renderPaymentRequestEmail,
  renderPaymentConfirmationEmail,
  renderPaymentAlertEmail,
} from "../emails";

describe("formatAmount", () => {
  it("formats cents as dollars with currency code", () => {
    expect(formatAmount(45000, "aud")).toBe("$450.00 AUD");
    expect(formatAmount(45010, "aud")).toBe("$450.10 AUD");
    expect(formatAmount(99, "aud")).toBe("$0.99 AUD");
  });
});

describe("renderPaymentRequestEmail", () => {
  const msg = renderPaymentRequestEmail({
    name: 'Jane <script>alert("x")</script>',
    description: "AI Workshop — Fri 7 Aug",
    amount: "$450.00 AUD",
    payUrl: "https://www.creative-milk.com.au/pay/abc-123",
  });
  it("escapes HTML in user-supplied fields", () => {
    expect(msg.html).not.toContain("<script>");
    expect(msg.html).toContain("&lt;script&gt;");
  });
  it("links to the pay URL and shows the amount", () => {
    expect(msg.html).toContain("https://www.creative-milk.com.au/pay/abc-123");
    expect(msg.html).toContain("$450.00 AUD");
    expect(msg.subject).toContain("$450.00 AUD");
  });
});

describe("renderPaymentConfirmationEmail", () => {
  it("includes the amount and description", () => {
    const msg = renderPaymentConfirmationEmail({
      name: "Jane Doe",
      description: "AI Workshop — Fri 7 Aug",
      amount: "$450.00 AUD",
    });
    expect(msg.html).toContain("$450.00 AUD");
    expect(msg.html).toContain("AI Workshop — Fri 7 Aug");
    expect(msg.html).toContain("Jane");
  });
});

describe("renderPaymentAlertEmail", () => {
  it("includes payer identity and amount", () => {
    const msg = renderPaymentAlertEmail({
      name: "Jane Doe",
      email: "jane@example.com",
      description: "AI Workshop — Fri 7 Aug",
      amount: "$450.00 AUD",
    });
    expect(msg.subject).toContain("Jane Doe");
    expect(msg.html).toContain("jane@example.com");
    expect(msg.html).toContain("$450.00 AUD");
  });
});
