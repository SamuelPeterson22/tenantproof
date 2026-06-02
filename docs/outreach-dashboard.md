# TenantProof Outreach Dashboard

The outreach dashboard reduces the manual work without publishing repetitive posts automatically.

## Start It

On a Mac:

1. Open the `scripts` folder in Finder.
2. Double-click `start-outreach-dashboard.command`.
3. Keep the Terminal window open while using the dashboard.

The dashboard opens at:

```text
http://127.0.0.1:4173
```

## Use It

For each prospect:

1. Click **Open thread**.
2. Read the Reddit post before replying.
3. Adjust the draft comment if the conversation needs a different tone.
4. Click **Copy comment**.
5. Paste the comment into Reddit and publish it manually.
6. Return to the dashboard and click **Mark as commented**.

The dashboard appends the interaction to `docs/audit-outreach-tracker.csv`.

## Why Publishing Stays Manual

The final publish click is intentionally not automated. Reddit communities have different rules, and the visible conversation can change after a prospect is added to the queue. A short review prevents irrelevant or repetitive promotion and protects the account from moderation issues.

The repetitive work is automated:

- finding the saved prospect;
- selecting the tailored draft;
- opening the thread;
- copying the comment;
- recording the interaction;
- setting the next follow-up date.
