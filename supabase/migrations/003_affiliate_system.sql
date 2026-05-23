-- 003_affiliate_system.sql
-- Affiliate System: affiliates, referrals, payouts tables + orders migration

-- ── affiliates ──────────────────────────────────────────────────────────────
create table public.affiliates (
  id uuid references auth.users primary key,
  created_at timestamp with time zone default now(),
  nama text not null,
  telefon text not null,
  bank_name text not null,
  bank_account text not null,
  bank_holder_name text not null,
  ref_code text unique not null,
  status text default 'pending',
  total_earned numeric default 0,
  total_paid numeric default 0
);

grant select on public.affiliates to anon;
grant select, insert, update, delete on public.affiliates to authenticated;
grant select, insert, update, delete on public.affiliates to service_role;

alter table public.affiliates enable row level security;

create policy "affiliate_own_record"
  on public.affiliates for all
  using (auth.uid() = id);

-- ── payouts ──────────────────────────────────────────────────────────────────
-- Create payouts BEFORE referrals (referrals references payouts)
create table public.payouts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  affiliate_id uuid references public.affiliates(id) not null,
  payout_month text not null,
  total_amount numeric not null,
  status text default 'pending',
  paid_at timestamp with time zone,
  payment_reference text,
  note text
);

grant select on public.payouts to anon;
grant select, insert, update, delete on public.payouts to authenticated;
grant select, insert, update, delete on public.payouts to service_role;

alter table public.payouts enable row level security;

create policy "affiliate_own_payouts"
  on public.payouts for select
  using (affiliate_id = auth.uid());

-- ── referrals ────────────────────────────────────────────────────────────────
create table public.referrals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  affiliate_id uuid references public.affiliates(id) not null,
  order_id uuid references public.orders(id) not null,
  order_amount numeric not null,
  commission_rate numeric default 0.40,
  commission_amount numeric not null,
  earned_month text not null,
  status text default 'pending',
  paid_at timestamp with time zone,
  payout_id uuid references public.payouts(id)
);

grant select on public.referrals to anon;
grant select, insert, update, delete on public.referrals to authenticated;
grant select, insert, update, delete on public.referrals to service_role;

alter table public.referrals enable row level security;

create policy "affiliate_own_referrals"
  on public.referrals for select
  using (affiliate_id = auth.uid());

-- ── orders: add affiliate tracking columns ───────────────────────────────────
alter table public.orders add column if not exists affiliate_ref_code text;
alter table public.orders add column if not exists commission_calculated boolean default false;
