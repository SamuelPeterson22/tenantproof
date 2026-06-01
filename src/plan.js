import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { readContract } from "./contract.js";

const ACCESS = new Set(["deny", "read", "write", "read_write", "review", "not_applicable"]);
const ACTORS = ["anonymous", "owner", "sameTenant", "otherTenant"];
const OPERATIONS = ["select", "insert", "update", "delete"];

function permits(access, operation) {
  if (access === "read_write") return true;
  if (access === "read") return operation === "select";
  if (access === "write") return operation !== "select";
  return false;
}

export function buildPlan(contract) {
  if (contract.version !== 1) throw new Error(`Unsupported tenantproof.json version: ${contract.version}`);
  if (!contract.resources || typeof contract.resources !== "object") {
    throw new Error("tenantproof.json must define a resources object.");
  }

  const unresolved = [];
  const cases = [];
  for (const [resource, definition] of Object.entries(contract.resources)) {
    if (!definition.access || typeof definition.access !== "object") {
      throw new Error(`${resource} must define access rules.`);
    }
    for (const actor of ACTORS) {
      const access = definition.access[actor];
      if (!ACCESS.has(access)) throw new Error(`${resource}.${actor} has unsupported access value: ${access}`);
      if (access === "review") {
        unresolved.push(`${resource}.${actor}`);
        continue;
      }
      if (access === "not_applicable") continue;
      for (const operation of OPERATIONS) {
        cases.push({
          resource,
          actor,
          operation,
          expected: permits(access, operation) ? "allow" : "deny",
        });
      }
    }
  }
  return { version: 1, unresolved, cases };
}

export async function writePlan(projectDirectory) {
  const root = path.resolve(projectDirectory);
  const { contract } = await readContract(root);
  const plan = buildPlan(contract);
  if (plan.unresolved.length > 0) {
    throw new Error(`Resolve access intent before generating a plan: ${plan.unresolved.join(", ")}`);
  }
  const directory = path.join(root, "tenantproof");
  const file = path.join(directory, "adversarial-plan.json");
  await mkdir(directory, { recursive: true });
  await writeFile(file, `${JSON.stringify(plan, null, 2)}\n`);
  return { file, plan };
}
