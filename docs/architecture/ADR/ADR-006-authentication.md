# ADR-006: Authentication Strategy

Status: **Accepted (Owner-Directed)**

## Context
Customers and administrators require secure account access, sign-in, registration, session management, and recovery on Next.js 15 App Router.
## Problem
Choose maintained identity/session primitives without custom security mistakes while keeping database data in Supabase PostgreSQL.
## Options
Clerk (`@clerk/nextjs`); Supabase Auth; Auth.js; custom implementation.
## Decision
Use **Clerk (`@clerk/nextjs`)** as the authentication and identity provider for Fynnestlady (`ClerkProvider`, `clerkMiddleware`, `/sign-in`, and `/sign-up` routes). `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is used for client/server session initialization, while `CLERK_SECRET_KEY` remains strictly server-only.
## Consequences
Provides first-class Next.js 15 App Router authentication, session handling, and account recovery while Supabase PostgreSQL and Storage remain the authoritative data and media layer.
## Risks
Requires environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`) in preview/production; unconfigured local/CI builds must degrade gracefully without leaking secrets.
## Alternatives
Auth.js remains unapproved; custom authentication is rejected due to security risk.
## Revisit conditions
Owner architectural direction change.
