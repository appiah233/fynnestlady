# ADR-014: Repository Engineering Bot

Status: **Owner-directed; control-plane validation pending** (2026-10-26)

## Context

ADR-011 reserved all merges for Eric. The newer owner instruction calls for one dedicated GitHub App to operate the issue-to-`dev` cycle and routine `dev`-to-`main` release administration without routine owner interaction. The building memo still requires human-first outcomes, correctness, accessibility, and proportionate complexity.

## Options

Keep manual administration; use a personal token; use a repository-scoped GitHub App with GitHub Actions orchestration and fail-closed gates.

## Decision

Use the private Fynnestlady Engineering Bot GitHub App installed only on this repository. GitHub Actions coordinates; Gemini (`google-github-actions/run-gemini-cli`) handles planning and code, while deterministic gates and independent specialist review decide eligibility. The bot may squash-merge to `dev`, delete its merged work branch, and later merge routine release PRs to `main` only when all required checks and protected-branch rules pass. It must not approve its own changes as a code owner, bypass protection, push directly to permanent branches, or manufacture passing evidence. During the first control-plane validation it stops before `main` merge and production deployment.

The approved application stack is in `.github/fynnestlady/architecture-policy.yml`: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase PostgreSQL/Auth/Storage, Vercel, Paystack, GHS, Playwright, and WCAG 2.2 AA. Historical AWS/Prisma/Auth.js proposals are superseded for new implementation. A new owner-accepted ADR is needed to introduce an alternative.

## Exceptions

The bot stops with a decision report for destructive production migration; unproven migration recovery; RLS weakening; replacement of payment or authentication provider; confirmed secret, customer-data, or automation-credential compromise; branch-protection changes; unresolved critical security failures; and irreversible production-data operations. These are owner decisions. A protected environment must also enforce any required approval before production access. The bot may prepare evidence and a release PR while waiting.

## Consequences and risks

Routine work can progress without manual GitHub administration, but a compromised bot token or workflow has meaningful repository authority. The initial task must repair `.github/workflows/foundation.yml`, so the App manifest includes `workflows: write`; this is a high-impact permission and must be limited to this repository, short-lived installation tokens, reviewed workflow changes, and explicit workflow-file controls. Use isolated untrusted and privileged jobs, no production credentials in Gemini, immutable action references where practical, and audited event source and evidence. GitHub settings must allow only intended App merges while preserving required checks and independent review. The current required code-owner approval by `@appiah233` prevents autonomous merges until repository governance is intentionally changed; the bot must not bypass it. A policy document alone does not establish settings.

## Revisit conditions

Revisit if the App cannot satisfy protected-branch review without granting bypass, if automated release evidence is insufficient, after a credential incident, or if the owner changes the operating mandate.
