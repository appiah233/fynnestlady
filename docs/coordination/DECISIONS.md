# Decision Log

## 2026-10-28 owner decision: evidence without Gemini API

Eric confirmed no Gemini API key is available and directed removal of that dependency from the evidence gate for PR #47. Automated role reports are deterministic, identified as such in the evidence manifest, and remain tied to the exact head SHA. Independent human approval, all required checks, protected branches, and the initial production hold remain in force. The controller update is tracked in issue #49 and PR #50. Any one-time merge exception needed to install the new trusted controller requires a separate explicit owner decision; this decision does not authorize bypassing a failing required check.


## 2026-10-26 owner-directed implementation update

The owner's active-development instruction and ADR-014 supersede the historical stack proposals in D-001 through D-004 and D-009: implementation uses Next.js 15, Supabase PostgreSQL/Auth/Storage, Vercel, Paystack, and GitHub with Playwright. The historical table below is retained for traceability. D-006 (Ghana delivery, tax, refund, privacy, and terms) and D-007 (verified catalogue and concern taxonomy) remain open before checkout or product publication. Existing `main` and `dev` branches supersede D-010's original bootstrap observation; protected branch and bot identity verification remain delivery gates.

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
| D-010 | Bootstrap and protect permanent `main` and `dev` branches | Owner establishes base branches, prevents force-push/deletion/direct changes, and configures required checks | Owner/Security |
| D-011 | Configure `staging` and protected `production` environments | Require owner production approval and restrict deployment branches | Owner/Security/Architecture |

No pending decision is accepted merely by being documented.
