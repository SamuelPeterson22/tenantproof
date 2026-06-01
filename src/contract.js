import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadProject } from "./audit.js";
import { isExposedTable } from "./sql.js";

function detectColumn(columns, candidates) {
  return candidates.find((candidate) => columns.includes(candidate)) ?? null;
}

function resourceFromTable(table) {
  const ownerColumn = detectColumn(table.columns, ["user_id", "owner_id", "created_by"]);
  const tenantColumn = detectColumn(table.columns, ["tenant_id", "organization_id", "org_id", "workspace_id", "team_id"]);
  return {
    ownerColumn,
    tenantColumn,
    access: {
      anonymous: "deny",
      owner: ownerColumn ? "read_write" : "review",
      sameTenant: tenantColumn ? "review" : "not_applicable",
      otherTenant: tenantColumn ? "deny" : "not_applicable",
    },
  };
}

export async function generateContract(projectDirectory, options = {}) {
  const { root, model } = await loadProject(projectDirectory, options.migrationsDirectory);
  const resources = {};
  for (const table of model.tables.values()) {
    if (isExposedTable(table)) resources[table.name] = resourceFromTable(table);
  }
  const contract = {
    $schema: "https://tenantproof.dev/schema/v1.json",
    version: 1,
    migrationsDirectory: options.migrationsDirectory ?? "supabase/migrations",
    resources,
  };
  const file = path.join(root, "tenantproof.json");
  try {
    await access(file);
    if (!options.overwrite) throw new Error("tenantproof.json already exists. Use --force to replace the reviewed contract.");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await writeFile(file, `${JSON.stringify(contract, null, 2)}\n`);
  await mkdir(path.join(root, "tenantproof"), { recursive: true });
  return { file, contract };
}

export async function readContract(projectDirectory) {
  const file = path.join(path.resolve(projectDirectory), "tenantproof.json");
  try {
    return { file, contract: JSON.parse(await readFile(file, "utf8")) };
  } catch (error) {
    if (error.code === "ENOENT") throw new Error("tenantproof.json was not found. Run `tenantproof generate` first.");
    if (error instanceof SyntaxError) throw new Error(`tenantproof.json is not valid JSON: ${error.message}`);
    throw error;
  }
}
