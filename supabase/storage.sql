-- ============================================
-- JERSEY STAND - Supabase Storage
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================

-- Crear el bucket para imágenes de productos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do nothing;

-- Solo admins pueden subir/eliminar imágenes
create policy "Admin puede subir imágenes" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.admin_users
      where email = auth.jwt() ->> 'email'
    )
  );

create policy "Admin puede eliminar imágenes" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.admin_users
      where email = auth.jwt() ->> 'email'
    )
  );

-- Lectura pública (las imágenes son visibles en la tienda)
create policy "Imágenes públicas de productos" on storage.objects
  for select using (bucket_id = 'product-images');

-- ============================================
-- Bucket para fotos de "Te compramos tu jersey"
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jersey-compras-fotos',
  'jersey-compras-fotos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do nothing;

-- Cualquiera puede subir fotos (clientes enviando su jersey)
create policy "Clientes suben fotos de compra" on storage.objects
  for insert with check (bucket_id = 'jersey-compras-fotos');

-- Solo admins pueden eliminar
create policy "Admin elimina fotos de compra" on storage.objects
  for delete using (
    bucket_id = 'jersey-compras-fotos'
    and exists (
      select 1 from public.admin_users
      where email = auth.jwt() ->> 'email'
    )
  );

-- Lectura pública
create policy "Fotos de compra públicas" on storage.objects
  for select using (bucket_id = 'jersey-compras-fotos');
