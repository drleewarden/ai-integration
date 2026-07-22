import { validateAuditUrl, isPrivateIp } from "../health-check-url";

describe("validateAuditUrl", () => {
  it("accepts a normal https URL", () => {
    const r = validateAuditUrl("https://example.com.au/about");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.url.hostname).toBe("example.com.au");
  });

  it("accepts a bare domain and assumes https", () => {
    const r = validateAuditUrl("example.com.au");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.url.protocol).toBe("https:");
  });

  it.each([
    "http://example.com", // plain http
    "ftp://example.com", // non-http scheme
    "https://user:pw@example.com", // embedded credentials
    "https://example.com:8443", // non-default port
    "https://localhost",
    "https://foo.local",
    "https://foo.internal",
    "https://127.0.0.1", // IP literals rejected outright
    "https://[::1]",
    "https://10.0.0.5",
    "not a url at all",
    "",
  ])("rejects %s", (raw) => {
    expect(validateAuditUrl(raw).ok).toBe(false);
  });
});

describe("isPrivateIp", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "0.0.0.0",
    "::1",
    "fc00::1",
    "fd12::1",
    "fe80::1",
    "::ffff:192.168.1.1",
  ])("flags %s as private", (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });

  it.each(["8.8.8.8", "1.1.1.1", "172.32.0.1", "2606:4700::1111"])(
    "allows public %s",
    (ip) => expect(isPrivateIp(ip)).toBe(false),
  );
});
