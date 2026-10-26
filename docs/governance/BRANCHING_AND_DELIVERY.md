# Branching and Delivery

## Permanent Branches

- `main`: production-quality, reviewed revisions only. Production release candidates originate only here.
- `dev`: deployable integration branch and normal target for working-branch pull requests.

Neither branch accepts direct implementation commits, force pushes, autonomous merges, or deletion. Eric Appiah Owusu is the sole merge authority.

## Normal Flow

`feature/fix/security/docs branch → PR to dev → owner-approved merge → integration/staging verification → release PR from dev to main → owner-approved merge → production candidate → owner deployment approval → production`

Every working branch records owner, task ID, scope, expected files, tests, coordination entry, and handoff. A release PR identifies exact `dev` SHA, included changes, migrations, security impact, risks, rollback, complete CI evidence, and unresolved owner decisions.

## CI

Pull requests to `dev` and `main` run checkout, toolchain validation, clean install, governance validation, lint, typecheck, unit/integration tests, production build, dependency review, CodeQL, secret scanning, and FynnestladyPRBot. Accessibility, schema, and migration validation activate where relevant. Mandatory failures fail closed.

After an owner-approved merge to `dev`, repeat the full engineering/security suite. When staging exists, build one immutable artifact, deploy that exact artifact to protected staging, and record revision/SHA with health, smoke, E2E, and accessibility evidence.

## Production

Only an approved `main` revision may become a production candidate. Build an immutable artifact, pass full CI/security gates, and enter a protected GitHub `production` environment. Deployment requires Eric's explicit approval, then controlled migration/restart, health/smoke checks, and recorded evidence. A merge alone is not deployment authorization.

No pull-request workflow receives production secrets. Do not use the production EC2 application server as a general-purpose self-hosted runner. Future AWS deployment uses GitHub OIDC to a least-privilege IAM role rather than persistent access keys.

Repository branch rules, environments, required reviewers, and required checks must be verified in GitHub; documents do not prove those settings are enabled.
