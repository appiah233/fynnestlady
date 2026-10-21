# ADR-006: Authentication Strategy

Status: **Proposed**

## Context
Customers and administrators require secure account access and recovery.
## Problem
Choose maintained identity/session primitives without custom security mistakes.
## Options
Auth.js; managed identity provider; custom implementation.
## Decision
Evaluate Auth.js in Milestone 1; do not accept until session, adapter, reset, admin MFA, and maintenance posture are reviewed.
## Consequences
Defers lock-in while preserving explicit security criteria.
## Risks
Foundation cannot yet specify final schema/session behavior.
## Alternatives
Managed identity reduces credential handling but adds cost/vendor dependency; custom auth has high risk.
## Revisit conditions
Completed security spike and owner decision.
