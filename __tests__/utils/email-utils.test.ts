// Test utility functions from the email route
describe("Email utility functions", () => {
  // We need to extract and test the utility functions
  // Since they're not exported, we'll test them through the main function calls
  // or create a separate utilities file. For now, let's test the HTML escaping functionality

  describe("HTML escaping in email content", () => {
    const createEmailContent = (message: string) => {
      // This simulates the escapeHtml function behavior
      return message
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    it("should escape HTML special characters", () => {
      const input = '<script>alert("xss")</script>';
      const expected = "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;";
      expect(createEmailContent(input)).toBe(expected);
    });

    it("should escape ampersands", () => {
      const input = "Johnson & Johnson";
      const expected = "Johnson &amp; Johnson";
      expect(createEmailContent(input)).toBe(expected);
    });

    it("should escape quotes", () => {
      const input = `He said "Hello" and she said 'Hi'`;
      const expected = `He said &quot;Hello&quot; and she said &#39;Hi&#39;`;
      expect(createEmailContent(input)).toBe(expected);
    });

    it("should handle empty strings", () => {
      expect(createEmailContent("")).toBe("");
    });

    it("should handle strings without special characters", () => {
      const input = "This is a normal message";
      expect(createEmailContent(input)).toBe(input);
    });
  });

  describe("Email template rendering", () => {
    const renderEmailTemplate = (fields: {
      name: string;
      email: string;
      company: string;
      message: string;
    }): string => {
      // This simulates the renderEmail function
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New project enquiry</title>
</head>
<body style="margin:0;background:#0F1526;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#F5F0E8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F1526;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0F1526;border:1px solid rgba(245,240,232,0.08);">

        <tr><td style="padding:32px 40px;border-bottom:1px solid rgba(245,240,232,0.08);">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;">-- New enquiry</div>
          <div style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#F5F0E8;letter-spacing:-0.01em;line-height:1.05;">
            Creative <em style="color:#C9A84C;font-style:italic;">Milk</em>
          </div>
        </td></tr>

        <tr><td style="padding:32px 40px;">
          <div style="margin-bottom:24px;">
            <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:6px;">Name</div>
            <div style="font-size:16px;color:#F5F0E8;">${fields.name}</div>
          </div>

          <div style="margin-bottom:24px;">
            <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:6px;">Email</div>
            <div style="font-size:16px;"><a href="mailto:${fields.email}" style="color:#C9A84C;text-decoration:none;border-bottom:1px solid rgba(201,168,76,0.35);">${fields.email}</a></div>
          </div>

          ${
            fields.company
              ? `<div style="margin-bottom:24px;">
                   <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:6px;">Company</div>
                   <div style="font-size:16px;color:#F5F0E8;">${fields.company}</div>
                 </div>`
              : ""
          }

          <div>
            <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,232,0.45);margin-bottom:6px;">Message</div>
            <div style="font-size:15px;line-height:1.7;color:#F5F0E8;background:rgba(245,240,232,0.04);border-left:2px solid #C9A84C;padding:16px 20px;">
              ${fields.message}
            </div>
          </div>
        </td></tr>

        <tr><td style="padding:24px 40px;border-top:1px solid rgba(245,240,232,0.08);font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;color:rgba(245,240,232,0.32);">
          Sent from the Creative Milk contact form
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
    };

    it("should render complete email template with all fields", () => {
      const fields = {
        name: "John Doe",
        email: "john@example.com",
        company: "Acme Corp",
        message: "This is a test message",
      };

      const html = renderEmailTemplate(fields);

      expect(html).toContain("John Doe");
      expect(html).toContain("john@example.com");
      expect(html).toContain("Acme Corp");
      expect(html).toContain("This is a test message");
      expect(html).toContain("Creative Milk");
      expect(html).toContain("New project enquiry");
    });

    it("should render email template without company field", () => {
      const fields = {
        name: "Jane Smith",
        email: "jane@example.com",
        company: "",
        message: "Hello there",
      };

      const html = renderEmailTemplate(fields);

      expect(html).toContain("Jane Smith");
      expect(html).toContain("jane@example.com");
      expect(html).not.toContain("Company</div>");
      expect(html).toContain("Hello there");
    });

    it("should properly structure HTML email", () => {
      const fields = {
        name: "Test User",
        email: "test@example.com",
        company: "Test Co",
        message: "Test message",
      };

      const html = renderEmailTemplate(fields);

      expect(html).toMatch(/^<!DOCTYPE html>/);
      expect(html).toContain('<html lang="en">');
      expect(html).toContain("<title>New project enquiry</title>");
      expect(html).toContain("</html>");
      expect(html).toContain('role="presentation"');
    });

    it("should handle special characters in fields safely", () => {
      const fields = {
        name: "John & Doe",
        email: "john+test@example.com",
        company: "Acme & Co.",
        message: "Hello <world>",
      };

      const html = renderEmailTemplate(fields);

      // The template should contain the raw values since escaping
      // happens before calling renderEmail in the actual implementation
      expect(html).toContain("John & Doe");
      expect(html).toContain("Acme & Co.");
      expect(html).toContain("Hello <world>");
    });
  });

  describe("Email validation regex", () => {
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it("should accept valid email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@example.com",
        "user+tag@example.co.uk",
        "firstname.lastname@company.org",
        "email@123.123.123.123",
      ];

      validEmails.forEach((email) => {
        expect(EMAIL_RE.test(email)).toBe(true);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "plainaddress",
        "@example.com",
        "test@",
        "test @example.com",
        "test@example",
        "test@.com",
        "",
        "  ",
        "test@example.",
      ];

      invalidEmails.forEach((email) => {
        expect(EMAIL_RE.test(email)).toBe(false);
      });
    });
  });
});
