# Initial Roadmap

Every milestone follows the building memo, project governance, required specialist reviews, and owner gates.

1. **Foundation:** business, brand, governance, coordination, architecture, domain/data/security/design direction, testing, GitHub workflow, and PR inspection.
2. **Engineering foundation:** verify current secure versions; initialize Next.js/TypeScript/Tailwind; tokens/components; environment validation; data tooling; tests; observability; health endpoint.
3. **Commerce data model:** catalogue, taxonomy, concerns, verified content, inventory, migrations, and integrity/concurrency tests.
4. **Authentication and authorization:** customer/admin identity, RBAC, recovery, session security, and negative tests.
5. **Admin:** safe catalogue, media, pricing, inventory, publishing, order, and audit workflows.
6. **Storefront:** reviewed design system, discovery, search/filter, product details, About/guidance, responsive and accessible implementation.
7. **Cart and checkout:** persistence, addresses, authoritative pricing, delivery, discounts, reservations, and checkout.
8. **Paystack and orders:** initialization, verification, webhooks, idempotency, reconciliation, order lifecycle, inventory finalization, and communication.
9. **AWS integration:** reviewed IAM/S3/EC2/NGINX/TLS/secret/backup/observability configuration; no action without owner authorization.
10. **Production readiness:** end-to-end, security, accessibility, performance, backup restore, rollback, operational verification, and owner release decision.

Sequence challenge: authentication may begin after the commerce model contract, but admin UI should not precede identity/RBAC. AWS runtime hardening and delivery design should be proven before late-stage release, while irreversible production changes remain deferred.
