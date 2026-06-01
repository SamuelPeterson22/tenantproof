create table public.invoices (
  id uuid primary key,
  tenant_id uuid not null,
  user_id uuid not null,
  amount numeric not null
);

alter table public.invoices enable row level security;

create policy "owners can read invoices"
on public.invoices
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "same tenant collaborators can read invoices"
on public.invoices
for select
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'tenant_id') = tenant_id::text);

create policy "owners can insert invoices"
on public.invoices
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "owners can update invoices"
on public.invoices
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "owners can delete invoices"
on public.invoices
for delete
to authenticated
using ((select auth.uid()) = user_id);

insert into public.invoices (id, tenant_id, user_id, amount)
values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000301',
  125
);
