# ADR-011: GitHub Governance

Status: **Proposed**

## Context
The public repository needs controlled changes and owner-only merge authority.
## Problem
Create review and evidence gates without giving automation merge power.
## Options
Direct pushes; PRs with CI/review; autonomous merge.
## Decision
Use scoped branches, pull requests, minimal-permission CI, CODEOWNERS, specialist review, PR inspection, and Eric-only merge authority.
## Consequences
Traceability and independent checks; repository rules require separate manual verification/configuration.
## Risks
Documented controls may not match GitHub settings until enabled.
## Alternatives
Direct push weakens review; autonomous merge violates project authority.
## Revisit conditions
Owner changes governance explicitly.
