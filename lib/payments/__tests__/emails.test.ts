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
  });
  it("includes the workshop preparation details and polished subject", () => {
    expect(msg.subject).toBe(
      "Your AI Automation Workshop: how to prepare (7 Aug, 3–5 PM)",
    );
    expect(msg.html).toContain("What we'll cover");
    expect(msg.html).toContain("What to bring");
    expect(msg.html).toContain("Claude or ChatGPT: which one?");
    expect(msg.html).toContain("Your top three pain points");
  });
  it("includes a prefilled Google Calendar save-the-date link", () => {
    expect(msg.html).toContain("Add to Google Calendar");
    expect(msg.html).toContain(
      "https://calendar.google.com/calendar/render?action=TEMPLATE",
    );
    expect(msg.html).toContain(
      "dates=20260807T050000Z%2F20260807T070000Z",
    );
    expect(msg.html).toContain(
      "Elwood%20%2B%20St%20Kilda%20Neighbourhood%20Learning%20Centre",
    );
  });
  it("does not use em dashes", () => {
    expect(msg.subject).not.toContain("—");
    expect(msg.html).not.toContain("—");
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
