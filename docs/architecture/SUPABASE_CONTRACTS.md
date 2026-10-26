# Supabase Domain Foundation Contracts

This work follows the [building memo](../governance/BUILDING_MEMO.md) and the owner-approved Supabase stack. The historical Prisma/AWS proposals in Milestone 0 do not govern implementation.

## Scope and data rules

The first migration establishes only the records needed to define catalogue, cart, order, payment, and inventory boundaries. It has no fabricated product data or live credentials. Money is `bigint` minor units (pesewas) with `GHS` constrained at the database boundary. Product is the merchandising identity; ProductVariant is the purchasable SKU. A simple product has one real variant.

`products` and `product_variants` are public only when active. `inventory` holds nonnegative on-hand and reserved counts. `inventory_movements.event_key` and `payment_events.provider_event_key` provide uniqueness for future idempotent services. The commerce service must update inventory and write a movement in one transaction under a row lock. Direct SQL grants for browser roles cannot mutate it.

`orders` and `order_items` store purchase-time address, name, SKU, quantity, and integer prices. `orders.total_minor` and `order_items.line_total_minor` are generated expressions. Commerce must check that sum of line totals equals subtotal in the same transaction; a later checkout function will encode this when delivery/tax rules are approved. An order row must not be rewritten after submission except for an authorized state transition, and that transition must add audit history in a later migration. Current RLS and grants deny browser mutation entirely.

## Read and write contracts

| Actor | Read | Write |
|---|---|---|
| Anonymous | Active products and variants | None |
| Authenticated customer | Active catalogue and own profile, cart, orders, order items | None in this foundation |
| Trusted server with service role | All, subject to application authorization | Commerce transactions only |

The server must verify a customer's identity and resource ownership before using the service role; service role bypasses RLS. Never expose it to the browser. Admin authority must be checked server-side against a separate role model, not user-editable metadata. Payments must be independently verified before setting success. Redirect parameters are not payment evidence.

## Dependencies and follow-up

CommerceAgent owns transactional checkout, immutable order enforcement, state transitions, inventory reservation/finalization, and subtotal reconciliation. PaymentsAgent owns verified Paystack events and reconciliation. SecurityAgent reviews grants and RLS, including negative cross-customer tests. AdminAgent cannot write through browser roles. Address shape, shipping/tax policy, and catalogue claim rules need ProductAgent decisions before checkout or publication.

Migration is additive. For a local disposable database it can be dropped wholesale; deployed environments need a forward migration rather than editing the applied file. No production migration is authorized by this branch.
