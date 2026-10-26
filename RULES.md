# Fynnestlady Project Rules

## Authority

Eric Appiah Owusu is the project owner and final merge authority.

AI agents may plan, investigate, create branches, implement, test, review, inspect pull requests, comment, recommend, and request changes. AI agents may not merge pull requests, enable auto-merge, bypass required checks, approve their own change as owner, alter repository governance without authorization, or deploy to production without authorization.

Final merge authority belongs exclusively to Eric Appiah Owusu.

## Mandatory Reading

Before work, read in order:

1. `RULES.md`
2. `docs/governance/BUILDING_MEMO.md`
3. `docs/governance/PROJECT_GOVERNANCE.md`
4. `docs/architecture/ARCHITECTURE.md`
5. `docs/architecture/DOMAIN_MODEL.md`
6. `docs/architecture/SECURITY_MODEL.md`
7. `docs/coordination/COORDINATION.md`
8. `docs/coordination/ACTIVE_WORK.md`
9. Relevant ADRs
10. Current task and handoff

## Investigation First

Before implementation, define the problem and current state; identify scope, non-goals, assumptions, dependencies, impacted files, risks, edge cases, test design, and rollback considerations. Every execution plan and roadmap must reference the building memo unless Eric explicitly directs otherwise.

## Scope

- Never modify unrelated modules or silently change public contracts.
- Never refactor solely because another design is preferred.
- Never rewrite working architecture without an accepted reason and ADR.
- Never hide errors, weaken tests, or suppress security controls to obtain a green status.
- Do not build directly on `main`.
- `main` is the production branch; `dev` is the integration branch.
- Working branches normally target `dev`; reviewed release pull requests promote `dev` to `main`.
- Agents and bots may not merge, squash-merge, rebase-merge, enable auto-merge, force-push, or silently promote either permanent branch.

## Evidence

Do not claim work is done, fixed, secure, or ready without evidence. Completion claims require evidence appropriate to the change: tests, build output, lint, typecheck, screenshots, API evidence, database verification, security results, Git status, and commit SHA.

## Security

Never commit `.env`, private keys, AWS credentials, Paystack secret keys, database credentials, private authentication secrets, or production tokens. Never expose secrets in logs or pull-request comments. Use least privilege and treat verified critical or high risks as release blockers unless the owner records risk acceptance.

## Commerce

- The server controls prices, totals, discounts, and valid state transitions.
- Payment is independently verified; browser redirects are not proof of payment.
- Webhooks are authenticated, idempotent, replay-safe, and auditable.
- Inventory is concurrency-safe and movements retain history.
- Historical orders preserve purchase-time product, price, address, tax, discount, and delivery values.
- Payment state and order state remain separate.

## Skincare Content

Never fabricate products, ingredients, safety information, clinical evidence, recommendations, or efficacy claims. Do not diagnose. Unsupported health or skincare claims require human content verification.

## UX

UI work requires DesignAgent involvement before implementation. Mobile, desktop, interaction states, and WCAG 2.2 AA accessibility require verification.

## Database

DatabaseAgent reviews material schema changes. Migrations require safety and rollback analysis. No destructive production migration may occur without explicit review.

## Deployment

No deployment from an unreviewed pull request. No autonomous production deployment without explicit owner authorization.

Production candidates originate only from approved `main` revisions through a protected production environment with explicit owner deployment approval. Pull-request code and the production EC2 host must never serve as a general-purpose CI runner with production credentials.
