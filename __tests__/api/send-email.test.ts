import { NextRequest } from "next/server";

// We'll access the mock through this variable after the mock is set up
let mockSend: jest.Mock;

jest.mock("resend", () => {
  // Create the mock inside the factory to avoid hoisting issues
  const sendMock = jest.fn();

  const MockResend = jest.fn().mockImplementation(function (this: any) {
    this.emails = {
      send: sendMock,
    };
    return this;
  });

  // Store reference so we can access it in tests
  (MockResend as any)._mockSend = sendMock;

  return {
    Resend: MockResend,
  };
});

// Set environment variables before importing the route
process.env.RESEND_API_KEY = "test-api-key";
process.env.RESEND_FROM = "test@example.com";
process.env.RESEND_TO = "recipient@example.com";

// Now import the route and the mocked Resend
import { POST } from "../../app/api/send-email/route";
import { Resend } from "resend";

// Get the mock send function from the mocked Resend constructor
mockSend = (Resend as any)._mockSend;

describe("/api/send-email", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) => {
    const request = {
      json: async () => body,
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    } as unknown as NextRequest;
    return request;
  };

  const validRequestBody = {
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Corp",
    message: "Hello, I would like to discuss a project.",
  };

  describe("Successful email sending", () => {
    it("should send email successfully with all fields", async () => {
      mockSend.mockResolvedValueOnce({
        id: "email-id-123",
        from: "test@example.com",
        to: "recipient@example.com",
      });

      const request = createRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();

      expect(mockSend).toHaveBeenCalledWith({
        from: "test@example.com",
        to: "recipient@example.com",
        replyTo: "john@example.com",
        subject: "New project enquiry — John Doe",
        html: expect.stringContaining("John Doe"),
      });
    });

    it("should send email successfully without company field", async () => {
      mockSend.mockResolvedValueOnce({ id: "email-id-123" });

      const requestBody = { ...validRequestBody };
      delete requestBody.company;

      const request = createRequest(requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const [emailCall] = mockSend.mock.calls;
      expect(emailCall[0].html).not.toContain("Acme Corp");
    });

    it("should use default environment variables when not provided", async () => {
      const originalFrom = process.env.RESEND_FROM;
      const originalTo = process.env.RESEND_TO;

      delete process.env.RESEND_FROM;
      delete process.env.RESEND_TO;

      mockSend.mockResolvedValueOnce({ id: "email-id-123" });

      const request = createRequest(validRequestBody);
      await POST(request);

      expect(mockSend).toHaveBeenCalledWith({
        from: "Creative Milk <onboarding@resend.dev>",
        to: "drleewarden@gmail.com",
        replyTo: "john@example.com",
        subject: "New project enquiry — John Doe",
        html: expect.any(String),
      });

      // Restore original values
      process.env.RESEND_FROM = originalFrom || "test@example.com";
      process.env.RESEND_TO = originalTo || "recipient@example.com";
    });
  });

  describe("Validation errors", () => {
    it("should return 400 when name is missing", async () => {
      const request = createRequest({ ...validRequestBody, name: "" });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Name, email, and message are required.");
    });

    it("should return 400 when email is missing", async () => {
      const request = createRequest({ ...validRequestBody, email: "" });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Name, email, and message are required.");
    });

    it("should return 400 when message is missing", async () => {
      const request = createRequest({ ...validRequestBody, message: "" });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Name, email, and message are required.");
    });

    it("should return 400 for invalid email format", async () => {
      const request = createRequest({
        ...validRequestBody,
        email: "invalid-email",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Please provide a valid email address.");
    });

    it("should return 400 when message is too long", async () => {
      const longMessage = "a".repeat(5001);
      const request = createRequest({
        ...validRequestBody,
        message: longMessage,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Message is too long — please keep it under 5,000 characters.",
      );
    });

    it("should trim whitespace from input fields", async () => {
      mockSend.mockResolvedValueOnce({ id: "email-id-123" });

      const request = createRequest({
        name: "  John Doe  ",
        email: "  john@example.com  ",
        company: "  Acme Corp  ",
        message: "  Hello, world!  ",
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      expect(mockSend).toHaveBeenCalledWith({
        from: expect.any(String),
        to: expect.any(String),
        replyTo: "john@example.com",
        subject: "New project enquiry — John Doe",
        html: expect.stringContaining("John Doe"),
      });
    });
  });

  describe("Configuration errors", () => {
    it("should return 503 when Resend API key is not configured", async () => {
      const originalApiKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      // Need to clear the module cache to test this properly
      jest.resetModules();

      // Re-mock Resend after reset
      const sendMock = jest.fn();
      jest.doMock("resend", () => {
        const MockResend = jest.fn().mockImplementation(function (this: any) {
          this.emails = {
            send: sendMock,
          };
          return this;
        });
        return {
          Resend: MockResend,
        };
      });

      const { POST: PostWithoutApiKey } = require("../../app/api/send-email/route");

      const request = createRequest(validRequestBody);
      const response = await PostWithoutApiKey(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe(
        "Email service not configured. Please contact us directly.",
      );

      // Restore the API key and reload the module
      process.env.RESEND_API_KEY = originalApiKey;
      jest.resetModules();
    });
  });

  describe("Resend API errors", () => {
    it("should return 500 when Resend API throws an error", async () => {
      mockSend.mockRejectedValueOnce(new Error("Resend API error"));

      const request = createRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "Failed to send. Please try again or email us directly.",
      );
      expect(data.details).toBe("Resend API error");
    });

    it("should handle unknown errors gracefully", async () => {
      mockSend.mockRejectedValueOnce("Unknown error");

      const request = createRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "Failed to send. Please try again or email us directly.",
      );
      expect(data.details).toBe("Unknown error");
    });
  });

  describe("Invalid JSON", () => {
    it("should handle malformed JSON gracefully", async () => {
      const request = {
        json: async () => {
          throw new Error("Unexpected end of JSON input");
        },
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: "invalid json",
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(
        "Failed to send. Please try again or email us directly.",
      );
    });
  });
});
