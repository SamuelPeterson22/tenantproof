# TenantProof

TenantProof is an early-stage authorization regression checker for Supabase applications built quickly with AI coding tools.

It currently performs a zero-dependency static audit of SQL migrations and client-facing source files. It catches:

- Exposed `public` or `storage` tables without row-level security
- Policies with unconditional `USING (true)` or `WITH CHECK (true)` access
- Write grants to exposed roles on tables without RLS
- `SECURITY DEFINER` functions that need manual authorization review
- Possible Supabase service-role material in client-facing files

## Try It

```bash
npm test
node ./bin/tenantproof.js verify --project ./test/fixtures/insecure
node ./bin/tenantproof.js verify --project ./test/fixtures/secure
```

Add TenantProof to an existing Supabase application:

```bash
npx tenantproof init
npx tenantproof generate
npx tenantproof plan
npx tenantproof verify
npx tenantproof execute
```

`generate` writes `tenantproof.json`, an editable authorization contract inferred from the SQL schema. Inferred `review` values are deliberately unresolved: access intent must come from the application owner, not from heuristics. It will not overwrite a reviewed contract unless explicitly called with `--force`.

`plan` compiles the reviewed contract to `tenantproof/adversarial-plan.json`. Each case describes a resource, actor, operation, and expected allow-or-deny outcome. Plan generation stops if any inferred `review` value remains unresolved.

`execute` runs those cases through the Supabase REST API. It reads fixture configuration from `tenantproof/runtime.json` and actor tokens from environment variables. The executor refuses remote URLs unless `allowRemote` is explicitly enabled, and it skips destructive delete checks unless `allowDelete` is enabled.

Minimal runtime configuration:

```json
{
  "supabaseUrl": "http://127.0.0.1:54321",
  "anonKeyEnv": "SUPABASE_ANON_KEY",
  "actors": {
    "owner": { "tokenEnv": "TENANTPROOF_OWNER_TOKEN" },
    "sameTenant": { "tokenEnv": "TENANTPROOF_SAME_TENANT_TOKEN" },
    "otherTenant": { "tokenEnv": "TENANTPROOF_OTHER_TENANT_TOKEN" }
  },
  "resources": {
    "public.invoices": {
      "table": "invoices",
      "idColumn": "id",
      "targetId": "replace-with-disposable-fixture-id",
      "insertPayload": {},
      "updatePayload": {}
    }
  }
}
```

## Current Boundary

The runtime executor expects a disposable local Supabase stack, seeded fixture rows, and actor tokens. Automatic local stack provisioning, user creation, and fixture seeding are the next integration boundary.

## Real Local Integration Fixture

The repository includes a disposable Supabase fixture that exercises owner, same-tenant, other-tenant, and anonymous access through the real local REST API:

```bash
./scripts/install-supabase-cli.sh
./test/integration/run-local.sh
```

The runner expects a running Docker daemon. It starts a trimmed disposable Supabase stack, resets the fixture database, and stops the stack after each run. Supabase currently warns that local services bind to `0.0.0.0`, so run audits only on a trusted network.

To prove that the runtime suite catches a regression, inject a temporary cross-tenant read leak and run the same matrix:

```bash
./test/integration/run-regression-demo.sh
```
