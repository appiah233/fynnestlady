# ADR-012: Secret Management

Status: **Proposed**

## Context
Runtime needs database, authentication, payment, and service credentials.
## Problem
Supply and rotate secrets without source or broad CI exposure.
## Options
Environment files; GitHub secrets; AWS Parameter Store/Secrets Manager with IAM role.
## Decision
Use AWS-managed secret storage with scoped EC2 role for production; reserve GitHub environment secrets only for approved deployment needs.
## Consequences
Centralized access and rotation; adds AWS policy/configuration work.
## Risks
Overbroad IAM, accidental log exposure, unavailable secret service.
## Alternatives
Committed/env files are unsafe; GitHub-only secrets do not solve runtime retrieval cleanly.
## Revisit conditions
Deployment platform or compliance needs change.
