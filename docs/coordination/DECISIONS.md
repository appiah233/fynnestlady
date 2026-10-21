# Decision Log

## Pending Owner Decisions

| ID | Decision | Recommendation | Required review |
|---|---|---|---|
| D-001 | Approve Milestone 0 foundation and ADR direction | Review as one coherent baseline | Owner plus named specialists |
| D-002 | Production PostgreSQL provider, region, tier, RPO/RTO | Managed private PostgreSQL; do not colocate on app EC2 | Database/Security/Architecture |
| D-003 | Authentication provider and admin MFA | Complete Auth.js vs managed-provider spike | Security/Architecture |
| D-004 | S3 delivery and CloudFront | Private S3; approve CDN after cost/security review | Security/Architecture |
| D-005 | Transactional communication provider | Select after privacy/delivery review | Product/Security |
| D-006 | Ghana delivery, tax, refund, privacy, and terms rules | Obtain owner/legal/business inputs before checkout | Product/Security |
| D-007 | Concern taxonomy and catalogue claims | Derive only from verified real catalogue | Product/Design/Security |
| D-008 | GitHub repository rules and secret scanning availability | Configure/verify manually after PR | Owner/Security |
| D-009 | Initial availability architecture | Begin controlled single EC2; define scaling trigger | Architecture/Owner |

No pending decision is accepted merely by being documented.
