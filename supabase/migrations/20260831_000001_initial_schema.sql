-- Miftahul Mubin initial database schema.
-- Applied to Supabase project xzcwmplikcavrbiuuxcc on 2026-08-31.
-- Keep this migration as the source-of-truth record for the production schema.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  type text not null check (type in ('news','islamic','event','announcement','gallery')),
  created_at timestamptz not null default now(),
  unique (slug, type)
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  excerpt text not null default '', content jsonb not null default '[]'::jsonb,
  thumbnail_url text, category_id uuid references public.categories(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz, view_count bigint not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.islamic_articles (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  excerpt text not null default '', content jsonb not null default '[]'::jsonb,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  description text not null default '', event_date date not null, start_time time, end_time time,
  location text not null default '', speaker text, status text not null default 'draft'
    check (status in ('draft','published','cancelled','completed')), cover_url text,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(), title text not null, content text not null default '',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz, author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.management_periods (
  id uuid primary key default gen_random_uuid(), name text not null, start_date date not null,
  end_date date, is_active boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.management_members (
  id uuid primary key default gen_random_uuid(), period_id uuid not null references public.management_periods(id) on delete cascade,
  name text not null, position text not null, photo_url text, bio text, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.media_albums (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  description text, cover_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(), album_id uuid not null references public.media_albums(id) on delete cascade,
  type text not null default 'image' check (type in ('image','video')), title text, url text not null,
  thumbnail_url text, caption text, sort_order integer not null default 0, created_at timestamptz not null default now()
);

create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(), name text not null,
  type text not null check (type in ('income','expense')), description text,
  created_at timestamptz not null default now(), unique(name, type)
);

create table if not exists public.finance_periods (
  id uuid primary key default gen_random_uuid(), year smallint not null, month smallint not null,
  opening_balance numeric(18,2) not null default 0, published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(year, month)
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(), period_id uuid not null references public.finance_periods(id) on delete restrict,
  transaction_date date not null, type text not null check (type in ('income','expense')),
  category_id uuid references public.finance_categories(id) on delete set null,
  description text not null, amount numeric(18,2) not null check(amount > 0), proof_url text,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.roles (id uuid primary key default gen_random_uuid(), name text not null unique, description text, created_at timestamptz not null default now());
create table if not exists public.user_roles (user_id uuid not null references auth.users(id) on delete cascade, role_id uuid not null references public.roles(id) on delete cascade, created_at timestamptz not null default now(), primary key(user_id, role_id));
create table if not exists public.profiles (id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade, full_name text not null, avatar_url text, phone text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.audit_logs (id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id) on delete set null, entity_type text not null, entity_id uuid, action text not null, old_data jsonb, new_data jsonb, created_at timestamptz not null default now());

-- RLS is intentionally enabled for every application table. Public content policies are
-- applied in the Supabase project; admin write access is role-gated there.
alter table public.categories enable row level security;
alter table public.news enable row level security;
alter table public.islamic_articles enable row level security;
alter table public.events enable row level security;
alter table public.announcements enable row level security;
alter table public.management_periods enable row level security;
alter table public.management_members enable row level security;
alter table public.media_albums enable row level security;
alter table public.media_items enable row level security;
alter table public.finance_categories enable row level security;
alter table public.finance_periods enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_logs enable row level security;
