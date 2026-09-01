grant select, insert, update, delete on table public.finance_periods to authenticated;
grant select, insert, update, delete on table public.finance_categories to authenticated;
grant select, insert, update, delete on table public.finance_transactions to authenticated;

create or replace function public.can_manage_finance()
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
      and r.name in ('super_admin', 'admin', 'treasurer')
  );
$$;

revoke all on function public.can_manage_finance() from public;
grant execute on function public.can_manage_finance() to authenticated;

drop policy if exists finance_periods_admin_read on public.finance_periods;
drop policy if exists finance_period_treasurer_insert on public.finance_periods;
drop policy if exists finance_period_treasurer_update on public.finance_periods;
drop policy if exists finance_period_treasurer_delete on public.finance_periods;
create policy finance_periods_admin_read on public.finance_periods for select to authenticated using (public.can_manage_finance());
create policy finance_periods_admin_insert on public.finance_periods for insert to authenticated with check (public.can_manage_finance());
create policy finance_periods_admin_update on public.finance_periods for update to authenticated using (public.can_manage_finance()) with check (public.can_manage_finance());
create policy finance_periods_admin_delete on public.finance_periods for delete to authenticated using (public.can_manage_finance());

drop policy if exists finance_categories_admin_read on public.finance_categories;
drop policy if exists finance_category_treasurer_insert on public.finance_categories;
drop policy if exists finance_category_treasurer_update on public.finance_categories;
drop policy if exists finance_category_treasurer_delete on public.finance_categories;
create policy finance_categories_admin_read on public.finance_categories for select to authenticated using (public.can_manage_finance());
create policy finance_categories_admin_insert on public.finance_categories for insert to authenticated with check (public.can_manage_finance());
create policy finance_categories_admin_update on public.finance_categories for update to authenticated using (public.can_manage_finance()) with check (public.can_manage_finance());
create policy finance_categories_admin_delete on public.finance_categories for delete to authenticated using (public.can_manage_finance());

drop policy if exists finance_transactions_admin_read on public.finance_transactions;
drop policy if exists finance_transaction_treasurer_insert on public.finance_transactions;
drop policy if exists finance_transaction_treasurer_update on public.finance_transactions;
drop policy if exists finance_transaction_treasurer_delete on public.finance_transactions;
create policy finance_transactions_admin_read on public.finance_transactions for select to authenticated using (public.can_manage_finance());
create policy finance_transactions_admin_insert on public.finance_transactions for insert to authenticated with check (public.can_manage_finance());
create policy finance_transactions_admin_update on public.finance_transactions for update to authenticated using (public.can_manage_finance()) with check (public.can_manage_finance());
create policy finance_transactions_admin_delete on public.finance_transactions for delete to authenticated using (public.can_manage_finance());

drop policy if exists storage_finance_proofs_insert on storage.objects;
create policy storage_finance_proofs_insert on storage.objects for insert to authenticated with check ((bucket_id = 'finance-proofs') and (has_role('super_admin') or has_role('admin') or has_role('treasurer')));
