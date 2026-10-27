-- Adds Storefront catalogue metadata columns and Clerk identity compatibility.
alter table public.products
  add column if not exists category text not null default 'Skincare',
  add column if not exists concerns text[] not null default '{}',
  add column if not exists skin_types text[] not null default '{"all"}',
  add column if not exists image_url text not null default '/images/product-placeholder.svg',
  add column if not exists badge text check (badge is null or badge in ('new', 'bestseller', 'limited')),
  add column if not exists stock_status text not null default 'in-stock' check (stock_status in ('in-stock', 'low', 'out-of-stock')),
  add column if not exists benefits text[] not null default '{}',
  add column if not exists key_ingredients text[] not null default '{}',
  add column if not exists how_to_use text[] not null default '{}',
  add column if not exists warnings text not null default '',
  add column if not exists delivery text not null default 'Delivered within 2–5 business days.',
  add column if not exists is_fixture boolean not null default true;

alter table public.product_variants
  add column if not exists size text not null default 'Standard',
  add column if not exists compare_at_price_minor bigint check (compare_at_price_minor is null or compare_at_price_minor >= 0),
  add column if not exists stock integer not null default 0 check (stock >= 0);

-- Allow Clerk string user IDs (e.g. user_2x...) alongside UUID user references.
alter table public.profiles
  add column if not exists clerk_user_id text unique;

alter table public.carts
  add column if not exists clerk_user_id text;
create index if not exists carts_clerk_user_id_idx on public.carts(clerk_user_id);

alter table public.orders
  add column if not exists clerk_user_id text;
create index if not exists orders_clerk_user_id_idx on public.orders(clerk_user_id);

alter table private.admin_memberships
  add column if not exists clerk_user_id text unique;
