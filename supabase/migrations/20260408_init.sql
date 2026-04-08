-- Deal Bazaar Initial Schema
-- Final fixed version for Supabase
-- Run in Supabase SQL Editor or use as your migration file

create extension if not exists "pgcrypto";

-- =========================================================
-- TYPES
-- =========================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('customer', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'stock_status') then
    create type public.stock_status as enum ('in_stock', 'out_of_stock', 'low_stock');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum ('bank_transfer', 'card');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum (
      'pending',
      'submitted',
      'under_review',
      'approved',
      'rejected'
    );
  end if;
end $$;

-- =========================================================
-- GENERIC FUNCTIONS
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- =========================================================
-- TABLES
-- =========================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid not null references public.categories(id) on delete restrict,
  price numeric(10,2) not null check (price > 0),
  old_price numeric(10,2) check (old_price is null or old_price >= price),
  discount int not null default 0 check (discount >= 0 and discount <= 100),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  stock_status public.stock_status not null default 'in_stock',
  sku text not null unique,
  short_description text not null,
  full_description text not null,
  specifications jsonb not null default '{}'::jsonb,
  main_image text not null,
  gallery_images text[] not null default '{}',
  video_url text,
  featured boolean not null default false,
  related_product_ids uuid[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  order_number text not null unique,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  payment_method public.payment_method not null,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping_fee numeric(10,2) not null default 0 check (shipping_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  notes text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  shipping_address text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  product_slug text not null,
  product_image text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique(user_id, product_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  proof_url text,
  proof_note text,
  admin_note text,
  instructions text,
  verified_by uuid references public.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- PROJECT FUNCTIONS
-- =========================================================
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users
    where id = uid
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    'customer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- =========================================================
-- INDEXES
-- =========================================================
create index if not exists idx_categories_slug on public.categories(slug);

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_featured on public.products(featured);
create index if not exists idx_products_stock_status on public.products(stock_status);
create index if not exists idx_products_created_at on public.products(created_at desc);

create index if not exists idx_addresses_user_id on public.addresses(user_id);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

create index if not exists idx_wishlist_user_id on public.wishlist(user_id);
create index if not exists idx_wishlist_product_id on public.wishlist(product_id);

create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_created_at on public.payments(created_at desc);

-- =========================================================
-- TRIGGERS
-- =========================================================
drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- =========================================================
-- RLS
-- =========================================================
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.payments enable row level security;

-- ---------------------------------------------------------
-- USERS
-- ---------------------------------------------------------
drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users
for select
to authenticated
using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = id or public.is_admin(auth.uid()))
with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "Admin can manage users" on public.users;
create policy "Admin can manage users"
on public.users
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------
drop policy if exists "Public can view categories" on public.categories;
create policy "Public can view categories"
on public.categories
for select
to public
using (true);

drop policy if exists "Admin can manage categories" on public.categories;
create policy "Admin can manage categories"
on public.categories
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
on public.products
for select
to public
using (true);

drop policy if exists "Admin can manage products" on public.products;
create policy "Admin can manage products"
on public.products
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------
-- ADDRESSES
-- ---------------------------------------------------------
drop policy if exists "Users manage own addresses" on public.addresses;
create policy "Users manage own addresses"
on public.addresses
for all
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ---------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Admin can update orders" on public.orders;
create policy "Admin can update orders"
on public.orders
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------
-- ORDER ITEMS
-- ---------------------------------------------------------
drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

drop policy if exists "Users can insert own order items" on public.order_items;
create policy "Users can insert own order items"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

-- ---------------------------------------------------------
-- WISHLIST
-- ---------------------------------------------------------
drop policy if exists "Users manage own wishlist" on public.wishlist;
create policy "Users manage own wishlist"
on public.wishlist
for all
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ---------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------
drop policy if exists "Users can view own payments" on public.payments;
create policy "Users can view own payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = payments.order_id
      and (orders.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

drop policy if exists "Users can create own payments" on public.payments;
create policy "Users can create own payments"
on public.payments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders
    where orders.id = payments.order_id
      and (orders.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

drop policy if exists "Admin can update payments" on public.payments;
create policy "Admin can update payments"
on public.payments
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- =========================================================
-- STORAGE BUCKET + POLICIES
-- =========================================================
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Users upload own payment proof files" on storage.objects;
create policy "Users upload own payment proof files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payment-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users view own payment proof files" on storage.objects;
create policy "Users view own payment proof files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin(auth.uid())
  )
);

drop policy if exists "Admins manage payment proof files" on storage.objects;
create policy "Admins manage payment proof files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'payment-proofs'
  and public.is_admin(auth.uid())
)
with check (
  bucket_id = 'payment-proofs'
  and public.is_admin(auth.uid())
);