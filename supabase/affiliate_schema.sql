-- ============================================================
-- IQFIT47 — Affiliate / Referral Module Schema
-- Run in Supabase SQL Editor after the main schema.sql
-- ============================================================

-- Affiliate profiles ------------------------------------------
-- One row per referrer, keyed by phone number.
-- The referral_code is the shareable token embedded in links.
create table if not exists affiliates (
  id                uuid primary key default gen_random_uuid(),
  phone             text unique not null,            -- 2547XXXXXXXX format
  display_name      text not null default '',        -- optional name they set
  referral_code     text unique not null,            -- e.g. "ABCD1234"
  referral_count    integer not null default 0,      -- confirmed successful referrals
  total_credit_kes  integer not null default 0,      -- lifetime KES credits earned
  pending_credit_kes integer not null default 0,     -- credits not yet redeemed
  rank              text not null default 'none'
    check (rank in ('none','bronze','silver','gold','platinum','legend')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists affiliates_phone_idx        on affiliates (phone);
create index if not exists affiliates_code_idx         on affiliates (referral_code);
create index if not exists affiliates_count_idx        on affiliates (referral_count desc);

-- Referral events ---------------------------------------------
-- Immutable audit log. One row per confirmed referred order.
create table if not exists referral_events (
  id              uuid primary key default gen_random_uuid(),
  affiliate_id    uuid not null references affiliates(id) on delete cascade,
  order_id        uuid,                              -- references orders(id)
  order_number    text not null,
  order_total_kes integer not null,
  credit_awarded  integer not null default 200,      -- KES credit given to referrer
  discount_given  integer not null default 0,        -- KES discount given to referee
  created_at      timestamptz not null default now()
);

create index if not exists referral_events_affiliate_idx on referral_events (affiliate_id);
create index if not exists referral_events_order_idx     on referral_events (order_number);

-- RPC function: atomically increment credit + rank --------------------------------
-- Called from the server API to avoid read-modify-write races.
create or replace function increment_affiliate_credit(
  p_affiliate_id uuid,
  p_credit       integer,
  p_rank         text,
  p_count        integer
)
returns void as $$
begin
  update affiliates
  set
    referral_count    = p_count,
    total_credit_kes  = total_credit_kes  + p_credit,
    pending_credit_kes = pending_credit_kes + p_credit,
    rank              = p_rank,
    updated_at        = now()
  where id = p_affiliate_id;
end;
$$ language plpgsql security definer;


-- updated_at triggers -----------------------------------------
drop trigger if exists affiliates_set_updated_at on affiliates;
create trigger affiliates_set_updated_at
  before update on affiliates
  for each row execute procedure set_updated_at();

-- Row Level Security ------------------------------------------
alter table affiliates      enable row level security;
alter table referral_events enable row level security;

-- Anyone can read affiliates (for leaderboard + code validation)
drop policy if exists "Public can read affiliates" on affiliates;
create policy "Public can read affiliates"
  on affiliates for select
  using (true);

-- Anyone can read referral events (aggregate stats)
drop policy if exists "Public can read referral_events" on referral_events;
create policy "Public can read referral_events"
  on referral_events for select
  using (true);

-- Only service role (server API routes) can insert/update/delete
-- No public insert/update policies → all writes go through server routes.
