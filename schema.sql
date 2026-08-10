create table public.families (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text not null,
  created_at timestamp with time zone not null default now(),
  constraint families_pkey primary key (id),
  constraint families_slug_key unique (slug)
) TABLESPACE pg_default;

create table public.gift_contributions (
  id uuid not null default gen_random_uuid (),
  gift_id text not null,
  gift_title text not null,
  donor_name text not null,
  message text null,
  amount numeric(10, 2) not null default 0,
  payment_method text not null default 'Pix'::text,
  payment_status text not null default 'pending'::text,
  payment_url text null,
  provider_payment_id text null,
  paid_at timestamp with time zone null,
  invite_slug text null,
  created_at timestamp with time zone not null default now(),
  constraint gift_contributions_pkey primary key (id)
) TABLESPACE pg_default;

create table public.guests (
  id uuid not null default gen_random_uuid (),
  family_id uuid not null,
  name text not null,
  attending boolean null,
  allergies text null,
  message text null,
  confirmed_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  constraint guests_pkey primary key (id),
  constraint guest_name_family_unique unique (family_id, name),
  constraint guests_family_id_fkey foreign KEY (family_id) references families (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.messages (
  id uuid not null default gen_random_uuid (),
  name text not null,
  message text not null,
  approved boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint messages_pkey primary key (id)
) TABLESPACE pg_default;