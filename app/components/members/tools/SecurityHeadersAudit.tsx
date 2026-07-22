"use client";

import UrlAuditTool from "./UrlAuditTool";

/**
 * Free members tool: HTTP security-header audit. The heavy lifting (and all
 * gating/validation) happens in /api/members/tools/security-headers.
 */
export default function SecurityHeadersAudit() {
  return (
    <UrlAuditTool
      endpoint="/api/members/tools/security-headers"
      inputLabel="Your website address"
      buttonLabel="Scan my site"
      busyLabel="Scanning…"
      scoreLabel={(finalUrl) => (
        <>
          Security score for <strong>{finalUrl}</strong>
        </>
      )}
    />
  );
}
