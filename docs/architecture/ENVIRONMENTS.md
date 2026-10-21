# Environments

| Environment | Purpose | Data | Access | Deployment |
|---|---|---|---|---|
| Local | Developer feedback | synthetic only | developer | manual |
| Test/CI | automated validation | isolated synthetic fixtures | GitHub Actions | ephemeral |
| Staging | production-like release verification | synthetic/anonymized only | restricted team | protected workflow, future |
| Production | live commerce | live customer/order data | least privilege | owner-authorized only |

Environment configuration is validated at startup. Secrets are distinct per environment and never copied into source, logs, browser bundles, pull requests, or untrusted CI. Production access and data must never be required for ordinary development.

Promotion should use the same immutable artifact from verified revision where practical. Database migrations require environment-specific preflight, backup/restore readiness, and rollback analysis.
