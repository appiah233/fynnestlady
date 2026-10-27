-- Initial Supabase domain foundation. Money is integer pesewas; currency is GHS.
create extension if not exists pgcrypto;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  sku text not null unique check (length(trim(sku)) > 0),
  name text not null check (length(trim(name)) > 0),
  price_minor bigint not null check (price_minor >= 0),
  currency text not null default 'GHS' check (currency = 'GHS'),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_variants_product_id_idx on public.product_variants(product_id);

create table public.inventory (
  variant_id uuid primary key references public.product_variants(id) on delete restrict,
  on_hand integer not null default 0 check (on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0 and reserved <= on_hand),
  updated_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  event_key text not null unique check (length(trim(event_key)) > 0),
  kind text not null check (kind in ('receive', 'reserve', 'release', 'fulfil', 'adjust')),
  on_hand_delta integer not null,
  reserved_delta integer not null,
  created_at timestamptz not null default now()
);
create index inventory_movements_variant_id_created_at_idx on public.inventory_movements(variant_id, created_at);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index carts_customer_id_idx on public.carts(customer_id);

create table public.cart_items (
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity between 1 and 99),
  primary key (cart_id, variant_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete restrict,
  public_reference text not null unique check (length(trim(public_reference)) > 0),
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'processing', 'fulfilled', 'cancelled')),
  currency text not null default 'GHS' check (currency = 'GHS'),
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  discount_minor bigint not null default 0 check (discount_minor >= 0),
  delivery_minor bigint not null default 0 check (delivery_minor >= 0),
  tax_minor bigint not null default 0 check (tax_minor >= 0),
  total_minor bigint generated always as (subtotal_minor - discount_minor + delivery_minor + tax_minor) stored,
  delivery_address jsonb not null check (jsonb_typeof(delivery_address) = 'object'),
  created_at timestamptz not null default now(),
  check (discount_minor <= subtotal_minor)
);
create index orders_customer_id_created_at_idx on public.orders(customer_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  sku_snapshot text not null,
  product_name_snapshot text not null,
  variant_name_snapshot text not null,
  quantity integer not null check (quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  line_total_minor bigint generated always as (quantity::bigint * unit_price_minor) stored
);
create index order_items_order_id_idx on public.order_items(order_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text not null check (provider = 'paystack'),
  provider_reference text not null,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'GHS' check (currency = 'GHS'),
  created_at timestamptz not null default now(),
  unique (provider, provider_reference)
);
create index payments_order_id_idx on public.payments(order_id);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  provider_event_key text not null unique,
  verified_at timestamptz not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Browser roles receive only catalogue reads and their own profile/cart/order reads.
-- No browser write privilege is granted for prices, inventory, orders or payments.
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.profiles enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.products, public.product_variants to anon, authenticated;
grant select on public.profiles, public.carts, public.cart_items, public.orders, public.order_items to authenticated;

create policy products_public_read on public.products for select to anon, authenticated
  using (status = 'active');
create policy variants_public_read on public.product_variants for select to anon, authenticated
  using (status = 'active' and exists (
    select 1 from public.products p where p.id = product_id and p.status = 'active'
  ));
create policy profiles_owner_read on public.profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy carts_owner_read on public.carts for select to authenticated
  using (customer_id = (select auth.uid()));
create policy cart_items_owner_read on public.cart_items for select to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.customer_id = (select auth.uid())));
create policy orders_owner_read on public.orders for select to authenticated
  using (customer_id = (select auth.uid()));
create policy order_items_owner_read on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid())));
