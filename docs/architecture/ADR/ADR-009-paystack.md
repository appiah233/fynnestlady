# ADR-009: Paystack Payment Architecture

Status: **Proposed**

## Context
Paystack is the initial provider and payment evidence crosses an untrusted browser boundary.
## Problem
Ensure a paid order reflects authentic, correct, exactly-once provider evidence.
## Options
Redirect trust; webhook only; webhook plus independent verification and reconciliation.
## Decision
Create a pending order from server totals, initialize server-side, verify signed events and provider transaction details, then apply idempotent state transitions.
## Consequences
Robust payment truth; more state, retry, and reconciliation logic.
## Risks
Provider outage, delayed events, duplicate delivery, amount/currency mismatch.
## Alternatives
Redirect trust is forgeable; webhook-only without transaction checks is insufficient defense.
## Revisit conditions
Provider API changes or multi-provider payments are approved.
