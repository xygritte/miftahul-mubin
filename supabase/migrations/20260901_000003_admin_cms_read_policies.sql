-- Allow authorized admin/editor roles to read unpublished CMS rows.
-- Public read policies remain restricted to published/public content.

create policy announcements_admin_read
  on public.announcements
  for select to authenticated
  using (public.has_role('super_admin') or public.has_role('admin') or public.has_role('editor'));

create policy events_admin_read
  on public.events
  for select to authenticated
  using (public.has_role('super_admin') or public.has_role('admin') or public.has_role('editor'));

create policy islamic_articles_admin_read
  on public.islamic_articles
  for select to authenticated
  using (public.has_role('super_admin') or public.has_role('admin') or public.has_role('editor'));

create policy management_periods_admin_read
  on public.management_periods
  for select to authenticated
  using (public.has_role('super_admin') or public.has_role('admin') or public.has_role('secretary'));

create policy management_members_admin_read
  on public.management_members
  for select to authenticated
  using (public.has_role('super_admin') or public.has_role('admin') or public.has_role('secretary'));

create policy media_albums_admin_read
  on public.media_albums
  for select to authenticated
  using (public.has_role('super_admin') or public.has_role('admin') or public.has_role('editor'));

create policy media_items_admin_read
  on public.media_items
  for select to authenticated
  using (public.has_role('super_admin') or public.has_role('admin') or public.has_role('editor'));

create policy finance_periods_admin_read
  on public.finance_periods
  for select to authenticated
  using (public.has_role('super_admin') or public.has_role('admin') or public.has_role('treasurer'));

create policy finance_transactions_admin_read
  on public.finance_transactions
  for select to authenticated
  using (public.has_role('super_admin') or public.has_role('admin') or public.has_role('treasurer'));

create policy finance_categories_admin_read
  on public.finance_categories
  for select to authenticated
  using (public.has_role('super_admin') or public.has_role('admin') or public.has_role('treasurer'));

create policy news_admin_read
  on public.news
  for select to authenticated
  using (public.has_role('super_admin') or public.has_role('admin') or public.has_role('editor'));
