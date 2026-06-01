create table public.invoices (
  id uuid primary key,
  tenant_id uuid not null,
  user_id uuid not null,
  amount numeric not null
);

grant select, insert, update on public.invoices to authenticated;

create table public.profiles (
  id uuid primary key,
  user_id uuid not null
);

alter table public.profiles enable row level security;

create policy "profiles are visible to everyone"
on public.profiles
for select
to authenticated
using (true);
