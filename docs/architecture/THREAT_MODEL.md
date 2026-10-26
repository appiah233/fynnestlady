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

## Engineering Bot Control Plane (2026-10-26)

The new control plane crosses four boundaries: untrusted issue/PR/repository text into Gemini; untrusted branch code into GitHub-hosted CI; CI evidence into a privileged merge controller; and a short-lived GitHub App installation token into repository mutation. The App is installed only on `appiah233/fynnestlady`. GitHub Actions is the event engine; its triggers must be verified against the installed App's events and Actions token behavior. The App has no webhook listener. The first validation has no production secrets, `main` merge, or production deployment.

| Threat | Abuse case | Required control | Evidence to verify |
|---|---|---|---|
| Issue or repository prompt injection | Text tells Gemini to ignore rules, disclose secrets, or approve itself | Treat issue body, code, README, logs, and artifacts as data; fixed trusted prompts; no production secrets in Gemini; validate all resulting changes | Adversarial text fixture leaves policy unchanged |
| Untrusted PR or fork code | Attacker changes test code or workflow and gains write token | Run untrusted checkout with read-only token and no secrets; never run fork code in privileged `pull_request_target`; split analysis and mutation jobs | Fork fixture cannot read App/Gemini secrets or write repository |
| Workflow command or shell injection | Issue title, ref, path, or output becomes shell syntax | Pass values through typed inputs/environment and quoted arguments; validate branch names and issue IDs; never interpolate event text into scripts | Metacharacter fixture remains literal |
| Token exfiltration | Logs, malicious dependency, or Gemini output reveal installation/Gemini token | Mint repository-scoped short-lived installation tokens only in privileged jobs; mask/redact logs; disable token persistence on untrusted checkout; rotate on compromise | Log scan and credential-scope audit |
| Workflow-file compromise | Bot edits CI to skip checks or send credentials away | `workflows: write` only because first task repairs CI; require independent review and workflow-diff checks; branch protection forbids bypass | Malicious workflow change blocks merge |
| Poisoned artifacts/caches | Untrusted build output is presented as release evidence or executable input | Validate source SHA, run ID, provenance, schema, and checksums; do not execute downloaded artifacts in privileged jobs; isolate caches by trust level | Mismatched artifact rejected |
| Malicious dependency | Install script steals CI credential or alters build | Lockfile, dependency review, least-privilege job tokens, no privileged install of PR dependencies | Vulnerable dependency fixture blocks |
| Forged checks or stale evidence | Bot creates a green signal for different SHA | App has checks/statuses read only; merge controller requires exact head SHA, named source App, completed successful conclusions, and fresh evidence | Missing/stale/wrong-source check blocks |
| Branch-protection bypass | Merge despite missing reviewer or gate | No Administration permission and no bypass grant; use normal PR merge API only; verify live rule result | Missing code-owner approval blocks |
| Infinite loop/cost abuse | Bot reacts to its own events indefinitely | Event source/label tracking, dedupe, bounded retries, concurrency, timeouts, daily budgets, kill switch | Self-event and retry-limit fixtures terminate |
| Unsafe deployment or rollback | Bot promotes a bad revision or corrupts data | First validation stops at dev; release requires exact SHA, production gates, protected environment, smoke checks; exception list requires owner decision | Dry-run release and negative gate fixtures |

Current residual blocker: `@appiah233` is the only required code owner. An App cannot provide independent human code-owner approval for its own changes. Automatic merge must remain blocked until the owner intentionally changes the review arrangement without weakening required checks. The manifest and policy are repository proposals; installation, token scope, live rules, and negative fixtures require separate verification.
