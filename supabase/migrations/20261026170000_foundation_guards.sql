-- Additive hardening of the initial domain contract.
create schema if not exists private;
revoke create on schema public from public, anon, authenticated;

create table private.admin_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table private.admin_memberships enable row level security;
revoke all on schema private from public, anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;

-- The server may advance order state, but purchase-time facts cannot change.
create function private.protect_order_snapshot() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'order snapshot cannot be deleted';
  end if;
  if row(old.customer_id, old.public_reference, old.currency,
         old.subtotal_minor, old.discount_minor, old.delivery_minor,
         old.tax_minor, old.delivery_address, old.created_at)
     is distinct from
     row(new.customer_id, new.public_reference, new.currency,
         new.subtotal_minor, new.discount_minor, new.delivery_minor,
         new.tax_minor, new.delivery_address, new.created_at) then
    raise exception 'order snapshot is immutable';
  end if;
  return new;
end $$;
create trigger orders_snapshot_guard before update or delete on public.orders
  for each row execute function private.protect_order_snapshot();

create function private.protect_order_item_snapshot() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'order item snapshot is immutable';
end $$;
create trigger order_items_snapshot_guard before update or delete on public.order_items
  for each row execute function private.protect_order_item_snapshot();

create function private.protect_inventory_movement() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'inventory movement is append only';
end $$;
create trigger inventory_movements_append_guard before update or delete on public.inventory_movements
  for each row execute function private.protect_inventory_movement();

revoke all on all functions in schema private from public, anon, authenticated;
