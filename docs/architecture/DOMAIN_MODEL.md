# Domain Model

## Core Language

- **Product:** merchandised identity and verified descriptive content; not directly purchasable when variants exist.
- **ProductVariant:** genuine purchasable option with unique SKU, precise price, and inventory identity.
- **Concern:** administrator-managed discovery concept. Association means a product may be explored for a stated concern, never that it cures a condition.
- **Cart:** mutable purchase intent; prices shown are estimates until server checkout validation.
- **Order:** durable commercial record with purchase-time snapshots and controlled state.
- **Payment:** provider-independent financial state associated with an order; separate from order state.
- **InventoryMovement:** auditable change or reservation effect on a variant's stock position.
- **Shipment:** fulfilment record separate from payment and order acceptance.

## Aggregates

- **Catalogue aggregate:** Product root; variants, images, content, concern/category/collection links governed by publication rules.
- **Inventory aggregate:** InventoryItem root per variant; movements and reservations enforce availability invariants.
- **Cart aggregate:** Cart root with items identified by variant and quantity.
- **Order aggregate:** Order root with items, totals, addresses, and controlled transitions.
- **Payment aggregate:** Payment root with attempts and webhook events.
- **Customer aggregate:** User/CustomerProfile root with addresses; order snapshots do not point to mutable address values for history.

Taxonomies, content, discounts, shipments, and audit records have separate lifecycle rules and ownership.

## Invariants

- Every purchasable variant has a unique SKU, valid currency, non-negative integer minor-unit price, and explicit publication/availability state.
- A product without genuine variation still has one purchasable variant; variants are never invented for presentation.
- Published products satisfy mandatory verified-content rules.
- Cart input cannot set authoritative price, discount, tax, delivery fee, or order total.
- Order totals equal validated component totals in one currency and do not use floating point.
- Submitted order snapshots do not change when catalogue or customer addresses change.
- Payment success requires independently verified provider evidence processed idempotently.
- Available inventory never becomes negative; every material stock change is attributable to a movement.
- State transitions follow explicit allowlists and privileged transitions are audited.
- Soft deletion/unpublication does not destroy order, payment, inventory, or audit history.

## Lifecycle Sketches

- Product: `DRAFT → ACTIVE → ARCHIVED`, with review returning to draft where needed.
- Order: `PENDING_PAYMENT → PAID → PROCESSING → FULFILLED`, with constrained cancellation/failure/refund paths.
- Payment: `PENDING → SUCCEEDED | FAILED`, with separate refund lifecycle and reconciliation.

Exact enums and transition tables remain proposed until product, database, and payment reviews.
