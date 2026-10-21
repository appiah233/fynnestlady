# ADR-002: PostgreSQL and Prisma

Status: **Proposed**

## Context
Commerce requires relational integrity, transactions, precise data types, and migrations.
## Problem
Select the system of record and TypeScript data-access approach.
## Options
PostgreSQL with Prisma; PostgreSQL with another query layer; document database.
## Decision
Use managed PostgreSQL; use Prisma only after Milestone 1 compatibility and migration review.
## Consequences
Strong relational controls and developer tooling; advanced constraints may require SQL migrations.
## Risks
ORM abstractions can hide query cost or omit database-native safeguards.
## Alternatives
A typed query builder offers more SQL control; a document store weakens fit for transactional relations.
## Revisit conditions
Unsupported database features, migration safety concerns, or measured performance limitations.
