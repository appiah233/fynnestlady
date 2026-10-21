# ADR-003: Commerce Domain Boundaries

Status: **Proposed**

## Context
Catalogue, cart, checkout, inventory, order, and payment have different authority and lifecycle rules.
## Problem
Prevent duplicated logic and unsafe cross-domain mutation.
## Options
Explicit modules; page-oriented services; shared CRUD layer.
## Decision
Adopt the boundaries in `DOMAIN_MODEL.md` with application-service orchestration.
## Consequences
Clear ownership and invariants; cross-module workflows require deliberate interfaces.
## Risks
Excessive abstraction or persistence leakage.
## Alternatives
Page/CRUD organization is initially faster but obscures commerce rules.
## Revisit conditions
Domain discovery shows aggregates or transaction boundaries are materially wrong.
