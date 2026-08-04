import {
  formatAmount,
  htmlToText,
  renderPaymentRequestEmail,
  renderPaymentConfirmationEmail,
  renderPaymentAlertEmail,
} from "../emails";

describe("htmlToText", () => {
  it("keeps link targets so URLs survive in the text part", () => {
    expect(htmlToText('<p><a href="https://x.test/pay/1">Pay securely</a></p>'))
      .toBe("Pay securely (https://x.test/pay/1)");
  });
  it("turns list items into dashes", () => {
    expect(htmlToText("<ul><li>One</li><li>Two</li></ul>")).toBe("- One\n- Two");
  });
  it("strips tags and drops head/script content", () => {
    const html = "<head><title>T</title></head><body><p>Hi</p></body>";
    const text = htmlToText(html);
    expect(text).toBe("Hi");
    expect(text).not.toContain("<");
  });
  it("decodes entities without re-creating markup", () => {
    // &amp;lt; must stay the literal text "&lt;", never become a tag.
    expect(htmlToText("<p>&amp;lt;b&amp;gt;</p>")).toBe("&lt;b&gt;");
    expect(htmlToText("<p>Tom &amp; Jerry&#39;s</p>")).toBe("Tom & Jerry's");
  });
});

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
  it("ships a text/plain alternative carrying the pay URL", () => {
    // HTML-only mail is a spam-filter signal, so the text part must be real
    // content, not a stub, and must keep the link the email exists to deliver.
    expect(msg.text).toContain("https://www.creative-milk.com.au/pay/abc-123");
    expect(msg.text).toContain("$450.00 AUD");
    expect(msg.text).toContain("What we'll cover");
    expect(msg.text.length).toBeGreaterThan(500);
    // No markup survives: no tags, no inline styles, no entities.
    expect(msg.text).not.toMatch(/<\/?(p|div|a|ul|li|table|td|tr|strong)\b/i);
    expect(msg.text).not.toContain("style=");
    expect(msg.text).not.toMatch(/&(amp|lt|gt|quot|#39|nbsp);/);
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

  describe("without a payUrl", () => {
    const noLink = renderPaymentRequestEmail({
      name: "Jane Doe",
      description: "AI Workshop - Fri 7 Aug",
      amount: "$25.00 AUD",
    });
    it("omits the pay button rather than linking nowhere", () => {
      expect(noLink.html).not.toContain("Pay securely");
      expect(noLink.html).not.toContain("/pay/");
      expect(noLink.html).not.toContain("The link doesn't expire");
      expect(noLink.html).toContain(
        "we'll send your secure payment link in a separate email shortly",
      );
    });
    it("keeps the same subject and preparation content", () => {
      expect(noLink.subject).toBe(msg.subject);
      expect(noLink.html).toContain("What we'll cover");
      expect(noLink.html).toContain("What to bring");
      expect(noLink.html).toContain("Claude or ChatGPT: which one?");
      expect(noLink.html).toContain("Add to Google Calendar");
      expect(noLink.html).toContain("$25.00 AUD");
    });
  });
});

describe("renderPaymentConfirmationEmail", () => {
  it("includes the amount and description", () => {
    const msg = renderPaymentConfirmationEmail({
      name: "Jane Doe",
      description: "AI Workshop — Fri 7 Aug",
      amount: "$450.00 AUD",
      reference: "pi_test_456",
    });
    expect(msg.subject).toBe("Payment receipt: AI Automation Workshop");
    expect(msg.html).toContain("$450.00 AUD");
    expect(msg.html).toContain("AI Workshop - Fri 7 Aug");
    expect(msg.html).toContain("Jane");
    expect(msg.html).toContain("pi_test_456");
    expect(msg.html).toContain("Please keep this email as your payment receipt");
    expect(msg.html).not.toContain("separate card receipt");
    expect(msg.html).not.toContain("—");
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
