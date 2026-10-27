# Blockers

## GITHUB-BOOTSTRAP-001

Status: Open
Observed: 2026-10-21
Evidence: Remote heads contain `docs/project-foundation` and automated Dependabot branches, but no `dev` or `main`; GitHub reports `docs/project-foundation` as the default branch.
Impact: A compliant foundation PR cannot target `dev`, and a release PR cannot target `main`.
Required owner action: Establish `main` and `dev` through an explicitly approved bootstrap procedure, set the intended default branch, and configure rulesets that prohibit direct changes, force pushes, deletion, and non-owner merges while requiring approved checks.
Agent constraint: Do not create or populate either permanent branch from unreviewed agent work merely to make a PR possible.

Milestone 1 remains blocked pending owner review, branch bootstrap, and the decisions in `DECISIONS.md`.

## SPRINT-1-VERIFY-2026-10-26

Status: Open. Supersedes the historical branch-bootstrap observation above for Sprint 1: local and remote `main`/`dev` now exist. Owner authorization in ADR-014 permits active development.
Observed: 2026-10-26.
Evidence: [TestingAgent provisional verdict](../testing/SPRINT_1_VERDICT.md) and [engineering dashboard](ENGINEERING_DASHBOARD.md).
Impact: Sprint 1 cannot be closed or merged into `dev` yet.
Owners: StorefrontAgent for stable UI handoff; DatabaseAgent/DevOpsAgent for disposable CI SQL run; TestingAgent for independent final verification; Engineering Bot for remote PR/merge.
Required next action: Complete storefront edits, rerun all gates on an exact commit, execute PostgreSQL RLS tests in CI, and obtain independent reviews. GitHub CLI credentials are invalid in this shell and the GitHub connection is not installed, so remote issue/PR operations require a working bot identity or connected account. Do not weaken protected gates.
