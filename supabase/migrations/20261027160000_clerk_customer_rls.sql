-- Clerk is the customer identity provider. Supabase verifies Clerk session tokens
-- through the configured third-party auth integration before evaluating RLS.
-- A legacy UUID-only row has no Clerk owner and remains invisible to customers.
-- Keep legacy UUID references as optional migration data; new Clerk identities
-- do not require rows in Supabase Auth's auth.users table.
alter table public.profiles drop constraint if exists profiles_user_id_fkey;
alter table public.profiles alter column user_id set default gen_random_uuid();
alter table public.carts drop constraint if exists carts_customer_id_fkey;
alter table public.carts alter column customer_id drop not null;
alter table public.carts add constraint carts_owner_present
  check (customer_id is not null or clerk_user_id is not null);
alter table public.orders drop constraint if exists orders_customer_id_fkey;
alter table public.orders alter column customer_id drop not null;
alter table public.orders add constraint orders_owner_present
  check (customer_id is not null or clerk_user_id is not null);
alter table private.admin_memberships drop constraint if exists admin_memberships_user_id_fkey;
alter table private.admin_memberships alter column user_id set default gen_random_uuid();

drop policy if exists profiles_owner_read on public.profiles;
create policy profiles_owner_read on public.profiles for select to authenticated
  using (clerk_user_id is not null and clerk_user_id = (select auth.jwt()->>'sub'));

drop policy if exists carts_owner_read on public.carts;
create policy carts_owner_read on public.carts for select to authenticated
  using (clerk_user_id is not null and clerk_user_id = (select auth.jwt()->>'sub'));

drop policy if exists cart_items_owner_read on public.cart_items;
create policy cart_items_owner_read on public.cart_items for select to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id
    and c.clerk_user_id is not null and c.clerk_user_id = (select auth.jwt()->>'sub')));

drop policy if exists orders_owner_read on public.orders;
create policy orders_owner_read on public.orders for select to authenticated
  using (clerk_user_id is not null and clerk_user_id = (select auth.jwt()->>'sub'));

drop policy if exists order_items_owner_read on public.order_items;
create policy order_items_owner_read on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id
    and o.clerk_user_id is not null and o.clerk_user_id = (select auth.jwt()->>'sub')));
