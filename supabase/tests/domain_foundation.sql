-- Run in a disposable database after the migration. Roll back all fixtures.
begin;
insert into auth.users(id) values
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002');
insert into public.products(id, slug, name, status) values
  ('10000000-0000-4000-8000-000000000001', 'published', 'Published', 'active'),
  ('10000000-0000-4000-8000-000000000002', 'draft', 'Draft', 'draft');
insert into public.product_variants(id, product_id, sku, name, price_minor, status) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'PUBLISHED-1', 'Standard', 1000, 'active'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'DRAFT-1', 'Standard', 1000, 'active');
insert into public.inventory(variant_id, on_hand, reserved)
  values ('20000000-0000-4000-8000-000000000001', 2, 1);
insert into public.profiles(user_id, clerk_user_id, display_name) values
  ('00000000-0000-4000-8000-000000000001', 'user_customer_a', 'Customer A'),
  ('00000000-0000-4000-8000-000000000002', 'user_customer_b', 'Customer B');
insert into private.admin_memberships(user_id)
  values ('00000000-0000-4000-8000-000000000001');
insert into public.carts(id, customer_id, clerk_user_id) values
  ('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'user_customer_a'),
  ('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'user_customer_b');
insert into public.cart_items(cart_id, variant_id, quantity) values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 1),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 2);
insert into public.orders(id, customer_id, clerk_user_id, public_reference, subtotal_minor, delivery_address)
  values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'user_customer_a', 'A-1', 1000, '{}'),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'user_customer_b', 'B-1', 1000, '{}');
insert into public.order_items(order_id, sku_snapshot, product_name_snapshot, variant_name_snapshot, quantity, unit_price_minor)
  values
  ('30000000-0000-4000-8000-000000000001', 'PUBLISHED-1', 'Published', 'Standard', 1, 1000),
  ('30000000-0000-4000-8000-000000000002', 'PUBLISHED-1', 'Published', 'Standard', 1, 1000);

set local role anon;
do $$
begin
  if (select count(*) from public.products) <> 1 then raise exception 'anonymous catalogue visibility wrong'; end if;
  if has_table_privilege('anon', 'public.profiles', 'SELECT') then raise exception 'anonymous profile read granted'; end if;
  if has_table_privilege('anon', 'public.carts', 'SELECT') then raise exception 'anonymous cart read granted'; end if;
  if has_table_privilege('anon', 'public.orders', 'SELECT') then raise exception 'anonymous order read granted'; end if;
  if has_table_privilege('anon', 'public.payments', 'SELECT') then raise exception 'anonymous payment read granted'; end if;
  if has_table_privilege('anon', 'public.products', 'INSERT') then raise exception 'anonymous catalogue write granted'; end if;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
do $$ begin
  if exists (select 1 from public.profiles) or exists (select 1 from public.orders) then
    raise exception 'missing Clerk subject can read customer rows';
  end if;
end $$;
select set_config('request.jwt.claims', '{"sub":"user_customer_a","role":"authenticated"}', true);
do $$
begin
  if (select count(*) from public.products) <> 1 then raise exception 'draft product leaked'; end if;
  if (select count(*) from public.product_variants) <> 1 then raise exception 'draft variant leaked'; end if;
  if (select count(*) from public.orders where id = '30000000-0000-4000-8000-000000000001') <> 1 or
     exists (select 1 from public.orders where id = '30000000-0000-4000-8000-000000000002') then raise exception 'Customer A order isolation failed'; end if;
  if (select count(*) from public.order_items where order_id = '30000000-0000-4000-8000-000000000001') <> 1 or
     exists (select 1 from public.order_items where order_id = '30000000-0000-4000-8000-000000000002') then raise exception 'Customer A order item isolation failed'; end if;
  if (select count(*) from public.profiles where display_name = 'Customer A') <> 1 or (select count(*) from public.profiles) <> 1 then raise exception 'Customer A profile isolation failed'; end if;
  if (select count(*) from public.carts) <> 1 then raise exception 'Customer A cart isolation failed'; end if;
  if (select quantity from public.cart_items) <> 1 then raise exception 'Customer A cart item isolation failed'; end if;
  if (select count(*) from public.carts where id = '40000000-0000-4000-8000-000000000001') <> 1 or
     exists (select 1 from public.carts where id = '40000000-0000-4000-8000-000000000002') then raise exception 'Customer A cart owner isolation failed'; end if;
  if (select count(*) from public.cart_items where cart_id = '40000000-0000-4000-8000-000000000001') <> 1 or
     exists (select 1 from public.cart_items where cart_id = '40000000-0000-4000-8000-000000000002') then raise exception 'Customer A cart item owner isolation failed'; end if;
  if has_table_privilege('authenticated', 'public.orders', 'INSERT') then raise exception 'browser can create authoritative order'; end if;
  if has_table_privilege('authenticated', 'public.product_variants', 'UPDATE') then raise exception 'browser can change price'; end if;
  if has_table_privilege('authenticated', 'public.payments', 'SELECT') then raise exception 'browser can read payment'; end if;
  if has_table_privilege('authenticated', 'public.inventory', 'UPDATE') then raise exception 'browser can change inventory'; end if;
  if has_schema_privilege('authenticated', 'private', 'USAGE') then raise exception 'browser can enter private schema'; end if;
  if has_schema_privilege('authenticated', 'public', 'CREATE') then raise exception 'browser can create public objects'; end if;
end $$;
select set_config('request.jwt.claims', '{"sub":"user_customer_b","role":"authenticated"}', true);
do $$
begin
  if (select count(*) from public.orders) <> 1 or (select count(*) from public.orders where public_reference = 'B-1') <> 1 then raise exception 'Customer B order isolation failed'; end if;
  if (select count(*) from public.order_items where order_id = '30000000-0000-4000-8000-000000000002') <> 1 or
     exists (select 1 from public.order_items where order_id = '30000000-0000-4000-8000-000000000001') then raise exception 'Customer B order item isolation failed'; end if;
  if (select count(*) from public.profiles where display_name = 'Customer B') <> 1 or (select count(*) from public.profiles) <> 1 then raise exception 'Customer B profile isolation failed'; end if;
  if (select count(*) from public.carts) <> 1 then raise exception 'Customer B cart isolation failed'; end if;
  if (select quantity from public.cart_items) <> 2 then raise exception 'Customer B cart item isolation failed'; end if;
end $$;
reset role;

set local role service_role;
do $$
begin
  if (select count(*) from private.admin_memberships) <> 1 then
    raise exception 'trusted server cannot read admin membership fixture';
  end if;
  if not exists (select 1 from private.admin_memberships
                 where user_id = '00000000-0000-4000-8000-000000000001') then
    raise exception 'trusted server membership lookup failed';
  end if;
end $$;
reset role;

do $$
begin
  if has_table_privilege('authenticated', 'private.admin_memberships', 'INSERT') then raise exception 'customer can promote itself'; end if;
  if has_schema_privilege('authenticated', 'private', 'USAGE') then raise exception 'customer can enter private schema'; end if;
  if has_table_privilege('anon', 'private.admin_memberships', 'SELECT') then raise exception 'anonymous admin membership read granted'; end if;
  if not has_schema_privilege('service_role', 'private', 'USAGE') then raise exception 'trusted server cannot enter private schema'; end if;
  if not has_table_privilege('service_role', 'private.admin_memberships', 'SELECT') then raise exception 'trusted server cannot read admin membership'; end if;
  if has_table_privilege('service_role', 'private.admin_memberships', 'INSERT') then raise exception 'trusted server has unintended admin membership write'; end if;
  begin
    update public.orders set subtotal_minor = 2000 where public_reference = 'A-1';
    raise exception 'order snapshot changed';
  exception when raise_exception then
    if sqlerrm <> 'order snapshot is immutable' then raise; end if;
  end;
  begin
    delete from public.order_items where order_id = '30000000-0000-4000-8000-000000000001';
    raise exception 'order item snapshot deleted';
  exception when raise_exception then
    if sqlerrm <> 'order item snapshot is immutable' then raise; end if;
  end;
end $$;

do $$
begin
  if not exists (select 1 from public.orders where total_minor = 1000) then raise exception 'total calculation failed'; end if;
  if not exists (select 1 from public.order_items where line_total_minor = 1000) then raise exception 'line calculation failed'; end if;
  begin
    update public.inventory set reserved = 3 where variant_id = '20000000-0000-4000-8000-000000000001';
    raise exception 'over-reservation was accepted';
  exception when check_violation then null;
  end;
  begin
    insert into public.product_variants(product_id, sku, name, price_minor)
      values ('10000000-0000-4000-8000-000000000001', 'BAD-PRICE', 'Bad', -1);
    raise exception 'negative price was accepted';
  exception when check_violation then null;
  end;
end $$;
rollback;
