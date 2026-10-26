# Release Checklist

## Governance and Scope

- [ ] Owner-approved scope and accepted relevant ADRs
- [ ] Coordination, handoff, known limitations, and rollback current
- [ ] Required architecture/product/database/security/design reviews complete
- [ ] FynnestladyPRBot verdict is `PASS FOR OWNER REVIEW`
- [ ] Eric Appiah Owusu makes the merge/release decision
- [ ] Release PR identifies the exact verified `dev` SHA promoted to `main`

## Quality

- [ ] Clean install, lint, typecheck, unit, integration, build, E2E, and governance validation pass
- [ ] Critical customer/admin flows independently verified
- [ ] Accessibility manual and automated checks pass at representative widths
- [ ] Performance budgets and production-like smoke tests pass

## Security and Commerce

- [ ] No unresolved critical/high security findings or undocumented risk acceptance
- [ ] Authorization/IDOR, price/discount tampering, payment replay/mismatch, and inventory concurrency tests pass
- [ ] Secrets/dependency/CodeQL checks pass; workflow permissions reviewed
- [ ] Order snapshots, payment/order separation, audit history, and reconciliation verified

## Operations

- [ ] Environment configuration and secret references verified without exposing values
- [ ] Migration preflight, backup, restore evidence, and rollback/forward-fix plan approved
- [ ] Health, logging redaction, metrics, alerts, certificate, capacity, and disk checks pass
- [ ] Post-deploy smoke/reconciliation plan and responsible person confirmed
- [ ] Production candidate originates from `main` and protected-environment owner approval is recorded

Unchecked release blockers cannot be bypassed by an agent.
