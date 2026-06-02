# TenantProof First-Revenue Plan

*Prepared: 2026-06-02*

## Commercial Decision

Do not try to monetize the npm package directly yet.

Keep the CLI open source and sell a narrow, hands-on outcome:

> We prove whether one customer can access another customer's records in your Supabase app. You receive a plain-English report, reproducible failing cases, and a regression contract you can rerun after future changes.

The CLI is the credibility engine. The audit service is the first income stream. A recurring CI product becomes the second income stream only after customers ask for reruns.

## Why This Wedge

The general "security scanner for vibe-coded apps" market is already crowded:

- Supabase ships a Security Advisor for improperly configured RLS policies.
- Lovable runs built-in RLS linting and database schema review before publishing.
- SymbioticSec's open-source Vibe-Scanner has broad Supabase static coverage.
- DBAudit sells a one-off quick scan and subscriptions.
- VibeScan and Pantra compete on low-friction public URL scans.

TenantProof should not compete on the number of scanner rules or promise broad security coverage. Its distinct value is project-specific behavioral proof:

- reviewed intended access rules;
- second-account and cross-tenant cases;
- real Supabase REST requests;
- a regression artifact that survives future changes.

## Offers

### Stage 1: Research Audits

Run the first three audits free in exchange for a 20-minute feedback call, permission to record anonymized failure patterns, and a testimonial if the result is useful.

### Stage 2: Founding Audit

Sell the next seven audits at **US$149** each.

Include:

- one Supabase-backed application;
- static migration and client-source audit;
- reviewed authorization contract;
- owner, same-tenant, other-tenant, and anonymous checks against a disposable local or staging project;
- plain-English Markdown report;
- one 30-minute findings call;
- one rerun within 14 days after fixes.

State the boundary clearly: this is a focused authorization audit, not a full penetration test or compliance certification.

### Stage 3: Standard Audit

After ten completed audits, raise the price to **US$299** if configuration consistently takes less than 90 minutes and customers describe the outcome as valuable.

### Stage 4: Agency Pilot

Offer agencies a **US$499** pilot covering up to three client applications. Include reusable setup guidance and a short handoff summary for each client.

The agency question is simple: would they pay for the same check on every Supabase client project before handoff?

### Stage 5: Recurring Product

Build recurring monitoring only if at least three customers ask for reruns or CI integration.

Initial pricing hypothesis:

| Plan | Price | Intended buyer | Scope |
|------|-------|----------------|-------|
| Free CLI | $0 | Technical founder | Local static audit and self-managed regression suite |
| Solo CI | US$29/month | Founder | One project, pull-request checks, retained reports |
| Agency CI | US$99/month | Agency | Up to five projects, branded reports, email alerts |
| Additional project | US$15/month | Growing team | Per-project expansion |

Treat these as interview hypotheses, not final prices.

## Promotion Plan

### The First Message

Lead with the second-account question:

> Your Supabase app may work perfectly for you and still return another customer's rows. TenantProof checks that boundary with real requests and leaves behind regression tests you can rerun after each database change.

Do not lead with "static RLS scanner." That puts TenantProof in the most crowded part of the market.

### Week 1: Get Three Research Audits

1. Contact 20 builders who recently shipped a Supabase-backed app.
2. Prioritize apps built with Lovable, Bolt, Cursor, Claude Code, or Codex.
3. Post one useful, non-sales explanation in `r/lovable`, `r/Supabase`, and `r/vibecoding`: demonstrate why a working UI does not prove tenant isolation.
4. Join the Lovable Discord and Supabase community channels. Answer questions first; offer a free audit only where it is relevant and permitted.
5. Ask every audit participant which future change would make them want to rerun the checks.

### Week 2: Sell the Founding Audit

1. Publish an anonymized write-up: "What three Supabase second-account tests found."
2. Add a limited founding-audit offer to the landing page.
3. Send 30 direct messages to recently launched builders and 10 to small AI-app agencies.
4. Ask the three free users for a testimonial, referral, or introduction.
5. Close the first paid audit before building a dashboard.

### Weeks 3-4: Test the Agency Wedge

1. Contact 20 agencies or freelancers showing Lovable, Bolt, Cursor, or Supabase work.
2. Offer the three-app pilot.
3. Ask whether a branded handoff report helps them sell or retain client work.
4. Record repeated setup work that should become CLI automation.

## Outreach Scripts

### Founder Direct Message

Hi [name] - I released a small open-source tool for one Supabase risk that is easy to miss when shipping quickly: the app works for your account, but nobody has proved that another account cannot read your records.

I am running three free research audits for Supabase-backed apps. I use a disposable local or staging project, never production credentials. You receive a plain-English report and checks you can rerun after future database changes.

Would a second-account tenant-isolation check be useful before your next release?

### Agency Direct Message

Hi [name] - I am testing a repeatable pre-handoff audit for agencies shipping Supabase-backed client apps. It proves whether one client account can access another account's records and leaves behind a regression suite for future changes.

I am looking for a few agency partners to run it on up to three disposable client fixtures. Would that solve a real handoff risk for your team?

### Community Post

I released an open-source Supabase authorization regression checker after noticing a gap between "RLS looks configured" and "we actually tested with a second account."

TenantProof turns intended access rules into owner, teammate, other-tenant, and anonymous REST checks against a disposable local or staging project.

The question is intentionally narrow: can Tenant A read, change, or delete Tenant B's records after the latest database change?

I am looking for three Supabase-backed apps for free research audits. No production credentials. I will share anonymized failure patterns afterward.

## What To Measure

Track every conversation and audit:

| Metric | Target after 20 audits |
|--------|------------------------|
| Meaningful authorization issues found | At least 5 |
| Customers willing to pay for an audit | At least 5 |
| Customers asking for reruns or CI | At least 3 |
| Agencies interested in repeated use | At least 2 |
| Average configuration time | Under 30 minutes after productization |
| First paid audit | Before building a dashboard |

## Product Roadmap Driven By Sales

Build only what removes repeated friction observed during audits:

1. Guided local stack provisioning and fixture seeding.
2. Generated remediation prompts for coding agents.
3. Storage bucket and Edge Function checks.
4. JUnit reports and a simpler GitHub Actions installer.
5. Hosted CI history, alerts, and agency reporting only after recurring demand is proven.

## Research Notes And Sources

- Supabase says RLS must be enabled on tables in exposed schemas and documents its Security Advisor for improperly configured RLS policies:
  - https://supabase.com/docs/guides/database/postgres/row-level-security
  - https://supabase.com/docs/guides/database/database-advisors
- Supabase documents pgTAP and client-level approaches for RLS testing:
  - https://supabase.com/docs/guides/local-development/testing/overview
- Lovable documents built-in RLS linting, database schema review, deep scans, and pre-publish scanning:
  - https://docs.lovable.dev/features/security
- SymbioticSec Vibe-Scanner documents broad static local and remote Supabase RLS coverage:
  - https://github.com/SymbioticSec/vibe-scanner
- Current commercial scanner examples:
  - https://dbaudit.app/
  - https://vibe-scan.app/
  - https://pantra.io/
- Representative community language:
  - https://www.reddit.com/r/lovable/comments/1pc4cv2/security_using_loveable_supabase/
  - https://www.reddit.com/r/vibecoding/comments/1sn35ig/ai_wrote_the_security_policy_wrote_comments/

Treat competitor-provided metrics as marketing claims unless independently verified.
