# Application foundation contract

This sprint follows the [Building Memo](../governance/BUILDING_MEMO.md): a small, accessible, maintainable modular monolith with executable code before expanding product scope. The owner-approved stack in ADR-014 supersedes historical Next.js 16, Prisma, Auth.js, and AWS proposals.

## Boundaries

- `src/app/**` owns routes and server component composition. Route code delegates business rules to domain modules as they are introduced.
- `src/components/ui/**` owns reusable visual primitives under DesignAgent review.
- `src/lib/supabase/browser.ts` creates a browser client using only public configuration.
- `src/lib/supabase/server.ts` creates a cookie-aware request client using the public key. RLS remains the database authorization boundary. Server actions must check the authenticated user and operation-specific policy.
- No service role client exists yet. A future privileged integration needs a narrow, server-only module, tests, and SecurityAgent review.
- Product, cart, checkout, order, and payment types must follow published DatabaseAgent and CommerceAgent contracts. Route or UI code must not invent persistence schemas.

## Configuration

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public values; the service role key is server-only and is absent from all current runtime imports. Missing public configuration fails when a Supabase client is created, leaving static pages buildable without development credentials. Production and preview values must be separate in Vercel.

## Handoff

DesignAgent supplies `src/app/globals.css`. SecurityAgent defines auth/session and service role rules. DatabaseAgent supplies schema and RLS contracts. TestingAgent independently verifies integration and the browser bundle. Auth is not enabled until a reviewed session refresh path exists.
