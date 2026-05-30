create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null unique,
  group_name text,
  attending boolean not null default false,
  guests_count integer not null default 0,
  companions jsonb not null default '[]'::jsonb,
  allergies text,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gift_contributions (
  id uuid primary key default gen_random_uuid(),
  gift_id text not null,
  gift_title text not null,
  donor_name text not null,
  message text,
  amount numeric(10, 2) not null default 0,
  payment_method text not null default 'Pix',
  payment_status text not null default 'pending',
  payment_url text,
  provider_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;
alter table public.gift_contributions enable row level security;
alter table public.messages enable row level security;

create policy "Public can read approved messages"
on public.messages
for select
using (approved = true);
