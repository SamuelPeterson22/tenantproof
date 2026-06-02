# Changelog

All notable changes to TenantProof are documented in this file.

## 0.1.0 - 2026-06-02

### Added

- Zero-dependency `tenantproof` CLI for Supabase authorization audits.
- Static checks for missing RLS, permissive policies, risky grants, `SECURITY DEFINER` functions, and exposed service-role material.
- Editable authorization contract generation with unresolved-intent review gates.
- Adversarial runtime plans for anonymous, owner, same-tenant, and other-tenant actors.
- Local-first Supabase REST executor with remote-target and destructive-check guardrails.
- Markdown audit reports and a local prerequisite `doctor` command.
- Disposable real-Supabase integration fixture and injected tenant-leak regression demo.

