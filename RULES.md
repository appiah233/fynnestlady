# Fynnestlady Project Rules

## Authority

Eric Appiah Owusu is the project owner and retains authority over architecture exceptions, risk acceptance, credentials, and branch-protection changes. The owner has authorized Fynnestlady Engineering Bot to perform routine dev merges and later routine release merges after every required gate passes. During initial control-plane validation, the bot may not merge main or deploy production.

AI agents may plan, investigate, create branches, implement, test, review, inspect pull requests, comment, recommend, and request changes. Only the dedicated GitHub App may automatically merge eligible routine work, using its own identity and the reviewed gate controller. Agents may not bypass required checks, approve their own change as an independent reviewer, alter branch protection, or expose production secrets to Gemini/Codex.

No automation may weaken branch protection to make a merge possible. The current code-owner approval rule may block automated merges until an owner-authorized governance change establishes an independent bot-compatible approval path.

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
- The dedicated bot may squash-merge into `dev` only after required checks, independent evidence, and GitHub branch protection pass. Routine release promotion to `main` additionally requires the production gate and is disabled during initial control-plane validation. Force pushes and bypasses remain prohibited.

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

No deployment from an unreviewed pull request. Automated production promotion and deployment remain disabled during initial control-plane validation. Later routine production operation requires all documented production gates and the dedicated bot identity; listed safety exceptions stop for owner decision.

Production candidates originate only from approved `main` revisions through a protected production environment. Pull-request code must never receive production credentials. AWS and EC2 hosting are outside the approved target architecture.
