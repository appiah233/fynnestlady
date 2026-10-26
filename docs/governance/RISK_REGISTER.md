# Project Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner | Status |
|---|---|---:|---:|---|---|---|
| R-001 | Unsupported skincare claims harm customers or trust | Medium | High | Verified source data, content review, explicit claim flags | Product/Security | Open |
| R-002 | Client price manipulation changes order totals | High | Critical | Server-authoritative catalogue and checkout totals | Architecture | Open |
| R-003 | Payment forgery, replay, or duplicate processing | Medium | Critical | Signature verification, provider verification, idempotency, audit trail | Security | Open |
| R-004 | Concurrent checkout oversells inventory | Medium | High | Transactional reservation/finalization and concurrency tests | Database | Open |
| R-005 | Privilege escalation exposes admin operations | Medium | Critical | Deny-by-default RBAC and server-side authorization | Security | Open |
| R-006 | S3 media or customer data becomes public | Medium | High | Private bucket, IAM role, scoped URLs, upload validation | Security | Open |
| R-007 | Single EC2 host causes availability loss | Medium | High | Backups, recovery runbook, health checks; reassess scaling | Architecture | Open |
| R-008 | Self-managed database causes data loss | Medium | Critical | Prefer managed PostgreSQL with backups and restore tests | Database | Open |
| R-009 | Scope growth delays safe launch | High | High | MVP boundaries, owner decisions, milestone gates | Product | Open |
| R-010 | Supply-chain or CI compromise alters releases | Medium | High | Pinned actions, least privilege, review dependency changes | Security | Open |
| R-011 | Premature technology lock-in | Medium | Medium | Proposed ADR status and Milestone 1 validation spikes | Architecture | Open |
| R-012 | Incomplete catalogue data produces misleading UI | High | High | Required-field policy, draft state, human verification | Product | Open |
| R-013 | Documented branch controls are not enabled in GitHub | High | High | Owner verifies rulesets for `dev` and `main`, required checks, deletion/force-push prevention | Owner/Security | Open |
| R-014 | PR or self-hosted CI exposes production credentials | Medium | Critical | GitHub-hosted runners, no PR secrets, OIDC, protected environments, scoped IAM | Security | Open |
