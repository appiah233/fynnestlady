# Proposed Data Model

Status: **Proposed; DatabaseAgent review and an accepted ADR are required before schema implementation.**

## Recommendation

Use managed PostgreSQL in production, subject to owner approval of provider, region, cost, backups, and recovery targets. Use Prisma after a Milestone 1 compatibility and migration-safety review. Store money as signed 64-bit integer minor units with ISO currency code; reject arithmetic across currencies.

## Logical Model

| Area | Principal records | Important constraints/indexes |
|---|---|---|
| Identity | User, CustomerProfile, Address, Role assignment, ResetToken | unique normalized email; expiring hashed tokens; role uniqueness |
| Catalogue | Product, ProductVariant, Category, Collection, ProductImage | unique slugs/SKUs; variant belongs to product; status indexes |
| Discovery | Concern, ProductConcern, ProductCategory, ProductCollection | unique joins; managed slug; publish state |
| Content | Ingredient, ProductIngredient, ContentPage, review metadata | normalized names; source/review status; ordered joins |
| Inventory | InventoryItem, InventoryMovement, InventoryReservation | one item/variant; movement idempotency; reservation expiry indexes |
| Cart | Cart, CartItem | unique cart/variant item; positive quantity; expiry/customer indexes |
| Orders | Order, OrderItem, OrderAddressSnapshot, OrderStatusEvent | unique public reference; immutable snapshots; customer/status/date indexes |
| Payments | Payment, PaymentAttempt, PaymentWebhookEvent | unique provider reference/event; idempotency keys; order/provider indexes |
| Promotions | Discount, Coupon, redemption/eligibility records | normalized unique code; validity and usage constraints |
| Fulfilment | Shipment, ShipmentEvent | order/index; tracking uniqueness where applicable |
| Governance | AuditLog | actor/action/target/time indexes; append-oriented retention |

## Snapshot Policy

Order items copy SKU, product/variant name, selected attributes, unit price, discount allocation, tax where applicable, quantity, and line total. Orders copy billing/delivery address values, currency, subtotal, discounts, delivery, tax, and grand total. Later catalogue/address edits never rewrite them.

## Inventory Strategy

Maintain an InventoryItem version or row lock plus append-only movements. At checkout, atomically create a bounded reservation or decrement an available balance only if sufficient stock exists. Payment success finalizes exactly once; expiry/cancellation releases exactly once. Reconciliation compares balance projections with movements.

## Transaction Boundaries

- Product publication validates the complete aggregate.
- Checkout reads authoritative inputs and atomically creates pending order plus reservation.
- Webhook ingestion stores a unique raw-event digest/reference before processing.
- Payment transition and order/inventory effects execute in a transaction or through an idempotent recovery workflow where external calls prevent one transaction.
- Refund/cancellation writes state event, inventory effect, and audit evidence consistently.

## Concurrency and Integrity

Use database uniqueness, foreign keys, check constraints where Prisma/PostgreSQL support them, and transactions—not pre-checks alone. Test simultaneous last-item checkout, duplicate webhooks, repeated callback, coupon exhaustion, stale cart, reservation expiry races, and concurrent admin adjustments.

## Migration Policy

Use reviewed, forward-compatible migrations; expand/migrate/contract for breaking changes; back up before risky production changes; rehearse rollback/restore; never edit applied migration history silently.
