create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  attending boolean, -- null = sem resposta, true = confirmado, false = recusou
  allergies text,
  message text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint guest_name_family_unique unique (family_id, name)
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
  invite_slug text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.families enable row level security;
alter table public.guests enable row level security;
alter table public.gift_contributions enable row level security;
alter table public.messages enable row level security;

-- Policies for Messages
create policy "Public can read approved messages"
on public.messages
for select
using (approved = true);

-- Policies for Families & Guests (Allow read/write through Service Role which bypasses RLS,
-- but define public read policies for safety)
create policy "Allow public read access to families" on public.families for select using (true);
create policy "Allow public read access to guests" on public.guests for select using (true);
create policy "Allow public update access to guests" on public.guests for update using (true);
