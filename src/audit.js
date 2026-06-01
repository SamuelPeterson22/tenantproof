import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { isExposedTable, mergeModels, parseMigration } from "./sql.js";

const SERVICE_ROLE_PATTERNS = [
  /SUPABASE_SERVICE_ROLE_KEY["']?\s*[:=]/i,
  /service_role["']?\s*[:=]/i,
  /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.?[a-zA-Z0-9_-]*/i,
];
const CLIENT_PATH_PATTERN = /(?:^|\/)(?:src|app|pages|components|public|client|frontend)(?:\/|$)/;

function finding(severity, code, message, context = {}) {
  return { severity, code, message, ...context };
}

function isAlwaysTrue(expression) {
  if (!expression) return false;
  return /^(?:\(?\s*)?(?:true|1\s*=\s*1)(?:\s*\)?)$/i.test(expression.trim());
}

async function walk(directory, relative = "") {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules", ".next", "dist", "coverage"].includes(entry.name)) continue;
    const nextRelative = path.join(relative, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute, nextRelative)));
    else files.push(nextRelative);
  }
  return files;
}

export async function loadProject(projectDirectory, migrationsDirectory = "supabase/migrations") {
  const root = path.resolve(projectDirectory);
  const migrationRoot = path.join(root, migrationsDirectory);
  const migrationFiles = (await walk(migrationRoot)).filter((file) => file.endsWith(".sql")).sort();
  const models = [];
  for (const file of migrationFiles) {
    models.push(parseMigration(await readFile(path.join(migrationRoot, file), "utf8")));
  }
  return { root, migrationFiles, model: mergeModels(models) };
}

async function auditClientSecrets(root) {
  const findings = [];
  const files = await walk(root);
  for (const file of files) {
    if (!CLIENT_PATH_PATTERN.test(file.replaceAll(path.sep, "/"))) continue;
    if (!/\.(?:js|jsx|ts|tsx|vue|svelte|env|json)$/.test(file)) continue;
    const content = await readFile(path.join(root, file), "utf8");
    if (SERVICE_ROLE_PATTERNS.some((pattern) => pattern.test(content))) {
      findings.push(
        finding("critical", "CLIENT_SERVICE_ROLE_SECRET", `Possible Supabase service-role material in client-facing file: ${file}`, {
          file,
        }),
      );
    }
  }
  return findings;
}

export async function auditProject(projectDirectory, options = {}) {
  const { root, migrationFiles, model } = await loadProject(projectDirectory, options.migrationsDirectory);
  const findings = [];

  if (migrationFiles.length === 0) {
    findings.push(finding("warning", "NO_MIGRATIONS", "No Supabase SQL migrations were found."));
  }

  for (const table of model.tables.values()) {
    if (!isExposedTable(table)) continue;
    if (!model.rlsEnabled.has(table.name)) {
      findings.push(
        finding("critical", "EXPOSED_TABLE_WITHOUT_RLS", `${table.name} is exposed but does not enable row-level security.`, {
          table: table.name,
        }),
      );
    }
  }

  for (const policy of model.policies) {
    if (isAlwaysTrue(policy.using) || isAlwaysTrue(policy.withCheck)) {
      findings.push(
        finding("critical", "PERMISSIVE_POLICY", `${policy.table} policy "${policy.name}" allows an unconditional operation.`, {
          table: policy.table,
          policy: policy.name,
        }),
      );
    }
  }

  for (const grant of model.grants) {
    const exposedRole = grant.roles.some((role) => ["anon", "authenticated", "public"].includes(role.toLowerCase()));
    const writePrivilege = grant.privileges.some((privilege) => ["ALL", "INSERT", "UPDATE", "DELETE"].includes(privilege));
    if (exposedRole && writePrivilege && !model.rlsEnabled.has(grant.table)) {
      findings.push(
        finding("high", "WRITE_GRANT_WITHOUT_RLS", `${grant.table} grants write access to ${grant.roles.join(", ")} without RLS.`, {
          table: grant.table,
        }),
      );
    }
  }

  for (const name of model.securityDefiners) {
    findings.push(
      finding("warning", "SECURITY_DEFINER_REVIEW", `${name} uses SECURITY DEFINER and needs an explicit authorization review.`, {
        function: name,
      }),
    );
  }

  findings.push(...(await auditClientSecrets(root)));
  return {
    ok: !findings.some(({ severity }) => severity === "critical" || severity === "high"),
    migrationFiles,
    findings,
    summary: {
      tables: model.tables.size,
      policies: model.policies.length,
      critical: findings.filter(({ severity }) => severity === "critical").length,
      high: findings.filter(({ severity }) => severity === "high").length,
      warning: findings.filter(({ severity }) => severity === "warning").length,
    },
  };
}
