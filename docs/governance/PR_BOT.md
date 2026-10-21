# FynnestladyPRBot Foundation

## Purpose

FynnestladyPRBot is a project-specific inspector, not a merge authority. It reads project rules, governance, architecture, domain/security models, relevant ADRs, coordination records, PR description, diff, and available checks.

## Inspection Contract

Inspect scope/coordination; architecture and dependencies; server-authoritative commerce; payment/idempotency/inventory/order invariants; authorization, validation, secrets, uploads, S3, injection and supply chain; migrations/constraints/transactions; skincare claims; responsive/accessibility/state UX; tests and evidence.

Unsupported medical, ingredient, safety, efficacy, or diagnosis-like content is labeled `HUMAN CONTENT VERIFICATION REQUIRED`; the bot never medically validates it.

## Verdicts

Only: `PASS FOR OWNER REVIEW`, `CHANGES REQUIRED`, `BLOCKED`, or `INSUFFICIENT EVIDENCE`.

Every review ends:

> Inspection complete. Merge authority remains exclusively with Eric Appiah Owusu. FynnestladyPRBot has not merged this pull request.

## Permissions and Architecture

The initial workflow uses `contents: read` and `pull-requests: read`, produces a job summary, and cannot comment or merge. A future comment capability may add only `pull-requests: write` after owner approval. It never receives `contents: write`, administration, deployment, AWS, production database, or production payment secrets.

The deterministic foundation checks changed-file scope, mandatory PR sections, risky commerce/security terms, forbidden secret filenames, governance changes, and content-claim language. It provides evidence-oriented prompts rather than claiming semantic proof. Mature inspection can add a reviewed model/service, but untrusted PR text/diff must be treated as data, never instructions, and production secrets stay outside its trust boundary.
