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
insert into public.orders(id, customer_id, public_reference, subtotal_minor, delivery_address)
  values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'A-1', 1000, '{}'),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'B-1', 1000, '{}');
insert into public.order_items(order_id, sku_snapshot, product_name_snapshot, variant_name_snapshot, quantity, unit_price_minor)
  values
  ('30000000-0000-4000-8000-000000000001', 'PUBLISHED-1', 'Published', 'Standard', 1, 1000),
  ('30000000-0000-4000-8000-000000000002', 'PUBLISHED-1', 'Published', 'Standard', 1, 1000);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
do $$
begin
  if (select count(*) from public.products) <> 1 then raise exception 'draft product leaked'; end if;
  if (select count(*) from public.product_variants) <> 1 then raise exception 'draft variant leaked'; end if;
  if (select count(*) from public.orders) <> 1 then raise exception 'another customer order leaked'; end if;
  if (select count(*) from public.order_items) <> 1 then raise exception 'another customer order item leaked'; end if;
  if has_table_privilege('authenticated', 'public.orders', 'INSERT') then raise exception 'browser can create authoritative order'; end if;
  if has_table_privilege('authenticated', 'public.product_variants', 'UPDATE') then raise exception 'browser can change price'; end if;
  if has_table_privilege('authenticated', 'public.payments', 'SELECT') then raise exception 'browser can read payment'; end if;
  if has_table_privilege('authenticated', 'public.inventory', 'UPDATE') then raise exception 'browser can change inventory'; end if;
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
