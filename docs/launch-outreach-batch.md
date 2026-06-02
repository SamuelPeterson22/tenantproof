# TenantProof Launch Outreach Batch

*Prepared: 2026-06-02*

## Goal

Book three free research audits with builders of Supabase-backed applications. Do not sell the paid audit until the three research slots are filled or the first participants confirm that the result is valuable.

Public links:

- Landing page: https://samuelpeterson22.github.io/tenantproof/
- GitHub: https://github.com/SamuelPeterson22/tenantproof
- npm: https://www.npmjs.com/package/tenantproof

## Daily Sequence

### Day 1

1. Publish the Reddit post below in one relevant community only.
2. Send five founder direct messages to people who have publicly posted about a Supabase-backed application.
3. Record each contact in `docs/audit-outreach-tracker.csv`.

### Day 2

1. Reply helpfully to questions and comments from Day 1.
2. Send five more founder direct messages.
3. Send two agency direct messages to freelancers or agencies advertising Lovable, Bolt, Cursor, or Supabase work.

### Day 3

1. Publish the short LinkedIn post below.
2. Send five more founder direct messages.
3. Ask any interested builder for the intake information below.

### Days 4-7

1. Fill the three free audit slots.
2. Run the audits.
3. Ask each participant what future change would make them rerun the checks.
4. Ask permission to share anonymized failure patterns.
5. Ask for a short testimonial if the result was useful.

## Reddit Post

**Suggested title:**

`I built a second-account test for Supabase apps after realizing that "RLS looks configured" is not the same as tenant isolation`

**Body:**

I released a small open-source CLI called TenantProof for a narrow Supabase security question:

> Can Tenant A read, change, or delete Tenant B's records after the latest database change?

A working UI and configured RLS policies do not prove that boundary. TenantProof turns intended access rules into owner, teammate, other-tenant, and anonymous REST checks against a disposable local or staging project.

It also checks for missing RLS, permissive policies, risky grants, and exposed service-role material.

I am looking for three Supabase-backed apps for free research audits. I will provide a plain-English report and reproducible checks that can be rerun after future changes.

No production credentials. No claim that this replaces a professional security review. The goal is to make one important boundary easier to test repeatedly.

Project: https://samuelpeterson22.github.io/tenantproof/

GitHub: https://github.com/SamuelPeterson22/tenantproof

I would also value blunt feedback from anyone already testing tenant isolation another way.

## LinkedIn Post

AI-assisted builders can ship a working SaaS demo quickly.

But a working demo does not answer a basic authorization question:

> Can one customer read or modify another customer's records?

I released TenantProof, an open-source Supabase authorization regression checker. It runs static checks, turns intended permissions into an explicit contract, and exercises owner, teammate, other-tenant, and anonymous access through real REST requests.

I am looking for three Supabase-backed apps for free research audits. Participants receive a plain-English report and reproducible checks they can rerun after future database changes.

Use a disposable local or staging project. Never send production credentials.

https://samuelpeterson22.github.io/tenantproof/

## Founder Direct Message

Hi [name] - I saw your post about [project].

I released a small open-source tool for one Supabase risk that is easy to miss when shipping quickly: the app works for your account, but nobody has proved that another account cannot read your records.

I am running three free research audits for Supabase-backed apps. I use a disposable local or staging project, never production credentials. You receive a plain-English report and checks you can rerun after future database changes.

Would a second-account tenant-isolation check be useful before your next release?

## Agency Direct Message

Hi [name] - I am testing a repeatable pre-handoff audit for agencies shipping Supabase-backed client apps.

TenantProof proves whether one client account can access another account's records and leaves behind a regression suite for future changes.

I am looking for a few agency partners willing to test the workflow on disposable client fixtures. Would that solve a real handoff risk for your team?

## Positive Reply

Thanks. The first step is a short intake so I can keep the audit narrow and avoid sensitive data.

Please send:

1. What the app does.
2. Whether it supports personal accounts, teams, or organizations.
3. Which records must never cross account or tenant boundaries.
4. Whether you can provide the Supabase migration files or a repository.
5. Whether you can run a disposable local or staging Supabase project with representative test data.

Please do not send production credentials or real customer data.

## Follow-Up After Two Days

Hi [name] - one quick follow-up in case this is useful before launch.

The audit is intentionally narrow: it checks whether another account can read or modify records that should stay private, then leaves behind regression cases for future database changes.

I still have [number] free research slot[s] open. No production credentials required.

## Tracker Rules

Use `docs/audit-outreach-tracker.csv`.

Record:

- one row for every direct message;
- one row for every community post;
- the next action date before ending each outreach session;
- whether the person asks for reruns or CI;
- the exact wording they use to describe their concern.

The customer wording is product research. Preserve it verbatim in the `notes` column.
