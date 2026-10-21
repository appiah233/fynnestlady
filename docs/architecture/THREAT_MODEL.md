# Threat Model

## Method and Scope

This initial model uses assets, trust boundaries, abuse cases, and STRIDE-style categories. It covers browser-to-app, admin, PostgreSQL, Paystack, S3, AWS host, CI/GitHub, and operational access. It must be updated with implemented data flows.

| Threat | Example impact | Primary controls | Verification |
|---|---|---|---|
| Authentication bypass/account takeover | Customer/admin compromise | maintained auth, adaptive hashes, secure sessions, rate limits, reset hardening | integration/security tests |
| Broken access control/IDOR | Other users' orders or admin commands | server object checks, deny default, permission matrix | negative authorization tests |
| Admin privilege escalation | Catalogue, price, order manipulation | scoped RBAC, reauth, audit logs | role matrix tests |
| Price/cart/discount manipulation | Underpayment or invalid order | server reload/calculation, eligibility rules | tampered-request tests |
| Payment forgery/replay/duplicates | False paid orders or repeated effects | raw-body signature, provider verify, unique events, idempotency | replay and mismatch tests |
| Inventory race | Overselling/negative stock | transactional reservation, locks/versioning, unique effects | concurrent integration tests |
| SQL injection | Data theft/corruption | parameterization, validation, least DB privilege | static/dynamic tests |
| XSS | Session/action compromise | output encoding, rich-text sanitization, CSP | payload tests/CSP review |
| CSRF | Unauthorized state change | SameSite and framework/origin/token controls | cross-origin tests |
| SSRF/open redirect | Internal access/phishing | URL allowlists, no arbitrary fetch, safe redirects | negative URL tests |
| Malicious upload | Stored active content/malware/cost abuse | auth, quotas, magic-byte/type checks, isolation, safe delivery | upload corpus tests |
| S3 exposure | Public media/customer leakage | block public access, IAM role/prefix policy, access review | policy checks |
| Secret exposure | Infrastructure/payment compromise | secret store, redaction, scanning, rotation | secret scan and IAM review |
| Customer-data leakage/order enumeration | Privacy breach | opaque references, object checks, minimal logs | enumeration tests |
| Password-reset abuse | Account takeover/enumeration | single-use hashed expiry token, generic response, rate limit | lifecycle tests |
| Dependency/supply-chain attack | CI/runtime compromise | lockfile review, Dependabot, dependency review, CodeQL | CI gates |
| CI token/workflow compromise | Repository mutation | read-only defaults, pinned actions, no fork secrets, CODEOWNERS | workflow permission audit |
| Sensitive logging | Persistent privacy/secret exposure | structured allowlist/redaction | log tests/review |

## Critical Abuse Cases

An attacker submits a lower price, reuses a valid webhook, races the final stock item, changes an order identifier, uploads disguised active content, promotes their own role, or modifies a workflow to obtain secrets. Each must fail closed, produce safe evidence where appropriate, and avoid revealing sensitive internals.

## Residual Risks and Required Decisions

Production database/provider, admin MFA, rate-limit backing store, malware scanning depth, CloudFront, WAF/Turnstile, retention, and recovery objectives remain owner decisions after cost and operational review.
