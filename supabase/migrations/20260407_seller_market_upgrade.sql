-- Seller + Market preferences upgrade for Deal Bazaar

-- ---------- Extend role enum ----------
do $$
begin
  if exists (select 1 from pg_type where typname = 'user_role') then
    alter type public.user_role add value if not exists 'seller';
  end if;
end $$;

-- ---------- Users preferences ----------
alter table if exists public.users
  add column if not exists preferred_currency text,
  add column if not exists preferred_language text;

-- ---------- Product seller ownership ----------
alter table if exists public.products
  add column if not exists seller_id uuid references public.users(id) on delete set null;

create index if not exists idx_products_seller_id on public.products(seller_id);

-- ---------- Order items seller reference ----------
alter table if exists public.order_items
  add column if not exists seller_id uuid references public.users(id) on delete set null;

create index if not exists idx_order_items_seller_id on public.order_items(seller_id);

-- ---------- Seller orders ----------
create table if not exists public.seller_orders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  seller_id uuid not null references public.users(id) on delete cascade,
  status public.order_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (order_id, seller_id)
);

create index if not exists idx_seller_orders_seller_id on public.seller_orders(seller_id);
create index if not exists idx_seller_orders_order_id on public.seller_orders(order_id);

drop trigger if exists trg_seller_orders_updated_at on public.seller_orders;
create trigger trg_seller_orders_updated_at
before update on public.seller_orders
for each row execute function public.set_updated_at();

alter table public.seller_orders enable row level security;

-- ---------- Policy upgrades ----------
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
on public.orders for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
  or exists (
    select 1 from public.seller_orders
    where seller_orders.order_id = orders.id
      and seller_orders.seller_id = auth.uid()
  )
);

drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
  or order_items.seller_id = auth.uid()
);

drop policy if exists "Seller can manage own products" on public.products;
create policy "Seller can manage own products"
on public.products for all
to authenticated
using (
  public.is_admin(auth.uid())
  or seller_id = auth.uid()
)
with check (
  public.is_admin(auth.uid())
  or seller_id = auth.uid()
);

drop policy if exists "Seller can view assigned seller orders" on public.seller_orders;
create policy "Seller can view assigned seller orders"
on public.seller_orders for select
to authenticated
using (public.is_admin(auth.uid()) or seller_id = auth.uid());

drop policy if exists "Customers can create seller order mappings" on public.seller_orders;
create policy "Customers can create seller order mappings"
on public.seller_orders for insert
to authenticated
with check (
  public.is_admin(auth.uid())
  or exists (
    select 1 from public.orders
    where orders.id = seller_orders.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "Sellers and admin can update seller order status" on public.seller_orders;
create policy "Sellers and admin can update seller order status"
on public.seller_orders for update
to authenticated
using (public.is_admin(auth.uid()) or seller_id = auth.uid())
with check (public.is_admin(auth.uid()) or seller_id = auth.uid());
