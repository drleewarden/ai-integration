"use client";

import UrlAuditTool from "./UrlAuditTool";

/**
 * Free members tool: single-page website audit. The heavy lifting (and all
 * gating/validation) happens in /api/members/tools/health-check.
 */
export default function WebsiteHealthCheck() {
  return (
    <UrlAuditTool
      endpoint="/api/members/tools/health-check"
      inputLabel="Your website address"
      buttonLabel="Check my site"
      busyLabel="Checking…"
      scoreLabel={(finalUrl) => (
        <>
          Health score for <strong>{finalUrl}</strong>
        </>
      )}
    />
  );
}
