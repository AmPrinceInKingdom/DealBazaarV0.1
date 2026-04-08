-- Signup role selection + seller request flow

do $$
begin
  if exists (select 1 from pg_type where typname = 'user_role') then
    alter type public.user_role add value if not exists 'seller';
    alter type public.user_role add value if not exists 'super_admin';
  end if;
end $$;

create table if not exists public.seller_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  store_name text not null,
  store_description text,
  contact_phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.seller_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  store_name text not null,
  store_description text,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.users(id) on delete set null,
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_seller_requests_user_id on public.seller_requests(user_id);
create index if not exists idx_seller_requests_status on public.seller_requests(status);
create unique index if not exists idx_unique_pending_seller_request_per_user
  on public.seller_requests(user_id)
  where status = 'pending';

drop trigger if exists trg_seller_profiles_updated_at on public.seller_profiles;
create trigger trg_seller_profiles_updated_at
before update on public.seller_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_seller_requests_updated_at on public.seller_requests;
create trigger trg_seller_requests_updated_at
before update on public.seller_requests
for each row execute function public.set_updated_at();

alter table public.seller_profiles enable row level security;
alter table public.seller_requests enable row level security;

drop policy if exists "Users and admin read seller profiles" on public.seller_profiles;
create policy "Users and admin read seller profiles"
on public.seller_profiles for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Owner and admin manage seller profiles" on public.seller_profiles;
create policy "Owner and admin manage seller profiles"
on public.seller_profiles for all
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Users can create own seller requests" on public.seller_requests;
create policy "Users can create own seller requests"
on public.seller_requests for insert
to authenticated
with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Users can view own seller requests" on public.seller_requests;
create policy "Users can view own seller requests"
on public.seller_requests for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Admin can update seller requests" on public.seller_requests;
create policy "Admin can update seller requests"
on public.seller_requests for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  normalized_role public.user_role;
begin
  requested_role := lower(coalesce(new.raw_user_meta_data->>'requested_role', 'customer'));
  normalized_role := case
    when requested_role = 'seller' then 'seller'::public.user_role
    else 'customer'::public.user_role
  end;

  insert into public.users (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    normalized_role
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    phone = excluded.phone,
    role = excluded.role;

  if normalized_role = 'seller' then
    insert into public.seller_profiles (
      user_id,
      store_name,
      store_description,
      contact_phone
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'store_name', 'My Store'),
      new.raw_user_meta_data->>'store_description',
      new.raw_user_meta_data->>'phone'
    )
    on conflict (user_id) do update
    set
      store_name = excluded.store_name,
      store_description = excluded.store_description,
      contact_phone = excluded.contact_phone;
  end if;

  return new;
end;
$$;
