# Branching and Delivery

This delivery plan follows the building memo and ADR-014.

## Permanent Branches

- `main`: production revisions only.
- `dev`: integration and development branch.

Neither branch accepts direct implementation commits, force pushes, or deletion. Protected checks and independent reviews apply to bot merges.

## Normal Flow

`bot issue → feature/fix/security/chore branch from dev → PR to dev → independent evidence and required checks → bot squash merge → dev health verification → release PR from verified dev SHA to main → production gates → bot routine release merge → protected deployment → smoke verification`

The bot opens and manages normal issues, branches, and PRs. It deletes merged work branches after post-merge verification. Every PR records task scope, tests, risk, rollback, and evidence. A release PR identifies exact `dev` SHA, included changes, migrations, security impact, risks, rollback, and evidence. On the first control-plane validation, stop before `main` merge or production deployment.

## Merge eligibility

The bot may merge only if the linked issue, specialist reviews, independent TestingAgent approval, architecture policy, format/lint/type/test/build, dependency/secret/security gates, applicable database/RLS and accessibility/Playwright checks, Preview, rollback instructions, and complete evidence all pass. The live protected branch must also permit the merge without bypass. Any missing or stale evidence blocks. The bot cannot approve its own code-owner review.

The current protected branch requires code-owner approval by `@appiah233`. That requirement blocks automatic merges until an owner-approved governance change creates a valid independent approval path. The bot must report the block; it must not impersonate Eric, disable the rule, or use a bypass token.

## Production and exceptions

Routine production promotion is permitted only after release gates and a verified exact revision. The first bot validation performs no production release. Destructive production migration, unproven recovery, RLS weakening, provider replacement, confirmed credential/customer-data compromise, branch-protection change, unresolved critical security failure, or irreversible data operation requires Eric's decision. Protected environment requirements remain in force. Production secrets are unavailable to PR code and Gemini/Codex.

Repository branch rules, environment rules, required reviewers, and required checks must be verified in GitHub; this document alone does not enable them.
