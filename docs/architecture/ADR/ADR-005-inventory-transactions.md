# ADR-005: Inventory Transaction Strategy

Status: **Proposed**

## Context
Concurrent customers may attempt to purchase the final unit.
## Problem
Prevent overselling while retaining an auditable history.
## Options
Atomic decrement; reservation then finalize; asynchronous allocation.
## Decision
Use transactional bounded reservations with append-only movements; finalize/release exactly once.
## Consequences
Safer payment latency handling; requires expiry, reconciliation, and concurrency tests.
## Risks
Leaked reservations or duplicate effects if idempotency fails.
## Alternatives
Direct decrement is simpler but complicates payment failure; asynchronous allocation permits disappointing post-payment failure.
## Revisit conditions
Catalogue stock policy, payment timing, or fulfilment model changes.
