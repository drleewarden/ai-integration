import { NextRequest } from "next/server";

type ResendMockCtor = { _mockSend: jest.Mock };

jest.mock("resend", () => {
  const sendMock = jest.fn();
  const MockResend = jest.fn().mockImplementation(function (this: {
    emails: { send: jest.Mock };
  }) {
    this.emails = { send: sendMock };
    return this;
  });
  (MockResend as unknown as ResendMockCtor)._mockSend = sendMock;
  return { Resend: MockResend };
});

// The signup route now writes a workshop_payments row, so the service client
// is stubbed with just the from().insert().select().single() chain it uses.
const mockSingle = jest.fn();
jest.mock("../../lib/supabase/server", () => ({
  getServiceSupabase: () => ({
    from: () => ({
      insert: () => ({
        select: () => ({ single: mockSingle }),
      }),
    }),
  }),
}));

process.env.RESEND_API_KEY = "test-api-key";
process.env.RESEND_FROM = "test@example.com";
process.env.RESEND_TO = "recipient@example.com";

import { POST } from "../../app/api/workshop-signup/route";
import { Resend } from "resend";
import { resetRateLimits } from "../../lib/rate-limit";

const mockSend: jest.Mock = (Resend as unknown as ResendMockCtor)._mockSend;

describe("/api/workshop-signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimits();
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
    mockSingle.mockResolvedValue({ data: { id: "row-uuid-1" }, error: null });
  });

  const createRequest = (body: Record<string, unknown>) =>
    ({
      json: async () => body,
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      nextUrl: new URL("http://localhost:3000/api/workshop-signup"),
    }) as unknown as NextRequest;

  const validBody = {
    name: "Jane Doe",
    email: "jane@example.com",
    businessType: "Cafe",
  };

  it("auto-replies with the same email the admin section sends", async () => {
    const response = await POST(createRequest(validBody));
    expect(response.status).toBe(200);

    // [0] internal notification, [1] auto-reply to the signup.
    expect(mockSend).toHaveBeenCalledTimes(2);
    const reply = mockSend.mock.calls[1][0];
    expect(reply.to).toBe("jane@example.com");
    expect(reply.subject).toBe(
      "Your AI Automation Workshop: how to prepare (7 Aug, 3–5 PM)",
    );
    expect(reply.html).toContain("What we'll cover");
    expect(reply.html).toContain("Claude or ChatGPT: which one?");
    expect(reply.html).toContain("Your top three pain points");
    // The old short "You're on the list" template is gone.
    expect(reply.html).not.toContain("we'll follow up separately with payment");
  });

  it("charges the server-side seat price and links the new row", async () => {
    await POST(createRequest({ ...validBody, amount: "1.00" }));
    const reply = mockSend.mock.calls[1][0];
    expect(reply.html).toContain("$35.00 AUD");
    expect(reply.html).toContain("http://localhost:3000/pay/row-uuid-1");
    expect(reply.html).not.toContain("$1.00");
  });

  it("still sends the reply, without a pay button, when the insert fails", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "boom" } });
    const response = await POST(createRequest(validBody));

    expect(response.status).toBe(200);
    expect(mockSend).toHaveBeenCalledTimes(2);
    const reply = mockSend.mock.calls[1][0];
    expect(reply.html).toContain("What we'll cover");
    expect(reply.html).not.toContain("Pay securely");
  });

  it("drops honeypot submissions without sending or inserting anything", async () => {
    const response = await POST(
      createRequest({ ...validBody, website: "http://spam.example" }),
    );
    expect(response.status).toBe(200);
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockSingle).not.toHaveBeenCalled();
  });

  it("rejects an over-long name before it reaches the database", async () => {
    const response = await POST(
      createRequest({ ...validBody, name: "a".repeat(201) }),
    );
    expect(response.status).toBe(400);
    expect(mockSingle).not.toHaveBeenCalled();
  });
});
