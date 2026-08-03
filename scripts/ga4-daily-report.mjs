import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const propertyId = process.env.GA4_PROPERTY_ID || "510304117";
const credentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(process.cwd(), ".secrets/google-analytics-service-account.json");

const base64Url = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");

async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: credentials.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer
    .sign(credentials.private_key, "base64")
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");

  const response = await fetch(credentials.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!response.ok) throw new Error(`OAuth failed (${response.status}): ${await response.text()}`);
  return (await response.json()).access_token;
}

async function runReport(token, body) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) throw new Error(`GA4 request failed (${response.status}): ${await response.text()}`);
  return response.json();
}

const rows = (report) =>
  (report.rows || []).map((row) => ({
    dimensions: (row.dimensionValues || []).map((value) => value.value),
    metrics: (row.metricValues || []).map((value) => value.value),
  }));

const credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
const token = await getAccessToken(credentials);
const dateRanges = [
  { startDate: "yesterday", endDate: "yesterday", name: "yesterday" },
  { startDate: "2daysAgo", endDate: "2daysAgo", name: "previousDay" },
  { startDate: "8daysAgo", endDate: "8daysAgo", name: "sameWeekdayLastWeek" },
];

const [summary, channels, landingPages, keyEvents] = await Promise.all([
  runReport(token, {
    dateRanges,
    metrics: ["activeUsers", "sessions", "screenPageViews", "engagementRate", "keyEvents"].map(
      (name) => ({ name }),
    ),
  }),
  runReport(token, {
    dateRanges: [dateRanges[0]],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }, { name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  }),
  runReport(token, {
    dateRanges: [dateRanges[0]],
    dimensions: [{ name: "landingPagePlusQueryString" }],
    metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "keyEvents" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  }),
  runReport(token, {
    dateRanges: [dateRanges[0]],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "keyEvents" }],
    orderBys: [{ metric: { metricName: "keyEvents" }, desc: true }],
    limit: 20,
  }),
]);

console.log(
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      propertyId,
      summary: rows(summary),
      channels: rows(channels),
      landingPages: rows(landingPages),
      keyEvents: rows(keyEvents),
    },
    null,
    2,
  ),
);
