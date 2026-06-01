# TenantProof Concierge Validation

The goal of the first 20 audits is to verify that authorization regressions are frequent, painful, and worth monitoring continuously. Do not overbuild before collecting these results.

## Offer

> We will prove whether one customer can access another customer's records in your Supabase app. You receive a plain-English report, reproducible checks, and a regression contract for future changes.

Target Lovable, Bolt, Cursor, Claude Code, and Codex users shipping Supabase-backed SaaS products. Prioritize agencies because they can reuse the tool across client projects.

## Intake

Ask for:

1. A repository or exported Supabase migrations.
2. The intended anonymous, owner, same-tenant, and other-tenant access rules.
3. A disposable local or staging Supabase project.
4. Representative fixture rows without production customer data.
5. Permission to publish anonymized failure patterns.

Never request production service-role keys. Use a disposable project.

## Audit Workflow

```bash
node ./bin/tenantproof.js init --project ../customer-app
node ./bin/tenantproof.js verify --project ../customer-app
node ./bin/tenantproof.js plan --project ../customer-app
node ./bin/tenantproof.js execute --project ../customer-app
```

Resolve every `review` value in `tenantproof.json`, then copy `tenantproof/runtime.example.json` to `tenantproof/runtime.json` and add disposable fixture IDs. Supply actor tokens through environment variables.

## Record

For each audit, record:

- Builder profile and tools used
- Number of exposed tables
- Static findings by severity
- Runtime failures by actor and operation
- Whether the issue could expose another tenant's data
- Time required to configure and run the audit
- Whether the builder asks for reruns after future changes
- Willingness to pay for CI monitoring

## Go Or No-Go

Continue investing if at least 5 of the first 20 audits expose a meaningful authorization issue and at least 3 builders will pay for recurring checks. If configuration takes more than 30 minutes per project, prioritize automatic local Supabase provisioning and fixture seeding before adding more scanners.
