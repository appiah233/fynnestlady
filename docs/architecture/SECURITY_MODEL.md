# Security Model

Status: Milestone 0 baseline. ADR-014 and `.github/fynnestlady/architecture-policy.yml` supersede the Auth.js, AWS, EC2, and S3 implementation proposals below. Supabase Auth/PostgreSQL/Storage, Vercel, and the engineering bot require updated negative authorization, RLS, storage, CI-token, and deployment verification before release. See `docs/architecture/THREAT_MODEL.md` for the bot control plane.

## Objectives

Protect customer data, commerce integrity, administrative authority, payment evidence, media, secrets, and release provenance. Security is a release requirement and uses deny-by-default, least privilege, defense in depth, auditable transitions, and minimal data collection.

## Identity and Session

Auth.js is a candidate, not yet approved. Milestone 1 must assess maintained adapters, credential storage, cookie/session strategy, CSRF behavior, reset flows, and account-enumeration defenses. Passwords use a modern adaptive hash. Sessions use secure, HttpOnly, SameSite cookies, rotation where applicable, expiration, revocation, and reauthentication for sensitive changes.

## Authorization

Authorization is enforced server-side for every object and action. Roles are coarse (`CUSTOMER`, scoped admin roles); permissions govern concrete commands. Resource ownership is checked to prevent IDOR. Admin routes are not secured by URL obscurity or client controls. Privileged actions produce audit records.

## Input and Output

Validate and normalize request, webhook, query, route, environment, and upload data at boundaries. Parameterized ORM access does not replace authorization. Encode output by context; sanitize approved rich text; apply a restrictive Content Security Policy. Use anti-CSRF controls where cookie-authenticated state changes require them.

## Commerce and Payment

Reload price, promotion eligibility, tax/delivery rules, and stock server-side. Verify Paystack signatures against the raw body and independently verify transaction reference, amount, currency, and expected order. Store provider event uniqueness and process effects idempotently. Redact payment/customer data from logs. Never store card details.

## Media and S3

Application EC2 uses an IAM role with bucket/prefix-limited permissions. Keep the bucket private and block public access. Validate authorization, size, type, signature/magic bytes, extension, dimensions, and object key; randomize keys and prevent overwrite/traversal. Serve through scoped URLs or approved CloudFront origin controls. Treat metadata and rendered SVG/HTML as active-content risks.

## Secrets and Infrastructure

Secrets live outside Git and CI output, preferably in AWS Systems Manager Parameter Store or Secrets Manager with scoped instance access. Rotate after suspected exposure. Permit Internet ingress only to NGINX HTTPS (and tightly controlled HTTP redirect/validation); restrict SSH with the owner-approved access method; bind application and database interfaces privately.

## Abuse and Privacy

Rate-limit authentication, reset, search, checkout, coupon, upload, and webhook paths by context. Use generic account-recovery responses, bounded pagination, safe redirects, and anti-automation controls proportionate to risk. Define retention and deletion policy before collecting live customer data.

## Logging and Monitoring

Structured logs include correlation IDs and security/commerce events but exclude credentials, reset tokens, full addresses, unnecessary request bodies, and provider secrets. Alert on repeated auth failure, admin changes, webhook verification failure, payment/order mismatch, inventory invariant breach, and deployment failure.

## Release Gates

Verified critical/high findings, missing payment verification, broken authorization, exposed secrets, negative inventory, mutable order history, or absent restore capability block production unless Eric explicitly accepts documented risk.
