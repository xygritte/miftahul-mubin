-- Kegiatan uses a dedicated authorization function so its CRUD policy is
-- independent from generic content-role helpers.
create or replace function public.can_manage_events()
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

drop policy if exists events_editor_insert on public.events;
drop policy if exists events_editor_update on public.events;
drop policy if exists events_editor_delete on public.events;
drop policy if exists events_admin_insert on public.events;
drop policy if exists events_admin_update on public.events;
drop policy if exists events_admin_delete on public.events;

create policy events_admin_insert on public.events
  for insert to authenticated
  with check (public.can_manage_events());

create policy events_admin_update on public.events
  for update to authenticated
  using (public.can_manage_events())
  with check (public.can_manage_events());

create policy events_admin_delete on public.events
  for delete to authenticated
  using (public.can_manage_events());
