import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function escapeCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`),
  ].join("\n");
}

function staticReport(report) {
  const { summary } = report;
  const lines = [
    "# TenantProof Static Audit",
    "",
    `**Result:** ${report.ok ? "PASS" : "FAIL"}`,
    "",
    `Checked ${report.migrationFiles.length} migration(s), ${summary.tables} table(s), and ${summary.policies} policy definition(s).`,
    "",
    `Summary: ${summary.critical} critical, ${summary.high} high, ${summary.warning} warning.`,
  ];
  if (report.findings.length > 0) {
    lines.push(
      "",
      "## Findings",
      "",
      table(
        ["Severity", "Code", "Message"],
        report.findings.map(({ severity, code, message }) => [severity.toUpperCase(), code, message]),
      ),
    );
  }
  return `${lines.join("\n")}\n`;
}

function runtimeReport(report) {
  const { summary } = report;
  return `# TenantProof Runtime Audit

**Result:** ${report.ok ? "PASS" : "FAIL"}

Summary: ${summary.passed} passed, ${summary.failed} failed, ${summary.error} errors, ${summary.skipped} skipped.

## Authorization Matrix

${table(
  ["Status", "Resource", "Actor", "Operation", "Expected", "Observed", "HTTP"],
  report.results.map(({ status, resource, actor, operation, expected, observed, httpStatus }) => [
    status.toUpperCase(),
    resource,
    actor,
    operation,
    expected,
    observed ?? "",
    httpStatus ?? "",
  ]),
)}
`;
}

export async function writeReport(projectDirectory, requestedFile, kind, report) {
  const file = path.resolve(projectDirectory, requestedFile);
  await mkdir(path.dirname(file), { recursive: true });
  const content = kind === "static" ? staticReport(report) : runtimeReport(report);
  await writeFile(file, content);
  return file;
}
