# Runtime Roadmap

TenantProof compiles an authorization contract into explicit adversarial cases and executes those cases against a disposable Supabase REST API.

## Implemented: Disposable Local Integration Fixture

The repository includes `test/integration/run-local.sh`. It:

- Checks that Docker and the workspace-local Supabase CLI are available.
- Starts a trimmed disposable Supabase stack.
- Resets the local database and reapplies migrations.
- Exports development credentials to a temporary file.
- Runs the static verifier.
- Compiles the reviewed contract.
- Mints local owner, same-tenant, and other-tenant JWTs.
- Executes 16 adversarial REST cases, including destructive checks against disposable fixture rows.

During development, the runtime matrix found a missing owner-delete policy that the static audit could not infer. A deliberate permissive read policy was then injected directly into the local database; TenantProof correctly failed the `otherTenant.select` case.

## Next Slice: Productized Provisioning

1. Move local stack detection and startup into the TenantProof CLI.
2. Infer representative fixtures from the schema where possible.
3. Add a guided prompt for required fixture values.
4. Seed disposable rows and actors automatically.
5. Reset the local stack after a run.

## After Provisioning

- Add storage bucket checks.
- Add Edge Function authentication probes.
- Add generated remediation prompts for coding agents.
- Emit Markdown and JUnit reports for CI.
- Package the executable for npm distribution.
- Run the first 20 concierge audits described in [concierge-validation.md](./concierge-validation.md).
