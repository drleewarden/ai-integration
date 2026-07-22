/**
 * Upload member download assets to the private `member-files` bucket.
 *
 * Sources live in content/members/files/<slug>/ (one folder per download
 * item). Each folder is zipped to <slug>-v1.zip and uploaded to
 * <slug>/<slug>-v1.zip — matching the storagePath convention in the
 * registry (lib/members/items.ts).
 *
 * Usage:
 *   node scripts/upload-member-files.mjs           # upload every folder
 *   node scripts/upload-member-files.mjs <slug>    # upload one folder
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * .env.local. The service-role key never leaves this process and is
 * never printed; run locally only, never in CI logs with echo enabled.
 */

import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const FILES_DIR = path.join(ROOT, "content", "members", "files");
const BUCKET = "member-files";
const VERSION = "v1";

// Minimal .env.local parser — only the two keys we need, no logging of values.
function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
    }
  } catch {
    /* .env.local optional if vars already exported */
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const only = process.argv[2];
const slugs = readdirSync(FILES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && (!only || d.name === only))
  .map((d) => d.name);

if (slugs.length === 0) {
  console.error(only ? `No folder ${only} in ${FILES_DIR}` : `Nothing in ${FILES_DIR}`);
  process.exit(1);
}

const tmp = mkdtempSync(path.join(tmpdir(), "member-files-"));
let failed = false;

for (const slug of slugs) {
  const zipName = `${slug}-${VERSION}.zip`;
  const zipPath = path.join(tmp, zipName);
  // -j flattens paths so the zip contains just the files, no folder nesting
  execFileSync("zip", ["-j", "-q", zipPath, ...readdirSync(path.join(FILES_DIR, slug)).map((f) => path.join(FILES_DIR, slug, f))]);

  const storagePath = `${slug}/${zipName}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, readFileSync(zipPath), {
      contentType: "application/zip",
      upsert: true,
    });

  if (error) {
    console.error(`✗ ${storagePath}: ${error.message}`);
    failed = true;
  } else {
    console.log(`✓ ${storagePath}`);
  }
}

rmSync(tmp, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
