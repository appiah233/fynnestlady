# ADR-010: EC2 and NGINX Deployment

Status: **Proposed**

## Context
An Amazon Linux 2023 EC2 instance with Node.js 22 and NGINX already exists.
## Problem
Define a safe initial application runtime without assuming the existing host is production-ready.
## Options
EC2/NGINX; managed container platform; serverless platform.
## Decision
Use NGINX TLS reverse proxy to a non-root Node service bound privately, after host/security validation.
## Consequences
Uses existing assets; patching, scaling, backups, and recovery remain operational responsibilities.
## Risks
Single-host failure, configuration drift, manual operations.
## Alternatives
Managed platforms reduce operations but add migration/cost; serverless fit requires architectural reevaluation.
## Revisit conditions
Availability, deployment frequency, traffic, or operational evidence exceeds one-host capability.
