import "@testing-library/jest-dom";
import "whatwg-fetch";

// Mock NextResponse
class MockResponse extends Response {
  static json(data, init) {
    return new MockResponse(JSON.stringify(data), {
      status: init?.status || 200,
      statusText: init?.statusText || "OK",
      headers: {
        "content-type": "application/json",
        ...(init?.headers || {}),
      },
    });
  }
}

// Add json method to global Response for Next.js compatibility
if (!global.Response.json) {
  global.Response.json = MockResponse.json;
}

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "";
  },
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data, init) => MockResponse.json(data, init),
  },
}));

// Mock environment variables for tests
process.env.RESEND_API_KEY = "test-api-key";
process.env.RESEND_FROM = "test@example.com";
process.env.RESEND_TO = "recipient@example.com";
