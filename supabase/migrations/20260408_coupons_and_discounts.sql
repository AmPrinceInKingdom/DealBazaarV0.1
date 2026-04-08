-- Coupons + order discount support

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  min_order_total numeric(10,2) not null default 0 check (min_order_total >= 0),
  max_discount_amount numeric(10,2) check (
    max_discount_amount is null or max_discount_amount >= 0
  ),
  usage_limit int check (usage_limit is null or usage_limit > 0),
  used_count int not null default 0 check (used_count >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_coupons_active on public.coupons(is_active);
create index if not exists idx_coupons_date_window on public.coupons(starts_at, ends_at);

alter table public.orders
  add column if not exists coupon_id uuid references public.coupons(id) on delete set null,
  add column if not exists coupon_code text,
  add column if not exists discount_amount numeric(10,2) not null default 0 check (discount_amount >= 0);

drop trigger if exists trg_coupons_updated_at on public.coupons;
create trigger trg_coupons_updated_at
before update on public.coupons
for each row execute function public.set_updated_at();

create or replace function public.is_super_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users
    where id = uid
      and role = 'super_admin'
  );
$$;

create or replace function public.consume_coupon(p_coupon_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.coupons
  set used_count = used_count + 1
  where id = p_coupon_id;
end;
$$;

revoke execute on function public.consume_coupon(uuid) from public;
grant execute on function public.consume_coupon(uuid) to authenticated;

alter table public.coupons enable row level security;

drop policy if exists "Authenticated can read active coupons" on public.coupons;
create policy "Authenticated can read active coupons"
on public.coupons
for select
to authenticated
using (
  is_active = true
  or public.is_admin(auth.uid())
  or public.is_super_admin(auth.uid())
);

drop policy if exists "Super admin manage coupons" on public.coupons;
create policy "Super admin manage coupons"
on public.coupons
for all
to authenticated
using (public.is_super_admin(auth.uid()))
with check (public.is_super_admin(auth.uid()));
