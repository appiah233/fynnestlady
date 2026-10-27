-- The trusted server can inspect admin membership. Browser roles cannot.
-- service_role exists in Supabase; the guard permits a minimal local Auth stub.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant usage on schema private to service_role;
    grant select on private.admin_memberships to service_role;
  end if;
end $$;
