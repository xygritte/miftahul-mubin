grant select, insert, update, delete on table public.media_albums to authenticated;
grant select, insert, update, delete on table public.media_items to authenticated;

create or replace function public.can_manage_documentation()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('super_admin', 'admin', 'editor')
  );
$$;

revoke all on function public.can_manage_documentation() from public;
grant execute on function public.can_manage_documentation() to authenticated;

drop policy if exists media_admin_delete on public.media_albums;
drop policy if exists media_admin_insert on public.media_albums;
drop policy if exists media_admin_update on public.media_albums;
drop policy if exists media_albums_admin_read on public.media_albums;
create policy media_albums_admin_read on public.media_albums
for select to authenticated using (public.can_manage_documentation());
create policy media_albums_admin_insert on public.media_albums
for insert to authenticated with check (public.can_manage_documentation());
create policy media_albums_admin_update on public.media_albums
for update to authenticated using (public.can_manage_documentation()) with check (public.can_manage_documentation());
create policy media_albums_admin_delete on public.media_albums
for delete to authenticated using (public.can_manage_documentation());

drop policy if exists media_item_admin_delete on public.media_items;
drop policy if exists media_item_admin_insert on public.media_items;
drop policy if exists media_item_admin_update on public.media_items;
drop policy if exists media_items_admin_read on public.media_items;
create policy media_items_admin_read on public.media_items
for select to authenticated using (public.can_manage_documentation());
create policy media_items_admin_insert on public.media_items
for insert to authenticated with check (public.can_manage_documentation());
create policy media_items_admin_update on public.media_items
for update to authenticated using (public.can_manage_documentation()) with check (public.can_manage_documentation());
create policy media_items_admin_delete on public.media_items
for delete to authenticated using (public.can_manage_documentation());
