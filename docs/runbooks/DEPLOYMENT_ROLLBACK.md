# Deployment and Rollback Runbook

This runbook is preparatory; Milestone 0 authorizes no deployment. The production kill switch remains off until the owner completes the initial control-plane validation and enables production mode.

Before release, identify artifact SHA, accepted migrations, backup/restore evidence, health criteria, rollback trigger, responsible operator, and customer-impact window. Deploy only through an owner-authorized protected environment.

After deployment, verify liveness/readiness, representative read/write flow, logs/metrics, payment configuration without live charges, and migration status. A failed production smoke run starts the rollback workflow only when both bot and production switches are enabled. The bot verifies that the failed deployment is still the current Vercel production release, checks the commit range for database migrations, rolls production traffic back to the prior ready deployment, and verifies `/api/health` at `VERCEL_PRODUCTION_URL`.

The bot records the failed deployment, smoke run, rollback outcome, and reason in a GitHub incident issue and comments on the merged release PR when it can identify one. It does not roll back database changes, payments, orders, or inventory. If the failed release is no longer current, migration files changed, the previous deployment cannot be identified, or health verification fails, it stops and reports the exact blocker instead of rolling back a newer release or claiming recovery.

Automatic recovery requires the `VERCEL_TOKEN` Actions secret and `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and `VERCEL_PRODUCTION_URL` repository variables. Configure these only after the owner-authorized production setup. The token must be scoped to the Vercel team and project with deployment rollback access.

Do not reverse irreversible payment/order events by code rollback. Reconcile them and apply an auditable forward correction. Record the final state and evidence.
