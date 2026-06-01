import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { auditProject } from "./audit.js";
import { generateContract } from "./contract.js";
import { writePlan } from "./plan.js";
import { executeProject, writeRuntimeExample } from "./runtime.js";
import { writeReport } from "./report.js";
import { doctorProject } from "./doctor.js";

const HELP = `TenantProof: authorization regression checks for Supabase applications

Usage:
  tenantproof init [--project <path>]
  tenantproof doctor [--project <path>]
  tenantproof generate [--project <path>] [--force]
  tenantproof plan [--project <path>]
  tenantproof execute [--project <path>] [--json] [--report <file>]
  tenantproof verify [--project <path>] [--json] [--report <file>]

Commands:
  init      Add a starter contract and GitHub Actions workflow
  doctor    Check local runtime audit prerequisites
  generate  Infer an editable authorization contract from Supabase migrations
  plan      Compile a reviewed contract into adversarial runtime test cases
  execute   Run the adversarial plan against a disposable Supabase stack
  verify    Audit migrations and client files for authorization risks
`;

function parseArgs(args) {
  const command = args[0] ?? "help";
  const options = { project: process.cwd(), json: false, force: false, report: null };
  for (let index = 1; index < args.length; index += 1) {
    if (args[index] === "--json") options.json = true;
    else if (args[index] === "--force") options.force = true;
    else if (args[index] === "--report") options.report = args[++index];
    else if (args[index] === "--project") options.project = args[++index];
    else throw new Error(`Unknown option: ${args[index]}`);
  }
  return { command, options };
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function init(projectDirectory) {
  const root = path.resolve(projectDirectory);
  const contractFile = path.join(root, "tenantproof.json");
  let contract;
  if (!(await exists(contractFile))) ({ contract } = await generateContract(root));
  else contract = JSON.parse(await readFile(contractFile, "utf8"));
  await writeRuntimeExample(root, contract);

  const workflowDirectory = path.join(root, ".github", "workflows");
  const workflowFile = path.join(workflowDirectory, "tenantproof.yml");
  if (!(await exists(workflowFile))) {
    await mkdir(workflowDirectory, { recursive: true });
    await writeFile(
      workflowFile,
      `name: TenantProof
on:
  pull_request:
    paths:
      - "supabase/migrations/**"
      - "src/**"
      - "app/**"
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx tenantproof verify
`,
    );
  }
  console.log(`Ready: ${path.relative(root, contractFile)}, tenantproof/runtime.example.json, and ${path.relative(root, workflowFile)}.`);
}

function printReport(report) {
  const { summary } = report;
  console.log(`TenantProof checked ${report.migrationFiles.length} migration(s), ${summary.tables} table(s), and ${summary.policies} policy definition(s).`);
  if (report.findings.length === 0) {
    console.log("PASS No authorization risks detected by the static audit.");
    return;
  }
  for (const item of report.findings) {
    console.log(`${item.severity.toUpperCase().padEnd(8)} ${item.code}: ${item.message}`);
  }
  console.log(`Result: ${summary.critical} critical, ${summary.high} high, ${summary.warning} warning.`);
}

function printExecution(report) {
  for (const result of report.results) {
    const suffix = result.status === "skipped" ? result.reason : `expected ${result.expected}, observed ${result.observed}`;
    console.log(`${result.status.toUpperCase().padEnd(8)} ${result.resource} ${result.actor}.${result.operation}: ${suffix}`);
  }
  console.log(`Result: ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.error} errors, ${report.summary.skipped} skipped.`);
}

function printDoctor(report) {
  for (const item of report.checks) {
    console.log(`${item.status.toUpperCase().padEnd(8)} ${item.code}: ${item.message}`);
  }
}

export async function run(args) {
  const { command, options } = parseArgs(args);
  if (["help", "--help", "-h"].includes(command)) {
    console.log(HELP);
    return;
  }
  if (command === "init") {
    await init(options.project);
    return;
  }
  if (command === "doctor") {
    const report = await doctorProject(options.project);
    printDoctor(report);
    if (!report.ok) process.exitCode = 1;
    return;
  }
  if (command === "generate") {
    const { file, contract } = await generateContract(options.project, { overwrite: options.force });
    console.log(`Generated ${file} with ${Object.keys(contract.resources).length} resource(s). Review every "review" value before treating it as an executable contract.`);
    return;
  }
  if (command === "plan") {
    const { file, plan } = await writePlan(options.project);
    console.log(`Generated ${file} with ${plan.cases.length} adversarial authorization case(s).`);
    return;
  }
  if (command === "execute") {
    const report = await executeProject(options.project);
    if (options.json) console.log(JSON.stringify(report, null, 2));
    else printExecution(report);
    if (options.report) console.log(`Wrote ${await writeReport(options.project, options.report, "runtime", report)}.`);
    if (!report.ok) process.exitCode = 1;
    return;
  }
  if (command === "verify") {
    const report = await auditProject(options.project);
    if (options.json) console.log(JSON.stringify(report, null, 2));
    else printReport(report);
    if (options.report) console.log(`Wrote ${await writeReport(options.project, options.report, "static", report)}.`);
    if (!report.ok) process.exitCode = 1;
    return;
  }
  throw new Error(`Unknown command: ${command}\n\n${HELP}`);
}
