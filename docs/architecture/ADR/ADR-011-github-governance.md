# ADR-011: GitHub Governance

Status: **Superseded by ADR-014 on 2026-10-26**

This record preserves the initial owner-only merge proposal. The later owner instruction authorizes Fynnestlady Engineering Bot to merge eligible `dev` PRs and routine releases through protected gates. See ADR-014; do not use this record as the active merge policy.

## Context
The public repository needs controlled changes and owner-only merge authority.
## Problem
Create review and evidence gates without giving automation merge power.
## Options
Direct pushes; PRs with CI/review; autonomous merge.
## Decision
Use permanent `dev` integration and `main` production branches, scoped working branches targeting `dev`, release PRs from `dev` to `main`, minimal-permission CI, CODEOWNERS, specialist review, PR inspection, and Eric-only merge authority.
## Consequences
Traceability, staged integration, and independent checks; repository rules and protected environments require separate manual verification/configuration.
## Risks
Documented controls may not match GitHub settings until enabled.
## Alternatives
Direct push weakens review; autonomous merge violates project authority.
## Revisit conditions
Owner changes governance explicitly.
