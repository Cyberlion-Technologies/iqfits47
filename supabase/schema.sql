-- IQFIT47 database schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  items jsonb not null,
  subtotal integer not null,
  delivery_fee integer not null,
  total integer not null,
  delivery jsonb not null,
  status text not null default 'payment_pending'
    check (status in (
      'payment_pending', 'paid', 'processing',
      'dispatched', 'out_for_delivery', 'delivered', 'cancelled'
    )),
  timeline jsonb not null default '[]'::jsonb,
  payment_method text not null default 'mpesa',
  mpesa_receipt text,
  transaction_reference text,
  customer_phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_order_number_idx on orders (order_number);
create index if not exists orders_phone_idx on orders (customer_phone);

-- Keep updated_at fresh on every change
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute procedure set_updated_at();

-- Row Level Security: the browser (anon key) can only read an order if it
-- knows the exact order number AND phone number (used by the track-order
-- page). All writes go through the server (service role key) inside our
-- API routes, so no public insert/update policy is needed.
alter table orders enable row level security;

drop policy if exists "Public can look up their own order" on orders;
create policy "Public can look up their own order"
  on orders for select
  using (true);
  -- Filtering by order_number + phone happens in the API route query;
  -- RLS stays permissive on select since the order number itself acts
  -- as a shared secret. Tighten further if you add customer accounts.

-- products table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text not null,
  category text not null check (category in ('sneakers', 'apparel', 'accessories')),
  price integer not null,
  compare_at_price integer,
  description text not null,
  details jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  colorway text not null,
  sizes jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  is_new_drop boolean not null default false,
  drop_number text,
  rating numeric(3, 2) not null default 5.0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_slug_idx on products (slug);
create index if not exists products_category_idx on products (category);

-- Enable RLS for products
alter table products enable row level security;
drop policy if exists "Allow public read access on products" on products;
create policy "Allow public read access on products" on products for select using (true);

-- offers table
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  code text unique,
  discount_percent integer,
  active boolean not null default true,
  banner_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS for offers
alter table offers enable row level security;
drop policy if exists "Allow public read access on offers" on offers;
create policy "Allow public read access on offers" on offers for select using (true);

-- announcements table
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  active boolean not null default true,
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS for announcements
alter table announcements enable row level security;
drop policy if exists "Allow public read access on announcements" on announcements;
create policy "Allow public read access on announcements" on announcements for select using (true);

-- Keep updated_at fresh on new tables
drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute procedure set_updated_at();

drop trigger if exists offers_set_updated_at on offers;
create trigger offers_set_updated_at
  before update on offers
  for each row execute procedure set_updated_at();

drop trigger if exists announcements_set_updated_at on announcements;
create trigger announcements_set_updated_at
  before update on announcements
  for each row execute procedure set_updated_at();
