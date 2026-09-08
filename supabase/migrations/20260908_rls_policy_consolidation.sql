-- Consolidate RLS policies without changing intended access rules.
-- Public content remains public to anonymous users; authenticated staff use their staff policies.

-- Restrict public-read policies to anon so authenticated requests do not evaluate
-- both the public-read and authenticated staff-read policies.
drop policy if exists announcements_public_read on public.announcements;
create policy announcements_public_read on public.announcements
for select to anon
using (status = 'published' and published_at is not null and published_at <= now());

drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events
for select to anon
using (status = 'published');

drop policy if exists finance_categories_public_read on public.finance_categories;
create policy finance_categories_public_read on public.finance_categories
for select to anon
using (true);

drop policy if exists finance_periods_public_read on public.finance_periods;
create policy finance_periods_public_read on public.finance_periods
for select to anon
using (published_at is not null and published_at <= now());

drop policy if exists finance_transactions_public_read on public.finance_transactions;
create policy finance_transactions_public_read on public.finance_transactions
for select to anon
using (
  status = 'published'
  and exists (
    select 1
    from public.finance_periods p
    where p.id = finance_transactions.period_id
      and p.published_at is not null
      and p.published_at <= now()
  )
);

drop policy if exists islamic_public_read on public.islamic_articles;
create policy islamic_public_read on public.islamic_articles
for select to anon
using (status = 'published' and published_at is not null and published_at <= now());

drop policy if exists management_members_public_read on public.management_members;
create policy management_members_public_read on public.management_members
for select to anon
using (
  exists (
    select 1
    from public.management_periods p
    where p.id = management_members.period_id
      and p.is_active = true
  )
);

drop policy if exists management_periods_public_read on public.management_periods;
create policy management_periods_public_read on public.management_periods
for select to anon
using (is_active = true);

drop policy if exists media_albums_public_read on public.media_albums;
create policy media_albums_public_read on public.media_albums
for select to anon
using (true);

drop policy if exists media_items_public_read on public.media_items;
create policy media_items_public_read on public.media_items
for select to anon
using (true);

drop policy if exists news_public_read on public.news;
create policy news_public_read on public.news
for select to anon
using (status = 'published' and published_at is not null and published_at <= now());

-- Keep categories publicly readable and authenticated-readable because the admin UI
-- uses them for editing forms and there is no separate authenticated categories policy.

-- Audit logs are never public; limit their policy to authenticated users.
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
for select to authenticated
using (public.has_role('admin') or public.has_role('super_admin'));

-- site_settings is public content plus authenticated admin write access. Restrict the
-- read policy to anon so authenticated admin requests use the admin write/read path only.
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
for select to anon
using (true);

-- The management secretary policies duplicated can_manage_management(), which already
-- grants the same super_admin/admin/secretary role set. Remove the duplicate policies.
drop policy if exists management_members_secretary_delete on public.management_members;
drop policy if exists management_members_secretary_insert on public.management_members;
drop policy if exists management_members_secretary_update on public.management_members;
drop policy if exists management_periods_secretary_delete on public.management_periods;
drop policy if exists management_periods_secretary_insert on public.management_periods;
drop policy if exists management_periods_secretary_update on public.management_periods;

-- Profiles had overlapping update policies. Replace them with one policy preserving
-- self-update plus administrator/secretary management access.
drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_update on public.profiles
for update to authenticated
using (
  (select auth.uid()) = user_id
  or public.has_role('super_admin')
  or public.has_role('admin')
  or public.has_role('secretary')
)
with check (
  (select auth.uid()) = user_id
  or public.has_role('super_admin')
  or public.has_role('admin')
  or public.has_role('secretary')
);