grant select, insert, update, delete on table public.islamic_articles to authenticated;

create or replace function public.can_manage_islamic()
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

revoke all on function public.can_manage_islamic() from public;
grant execute on function public.can_manage_islamic() to authenticated;

drop policy if exists islamic_articles_admin_read on public.islamic_articles;
drop policy if exists islamic_editor_insert on public.islamic_articles;
drop policy if exists islamic_editor_update on public.islamic_articles;
drop policy if exists islamic_editor_delete on public.islamic_articles;

create policy islamic_admin_read on public.islamic_articles
for select to authenticated
using (public.can_manage_islamic());

create policy islamic_admin_insert on public.islamic_articles
for insert to authenticated
with check (public.can_manage_islamic());

create policy islamic_admin_update on public.islamic_articles
for update to authenticated
using (public.can_manage_islamic())
with check (public.can_manage_islamic());

create policy islamic_admin_delete on public.islamic_articles
for delete to authenticated
using (public.can_manage_islamic());
