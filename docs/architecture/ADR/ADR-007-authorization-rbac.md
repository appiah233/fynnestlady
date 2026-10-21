# ADR-007: Authorization and RBAC

Status: **Proposed**

## Context
Administration includes high-impact catalogue, price, inventory, order, and role actions.
## Problem
Enforce least privilege and object ownership consistently.
## Options
Single admin flag; role-based permissions; policy/attribute-based authorization.
## Decision
Use deny-by-default roles mapped to explicit permissions plus resource ownership checks.
## Consequences
Testable authorization matrix and scoped administration; more policy maintenance.
## Risks
Role drift or missing checks at new endpoints.
## Alternatives
A boolean admin is too broad; full policy engines are premature.
## Revisit conditions
Team roles or policy complexity exceed a reviewed permission matrix.
