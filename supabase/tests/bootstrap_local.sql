-- Minimal Supabase Auth stubs for a fresh, disposable PostgreSQL database only.
-- Run as its database owner before the domain migration. Never apply to Supabase.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
do $$
begin
  execute format('grant service_role to %I', current_user);
end $$;
do $$ begin
  execute format('grant anon to %I', current_user);
  execute format('grant authenticated to %I', current_user);
end $$;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
