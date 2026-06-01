create table public.invoices (
  id uuid primary key,
  tenant_id uuid not null,
  user_id uuid not null,
  amount numeric not null
);

alter table public.invoices enable row level security;

create policy "users can read their invoices"
on public.invoices
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users can insert their invoices"
on public.invoices
for insert
to authenticated
with check ((select auth.uid()) = user_id);
