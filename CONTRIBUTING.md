# Contributing

TenantProof is intentionally small. Keep changes focused on authorization verification for Supabase applications.

## Local Checks

```bash
node --test test/*.test.js
node ./bin/tenantproof.js --help
```

For the real local Supabase fixture:

```bash
./scripts/install-supabase-cli.sh
./test/integration/run-local.sh
./test/integration/run-regression-demo.sh
```

The integration scripts require Docker Desktop and stop their disposable Supabase stack after each run.

## Pull Requests

- Add focused tests for behavioral changes.
- Do not commit runtime credentials, generated plans, or generated reports.
- Call out changes that could create false passes or false failures.

