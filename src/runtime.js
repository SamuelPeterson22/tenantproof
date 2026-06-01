import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function requireValue(value, message) {
  if (!value) throw new Error(message);
  return value;
}

function actorToken(runtime, actor, env) {
  const tokenEnv = runtime.actors?.[actor]?.tokenEnv;
  return tokenEnv ? requireValue(env[tokenEnv], `Missing environment variable for ${actor}: ${tokenEnv}`) : null;
}

function isLocalUrl(value) {
  const { hostname } = new URL(value);
  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
}

function endpoint(runtime, fixture) {
  return `${runtime.supabaseUrl.replace(/\/$/, "")}/rest/v1/${fixture.table}`;
}

async function requestFor(testCase, runtime, fixture, env, fetchImpl) {
  const url = new URL(endpoint(runtime, fixture));
  const headers = {
    apikey: requireValue(env[runtime.anonKeyEnv], `Missing environment variable: ${runtime.anonKeyEnv}`),
    Prefer: "return=representation",
  };
  const token = actorToken(runtime, testCase.actor, env);
  if (token) headers.Authorization = `Bearer ${token}`;

  const options = { method: "GET", headers };
  if (testCase.operation === "select") {
    url.searchParams.set("select", "*");
    url.searchParams.set(fixture.idColumn, `eq.${fixture.targetId}`);
  } else if (testCase.operation === "insert") {
    options.method = "POST";
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(requireValue(fixture.insertPayload, `${testCase.resource} requires insertPayload`));
  } else if (testCase.operation === "update") {
    options.method = "PATCH";
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(requireValue(fixture.updatePayload, `${testCase.resource} requires updatePayload`));
    url.searchParams.set(fixture.idColumn, `eq.${fixture.targetId}`);
  } else if (testCase.operation === "delete") {
    options.method = "DELETE";
    url.searchParams.set(fixture.idColumn, `eq.${fixture.targetId}`);
  }
  const response = await fetchImpl(url, options);
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, ok: response.ok, body };
}

function observedAccess(operation, response) {
  if (!response.ok) {
    if ([401, 403].includes(response.status)) return "deny";
    return "error";
  }
  if (operation === "insert") return "allow";
  return Array.isArray(response.body) && response.body.length > 0 ? "allow" : "deny";
}

export async function executePlan(plan, runtime, options = {}) {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  if (!runtime.supabaseUrl) throw new Error("runtime.json must define supabaseUrl.");
  if (!runtime.anonKeyEnv) throw new Error("runtime.json must define anonKeyEnv.");
  if (!runtime.allowRemote && !isLocalUrl(runtime.supabaseUrl)) {
    throw new Error("Refusing to execute mutation checks against a remote Supabase URL. Set allowRemote to true only for a disposable test project.");
  }

  const operationOrder = { select: 0, update: 1, insert: 2, delete: 3 };
  const cases = [...plan.cases].sort((left, right) => {
    const byOperation = operationOrder[left.operation] - operationOrder[right.operation];
    if (byOperation !== 0) return byOperation;
    if (left.operation === "delete") return left.expected === "allow" ? 1 : -1;
    return 0;
  });
  const results = [];
  for (const testCase of cases) {
    const fixture = runtime.resources?.[testCase.resource];
    if (!fixture) throw new Error(`runtime.json has no fixture for ${testCase.resource}.`);
    if (!fixture.table || !fixture.idColumn || !fixture.targetId) {
      throw new Error(`${testCase.resource} fixture must define table, idColumn, and targetId.`);
    }
    if (testCase.operation === "delete" && !runtime.allowDelete) {
      results.push({ ...testCase, status: "skipped", reason: "Set allowDelete to true for disposable fixtures." });
      continue;
    }
    const response = await requestFor(testCase, runtime, fixture, env, fetchImpl);
    const observed = observedAccess(testCase.operation, response);
    results.push({
      ...testCase,
      status: observed === "error" ? "error" : observed === testCase.expected ? "passed" : "failed",
      observed,
      httpStatus: response.status,
    });
  }

  return {
    ok: !results.some(({ status }) => status === "failed" || status === "error"),
    summary: {
      passed: results.filter(({ status }) => status === "passed").length,
      failed: results.filter(({ status }) => status === "failed").length,
      error: results.filter(({ status }) => status === "error").length,
      skipped: results.filter(({ status }) => status === "skipped").length,
    },
    results,
  };
}

export async function executeProject(projectDirectory, options = {}) {
  const root = path.resolve(projectDirectory);
  const plan = JSON.parse(await readFile(path.join(root, "tenantproof", "adversarial-plan.json"), "utf8"));
  const runtime = JSON.parse(await readFile(path.join(root, options.runtimeFile ?? "tenantproof/runtime.json"), "utf8"));
  return executePlan(plan, runtime, options);
}

export async function writeRuntimeExample(projectDirectory, contract) {
  const root = path.resolve(projectDirectory);
  const resources = {};
  for (const resource of Object.keys(contract.resources)) {
    resources[resource] = {
      table: resource.split(".").at(-1),
      idColumn: "id",
      targetId: "replace-with-disposable-fixture-id",
      insertPayload: {},
      updatePayload: {},
    };
  }
  const runtime = {
    supabaseUrl: "http://127.0.0.1:54321",
    anonKeyEnv: "SUPABASE_ANON_KEY",
    actors: {
      owner: { tokenEnv: "TENANTPROOF_OWNER_TOKEN" },
      sameTenant: { tokenEnv: "TENANTPROOF_SAME_TENANT_TOKEN" },
      otherTenant: { tokenEnv: "TENANTPROOF_OTHER_TENANT_TOKEN" },
    },
    resources,
  };
  const directory = path.join(root, "tenantproof");
  const file = path.join(directory, "runtime.example.json");
  await mkdir(directory, { recursive: true });
  await writeFile(file, `${JSON.stringify(runtime, null, 2)}\n`);
  return file;
}
