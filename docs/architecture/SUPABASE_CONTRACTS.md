# Supabase Domain Foundation Contracts

This work follows the [building memo](../governance/BUILDING_MEMO.md) and the owner-approved Supabase stack. The historical Prisma/AWS proposals in Milestone 0 do not govern implementation.

## Scope and data rules

The first migration establishes only the records needed to define catalogue, cart, order, payment, and inventory boundaries. It has no fabricated product data or live credentials. Money is `bigint` minor units (pesewas) with `GHS` constrained at the database boundary. Product is the merchandising identity; ProductVariant is the purchasable SKU. A simple product has one real variant.

`products` and `product_variants` are public only when active. `inventory` holds nonnegative on-hand and reserved counts. `inventory_movements.event_key` and `payment_events.provider_event_key` provide uniqueness for future idempotent services. The commerce service must update inventory and write a movement in one transaction under a row lock. Direct SQL grants for browser roles cannot mutate it.

`orders` and `order_items` store purchase-time address, name, SKU, quantity, and integer prices. `orders.total_minor` and `order_items.line_total_minor` are generated expressions. Commerce must check that sum of line totals equals subtotal in the same transaction; a later checkout function will encode this when delivery/tax rules are approved. An order row must not be rewritten after submission except for an authorized state transition, and that transition must add audit history in a later migration. Current RLS and grants deny browser mutation entirely.

`private.admin_memberships` is readable by `service_role` only. The private schema is not exposed through Supabase REST. Authentication work must use a reviewed security-definer RPC with an explicit permission contract or a direct trusted database connection for admin checks; it must not expose the private schema or infer admin status from customer-editable profile data. The browser roles have neither schema usage nor table access.

## Read and write contracts

| Actor | Read | Write |
|---|---|---|
| Anonymous | Active products and variants | None |
| Authenticated customer | Active catalogue and own profile, cart, orders, order items | None in this foundation |
| Trusted server with service role | All, subject to application authorization | Commerce transactions only |

The server must verify a customer's identity and resource ownership before using the service role; service role bypasses RLS. Never expose it to the browser. Customer clients pass a Clerk session token through Supabase's third-party Clerk integration, and RLS matches its verified `sub` claim to `clerk_user_id`. Configure the Clerk integration in both dashboards before customer access; UUID-only legacy rows remain invisible until migrated to verified Clerk ownership. Admin authority must be checked server-side against a separate role model, not user-editable metadata. Payments must be independently verified before setting success. Redirect parameters are not payment evidence.

## Dependencies and follow-up

CommerceAgent owns transactional checkout, immutable order enforcement, state transitions, inventory reservation/finalization, and subtotal reconciliation. PaymentsAgent owns verified Paystack events and reconciliation. SecurityAgent reviews grants and RLS, including negative cross-customer tests. AdminAgent cannot write through browser roles. Address shape, shipping/tax policy, and catalogue claim rules need ProductAgent decisions before checkout or publication.

Migrations are additive. The second migration adds a private admin-membership table and guards against mutation of purchase-time snapshots and inventory movement history. It does not grant browser access to admin roles. For a local disposable database the schema can be dropped wholesale; deployed environments need a forward migration rather than editing an applied file. No production migration is authorized by this branch.

## Independent local SQL check

`tests/database.test.mjs` requires a fresh disposable local PostgreSQL database, `DATABASE_TEST_URL` pointing at a database named with `test` or `fixture`, and `FYNNESTLADY_DATABASE_TEST_DISPOSABLE=1`. It applies the Auth stub, all timestamped migrations, and `supabase/tests/domain_foundation.sql` with `psql -X -v ON_ERROR_STOP=1`. The Auth stub must never be applied to Supabase. The assertion suite rolls back its fixtures. Without `DATABASE_TEST_URL` the general test run records this check as skipped; the bot database gate requires that variable and fails closed. This local test supplies simulated JWT claims to check RLS only; a real Clerk-signed token against a configured Supabase project must be verified before customer access is released.
