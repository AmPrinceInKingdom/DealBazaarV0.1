-- Product reviews and review image uploads

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) >= 3),
  image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_product_reviews_product_id
  on public.product_reviews(product_id);
create index if not exists idx_product_reviews_user_id
  on public.product_reviews(user_id);
create index if not exists idx_product_reviews_created_at
  on public.product_reviews(created_at desc);

drop trigger if exists trg_product_reviews_updated_at on public.product_reviews;
create trigger trg_product_reviews_updated_at
before update on public.product_reviews
for each row execute function public.set_updated_at();

alter table public.product_reviews enable row level security;

drop policy if exists "Public can view product reviews" on public.product_reviews;
create policy "Public can view product reviews"
on public.product_reviews
for select
to public
using (true);

drop policy if exists "Users can create own product reviews" on public.product_reviews;
create policy "Users can create own product reviews"
on public.product_reviews
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users and admin can update product reviews" on public.product_reviews;
create policy "Users and admin can update product reviews"
on public.product_reviews
for update
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Users and admin can delete product reviews" on public.product_reviews;
create policy "Users and admin can delete product reviews"
on public.product_reviews
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-images',
  'review-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Authenticated users upload review images" on storage.objects;
create policy "Authenticated users upload review images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'review-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Public can read review images" on storage.objects;
create policy "Public can read review images"
on storage.objects
for select
to public
using (bucket_id = 'review-images');

drop policy if exists "Users and admin delete own review images" on storage.objects;
create policy "Users and admin delete own review images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'review-images'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin(auth.uid())
  )
);
