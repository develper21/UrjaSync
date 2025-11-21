-- Microgrid schema for Supabase/Postgres
-- Creates microgrids, microgrid_members, and energy_trades tables plus indexes.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'trade_status') then
    create type trade_status as enum ('pending', 'settled', 'rejected');
  end if;
end $$;

create table if not exists public.microgrids (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  households integer not null check (households > 0),
  invites_open boolean not null default true,
  description text,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.microgrid_members (
  id uuid primary key default gen_random_uuid(),
  microgrid_id uuid not null references public.microgrids(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  surplus_kwh numeric(10,2) not null default 0,
  peak_cut_pct numeric(5,2) not null default 0,
  tier text not null default 'Bronze',
  badges jsonb not null default '[]'::jsonb,
  credits numeric(12,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (microgrid_id, user_id)
);

create index if not exists idx_microgrid_members_user on public.microgrid_members (user_id);
create index if not exists idx_microgrid_members_microgrid on public.microgrid_members (microgrid_id);

create table if not exists public.energy_trades (
  id uuid primary key default gen_random_uuid(),
  from_member_id uuid not null references public.microgrid_members(id) on delete cascade,
  to_member_id uuid not null references public.microgrid_members(id) on delete cascade,
  amount_kwh numeric(10,3) not null check (amount_kwh > 0),
  credit_value numeric(12,2) not null check (credit_value >= 0),
  price_per_kwh numeric(8,2) not null check (price_per_kwh > 0),
  status trade_status not null default 'pending',
  settled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_energy_trades_from_member on public.energy_trades (from_member_id);
create index if not exists idx_energy_trades_to_member on public.energy_trades (to_member_id);
create index if not exists idx_energy_trades_status_created on public.energy_trades (status, created_at);

alter table public.microgrids enable row level security;
alter table public.microgrid_members enable row level security;
alter table public.energy_trades enable row level security;

create or replace function public.is_microgrid_admin(microgrid_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.microgrid_members m
    where m.microgrid_id = is_microgrid_admin.microgrid_id
      and m.user_id = auth.uid()
      and m.tier in ('Gold', 'Platinum')
  );
$$;

create policy "microgrid-admin-manage"
on public.microgrids
using (public.is_microgrid_admin(id));

create policy "members-manage-self"
on public.microgrid_members
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "trade-visible-to-parties"
on public.energy_trades
using (
  exists (
    select 1 from public.microgrid_members m
    where m.id = energy_trades.from_member_id and m.user_id = auth.uid()
  )
  or exists (
    select 1 from public.microgrid_members m
    where m.id = energy_trades.to_member_id and m.user_id = auth.uid()
  )
);

create policy "create-trade-if-owner"
on public.energy_trades
for insert
with check (
  exists (
    select 1 from public.microgrid_members m
    where m.id = energy_trades.from_member_id
      and m.user_id = auth.uid()
  )
);
