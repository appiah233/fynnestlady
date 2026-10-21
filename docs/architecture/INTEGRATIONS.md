# Integrations

## Paystack

Server initializes transactions using authoritative order amount/currency/reference. Webhooks use raw-body signature verification, durable unique-event ingestion, independent transaction verification, idempotent processing, and reconciliation. Browser callbacks display status but do not establish payment truth.

## AWS S3 and CloudFront

S3 stores approved media under randomized keys through an EC2 IAM role or narrowly scoped signed upload flow. The bucket remains private. CloudFront is optional pending cost/security review and should use private-origin controls.

## PostgreSQL

Production recommendation is a private managed service, provider/region pending. Connections require TLS, least-privilege application and migration roles, pooling review, backup, restore tests, and monitored capacity.

## Authentication and Communication

Auth.js remains a candidate pending ADR review. Transactional email/SMS provider selection is deferred; any provider receives only required data and must support authenticated domains, delivery evidence, retry safety, and privacy obligations.

## GitHub

GitHub hosts source, pull requests, reviews, and CI. Workflows use minimal permissions, pinned action versions, protected environments for any future deployment, and no production secret exposure to pull requests.
