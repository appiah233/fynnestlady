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

Milestone 0 CI validates only. Future deployment requires explicit owner approval, a protected environment, immutable build artifact, commit provenance, preflight/migration plan, post-deploy health check, and rollback. Pull requests never deploy production simply because they open.

## Data and Recovery

Use managed PostgreSQL automated backups and point-in-time recovery where approved. Enable S3 versioning/lifecycle as appropriate. Encrypt at rest and in transit. Define RPO/RTO in Milestone 1, rehearse restoration, and retain evidence.

## Observability

Provide liveness and dependency-aware readiness separately, structured application/NGINX logs, metrics for latency/errors/resources, and alerts for health, disk, certificate, payment mismatches, and inventory failures. Do not log secrets or excessive customer data.

## Rollback

Retain the prior artifact and configuration, use backward-compatible database changes, and define decision criteria. Rollback must not silently reverse irreversible commerce events; reconciliation and forward repair may be safer for orders/payments.
