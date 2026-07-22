import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv() {
  const text = fs.readFileSync(".env", "utf8");

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ||= value;
  }
}

function assertEnv(name, options = {}) {
  const value = process.env[name];
  if (!value) {
    return { name, ok: false, message: "missing" };
  }

  if (options.includes && !value.includes(options.includes)) {
    return {
      name,
      ok: false,
      message: `set, but does not include "${options.includes}"`,
    };
  }

  return { name, ok: true, message: "set" };
}

function printCheck(label, ok, detail = "") {
  const status = ok ? "OK" : "FAIL";
  console.log(`${status} ${label}${detail ? ` - ${detail}` : ""}`);
}

loadDotEnv();

const envChecks = [
  assertEnv("DATABASE_URL", { includes: "supabase.com" }),
  assertEnv("DIRECT_URL", { includes: "supabase.co" }),
  assertEnv("NEXT_PUBLIC_SUPABASE_URL", { includes: "supabase.co" }),
  assertEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  assertEnv("SUPABASE_SERVICE_ROLE_KEY"),
  assertEnv("NEXTAUTH_SECRET"),
  assertEnv("NEXTAUTH_URL"),
];

console.log("Environment");
for (const check of envChecks) {
  printCheck(check.name, check.ok, check.message);
}

const missingEnv = envChecks.filter((check) => !check.ok);
if (missingEnv.length > 0) {
  process.exitCode = 1;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.log("\nSkipping Supabase API checks because URL or service role key is missing.");
  process.exit();
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

console.log("\nStorage Buckets");

const expectedBuckets = [
  {
    name: "PropertyImages",
    public: true,
    note: "Used by property listing create/edit/delete routes.",
  },
  {
    name: "Avatar",
    public: true,
    note: "Used by sign-up and profile edit avatar upload routes.",
  },
];

const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

if (bucketError) {
  printCheck("List buckets", false, bucketError.message);
  process.exit(1);
}

printCheck("List buckets", true, `${buckets.length} bucket(s) found`);

for (const expected of expectedBuckets) {
  const bucket = buckets.find((item) => item.name === expected.name || item.id === expected.name);
  if (!bucket) {
    printCheck(expected.name, false, "bucket is missing");
    process.exitCode = 1;
    continue;
  }

  const publicMatches = bucket.public === expected.public;
  printCheck(
    expected.name,
    publicMatches,
    `public=${bucket.public}; expected public=${expected.public}; ${expected.note}`,
  );
}

console.log("\nStorage Access Smoke Tests");

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

for (const expected of expectedBuckets) {
  const path = `.setup-check/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  const upload = await supabase.storage
    .from(expected.name)
    .upload(path, onePixelPng, {
      contentType: "image/png",
      upsert: false,
    });

  if (upload.error) {
    printCheck(`${expected.name} upload`, false, upload.error.message);
    process.exitCode = 1;
    continue;
  }

  printCheck(`${expected.name} upload`, true);

  const { data: publicUrlData } = supabase.storage.from(expected.name).getPublicUrl(path);
  const response = await fetch(publicUrlData.publicUrl);
  printCheck(`${expected.name} public read`, response.ok, `HTTP ${response.status}`);

  const remove = await supabase.storage.from(expected.name).remove([path]);
  printCheck(
    `${expected.name} cleanup delete`,
    !remove.error,
    remove.error ? remove.error.message : "removed test file",
  );
}
