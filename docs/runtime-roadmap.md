# Runtime Roadmap

TenantProof already compiles an authorization contract into explicit adversarial cases and executes those cases against a configured disposable Supabase REST API. The remaining integration work removes manual setup.

## Next Slice: Local Stack Provisioning

1. Detect the Supabase CLI and Docker daemon.
2. Run `supabase start` inside the target application.
3. Apply migrations to a disposable local database.
4. Create three test users: owner, same-tenant collaborator, and other-tenant user.
5. Seed one representative row for each resource in `tenantproof.json`.
6. Write `tenantproof/runtime.json` with fixture IDs while keeping tokens in process environment variables.
7. Execute the generated adversarial plan.
8. Reset the local stack after the run.

## After Provisioning

- Add storage bucket checks.
- Add Edge Function authentication probes.
- Add generated remediation prompts for coding agents.
- Emit Markdown and JUnit reports for CI.
- Package the executable for npm distribution.
- Run the first 20 concierge audits described in [concierge-validation.md](./concierge-validation.md).

## Current Environment Boundary

On the initial development machine, Node and Docker are installed, but the Supabase CLI is absent and the Docker daemon is not running. The zero-dependency static workflow and mocked REST executor are verified. A real local-stack execution needs Docker Desktop started and the Supabase CLI installed.
