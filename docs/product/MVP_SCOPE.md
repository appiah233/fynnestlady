# MVP Scope

## In Scope

- Storefront: home, catalogue, category/collection/concern discovery, search/filter, product detail, About, guidance content, cart, checkout, and order confirmation.
- Customer: registration, sign-in, password reset, profile, addresses, order history, and order status.
- Commerce: genuine variants, GHS minor-unit pricing, inventory, discounts, server totals, Paystack payment, orders, shipment state, and transactional communication.
- Administration: secure RBAC, products, variants, media, taxonomy, concerns, ingredients/content, pricing, inventory, publishing, orders, fulfilment, discounts, audit history, and basic reporting.
- Platform: Supabase PostgreSQL/Auth/Storage, Vercel, observability, backups, CI gates, accessibility, security controls, and documented deployment/rollback.

## Explicit Non-goals

AI diagnosis or medical recommendations, native apps, microservices, Kubernetes, multi-vendor commerce, loyalty, advanced ML recommendations, international multi-currency, advanced marketing automation, and warehouse-management functionality.

## Acceptance Criteria

- Critical customer and admin journeys pass independent end-to-end verification.
- Prices and discounts are server-authoritative; payments independently verified and idempotent.
- Inventory resists concurrent oversell; order snapshots remain immutable.
- Access is deny-by-default and admin operations are auditable.
- Representative 320px through large-desktop layouts meet WCAG 2.2 AA targets.
- Product and skincare content contains no fabricated or unreviewed claims.
- Backup restore, deployment rollback, monitoring, and incident paths have evidence.

## Scope Control

New capabilities require a business outcome, acceptance criteria, impact review, and owner prioritization. Deferred features do not enter MVP by convenience.
