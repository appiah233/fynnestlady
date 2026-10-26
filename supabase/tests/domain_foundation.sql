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
insert into public.profiles(user_id, display_name) values
  ('00000000-0000-4000-8000-000000000001', 'Customer A'),
  ('00000000-0000-4000-8000-000000000002', 'Customer B');
insert into public.carts(id, customer_id) values
  ('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001'),
  ('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002');
insert into public.cart_items(cart_id, variant_id, quantity) values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 1),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 2);
insert into public.orders(id, customer_id, public_reference, subtotal_minor, delivery_address)
  values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'A-1', 1000, '{}'),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'B-1', 1000, '{}');
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
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
do $$
begin
  if (select count(*) from public.products) <> 1 then raise exception 'draft product leaked'; end if;
  if (select count(*) from public.product_variants) <> 1 then raise exception 'draft variant leaked'; end if;
  if (select count(*) from public.orders) <> 1 then raise exception 'another customer order leaked'; end if;
  if (select count(*) from public.order_items) <> 1 then raise exception 'another customer order item leaked'; end if;
  if (select count(*) from public.profiles where display_name = 'Customer A') <> 1 or (select count(*) from public.profiles) <> 1 then raise exception 'Customer A profile isolation failed'; end if;
  if (select count(*) from public.carts) <> 1 then raise exception 'Customer A cart isolation failed'; end if;
  if (select quantity from public.cart_items) <> 1 then raise exception 'Customer A cart item isolation failed'; end if;
  if has_table_privilege('authenticated', 'public.orders', 'INSERT') then raise exception 'browser can create authoritative order'; end if;
  if has_table_privilege('authenticated', 'public.product_variants', 'UPDATE') then raise exception 'browser can change price'; end if;
  if has_table_privilege('authenticated', 'public.payments', 'SELECT') then raise exception 'browser can read payment'; end if;
  if has_table_privilege('authenticated', 'public.inventory', 'UPDATE') then raise exception 'browser can change inventory'; end if;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
do $$
begin
  if (select count(*) from public.orders) <> 1 or (select count(*) from public.orders where public_reference = 'B-1') <> 1 then raise exception 'Customer B order isolation failed'; end if;
  if (select count(*) from public.order_items) <> 1 then raise exception 'Customer B order item isolation failed'; end if;
  if (select count(*) from public.profiles where display_name = 'Customer B') <> 1 or (select count(*) from public.profiles) <> 1 then raise exception 'Customer B profile isolation failed'; end if;
  if (select count(*) from public.carts) <> 1 then raise exception 'Customer B cart isolation failed'; end if;
  if (select quantity from public.cart_items) <> 2 then raise exception 'Customer B cart item isolation failed'; end if;
end $$;
reset role;

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
