# Environments

| Environment | Purpose | Data | Access | Deployment |
|---|---|---|---|---|
| Local | Developer feedback | synthetic only | developer | manual |
| Test/CI | automated validation | isolated synthetic fixtures | GitHub Actions | ephemeral |
| Staging | production-like release verification | synthetic/anonymized only | restricted team | protected workflow, future |
| Production | live commerce | live customer/order data | least privilege | owner-authorized only |

Environment configuration is validated at startup. Secrets are distinct per environment and never copied into source, logs, browser bundles, pull requests, or untrusted CI. Production access and data must never be required for ordinary development.

Promotion should use the same immutable artifact from a recorded verified revision where practical. `dev` feeds protected staging; only `main` feeds protected production. Production requires an explicit owner deployment approval independent of merge. Database migrations require environment-specific preflight, backup/restore readiness, and rollback analysis.
