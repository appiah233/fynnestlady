# Test Strategy

## Principles

Design critical tests before implementation. Test externally meaningful behavior, invariants, failure/retry paths, and authorization denial. TestingAgent independently reruns and challenges implementer evidence.

## Layers

- **Unit:** pure totals, allocation, eligibility, validation, state transitions, formatting, and content rules.
- **Integration:** PostgreSQL constraints/transactions, repository behavior, auth/session boundaries, S3 adapters, Paystack signature/verification/idempotency, and concurrency.
- **End-to-end:** critical customer and admin flows using isolated test data and payment-provider test mode/stubs as approved.
- **Security:** authorization matrix, IDOR, tampered prices, replay, CSRF/XSS, unsafe redirects, upload corpus, rate limits, secret/log checks, dependency and static analysis.
- **Accessibility:** automated axe checks plus keyboard, focus, screen-reader semantics, zoom/reflow, contrast, errors, and reduced motion.

## Critical Scenarios

- Last-stock concurrent checkout yields at most one successful allocation.
- Duplicate/out-of-order Paystack events cause one valid effect.
- Amount, currency, order reference, or signature mismatch never marks paid.
- Customer/admin cross-resource access fails without data leakage.
- Catalogue/address edits never mutate prior order snapshots.
- Stale cart, expired reservation, invalid coupon, interrupted payment, and retry recover safely.
- Product cannot publish with missing required verified content.

## Representative Coverage

Browsers: current Chromium plus Firefox/WebKit coverage for critical paths. Viewports include 320px, 375/390px, tablet, laptop, desktop, and large desktop. Actual matrix is selected in Milestone 1 based on analytics/business audience, without lowering the minimum responsive requirement.

## Evidence

CI records commands, revision, environment, pass/fail totals, reports, screenshots/traces for failures, and known exclusions. Flaky tests are defects; quarantine requires owner-visible tracking and cannot hide critical-flow failure.
