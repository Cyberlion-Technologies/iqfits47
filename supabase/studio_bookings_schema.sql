-- 47Studio Bookings Schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- tour_dates: the upcoming pop-up / tour city events
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists tour_dates (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  venue text not null,
  venue_address text,
  start_date date not null,
  end_date date not null,
  total_slots integer not null default 20,
  booked_slots integer not null default 0,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'open', 'sold_out', 'completed', 'cancelled')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tour_dates_city_idx on tour_dates (city);
create index if not exists tour_dates_start_date_idx on tour_dates (start_date);
create index if not exists tour_dates_status_idx on tour_dates (status);

alter table tour_dates enable row level security;
drop policy if exists "Public can read tour dates" on tour_dates;
create policy "Public can read tour dates"
  on tour_dates for select using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- studio_bookings: all booking requests (studio + tour)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists studio_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text unique not null default 'BK-' || upper(substr(gen_random_uuid()::text, 1, 8)),

  -- booking type
  booking_type text not null default 'studio'
    check (booking_type in ('studio', 'tour')),

  -- customer details
  full_name text not null,
  phone text not null,
  email text,

  -- tattoo details
  tattoo_style text not null
    check (tattoo_style in ('traditional', 'neo_traditional', 'geometric', 'fine_line', 'blackwork', 'realism', 'watercolour', 'custom')),
  tattoo_size text not null
    check (tattoo_size in ('small', 'medium', 'large', 'sleeve', 'full_back')),
  body_placement text not null,
  design_description text not null,
  has_reference_art boolean not null default false,
  notes text,

  -- studio session fields (only for booking_type = 'studio')
  preferred_date date,
  preferred_time text
    check (preferred_time in ('morning', 'afternoon', 'evening', null)),

  -- tour fields (only for booking_type = 'tour')
  tour_date_id uuid references tour_dates (id) on delete set null,

  -- booking status lifecycle
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'deposit_paid', 'completed', 'cancelled', 'no_show')),

  -- deposit (KES) — optional for future M-Pesa integration
  deposit_amount integer,
  deposit_paid boolean not null default false,
  mpesa_receipt text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_bookings_ref_idx on studio_bookings (booking_ref);
create index if not exists studio_bookings_phone_idx on studio_bookings (phone);
create index if not exists studio_bookings_status_idx on studio_bookings (status);
create index if not exists studio_bookings_tour_idx on studio_bookings (tour_date_id);
create index if not exists studio_bookings_type_idx on studio_bookings (booking_type);

alter table studio_bookings enable row level security;

-- Public can INSERT their own booking
drop policy if exists "Public can create bookings" on studio_bookings;
create policy "Public can create bookings"
  on studio_bookings for insert
  with check (true);

-- Public can look up their own booking by ref + phone (for confirmation page)
drop policy if exists "Public can view their own booking" on studio_bookings;
create policy "Public can view their own booking"
  on studio_bookings for select
  using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-update updated_at on studio_bookings
-- ─────────────────────────────────────────────────────────────────────────────
drop trigger if exists studio_bookings_set_updated_at on studio_bookings;
create trigger studio_bookings_set_updated_at
  before update on studio_bookings
  for each row execute procedure set_updated_at();

drop trigger if exists tour_dates_set_updated_at on tour_dates;
create trigger tour_dates_set_updated_at
  before update on tour_dates
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-increment booked_slots when a tour booking is confirmed
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function increment_tour_slots()
returns trigger as $$
begin
  if NEW.tour_date_id is not null and NEW.booking_type = 'tour' then
    update tour_dates
    set booked_slots = booked_slots + 1
    where id = NEW.tour_date_id
      and booked_slots < total_slots;
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists increment_tour_slots_on_insert on studio_bookings;
create trigger increment_tour_slots_on_insert
  after insert on studio_bookings
  for each row execute procedure increment_tour_slots();

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: placeholder tour dates
-- ─────────────────────────────────────────────────────────────────────────────
insert into tour_dates (city, venue, venue_address, start_date, end_date, total_slots, status, is_featured) values
  ('Nairobi',  'Westlands Studio Hub',         'Westlands Ave, off Waiyaki Way, Nairobi',          '2026-08-08', '2026-08-10', 24, 'open',     true),
  ('Mombasa',  'Old Town Ink Collective',       'Nkrumah Road, Old Town, Mombasa',                  '2026-08-22', '2026-08-23', 16, 'upcoming', false),
  ('Kisumu',   'Milimani Arts Quarter',         'Oginga Odinga St, Milimani, Kisumu',               '2026-09-05', '2026-09-06', 16, 'upcoming', false),
  ('Eldoret',  'Pioneers Mall Pop-up',          'Uganda Road, Pioneers Mall, Eldoret',              '2026-09-19', '2026-09-20', 12, 'upcoming', false)
on conflict do nothing;
