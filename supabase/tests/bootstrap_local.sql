-- Minimal Supabase Auth stubs for a fresh, disposable PostgreSQL database only.
-- Run as its database owner before the domain migration. Never apply to Supabase.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
  if (select rolcanlogin or rolbypassrls from pg_roles where rolname = 'anon') then raise exception 'anon role attributes are unsafe'; end if;
  if (select rolcanlogin or rolbypassrls from pg_roles where rolname = 'authenticated') then raise exception 'authenticated role attributes are unsafe'; end if;
  if not (select not rolcanlogin and rolbypassrls from pg_roles where rolname = 'service_role') then raise exception 'service_role attributes are wrong'; end if;
end $$;
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
create function auth.jwt() returns jsonb language sql stable as
  $$ select nullif(current_setting('request.jwt.claims', true), '')::jsonb $$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
grant execute on function auth.jwt() to authenticated;
