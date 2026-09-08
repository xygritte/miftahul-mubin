-- Remove the SELECT overlap caused by an ALL policy plus a self-read policy.
-- Preserve the exact admin/super_admin write capability for user role management.
drop policy if exists user_roles_admin_manage on public.user_roles;

create policy user_roles_admin_insert on public.user_roles
for insert to authenticated
with check (public.has_role('admin') or public.has_role('super_admin'));

create policy user_roles_admin_update on public.user_roles
for update to authenticated
using (public.has_role('admin') or public.has_role('super_admin'))
with check (public.has_role('admin') or public.has_role('super_admin'));

create policy user_roles_admin_delete on public.user_roles
for delete to authenticated
using (public.has_role('admin') or public.has_role('super_admin'));