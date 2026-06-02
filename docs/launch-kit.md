# TenantProof Launch Kit

## One-Sentence Positioning

TenantProof proves whether one customer can access another customer's data after an AI-generated Supabase change.

## Landing Page Copy

### Hero

**Your AI-built SaaS may pass a demo and still leak customer data.**

TenantProof checks Supabase row-level security before a small authorization mistake becomes a serious incident.

Run a static audit in seconds. Turn your intended access rules into an adversarial regression suite. Verify that anonymous visitors, other users, and other tenants stay blocked after every change.

**Primary CTA:** Audit my Supabase app  
**Secondary CTA:** View the CLI on GitHub

### Problem

AI coding tools make it easy to add features quickly. They also make it easy to change a database policy without understanding the blast radius.

TenantProof tests the question that matters:

> Can Tenant A read, change, or delete Tenant B's records?

### What It Checks

- Public tables without row-level security
- Policies that accidentally allow everyone
- Risky write grants
- Service-role secrets exposed in client code
- Owner, teammate, other-tenant, and anonymous access through the real Supabase REST API

### How It Works

```bash
npx tenantproof init
npx tenantproof verify
npx tenantproof plan
npx tenantproof execute
```

### Early Access Offer

We are offering a limited number of free authorization audits for Supabase-backed SaaS apps. You receive:

- A plain-English risk report
- Reproducible failing cases
- A reviewed authorization contract
- A regression suite for future changes

Use a disposable local or staging project. Never send production credentials.

## Outreach Messages

### Founder DM

I am testing a small Supabase security tool called TenantProof. It checks whether one customer can access another customer's records after an AI-generated change. I am offering a few free audits for Lovable, Bolt, Cursor, Claude Code, and Codex builders. You get a plain-English report and reproducible checks. Interested?

### Agency DM

I am building TenantProof, a repeatable authorization audit for Supabase-backed client apps. It checks missing RLS, permissive policies, exposed service-role material, and real cross-tenant REST behavior. I am looking for a few agencies willing to run a free audit on a disposable client fixture and tell me whether recurring CI checks would be useful.

### Community Post

I built a small CLI for a problem I kept seeing in AI-built Supabase apps: the app works, but nobody has proved that Tenant A cannot read Tenant B's data.

TenantProof runs static RLS checks, turns intended access rules into a regression contract, and executes anonymous, owner, teammate, and other-tenant probes against a disposable Supabase stack.

I am looking for early users with Lovable, Bolt, Cursor, Claude Code, or Codex projects. I will run the first audits with you and turn the rough edges into product features.

## Intake Form

- What does the app do?
- Which AI coding tool did you use?
- Does the app use Supabase?
- Does it support personal accounts, teams, or organizations?
- Can you provide migrations and a disposable local or staging project?
- Which records must never cross tenant boundaries?
- May anonymized failure patterns be used to improve TenantProof?

