# Sprint 1 security baseline

This plan follows the [building memo](../governance/BUILDING_MEMO.md) and the owner-directed stack in ADR-014. It replaces the historical Auth.js/AWS proposals for implementation. Scope is the local, preview, and production Next.js 15, Supabase, Vercel, and Paystack boundaries. It is a test contract, not a release approval.

## Assets and trust boundaries

| Asset or boundary | Threat | Required control | Negative evidence |
|---|---|---|---|
| Browser to Next.js | Forged user, price, discount, order ID, redirect, or upload | Validate input, resolve identity on server, calculate money and stock on server, check object ownership | Tampered requests fail without state change |
| Browser to Supabase | Cross-customer reads/writes and admin escalation | RLS on every exposed table; deny by default; no user-writable role field | Customer A cannot read B's order; customer cannot grant admin |
| Next.js to Supabase | Service key leak or bypass of policy | Public client uses only anon/publishable key; privileged client stays in server-only modules and checks authorization before mutation | Browser bundle/config scan finds no service role key; anonymous admin call is denied |
| Paystack to webhook | Forged, replayed, or mismatched success | Raw-body HMAC verification, server-side transaction verification, reference/amount/currency comparison, unique event processing | Invalid signature, duplicate event, wrong amount/currency cannot mark paid |
| Admin to commerce | Unauthorized pricing, stock, or order changes | Server checks an active admin membership for each operation; separate privileges by command; audit sensitive actions | Customer and anonymous users fail direct admin requests |
| GitHub CI to Vercel/Supabase | Untrusted PR obtains deployment credentials | No production secrets in PR jobs or preview; protected production environment; exact SHA gates | Fork PR cannot access production secret or deploy |
| Supabase Storage | Unauthorized upload/read or active content | Bucket policies, validated type/size/content, randomized keys, safe delivery | Customer cannot overwrite another upload or upload active content |

## Role and RLS matrix

`anon` means no authenticated customer session. `customer` means a Clerk user whose session token Supabase has verified through its Clerk third-party integration. `admin` means an authenticated user with a valid server-checked membership in the private admin table; a browser claim or hidden link is insufficient. `service_role` is a server-only system capability, never a customer role.

| Resource | anon | customer | admin | service role |
|---|---|---|---|---|
| Active catalogue and public taxonomy | read | read | read | read/write |
| Draft catalogue, inventory, payment events | deny | deny | server-mediated operations only | read/write |
| Customer profile | deny | own row read; updates through a validated server command | server-mediated lookup | read/write |
| Order and order item | deny | own row read; no direct write | server-mediated lookup/commands | read/write |
| Private admin membership | deny | deny, including self-insert/update | server-mediated, separately authorized | read/write |
| Checkout, refund, product, stock commands | deny | allowed only by appropriate server command | allowed only by appropriate server command | technical execution after authorization |

All exposed tables must explicitly enable RLS. The first migration uses `public.profiles`, `public.carts`, `public.cart_items`, `public.orders`, and `public.order_items` for customer-owned records; it has no direct browser write grant. Do not grant browser clients direct write access to orders, payments, inventory, or administrator membership. RLS also applies to reads; server-side checks protect privileged operations that use a bypassing service role.

## Authentication and administration contract

- Use Clerk for signup, login, logout, recovery, and session refresh. Configure Supabase's Clerk third-party auth integration and pass the Clerk session token for customer queries. RLS compares the verified token subject with `clerk_user_id`; server operations never trust a submitted user ID, email, role, or unverified JWT payload.
- Return generic recovery results to avoid account enumeration. Rate-limit login, signup, recovery, checkout, and admin endpoints with a shared backing store before production.
- Session cookies must be Secure in HTTPS, HttpOnly where the SDK supports it, and configured for suitable SameSite and path scope. Evaluate CSRF on every cookie-authenticated mutation; use same-origin checks and explicit tokens when needed.
- Put admin membership in a private schema with no browser grants. The first administrator is provisioned through an audited server-side procedure. Customers cannot assign or change this membership.
- Check the active membership on the server for every admin command. Use narrower permissions for catalogue, inventory, orders, and user administration when those commands are built. Log actor, action, target, outcome, and request ID without sensitive payloads.
- No production customer data or live Paystack payments are used for development or tests.

## Environment and secret classification

| Variable/capability | Browser | Local | Preview/development | Production |
|---|---|---|---|---|
| Supabase URL and anon/publishable key | allowed | local project | nonproduction project | production project |
| Supabase service role key | forbidden | local only if necessary | nonproduction server only | production server only |
| Paystack public key | allowed when payment UI is built | test mode | test mode | live mode |
| Paystack secret key and webhook secret | forbidden | test credentials, server only | test credentials, server only | live credentials, server only |
| Database connection string, CI App token | forbidden | local scoped values | scoped CI/server values | protected environment only |

The committed `.env.example` should list only approved variable names and blank placeholders. Preview must use separate Supabase and Paystack test resources. Logs, build artifacts, and client bundles must exclude private values. Rotate any exposed key and invalidate affected sessions/tokens where applicable.

## Acceptance and handoff

SecurityAgent reviews migration RLS and writes negative tests before authentication or commerce implementation. DatabaseAgent owns migration SQL. ArchitectAgent owns client boundaries and environment validation. DevOpsAgent owns CI secret isolation. TestingAgent independently runs negative tests and records a pass or reject verdict. The first sprint cannot claim security completion until an isolated local Supabase project runs the RLS tests, the browser build is checked for private keys, and the admin denial tests pass. The current app has no authentication routes or admin commands, so those runtime checks are pending their workstreams.
