# Architecture

Status: **Historical Milestone 0 proposal, superseded for implementation by ADR-014 and `.github/fynnestlady/architecture-policy.yml` on 2026-10-26.** The owner-directed stack is Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase PostgreSQL/Auth/Storage, Vercel, Paystack, GHS, Playwright, and WCAG 2.2 AA. The AWS, Prisma, Auth.js, and Next.js 16 text below remains as decision history and must not guide new implementation. See the building memo and ADR-014.

## Recommendation

Use a TypeScript modular monolith built with a security-patched Next.js 16 release on Node.js 22. Keep domain modules behind explicit application interfaces. Use PostgreSQL as the commerce system of record, Prisma as the proposed data-access/migration tool, Zod at trust boundaries, S3 for media, Paystack for payment, and NGINX in front of the application on EC2.

This foundation does not lock package versions or accept Auth.js. Milestone 1 must verify current supported versions, compatibility, security posture, and operational fit before installation.

## System Context

Customers and administrators use the web application over HTTPS. The application alone performs trusted commerce decisions and communicates server-to-server with PostgreSQL, Paystack, S3, and communication providers. GitHub Actions validates changes but has no production deployment path from pull requests.

## Module Boundaries

- **Identity and access:** users, sessions, credentials/federation, password reset, roles, permissions.
- **Catalogue:** products, genuine variants, categories, collections, product content, publication.
- **Discovery:** managed concerns, search/filter projections, guides, and merchandising labels.
- **Pricing and promotions:** authoritative prices, eligibility, discount calculation.
- **Inventory:** stock item, reservation/finalization policy, append-only movement history.
- **Cart:** customer/guest intent; never an authoritative price ledger.
- **Checkout:** validates address, stock, price, discount, and creates a pending order.
- **Orders:** immutable purchase snapshots, controlled lifecycle, fulfilment coordination.
- **Payments:** provider attempts/events, independent verification, idempotent transitions.
- **Media:** metadata, upload policy, S3 object lifecycle, delivery URLs.
- **Content:** managed pages and educational content with review state.
- **Administration and audit:** authorized commands, reporting projections, audit events.

Modules may call documented application services, not another module's persistence internals. Cross-module workflows are orchestrated in application services and transactional boundaries are explicit.

## Trust Boundaries

Browser input, headers, uploaded files, webhooks, provider callbacks, database-derived rich content, environment configuration, and CI artifacts are untrusted until validated. Authorization runs server-side for every protected operation. Prices and totals are loaded/calculated server-side.

## Runtime Qualities

Start as one deployable application to reduce consistency and operational complexity. Design stateless request handling, structured logging with redaction, health/readiness separation, graceful shutdown, bounded retries, idempotency, and externalized media/database state. Reassess multiple instances only after shared session/rate-limit/idempotency concerns are resolved.

## Alternatives Challenged

- Microservices add distributed transactions and operational burden before demonstrated need.
- PostgreSQL on the application EC2 couples failures and backup duties; managed PostgreSQL is preferred pending owner cost/region approval.
- Direct public S3 objects simplify delivery but weaken access and transformation control; private origin plus scoped delivery is preferred.
- Client-heavy commerce logic improves perceived responsiveness but cannot be authoritative.
