grant select, insert, update, delete on table public.announcements to authenticated;

create or replace function public.can_manage_announcements()
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

revoke all on function public.can_manage_announcements() from public;
grant execute on function public.can_manage_announcements() to authenticated;

drop policy if exists announcements_admin_read on public.announcements;
drop policy if exists announcements_editor_insert on public.announcements;
drop policy if exists announcements_editor_update on public.announcements;
drop policy if exists announcements_editor_delete on public.announcements;
drop policy if exists announcements_admin_insert on public.announcements;
drop policy if exists announcements_admin_update on public.announcements;
drop policy if exists announcements_admin_delete on public.announcements;

create policy announcements_admin_read
on public.announcements for select to authenticated
using (public.can_manage_announcements());

create policy announcements_admin_insert
on public.announcements for insert to authenticated
with check (public.can_manage_announcements());

create policy announcements_admin_update
on public.announcements for update to authenticated
using (public.can_manage_announcements())
with check (public.can_manage_announcements());

create policy announcements_admin_delete
on public.announcements for delete to authenticated
using (public.can_manage_announcements());
