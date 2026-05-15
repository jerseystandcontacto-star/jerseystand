-- ============================================================
-- Migración 001: columnas nuevas en products y product_variants
-- Ejecuta en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Precio tachado (precio original antes de descuento)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS compare_price numeric(10,2);

-- 2. Campos de catálogo (marca, año, liga, género, temporada)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS marca     text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS anio      text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS liga      text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS genero    text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS temporada text;

-- 3. Hacer opcionales 'type' y 'season' en product_variants
--    para no tener que pasarlos desde el formulario de admin
ALTER TABLE public.product_variants
  ALTER COLUMN type   SET DEFAULT 'local',
  ALTER COLUMN season SET DEFAULT '';

-- Refrescar la caché de schema de PostgREST
NOTIFY pgrst, 'reload schema';
