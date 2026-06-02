# TenantProof First Prospect Queue

*Prepared: 2026-06-02*

## How To Use This List

Start with a helpful public comment where the thread is active and relevant. Do not paste the same pitch everywhere. Mention TenantProof only after connecting it to the person's actual concern.

Send a direct message only if:

- the person asks for help;
- the post explicitly invites tools, advice, or feedback;
- your public comment would derail the thread;
- or you have already had a useful public exchange.

Do not contact people who are selling competing scanners as prospects. Their posts are useful market research, not sales leads.

## Priority Threads

### 1. Launch-Ready Nontechnical Lovable Builder

**Thread:** [I need devs advice](https://www.reddit.com/r/lovable/comments/1tfvpoo/i_need_devs_advice/)

**Why it fits:** The builder describes a launch-ready tool with no engineering background, GitHub connected, many Edge Functions, and uncertainty about launch risks.

**Public comment:**

You are asking the right question before user growth. One narrow check I would add before launch is a second-account test: create two disposable users and prove that one cannot read or modify the other's records, then repeat it for any team or admin roles. A configured login flow is not the same as verified authorization behavior.

I released an open-source CLI called TenantProof for this exact Supabase boundary. I am running three free research audits using disposable local or staging projects, never production credentials. Happy to include your app if that would help.

### 2. Founder Who Explicitly Struggled With Supabase RLS

**Thread:** [I tried a simple constraint for my last side project: build and launch a SaaS in 30 days or kill it](https://www.reddit.com/r/saasbuild/comments/1tsvrvd/i_tried_a_simple_constraint_for_my_last_side/)

**Why it fits:** The founder launched a Next.js and Supabase SaaS and explicitly says RLS rules consumed time.

**Public comment:**

The RLS comment jumped out at me. That is one of the awkward parts of a fast Supabase launch: a policy can look reasonable while still failing for the wrong account.

I just released an open-source CLI that turns the intended rules into owner, other-user, and anonymous REST checks so they can be rerun after migrations. I would value blunt feedback from someone who has actually fought those rules during a 30-day build: https://github.com/SamuelPeterson22/tenantproof

### 3. Lovable Builder Learning Auth During Launch

**Thread:** [Built a SaaS in 4 weeks with Lovable. Here's what nobody tells you about going from idea to live product.](https://www.reddit.com/r/lovable/comments/1thqqvo/built_a_saas_in_4_weeks_with_lovable_heres_what/)

**Why it fits:** The founder writes that connecting Supabase exposed how little they understood auth and that real users are already signing up.

**Public comment:**

The gap between "connected Supabase" and understanding auth is very real. One useful pre-launch habit is testing the same record through a second account, not just confirming that your own account works.

I released a small open-source Supabase CLI for that exact check and I am running three free research audits against disposable staging fixtures. If a second-account pass would be useful, I am happy to help.

### 4. Lovable Builder Migrating Toward Supabase

**Thread:** [Lovable cloud/Supabase](https://www.reddit.com/r/lovable/comments/1r1x3j7/lovable_cloudsupabase/)

**Why it fits:** The builder is early in launch, nontechnical, moving toward Supabase ownership, and already sees security warnings.

**Public comment:**

Owning the Supabase project is useful, but I would treat migration and verification as separate tasks. After the move, create disposable accounts for owner, other user, and any team role, then prove each one can only reach the rows it should.

That exact second-account boundary is what I am testing with an open-source CLI called TenantProof. I would be interested in whether a guided audit would make the migration feel less opaque.

### 5. Agency-Oriented Backend Engineer

**Thread:** [6 things that broke when my Lovable apps got their first real users](https://www.reddit.com/r/lovable/comments/1t1kkf6/6_things_that_broke_when_my_lovable_apps_got/)

**Why it fits:** The author has audited many Lovable apps and may be a better agency partner or product-feedback contact than a customer.

**Public comment:**

This is a useful checklist. I am working on the authorization slice specifically: turning intended Supabase access rules into repeatable owner, same-tenant, other-tenant, and anonymous REST checks.

You have seen far more production Lovable failures than most people. I would value your blunt take on whether agencies would rerun that tenant-isolation matrix before every handoff or migration.

## Research-Only Threads

Do not pitch these authors as prospects. Read the comments for language, objections, and competitive positioning:

- [My boss hacked our clients lovable built app in less than half an hour](https://www.reddit.com/r/lovable/comments/1tqcw0c/my_boss_hacked_our_clients_lovable_built_app_in/)
- [I built a free Lovable Security Scanner](https://www.reddit.com/r/lovable/comments/1tcth3c/i_built_a_free_lovable_security_scanner/)
- [Audited 8 vibe-coded SaaS apps last week. 5 had RLS completely off.](https://www.reddit.com/r/SaaS/comments/1t2bk59/audited_8_vibecoded_saas_apps_last_week_5_had_rls/)

## Today

Comment on threads 1, 2, and 3 only.

Record each comment in `docs/audit-outreach-tracker.csv` with:

- the date;
- the thread title;
- the link;
- status `commented`;
- next action `Check replies`;
- next action date `2026-06-03`.

Stop after three comments. Quality matters more than volume.
