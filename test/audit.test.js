import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { auditProject } from "../src/audit.js";
import { generateContract } from "../src/contract.js";
import { buildPlan, writePlan } from "../src/plan.js";
import { executePlan } from "../src/runtime.js";
import { writeRuntimeExample } from "../src/runtime.js";
import { parseMigration } from "../src/sql.js";

const fixture = (name) => path.resolve("test", "fixtures", name);

test("parseMigration recognizes RLS policies with nested expressions", () => {
  const model = parseMigration(`
    create table public.notes (id uuid, user_id uuid);
    alter table public.notes enable row level security;
    create policy "owner read" on public.notes for select to authenticated
      using ((select auth.uid()) = user_id);
  `);
  assert.equal(model.tables.size, 1);
  assert.ok(model.rlsEnabled.has("public.notes"));
  assert.equal(model.policies[0].using, "(select auth.uid()) = user_id");
});

test("audit flags missing RLS, permissive policy, risky grant, and client secret", async () => {
  const report = await auditProject(fixture("insecure"));
  assert.equal(report.ok, false);
  assert.deepEqual(
    new Set(report.findings.map(({ code }) => code)),
    new Set([
      "EXPOSED_TABLE_WITHOUT_RLS",
      "PERMISSIVE_POLICY",
      "WRITE_GRANT_WITHOUT_RLS",
      "CLIENT_SERVICE_ROLE_SECRET",
    ]),
  );
});

test("audit passes a secure owner-scoped migration", async () => {
  const report = await auditProject(fixture("secure"));
  assert.equal(report.ok, true);
  assert.deepEqual(report.findings, []);
});

test("generateContract infers owner and tenant columns", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "tenantproof-"));
  await mkdir(path.join(root, "supabase", "migrations"), { recursive: true });
  await writeFile(
    path.join(root, "supabase", "migrations", "001.sql"),
    "create table public.documents (id uuid, workspace_id uuid, owner_id uuid);",
  );
  const { file, contract } = await generateContract(root);
  assert.equal(contract.resources["public.documents"].ownerColumn, "owner_id");
  assert.equal(contract.resources["public.documents"].tenantColumn, "workspace_id");
  assert.deepEqual(JSON.parse(await readFile(file, "utf8")), contract);
});

test("generateContract refuses to overwrite a reviewed contract by default", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "tenantproof-"));
  await mkdir(path.join(root, "supabase", "migrations"), { recursive: true });
  await writeFile(path.join(root, "supabase", "migrations", "001.sql"), "create table public.notes (id uuid);");
  await generateContract(root);
  await assert.rejects(() => generateContract(root), /already exists/);
});

test("buildPlan produces allow and deny cases from reviewed intent", () => {
  const plan = buildPlan({
    version: 1,
    resources: {
      "public.invoices": {
        access: {
          anonymous: "deny",
          owner: "read_write",
          sameTenant: "read",
          otherTenant: "deny",
        },
      },
    },
  });
  assert.equal(plan.unresolved.length, 0);
  assert.equal(plan.cases.length, 16);
  assert.deepEqual(
    plan.cases.find(({ actor, operation }) => actor === "sameTenant" && operation === "select"),
    { resource: "public.invoices", actor: "sameTenant", operation: "select", expected: "allow" },
  );
});

test("writePlan blocks unresolved inferred access intent", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "tenantproof-"));
  await writeFile(
    path.join(root, "tenantproof.json"),
    JSON.stringify({
      version: 1,
      resources: {
        "public.invoices": {
          access: {
            anonymous: "deny",
            owner: "read_write",
            sameTenant: "review",
            otherTenant: "deny",
          },
        },
      },
    }),
  );
  await assert.rejects(() => writePlan(root), /Resolve access intent/);
});

test("executePlan classifies silent RLS denials and visible rows", async () => {
  const plan = {
    cases: [
      { resource: "public.invoices", actor: "owner", operation: "select", expected: "allow" },
      { resource: "public.invoices", actor: "otherTenant", operation: "select", expected: "deny" },
    ],
  };
  const runtime = {
    supabaseUrl: "http://127.0.0.1:54321",
    anonKeyEnv: "SUPABASE_ANON_KEY",
    actors: {
      owner: { tokenEnv: "OWNER_TOKEN" },
      otherTenant: { tokenEnv: "OTHER_TOKEN" },
    },
    resources: {
      "public.invoices": { table: "invoices", idColumn: "id", targetId: "invoice-1" },
    },
  };
  const fetchImpl = async (_url, options) => {
    const visible = options.headers.Authorization === "Bearer owner-token";
    return new Response(JSON.stringify(visible ? [{ id: "invoice-1" }] : []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const report = await executePlan(plan, runtime, {
    env: { SUPABASE_ANON_KEY: "anon", OWNER_TOKEN: "owner-token", OTHER_TOKEN: "other-token" },
    fetchImpl,
  });
  assert.equal(report.ok, true);
  assert.deepEqual(report.summary, { passed: 2, failed: 0, error: 0, skipped: 0 });
});

test("executePlan refuses remote mutation targets by default", async () => {
  await assert.rejects(
    () => executePlan({ cases: [] }, { supabaseUrl: "https://example.supabase.co", anonKeyEnv: "ANON" }),
    /Refusing to execute mutation checks/,
  );
});

test("executePlan never treats infrastructure failures as authorization denials", async () => {
  const report = await executePlan(
    {
      cases: [{ resource: "public.invoices", actor: "anonymous", operation: "select", expected: "deny" }],
    },
    {
      supabaseUrl: "http://127.0.0.1:54321",
      anonKeyEnv: "SUPABASE_ANON_KEY",
      resources: {
        "public.invoices": { table: "invoices", idColumn: "id", targetId: "invoice-1" },
      },
    },
    {
      env: { SUPABASE_ANON_KEY: "anon" },
      fetchImpl: async () => new Response("unavailable", { status: 503 }),
    },
  );
  assert.equal(report.ok, false);
  assert.deepEqual(report.summary, { passed: 0, failed: 0, error: 1, skipped: 0 });
});

test("writeRuntimeExample creates fixtures without embedding tokens", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "tenantproof-"));
  const file = await writeRuntimeExample(root, {
    resources: { "public.invoices": {} },
  });
  const runtime = JSON.parse(await readFile(file, "utf8"));
  assert.equal(runtime.resources["public.invoices"].table, "invoices");
  assert.equal(runtime.actors.owner.tokenEnv, "TENANTPROOF_OWNER_TOKEN");
  assert.equal(JSON.stringify(runtime).includes("owner-token"), false);
});
