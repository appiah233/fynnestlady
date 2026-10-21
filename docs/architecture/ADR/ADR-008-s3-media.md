# ADR-008: S3 Media Architecture

Status: **Proposed**

## Context
Product media requires durable object storage and safe delivery.
## Problem
Upload and serve files without public write access or permanent credentials.
## Options
App-proxied upload; scoped presigned upload; public bucket.
## Decision
Use private S3, EC2 IAM role, validated randomized object keys, and scoped delivery; assess presigned uploads and CloudFront later.
## Consequences
Strong access boundary; lifecycle and delivery configuration require operations work.
## Risks
Misconfigured policy, active content, orphan objects, and cost abuse.
## Alternatives
Public bucket is unsafe; local EC2 disk is non-durable and hard to scale.
## Revisit conditions
Media volume, transformation, CDN, or upload throughput requires change.
