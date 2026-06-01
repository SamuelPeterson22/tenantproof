import { access } from "node:fs/promises";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFile = promisify(execFileCallback);

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function check(status, code, message) {
  return { status, code, message };
}

async function run(execImpl, command, args) {
  try {
    const { stdout = "" } = await execImpl(command, args);
    return { ok: true, stdout: stdout.trim() };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function doctorProject(projectDirectory, options = {}) {
  const root = path.resolve(projectDirectory);
  const execImpl = options.execImpl ?? execFile;
  const env = options.env ?? process.env;
  const cwd = options.cwd ?? process.cwd();
  const nodeVersion = options.nodeVersion ?? process.versions.node;
  const checks = [];

  const nodeMajor = Number(nodeVersion.split(".")[0]);
  checks.push(
    nodeMajor >= 20
      ? check("pass", "NODE_VERSION", `Node ${nodeVersion}`)
      : check("fail", "NODE_VERSION", `Node ${nodeVersion} is too old. TenantProof requires Node 20 or later.`),
  );

  const docker = await run(execImpl, "docker", ["info", "--format", "{{.ServerVersion}}"]);
  checks.push(
    docker.ok
      ? check("pass", "DOCKER_DAEMON", `Docker daemon ${docker.stdout}`)
      : check("fail", "DOCKER_DAEMON", "Docker daemon is unavailable. Start Docker Desktop before a local runtime audit."),
  );

  const cliCandidates = [
    env.TENANTPROOF_SUPABASE_CLI,
    path.join(cwd, ".tools", "supabase-cli"),
    "supabase",
  ].filter(Boolean);
  let supabase = null;
  for (const candidate of cliCandidates) {
    const result = await run(execImpl, candidate, ["--version"]);
    if (result.ok) {
      supabase = { candidate, version: result.stdout };
      break;
    }
  }
  checks.push(
    supabase
      ? check("pass", "SUPABASE_CLI", `Supabase CLI ${supabase.version} at ${supabase.candidate}`)
      : check("fail", "SUPABASE_CLI", "Supabase CLI is unavailable. Install it or set TENANTPROOF_SUPABASE_CLI."),
  );

  checks.push(
    (await exists(path.join(root, "supabase", "migrations")))
      ? check("pass", "MIGRATIONS", "Found supabase/migrations.")
      : check("warning", "MIGRATIONS", "No supabase/migrations directory found. Static and runtime audits need exported migrations."),
  );
  checks.push(
    (await exists(path.join(root, "tenantproof.json")))
      ? check("pass", "CONTRACT", "Found tenantproof.json.")
      : check("warning", "CONTRACT", "No tenantproof.json found. Run `tenantproof generate`."),
  );
  checks.push(
    (await exists(path.join(root, "tenantproof", "runtime.json")))
      ? check("pass", "RUNTIME_CONFIG", "Found tenantproof/runtime.json.")
      : check("warning", "RUNTIME_CONFIG", "No tenantproof/runtime.json found. Copy and edit tenantproof/runtime.example.json before execution."),
  );

  return {
    ok: !checks.some(({ status }) => status === "fail"),
    checks,
  };
}
