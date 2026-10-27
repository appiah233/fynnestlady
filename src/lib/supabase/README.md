# Supabase client boundary

`browser.ts` uses only the public URL and publishable/anon key. `server.ts` uses the same public key with request cookies. Neither module accepts a service role key. Authenticated server operations still require authorization and database RLS. A future auth workstream must add session refresh middleware and test cookie behavior before sign-in is enabled.

Use `auth.getUser()` for server authorization decisions. Do not trust `getSession()` or a browser supplied role. Privileged database operations require a separately reviewed server-only service module with explicit authorization and auditing.
