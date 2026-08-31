-- Miftahul Mubin — initial Supabase schema
-- Designed for the public portal + future admin CMS.

create extension if not exists pgcrypto;

create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.event_status as enum ('draft', 'published', 'cancelled', 'completed');
create type public.finance_type as enum ('income', 'expense');
create type public.media_type as enum ('image', 'video');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  type text not null check (type in ('news', 'islamic', 'event', 'announcement', 'gallery')),
  created_at timestamptz not null default now(),
  unique (slug, type)
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content jsonb not null default '[]'::jsonb,
  thumbnail_url text,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  view_count bigint not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.islamic_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content jsonb not null default '[]'::jsonb,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  view_count bigint not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  event_date date not null,
  start_time time not null,
  end_time time,
  location text not null default '',
  speaker text,
  category_id uuid references public.categories(id) on delete set null,
  status public.event_status not null default 'draft',
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time is null or end_time >= start_time)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.management_periods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.management_members (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.management_periods(id) on delete cascade,
  name text not null,
  position text not null,
  photo_url text,
  bio text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.media_albums(id) on delete cascade,
  type public.media_type not null default 'image',
  title text,
  url text not null,
  thumbnail_url text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.finance_type not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, type)
);

create table public.finance_periods (
  id uuid primary key default gen_random_uuid(),
  year integer not null check (year between 2000 and 2100),
  month integer not null check (month between 1 and 12),
  opening_balance numeric(18,2) not null default 0 check (opening_balance >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (year, month)
);

create table public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.finance_periods(id) on delete restrict,
  transaction_date date not null,
  type public.finance_type not null,
  category_id uuid not null references public.finance_categories(id) on delete restrict,
  description text not null,
  amount numeric(18,2) not null check (amount > 0),
  proof_url text,
  created_by uuid references auth.users(id) on delete set null,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index news_published_idx on public.news (published_at desc) where status = 'published';
create index islamic_published_idx on public.islamic_articles (published_at desc) where status = 'published';
create index events_date_idx on public.events (event_date, start_time);
create index announcements_published_idx on public.announcements (published_at desc) where status = 'published';
create index management_members_order_idx on public.management_members (period_id, sort_order);
create index media_items_order_idx on public.media_items (album_id, sort_order);
create index finance_transactions_period_idx on public.finance_transactions (period_id, transaction_date desc);

insert into public.roles (name) values ('admin'), ('editor'), ('treasurer') on conflict do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger news_updated_at before update on public.news for each row execute function public.set_updated_at();
create trigger islamic_updated_at before update on public.islamic_articles for each row execute function public.set_updated_at();
create trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger announcements_updated_at before update on public.announcements for each row execute function public.set_updated_at();
create trigger management_periods_updated_at before update on public.management_periods for each row execute function public.set_updated_at();
create trigger management_members_updated_at before update on public.management_members for each row execute function public.set_updated_at();
create trigger media_albums_updated_at before update on public.media_albums for each row execute function public.set_updated_at();
create trigger media_items_updated_at before update on public.media_items for each row execute function public.set_updated_at();
create trigger finance_categories_updated_at before update on public.finance_categories for each row execute function public.set_updated_at();
create trigger finance_periods_updated_at before update on public.finance_periods for each row execute function public.set_updated_at();
create trigger finance_transactions_updated_at before update on public.finance_transactions for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
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
alter table public.audit_logs enable row level security;

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = required_role
  );
$$;

create or replace function public.is_admin_or_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin') or public.has_role('editor');
$$;

create or replace function public.is_admin_or_treasurer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin') or public.has_role('treasurer');
$$;

-- Public read policies: only published content is exposed.
create policy categories_public_read on public.categories for select using (true);
create policy news_public_read on public.news for select using (status = 'published');
create policy islamic_public_read on public.islamic_articles for select using (status = 'published');
create policy events_public_read on public.events for select using (status = 'published');
create policy announcements_public_read on public.announcements for select using (status = 'published');
create policy management_periods_public_read on public.management_periods for select using (is_active = true);
create policy management_members_public_read on public.management_members for select using (
  exists (select 1 from public.management_periods p where p.id = period_id and p.is_active = true)
);
create policy media_albums_public_read on public.media_albums for select using (true);
create policy media_items_public_read on public.media_items for select using (true);
create policy finance_periods_public_read on public.finance_periods for select using (published_at is not null);
create policy finance_transactions_public_read on public.finance_transactions for select using (
  status = 'published' and exists (
    select 1 from public.finance_periods p where p.id = period_id and p.published_at is not null
  )
);

-- Admin/editor write access for editorial content.
create policy news_staff_read on public.news for select using (public.is_admin_or_editor());
create policy news_staff_insert on public.news for insert with check (public.is_admin_or_editor());
create policy news_staff_update on public.news for update using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());
create policy news_staff_delete on public.news for delete using (public.has_role('admin'));

create policy islamic_staff_read on public.islamic_articles for select using (public.is_admin_or_editor());
create policy islamic_staff_insert on public.islamic_articles for insert with check (public.is_admin_or_editor());
create policy islamic_staff_update on public.islamic_articles for update using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());
create policy islamic_staff_delete on public.islamic_articles for delete using (public.has_role('admin'));

create policy events_staff_read on public.events for select using (public.is_admin_or_editor());
create policy events_staff_insert on public.events for insert with check (public.is_admin_or_editor());
create policy events_staff_update on public.events for update using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());
create policy events_staff_delete on public.events for delete using (public.has_role('admin'));

create policy announcements_staff_read on public.announcements for select using (public.is_admin_or_editor());
create policy announcements_staff_insert on public.announcements for insert with check (public.is_admin_or_editor());
create policy announcements_staff_update on public.announcements for update using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());
create policy announcements_staff_delete on public.announcements for delete using (public.has_role('admin'));

create policy management_periods_staff_all on public.management_periods for all using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());
create policy management_members_staff_all on public.management_members for all using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());
create policy media_albums_staff_all on public.media_albums for all using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());
create policy media_items_staff_all on public.media_items for all using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());

create policy finance_categories_staff_read on public.finance_categories for select using (public.is_admin_or_treasurer());
create policy finance_categories_staff_write on public.finance_categories for all using (public.is_admin_or_treasurer()) with check (public.is_admin_or_treasurer());
create policy finance_periods_staff_read on public.finance_periods for select using (public.is_admin_or_treasurer());
create policy finance_periods_staff_write on public.finance_periods for all using (public.is_admin_or_treasurer()) with check (public.is_admin_or_treasurer());
create policy finance_transactions_staff_read on public.finance_transactions for select using (public.is_admin_or_treasurer());
create policy finance_transactions_staff_write on public.finance_transactions for all using (public.is_admin_or_treasurer()) with check (public.is_admin_or_treasurer());

create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.has_role('admin'));
create policy profiles_self_update on public.profiles for update using (id = auth.uid() or public.has_role('admin')) with check (id = auth.uid() or public.has_role('admin'));
create policy profiles_self_insert on public.profiles for insert with check (id = auth.uid() or public.has_role('admin'));

create policy roles_authenticated_read on public.roles for select using (auth.uid() is not null);
create policy user_roles_admin_manage on public.user_roles for all using (public.has_role('admin')) with check (public.has_role('admin'));

create policy audit_logs_admin_read on public.audit_logs for select using (public.has_role('admin'));
create policy audit_logs_staff_insert on public.audit_logs for insert with check (auth.uid() is not null);

-- The finance proof bucket must remain private. Public UI should use signed URLs later.
