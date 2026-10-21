# Proposed Deployment Architecture

Status: **Documentation only. No AWS changes are authorized by this foundation.**

## Topology

`Internet → DNS/TLS → NGINX on EC2 → Node.js application → managed PostgreSQL`

The application uses an EC2 IAM role to access a private S3 media bucket and a secret store. It communicates outbound to Paystack and an approved transactional communication provider. CloudFront is recommended for media delivery when cost and configuration are approved.

## Host Boundaries

- Expose only HTTPS and tightly controlled HTTP redirect/certificate validation.
- Keep the Node.js port bound to loopback or a private interface behind NGINX.
- Do not expose PostgreSQL publicly or install it on the application EC2 by default.
- Run the app as a non-root service user with a process manager/service definition, resource bounds, graceful restart, and health checks.
- Patch Amazon Linux, Node.js, NGINX, and dependencies through a controlled maintenance process.

## Delivery

Milestone 0 CI validates only. Working branches target `dev`; after an owner-approved merge, the exact revision may later deploy to staging. Production candidates move by release PR from `dev` to `main`. Future production deployment requires full CI, an approved `main` revision, explicit owner approval, a protected `production` environment, immutable build artifact, commit provenance, preflight/migration plan, post-deploy health check, and rollback. Pull requests and `dev` never deploy production.

GitHub-to-AWS authentication should use OIDC and a least-privilege deployment IAM role. Never provide production credentials to pull-request jobs or use the production EC2 application server as a general-purpose self-hosted runner.

## Data and Recovery

Use managed PostgreSQL automated backups and point-in-time recovery where approved. Enable S3 versioning/lifecycle as appropriate. Encrypt at rest and in transit. Define RPO/RTO in Milestone 1, rehearse restoration, and retain evidence.

## Observability

Provide liveness and dependency-aware readiness separately, structured application/NGINX logs, metrics for latency/errors/resources, and alerts for health, disk, certificate, payment mismatches, and inventory failures. Do not log secrets or excessive customer data.

## Rollback

Retain the prior artifact and configuration, use backward-compatible database changes, and define decision criteria. Rollback must not silently reverse irreversible commerce events; reconciliation and forward repair may be safer for orders/payments.
