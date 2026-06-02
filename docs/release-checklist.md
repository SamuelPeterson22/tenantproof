# TenantProof 0.1.0 Release Checklist

## Repository Setup

- [ ] Create a public GitHub repository named `tenantproof`.
- [ ] Add the local repository as its remote and push `main`.
- [x] Replace the placeholder email and GitHub URL in `public/index.html`.
- [x] Add `repository`, `homepage`, and `bugs` URLs to `package.json`.
- [ ] Confirm GitHub Actions CI passes.
- [ ] In GitHub repository settings, enable Pages with GitHub Actions as the source.
- [ ] Add a short-lived granular npm token as the GitHub Actions secret `NPM_TOKEN` for the first publish.
- [ ] Review the security contact in `SECURITY.md`.

## npm Setup

- [x] Create or sign in to an npm account: `samuelpeterson22`.
- [x] Confirm the unscoped package name `tenantproof` is available. Checked against the npm registry on 2026-06-02.
- [ ] Enable two-factor authentication on the npm account.
- [x] Use the available unscoped package name `tenantproof`.

## Release

- [ ] Review `CHANGELOG.md`.
- [ ] Run `node --test test/*.test.js`.
- [ ] Run `./test/integration/run-local.sh`.
- [ ] Run `./test/integration/run-regression-demo.sh`.
- [ ] Commit any final changes.
- [ ] Create and push the Git tag `v0.1.0`.
- [ ] Create a GitHub release from `v0.1.0`.
- [ ] Confirm the npm publish workflow succeeds.
- [ ] Configure npm trusted publishing for the public GitHub repository and `.github/workflows/publish.yml`.
- [ ] Remove the `NPM_TOKEN` GitHub secret after trusted publishing succeeds.
- [ ] In npm package settings, require two-factor authentication and disallow token publishing.
- [ ] Install from npm in a temporary folder and run `npx tenantproof --help`.

## Launch

- [ ] Publish the copy in `docs/launch-kit.md` as a simple landing page.
- [ ] Contact the first 20 Supabase builders or agencies.
- [ ] Offer a free authorization audit using the intake checklist.
- [ ] Record findings using `docs/concierge-validation.md`.
