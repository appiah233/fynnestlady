# Project Governance

## Authority

Eric Appiah Owusu owns product decisions, risk acceptance, production authorization, and merges. Agents advise and execute within assigned scope; they do not merge or deploy autonomously.

## Required Roles

- **ArchitectAgent:** boundaries, ADRs, integrations, maintainability, and scalability.
- **ProductAgent:** outcomes, requirements, priorities, acceptance criteria, and scope control.
- **DatabaseAgent:** schema, constraints, indexes, integrity, transactions, concurrency, and migration safety.
- **SecurityAgent:** threat model, identity, authorization, secrets, payment, uploads, privacy, abuse, and infrastructure boundaries.
- **DesignAgent:** mandatory before every storefront, admin UI, UX, checkout, account, responsive, or visual-system change.
- **Implementation agent:** implements only reviewed, bounded work.
- **TestingAgent:** independently verifies critical behavior and does not rely solely on implementer evidence.
- **FynnestladyPRBot:** inspects pull requests and returns a constrained verdict; it cannot merge.

One agent may document multiple perspectives during foundation work, but must record each role's analysis and cannot waive required independent review for implementation or release.

## Development Workflow

1. Confirm business outcome and definition of ready.
2. Read mandatory documents and coordination records.
3. Record task ownership in `ACTIVE_WORK.md`.
4. Investigate current state, invariants, failure modes, edge cases, tests, and rollback.
5. Obtain required architecture, product, database, security, and design reviews.
6. Work on a scoped branch with conventional commits.
7. Run proportionate validation and attach evidence.
8. Open a pull request using the template.
9. Obtain independent TestingAgent and FynnestladyPRBot inspection.
10. Eric reviews and alone decides whether to merge or release.

## Branches and Commits

Never develop directly on `main`. Use branches such as `docs/*`, `feat/*`, `fix/*`, or `security/*`. Use conventional commit prefixes: `feat`, `fix`, `security`, `refactor`, `test`, `docs`, `chore`, `perf`, and `ci`.

## Decision Governance

Material architecture choices require an ADR with context, options, decision status, consequences, risks, alternatives, and revisit conditions. Proposed ADRs are not accepted until required reviewers and Eric approve them. Decisions and unresolved owner choices are recorded in `docs/coordination/DECISIONS.md`.

## Review Gates

- SecurityAgent reviews identity, authorization, payment, uploads, customer data, secrets, infrastructure, and material dependency changes.
- DatabaseAgent reviews schema and migration changes plus money, order-history, transaction, and inventory invariants.
- DesignAgent reviews all product-facing and admin-facing UI/UX before implementation and critiques hierarchy, responsive behavior, accessibility, states, content, trust, and conversion friction.
- TestingAgent independently verifies critical customer and admin journeys.
- Critical/high verified security risks and broken commerce invariants block release unless Eric records explicit risk acceptance.

## Pull Requests and Deployment

Pull requests require complete scope, impact, evidence, risk, rollback, and coordination information. The PR bot may report `PASS FOR OWNER REVIEW`, `CHANGES REQUIRED`, `BLOCKED`, or `INSUFFICIENT EVIDENCE`; never merge approval. Production deployment requires a merged, reviewed commit, passing release gates, a rollback plan, and explicit owner authorization.

## Incidents and Rollback

Protect customers and evidence first. Contain exposure, preserve logs without sensitive-data leakage, notify Eric, document chronology and impact, and use the safest tested rollback or forward fix. Payment, inventory, order, and customer-data incidents receive priority. Conduct a blameless review and track corrective actions.

## Evidence

Evidence must be reproducible and may include exact commands, CI links, test/build results, screenshots, migration dry runs, security findings, commit SHA, and environment. Never substitute assertion for proof.

## Definition of Ready

A task is ready when its owner, business outcome, scope, non-goals, acceptance criteria, dependencies, risks, required reviews, impacted areas, test approach, and rollback considerations are known and coordination conflicts are cleared.

## Definition of Done

A task is done when acceptance criteria are met; required reviews and tests pass; security, accessibility, data, and operational impacts are addressed; documentation and coordination records are current; evidence is attached; known limitations are explicit; and the work is ready for Eric's review. Merge and production release are separate owner decisions.
