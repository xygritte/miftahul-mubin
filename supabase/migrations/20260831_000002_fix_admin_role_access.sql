-- Allow authenticated users to read their own role assignment so the client-side
-- admin guard can resolve access without a circular RLS dependency.
drop policy if exists user_roles_self_read on public.user_roles;
create policy user_roles_self_read on public.user_roles
  for select
  using (user_id = auth.uid() or public.has_role('admin') or public.has_role('super_admin'));

-- Support both the original `admin` role and the newer `super_admin` role.
create or replace function public.is_admin_or_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin') or public.has_role('super_admin') or public.has_role('editor');
$$;

create or replace function public.is_admin_or_treasurer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin') or public.has_role('super_admin') or public.has_role('treasurer');
$$;

-- Super admins have unrestricted administrative role-management capability.
drop policy if exists user_roles_admin_manage on public.user_roles;
create policy user_roles_admin_manage on public.user_roles
  for all
  using (public.has_role('admin') or public.has_role('super_admin'))
  with check (public.has_role('admin') or public.has_role('super_admin'));

drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
  for select
  using (public.has_role('admin') or public.has_role('super_admin'));
