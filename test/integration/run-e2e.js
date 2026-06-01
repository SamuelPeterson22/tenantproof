import { copyFile, readFile } from "node:fs/promises";
import path from "node:path";
import { createHmac } from "node:crypto";
import { executeProject } from "../../src/runtime.js";
import { writePlan } from "../../src/plan.js";

const root = path.resolve("test/integration/app");

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function jwt(secret, subject, tenantId) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    aud: "authenticated",
    role: "authenticated",
    sub: subject,
    app_metadata: { tenant_id: tenantId },
    iat: now,
    exp: now + 3600,
  });
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

const envFile = process.argv[2];
if (!envFile) throw new Error("Usage: node test/integration/run-e2e.js <supabase-status-env-file>");
const status = Object.fromEntries(
  (await readFile(envFile, "utf8"))
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("=", 2).map((value) => value.replace(/^"|"$/g, ""))),
);

await copyFile(
  path.join(root, "tenantproof", "runtime.example.json"),
  path.join(root, "tenantproof", "runtime.json"),
);
await writePlan(root);

const tenantA = "00000000-0000-0000-0000-000000000201";
const tenantB = "00000000-0000-0000-0000-000000000202";
const env = {
  SUPABASE_ANON_KEY: status.ANON_KEY,
  TENANTPROOF_OWNER_TOKEN: jwt(status.JWT_SECRET, "00000000-0000-0000-0000-000000000301", tenantA),
  TENANTPROOF_SAME_TENANT_TOKEN: jwt(status.JWT_SECRET, "00000000-0000-0000-0000-000000000302", tenantA),
  TENANTPROOF_OTHER_TENANT_TOKEN: jwt(status.JWT_SECRET, "00000000-0000-0000-0000-000000000303", tenantB),
};

const report = await executeProject(root, { env });
for (const result of report.results) {
  const details = result.status === "failed"
    ? ` expected=${result.expected} observed=${result.observed} http=${result.httpStatus}`
    : "";
  console.log(`${result.status.toUpperCase().padEnd(8)} ${result.resource} ${result.actor}.${result.operation}${details}`);
}
console.log(`Result: ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.error} errors, ${report.summary.skipped} skipped.`);
if (!report.ok) process.exitCode = 1;
