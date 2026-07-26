-- 47Studio Bookings & Operations Schema
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
  deposit_price_kes integer default 1500,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'open', 'filling_fast', 'sold_out', 'completed', 'cancelled')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tour_dates_city_idx on tour_dates (city);
create index if not exists tour_dates_start_date_idx on tour_dates (start_date);
create index if not exists tour_dates_status_idx on tour_dates (status);

alter table tour_dates enable row level security;
drop policy if exists "Public can read tour dates" on tour_dates;
create policy "Public can read tour dates" on tour_dates for select using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- studio_services: tattoo styles, piercings, body art & pricing
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists studio_services (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'tattoo'
    check (category in ('tattoo', 'piercing', 'body_art', 'consultation')),
  title text not null,
  starting_price_kes integer not null default 3000,
  deposit_required_kes integer not null default 1000,
  estimated_duration text default '1-2 Hours',
  description text,
  is_active boolean not null default true,
  display_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table studio_services enable row level security;
drop policy if exists "Public can read studio services" on studio_services;
create policy "Public can read studio services" on studio_services for select using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- studio_settings: operational configs, deposit rules, pricing policies
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists studio_settings (
  id text primary key default 'default',
  studio_name text not null default '47Studio (47Cultures & Ink)',
  min_deposit_kes integer not null default 1000,
  hourly_rate_kes integer not null default 5000,
  operating_hours text default 'Mon - Sat: 10:00 AM - 7:00 PM',
  cancellation_policy text default 'Deposits are non-refundable for cancellations made less than 24h before appointment.',
  contact_phone text default '+254 716 672 878',
  contact_email text default 'bookings@iqfits47.store',
  updated_at timestamptz not null default now()
);

alter table studio_settings enable row level security;
drop policy if exists "Public can read studio settings" on studio_settings;
create policy "Public can read studio settings" on studio_settings for select using (true);

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

  -- deposit (KES)
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
drop policy if exists "Public can create bookings" on studio_bookings;
create policy "Public can create bookings" on studio_bookings for insert with check (true);

drop policy if exists "Public can view their own booking" on studio_bookings;
create policy "Public can view their own booking" on studio_bookings for select using (true);

-- ── Auto-update triggers ─────────────────────────────────────────────────────
drop trigger if exists studio_bookings_set_updated_at on studio_bookings;
create trigger studio_bookings_set_updated_at before update on studio_bookings for each row execute procedure set_updated_at();

drop trigger if exists tour_dates_set_updated_at on tour_dates;
create trigger tour_dates_set_updated_at before update on tour_dates for each row execute procedure set_updated_at();

drop trigger if exists studio_services_set_updated_at on studio_services;
create trigger studio_services_set_updated_at before update on studio_services for each row execute procedure set_updated_at();

-- ── Seed Data ────────────────────────────────────────────────────────────────
insert into tour_dates (city, venue, venue_address, start_date, end_date, total_slots, status, is_featured, deposit_price_kes) values
  ('Nairobi',  'Westlands Studio Hub',   'Westlands Ave, off Waiyaki Way, Nairobi',  '2026-08-08', '2026-08-10', 24, 'open',     true,  1500),
  ('Mombasa',  'Old Town Ink Collective','Nkrumah Road, Old Town, Mombasa',          '2026-08-22', '2026-08-23', 16, 'open',     false, 1500),
  ('Kisumu',   'Milimani Arts Quarter',   'Oginga Odinga St, Milimani, Kisumu',       '2026-09-05', '2026-09-06', 16, 'upcoming', false, 1500),
  ('Eldoret',  'Pioneers Mall Pop-up',    'Uganda Road, Pioneers Mall, Eldoret',      '2026-09-19', '2026-09-20', 12, 'upcoming', false, 1500)
on conflict do nothing;

insert into studio_services (category, title, starting_price_kes, deposit_required_kes, estimated_duration, description, display_order) values
  ('tattoo', 'Fine Line & Minimalist',  3500,  1000, '1 - 2 Hours',  'Delicate single-needle linework, micro tattoos and script.', 1),
  ('tattoo', 'Geometric & Mandala',     6500,  2000, '2 - 4 Hours',  'Symmetrical geometry, dotwork, sacred geometry and mandalas.', 2),
  ('tattoo', 'Blackwork & Tribal',      7000,  2000, '3 - 5 Hours',  'Heavy black ink coverage, pattern work, ornamental & tribal.', 3),
  ('tattoo', 'Neo-Traditional',         8000,  2500, '3 - 5 Hours',  'Bold outlines, illustrative shading, color or black-and-grey.', 4),
  ('tattoo', 'Full Sleeve / Back Piece', 25000, 5000, 'Multi-Session', 'Large scale custom project. Multi-session booking.', 5),
  ('piercing', 'Ear & Nose Piercing',   1500,  500,  '20 Mins',      'Sterile single-use needle piercing with starter jewelry.', 6),
  ('body_art', 'Temporary Henna Art',   1000,  300,  '30 Mins',      'Natural organic henna designs for events and occasions.', 7)
on conflict do nothing;

insert into studio_settings (id, min_deposit_kes, hourly_rate_kes) values
  ('default', 1000, 5000)
on conflict do nothing;
