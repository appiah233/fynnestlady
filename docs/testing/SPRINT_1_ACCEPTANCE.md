# Sprint 1 acceptance contract

This contract follows the [building memo](../governance/BUILDING_MEMO.md): customer clarity, mobile access, security, and correctness are release requirements. TestingAgent defines the checks before integrated implementation and independently records evidence against an exact commit. A passing build alone is insufficient.

## Design system and shell — issue #8

| ID | Given / when | Required outcome | Evidence |
| --- | --- | --- | --- |
| DS-01 | A customer opens the shell at 320, 375, 390, 430, 768, 1024, and 1440 CSS pixels | No horizontal overflow or clipped controls; navigation and primary action remain usable | Playwright screenshots and overflow assertion at each width |
| DS-02 | Keyboard user starts at document top and tabs through navigation, form and buttons | Skip link becomes visible, focus order is logical, focus indicator remains visible, and controls can activate without a pointer | Keyboard trace and manual review |
| DS-03 | A field has a validation error | Persistent label, `aria-invalid`, associated text error, and preserved entered value | Component assertion and accessibility scan |
| DS-04 | An action loads or a dialog/drawer opens | Repeated action is disabled; status is announced; overlay focus stays inside and returns to trigger on close | Interaction test |
| DS-05 | Customer zooms to 200% or requests reduced motion | Content reflows and animations do not block understanding | Browser review |
| DS-06 | Brand logo is displayed | Official image retains aspect ratio and alt text; small text is not cropped or used as an icon | Screenshot and asset review |

The current design PR supplies tokens and initial primitives; it does not yet supply the integrated shell, navigation, drawers, or dialogs. Those rows remain open until storefront integration.

## Supabase data foundation — issue #9

| ID | Given / when | Required outcome | Evidence |
| --- | --- | --- | --- |
| DB-01 | Migrations run on a clean disposable Supabase/PostgreSQL database | Repeatable schema with constraints and indexes, no manual edits | CLI output and schema inspection |
| DB-02 | Variant is priced in GHS | Price is an integer minor unit, nonnegative, with unique SKU and separate product identity | Constraint tests |
| DB-03 | Order is created, then product or address changes | Historical item, amount, and address snapshots remain unchanged | Integration test |
| DB-04 | Two callers attempt last-stock allocation | At most one succeeds; stock never negative; movement remains attributable | Concurrent transaction test |
| DB-05 | The same payment event is submitted twice | Unique event identity prevents duplicate effect | Constraint/integration test |
| DB-06 | A migration fails during rollout | Recovery or forward repair path is documented and tested on disposable data | Migration exercise |

## Application architecture — issue #10

| ID | Given / when | Required outcome | Evidence |
| --- | --- | --- | --- |
| AR-01 | Fresh checkout installs dependencies and builds | Next.js 15 application typechecks, lints, tests, and produces a production build | Exact CI commands and outputs |
| AR-02 | Required public Supabase variables are absent or malformed | Configuration fails clearly before client creation, without logging secret values | Unit test |
| AR-03 | Client bundle is inspected | Service-role and Paystack secret values are absent; public anon key is intentionally public | Build artifact search with synthetic canary values |
| AR-04 | Browser accesses the shell on mobile and desktop | Correct route and asset rendering; no runtime console error | Playwright and screenshots |
| AR-05 | Package and source tree are scanned | Approved stack only; no AWS, Prisma, or Auth.js dependency introduced | Architecture gate and lockfile review |

## Security baseline — issue #11

| ID | Given / when | Required outcome | Evidence |
| --- | --- | --- | --- |
| SE-01 | Anonymous user requests profile, cart, orders, inventory or payment data | No private row is returned | Negative RLS test |
| SE-02 | Customer A requests Customer B's profile, cart, order or address | No row is returned and no mutation succeeds | Negative RLS and API tests |
| SE-03 | Customer edits user metadata or requests admin endpoint | Admin authority is unchanged and endpoint denies access server-side | Auth/admin negative test |
| SE-04 | Browser submits forged price, discount or stock | Server ignores claims and computes from authoritative records | Commerce integration test when available |
| SE-05 | Webhook signature or verified amount/currency mismatches | Payment cannot transition to success | Paystack test when available |
| SE-06 | Preview deployment runs | Production credentials and customer data are absent | Environment audit |

Security tests must use separate identities for anonymous, customer A, customer B and trusted server. Passing owner reads alone does not prove isolation.

## Integration verdict

Record each result as pass, fail, or pending with commit SHA, environment, command, output link, and reviewer. Pending is never treated as pass. DesignAgent signs off visual critique; SecurityAgent signs off the trust boundary; DatabaseAgent signs off migrations; TestingAgent issues an independent pass or rejection. CI and production build must pass before the sprint can close. Routine merges require the engineering bot's protected gates and independent evidence.
