# Product Marketing Context

*Last updated: 2026-06-02*

## Product Overview
**One-liner:** TenantProof proves whether one customer can access another customer's data after a Supabase authorization change.

**What it does:** TenantProof is an open-source Node CLI for Supabase-backed applications. It audits SQL migrations and client-facing files, turns intended access rules into an explicit authorization contract, and runs adversarial REST checks against a disposable local or staging stack.

**Product category:** Supabase authorization regression testing / developer security tooling.

**Product type:** Open-source CLI with a productized audit service first and recurring CI monitoring later.

**Business model:** Free CLI as the trust-building entry point. Initial revenue from hands-on audits and agency packages. Recurring revenue only after concierge validation proves demand for automated reruns.

## Target Audience
**Target companies:** Solo founders, small SaaS teams, and agencies shipping Supabase-backed applications quickly with Lovable, Bolt, Cursor, Claude Code, Codex, or similar tools.

**Decision-makers:** Founder, technical founder, lead developer, or agency owner responsible for shipping the application.

**Primary use case:** Before launch or after a database/authentication change, prove that Tenant A cannot read, change, or delete Tenant B's records.

**Jobs to be done:**
- Check whether the app's database boundary actually works with more than one account.
- Turn vague RLS confidence into a reproducible allow-or-deny matrix.
- Leave behind checks that can catch regressions after future AI-generated changes.

**Use cases:**
- Pre-launch review for a Supabase-backed SaaS app.
- Review after adding organizations, teams, roles, or shared records.
- Agency handoff check before delivering a client application.
- CI regression check after migrations change.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Non-specialist founder | Shipping without leaking customer data | Does not know how to test RLS behavior with multiple identities | Plain-English proof and reproducible failing cases |
| Technical founder | Fast releases without authorization regressions | Static review does not prove runtime behavior | Explicit contract plus adversarial REST checks |
| Agency owner | Reliable client handoff and repeatable QA | Each client app has different access rules and reputational risk | A reusable audit workflow and regression artifact |

## Problems & Pain Points
**Core problem:** AI-assisted builders produce a working happy path quickly, but the application owner often has not proved that another account stays blocked at the database boundary.

**Why alternatives fall short:**
- Supabase Security Advisor checks database configuration, but not the customer's intended multi-tenant behavior.
- Builder scanners catch common patterns, but a finding is not the same as a reviewed authorization contract and a repeatable behavioral regression suite.
- URL scanners are fast and useful, but compete on low-cost surface scanning rather than repository-local proof.
- Manual pgTAP tests are powerful, but require the builder to write and maintain the test cases.

**What it costs them:** Data exposure, delayed launch, reputational damage, and emergency remediation work.

**Emotional tension:** "The app works, but I do not know whether another account can see my customers' data."

## Competitive Landscape
**Direct:** SymbioticSec Vibe-Scanner - open-source local and remote Supabase RLS scanner with a broad rule set. Strong static coverage; TenantProof must differentiate on reviewed access intent and runtime behavioral proof.

**Secondary:** Supabase Security Advisor and Lovable security scans - valuable built-in configuration analysis. They reinforce that the category matters, but they do not remove the need for project-specific proof.

**Secondary:** DBAudit, VibeScan, Pantra, and similar web scanners - low-friction reports, fixes, and monitoring. They are better for quick public-surface scans; TenantProof should not imitate their wedge.

**Indirect:** Asking an AI agent to review its own code, manually testing with two accounts, or doing nothing until launch.

## Differentiation
**Key differentiators:**
- Encodes intended access rules as a reviewed authorization contract.
- Exercises owner, same-tenant, other-tenant, and anonymous identities through the real Supabase REST API.
- Produces reproducible regression cases suitable for CI.
- Uses disposable local or staging environments and never asks customers for production credentials.
- Keeps the CLI open source and zero-dependency.

**How we do it differently:** TenantProof focuses on a narrow security property and tries to falsify it with real requests.

**Why that's better:** A customer can rerun the proof after a migration instead of trusting a one-time review.

**Why customers choose us:** They need evidence that the tenant boundary works, not another generic list of security advice.

## Objections
| Objection | Response |
|-----------|----------|
| Lovable or Supabase already scans my app. | Those checks are useful. TenantProof adds a reviewed access matrix and adversarial runtime proof for your exact app. |
| I cannot share production credentials. | Do not share them. TenantProof uses disposable local or staging data and environment variables. |
| I am not technical enough to configure this. | Start with the concierge audit. The service converts your intended rules into the initial test suite. |

**Anti-persona:** Teams seeking a full penetration test, compliance certification, or broad web scanner. TenantProof is a focused supporting control, not a replacement for professional security review.

## Switching Dynamics
**Push:** Fear after launch, a new team feature, an RLS warning, a security incident in the news, or uncertainty after an AI-generated migration.

**Pull:** A narrow plain-English answer to "can one customer access another customer's records?"

**Habit:** Trusting the builder's happy-path demo, a one-time scanner result, or an AI-generated policy explanation.

**Anxiety:** Sharing sensitive data, setup complexity, false confidence, and whether a small tool can provide meaningful evidence.

## Customer Language
**How they describe the problem:**
- "We are planning to launch it to the public, so I am a bit concerned regarding the security issues that might arise."
- "Supabase RLS looks fine until you actually create a second user."
- "The person who most needs to run them usually can't."

**How they describe us:**
- Use after customer interviews.

**Words to use:** prove, another customer's rows, tenant isolation, second-account test, reproducible checks, disposable staging project, regression.

**Words to avoid:** guarantee, fully secure, compliance-certified, penetration test.

**Glossary:**
| Term | Meaning |
|------|---------|
| Tenant isolation | Preventing one customer or organization from accessing another customer's records |
| RLS | Postgres Row Level Security policies that restrict which rows a request can access |
| Authorization contract | The reviewed allow-or-deny rules TenantProof compiles into adversarial checks |

## Brand Voice
**Tone:** Calm, direct, credible, and security-conscious.

**Style:** Explain risk without fearmongering. Prefer one concrete question over broad security language.

**Personality:** Pragmatic, focused, transparent, careful.

## Proof Points
**Metrics:** No customer metrics yet. Record the first 20 concierge audits before making aggregate claims.

**Customers:** None yet.

**Testimonials:** None yet.

**Value themes:**
| Theme | Proof |
|-------|-------|
| Runtime behavior matters | The local fixture catches a deliberately injected cross-tenant leak |
| Static checks are still useful | The CLI catches missing RLS, permissive policies, risky grants, and service-role leaks |
| Repeatability matters | The reviewed contract compiles into an adversarial REST plan suitable for reruns |

## Goals
**Business goal:** Complete 20 concierge audits, validate willingness to pay, and identify the smallest recurring monitoring product worth building.

**Conversion action:** Request a TenantProof audit.

**Current metrics:** Public CLI released as `tenantproof@0.1.0` on 2026-06-02. Customer audits: 0. Revenue: $0.
