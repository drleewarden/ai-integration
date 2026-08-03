import { createHash, createSign } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const accountId = process.env.GTM_ACCOUNT_ID || "6322279911";
const containerId = process.env.GTM_CONTAINER_ID || "234280785";
const credentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(process.cwd(), ".secrets/google-analytics-service-account.json");
const snapshotPath = path.join(process.cwd(), ".secrets/gtm-last-snapshot.json");

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
      scope: "https://www.googleapis.com/auth/tagmanager.readonly",
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

async function gtmGet(token, resource) {
  const response = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${resource}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`GTM request failed (${response.status}): ${await response.text()}`);
  return response.json();
}

const credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
const token = await getAccessToken(credentials);
const containerPath = `accounts/${accountId}/containers/${containerId}`;
const workspaceResponse = await gtmGet(token, `${containerPath}/workspaces`);
const workspaces = workspaceResponse.workspace || [];
const workspace = workspaces.find((item) => item.name === "Default Workspace") || workspaces[0];
if (!workspace) throw new Error("No GTM workspace was available to audit.");

const workspacePath = workspace.path;
const [container, tagsResponse, triggersResponse, variablesResponse, builtInsResponse] = await Promise.all([
  gtmGet(token, containerPath),
  gtmGet(token, `${workspacePath}/tags`),
  gtmGet(token, `${workspacePath}/triggers`),
  gtmGet(token, `${workspacePath}/variables`),
  gtmGet(token, `${workspacePath}/built_in_variables`),
]);

const tags = tagsResponse.tag || [];
const triggers = triggersResponse.trigger || [];
const variables = variablesResponse.variable || [];
const builtInVariables = builtInsResponse.builtInVariable || [];
const configuration = {
  container: {
    name: container.name,
    publicId: container.publicId,
    domainName: container.domainName || [],
    fingerprint: container.fingerprint,
  },
  workspace: { name: workspace.name, workspaceId: workspace.workspaceId, fingerprint: workspace.fingerprint },
  tags: tags.map((tag) => ({
    id: tag.tagId,
    name: tag.name,
    type: tag.type,
    firingTriggerIds: tag.firingTriggerId || [],
    blockingTriggerIds: tag.blockingTriggerId || [],
    consentStatus: tag.consentSettings?.consentStatus || "notSet",
    fingerprint: tag.fingerprint,
  })),
  triggers: triggers.map((trigger) => ({
    id: trigger.triggerId,
    name: trigger.name,
    type: trigger.type,
    fingerprint: trigger.fingerprint,
  })),
  variables: variables.map((variable) => ({
    id: variable.variableId,
    name: variable.name,
    type: variable.type,
    fingerprint: variable.fingerprint,
  })),
  builtInVariables: builtInVariables.map((variable) => variable.type),
};
const fingerprint = createHash("sha256").update(JSON.stringify(configuration)).digest("hex");

let previous = null;
try {
  previous = JSON.parse(await readFile(snapshotPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const report = {
  generatedAt: new Date().toISOString(),
  accountId,
  containerId,
  container: configuration.container,
  workspace: configuration.workspace,
  counts: {
    tags: tags.length,
    triggers: triggers.length,
    variables: variables.length,
    builtInVariables: builtInVariables.length,
  },
  configurationChanged: previous ? previous.fingerprint !== fingerprint : null,
  issues: {
    tagsWithoutFiringTriggers: configuration.tags.filter((tag) => tag.firingTriggerIds.length === 0).map((tag) => tag.name),
    tagsWithoutExplicitConsent: configuration.tags.filter((tag) => tag.consentStatus === "notSet").map((tag) => tag.name),
  },
  tags: configuration.tags,
  triggers: configuration.triggers,
  variables: configuration.variables,
};

await writeFile(snapshotPath, JSON.stringify({ fingerprint, generatedAt: report.generatedAt }, null, 2), {
  mode: 0o600,
});
console.log(JSON.stringify(report, null, 2));
