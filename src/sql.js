const EXPOSED_SCHEMAS = new Set(["public", "storage"]);

export function stripSqlComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "");
}

export function normalizeTableName(value, fallbackSchema = "public") {
  const cleaned = value.replaceAll('"', "").trim();
  return cleaned.includes(".") ? cleaned : `${fallbackSchema}.${cleaned}`;
}

function extractClause(statement, keyword, nextKeywords) {
  const upper = statement.toUpperCase();
  const start = upper.indexOf(keyword);
  if (start === -1) return null;

  const open = statement.indexOf("(", start + keyword.length);
  if (open === -1) return null;

  let depth = 0;
  let quote = null;
  for (let index = open; index < statement.length; index += 1) {
    const char = statement[index];
    if (quote) {
      if (char === quote && statement[index - 1] !== "\\") quote = null;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (char === "(") depth += 1;
    if (char === ")") {
      depth -= 1;
      if (depth === 0) return statement.slice(open + 1, index).trim();
    }
  }

  const tail = statement.slice(open + 1);
  const stop = nextKeywords
    .map((candidate) => tail.toUpperCase().indexOf(candidate))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  return (stop === undefined ? tail : tail.slice(0, stop)).trim();
}

function splitStatements(sql) {
  return stripSqlComments(sql)
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function parseColumns(body) {
  return body
    .split(",")
    .map((part) => part.trim().match(/^"?([a-zA-Z_][\w]*)"?\s+/)?.[1])
    .filter(Boolean);
}

export function parseMigration(sql) {
  const tables = new Map();
  const rlsEnabled = new Set();
  const policies = [];
  const grants = [];
  const securityDefiners = [];

  for (const statement of splitStatements(sql)) {
    const createTable = statement.match(
      /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+([^\s(]+)\s*\(([\s\S]*)\)$/i,
    );
    if (createTable) {
      const table = normalizeTableName(createTable[1]);
      tables.set(table, {
        name: table,
        schema: table.split(".")[0],
        columns: parseColumns(createTable[2]),
      });
      continue;
    }

    const enableRls = statement.match(
      /ALTER\s+TABLE(?:\s+ONLY)?\s+([^\s]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i,
    );
    if (enableRls) {
      rlsEnabled.add(normalizeTableName(enableRls[1]));
      continue;
    }

    const policy = statement.match(
      /CREATE\s+POLICY\s+("?[^"]+"?|\S+)\s+ON\s+([^\s]+)([\s\S]*)$/i,
    );
    if (policy) {
      const rest = policy[3];
      policies.push({
        name: policy[1].replaceAll('"', ""),
        table: normalizeTableName(policy[2]),
        operation: rest.match(/\bFOR\s+(ALL|SELECT|INSERT|UPDATE|DELETE)\b/i)?.[1]?.toUpperCase() ?? "ALL",
        roles: rest.match(/\bTO\s+([a-zA-Z0-9_,\s"]+?)(?=\s+(?:USING|WITH\s+CHECK)\b|$)/i)?.[1]
          ?.split(",")
          .map((role) => role.trim().replaceAll('"', ""))
          .filter(Boolean) ?? ["public"],
        using: extractClause(rest, "USING", ["WITH CHECK"]),
        withCheck: extractClause(rest, "WITH CHECK", []),
      });
      continue;
    }

    const grant = statement.match(
      /GRANT\s+(.+?)\s+ON\s+(?:TABLE\s+)?([^\s]+)\s+TO\s+(.+)$/i,
    );
    if (grant) {
      grants.push({
        privileges: grant[1].split(",").map((value) => value.trim().toUpperCase()),
        table: normalizeTableName(grant[2]),
        roles: grant[3].split(",").map((value) => value.trim().replaceAll('"', "")),
      });
      continue;
    }

    if (/CREATE(?:\s+OR\s+REPLACE)?\s+FUNCTION/i.test(statement) && /\bSECURITY\s+DEFINER\b/i.test(statement)) {
      securityDefiners.push(
        statement.match(/FUNCTION\s+([^\s(]+)/i)?.[1]?.replaceAll('"', "") ?? "unknown",
      );
    }
  }

  return { tables, rlsEnabled, policies, grants, securityDefiners };
}

export function mergeModels(models) {
  const merged = {
    tables: new Map(),
    rlsEnabled: new Set(),
    policies: [],
    grants: [],
    securityDefiners: [],
  };
  for (const model of models) {
    for (const [name, table] of model.tables) merged.tables.set(name, table);
    for (const name of model.rlsEnabled) merged.rlsEnabled.add(name);
    merged.policies.push(...model.policies);
    merged.grants.push(...model.grants);
    merged.securityDefiners.push(...model.securityDefiners);
  }
  return merged;
}

export function isExposedTable(table) {
  return EXPOSED_SCHEMAS.has(table.schema);
}
