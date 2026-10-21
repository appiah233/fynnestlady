# Deployment and Rollback Runbook

This runbook is preparatory; Milestone 0 authorizes no deployment.

Before release, identify artifact SHA, accepted migrations, backup/restore evidence, health criteria, rollback trigger, responsible operator, and customer-impact window. Deploy only through an owner-authorized protected environment.

After deployment, verify liveness/readiness, representative read/write flow, logs/metrics, payment configuration without live charges, and migration status. If criteria fail, stop rollout and use the approved prior artifact where database compatibility permits.

Do not reverse irreversible payment/order events by code rollback. Reconcile them and apply an auditable forward correction. Record the final state and evidence.
