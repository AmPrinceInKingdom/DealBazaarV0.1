-- Super admin + product image storage upgrade

do $$
begin
  if exists (select 1 from pg_type where typname = 'user_role') then
    alter type public.user_role add value if not exists 'super_admin';
  end if;
end $$;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users
    where id = uid
      and role in ('admin', 'super_admin')
  );
$$;

alter table if exists public.users
  add column if not exists preferred_currency text,
  add column if not exists preferred_language text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  7340032,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Admin and seller upload product images" on storage.objects;
create policy "Admin and seller upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (
    public.is_admin(auth.uid())
    or exists (
      select 1
      from public.users
      where users.id = auth.uid()
        and users.role = 'seller'
    )
  )
);

drop policy if exists "Public view product images" on storage.objects;
create policy "Public view product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Admin and seller delete own product images" on storage.objects;
create policy "Admin and seller delete own product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (
    public.is_admin(auth.uid())
    or auth.uid()::text = (storage.foldername(name))[1]
  )
);
