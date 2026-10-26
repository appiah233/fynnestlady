# Sprint 1 security baseline

This implementation follows the [building memo](../governance/BUILDING_MEMO.md) and the owner-directed Supabase/Vercel architecture. SecurityAgent owns this baseline; DatabaseAgent owns the executable RLS policies and negative SQL tests.

## Trust and roles

| Actor | Identity | Permitted access | Denied access |
| --- | --- | --- | --- |
| Anonymous visitor | Supabase anon | Published catalogue read | Profiles, carts, orders, inventory, payments, admin commands |
| Customer | Supabase Auth user ID | Published catalogue and own profile, cart, orders | Another customer's records, privileged writes, role assignment |
| Admin | Auth user ID plus server-verified role | Scoped administration through server commands | Direct browser use of service-role key or unrestricted table writes |
| Trusted server | Service-role credential in server-only runtime | Validated commerce and admin commands | Exposure to client bundle, logs, preview from untrusted PRs |
| Paystack | Signed webhook and independent transaction verification | One idempotent payment event transition | Arbitrary order updates from redirect parameters |

Admin status must be stored outside user-editable metadata and checked on every privileged server request. A hidden navigation item is not an authorization check. Deny by default when identity, role, or resource ownership is uncertain.

## RLS matrix

| Resource | Anonymous | Customer | Admin browser | Trusted server |
| --- | --- | --- | --- | --- |
| Published products/variants | Read | Read | Read | Managed mutation |
| Profile and addresses | None | Own read and narrowly validated own mutation | No direct cross-user read | Scoped lookup/update |
| Cart and items | None | Own read; writes through validated server commands | None | Authoritative update |
| Orders and items | None | Own read | No direct table access | Scoped order operations |
| Inventory, payment, audit | None | None | None | Validated operations only |

DatabaseAgent must prove the matrix with `anon`, customer A, customer B, and service-role contexts. A positive policy test alone cannot prove tenant isolation. New tables start with RLS enabled and no broad write policy.

## Credentials and environments

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are intentionally public. `SUPABASE_SERVICE_ROLE_KEY`, Paystack secret, and any signing or database administration credentials are server-only. Client modules must never import the service-role environment accessor. Reject startup or protected operations when required values are absent; do not silently fall back to production.

Local uses disposable development credentials. Preview uses isolated Supabase development resources and Paystack test mode. Production uses separate projects and credentials, accessible only through a protected deployment environment. No production customer data or live payments are used in development. Pull-request workflows must not receive production secrets.

## Authentication and administration plan

Use Supabase Auth for signup, login, logout, recovery, and session refresh. Confirm user identity server-side with the Supabase auth API before protected actions. Validate redirect destinations against an allowlist. Use generic recovery responses to limit account discovery, and rate-limit authentication and recovery operations. Establish admin assignments through a privileged, audited operation; customer-editable profile data cannot confer admin status.

## Negative acceptance cases

1. Customer A cannot read or alter Customer B's profile, cart, order, or address by changing an ID.
2. Anonymous and customer requests to admin operations return denial before data access.
3. A customer changing their own metadata cannot become an admin.
4. A browser build contains no service-role or Paystack secret value.
5. A forged or repeated Paystack event cannot create a successful payment; the repeated valid event creates one effect.
6. A browser-submitted price, discount, or stock assertion cannot change authoritative totals or inventory.
7. Unauthenticated requests cannot read inventory, payments, or audit rows.

## Review gate

SecurityAgent reviews auth, RLS, checkout, payments, admin, uploads, environment and workflow changes. TestingAgent independently executes negative cases before integration. A failed denial case blocks the work item. Production release additionally requires secret-scanning, dependency and workflow review, migration recovery evidence, and approved environment boundaries.
