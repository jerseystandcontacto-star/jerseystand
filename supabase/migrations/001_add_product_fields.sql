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

-- 3. Columnas de auditoría
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 4. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Hacer opcionales 'type' y 'season' en product_variants
ALTER TABLE public.product_variants
  ALTER COLUMN type   SET DEFAULT 'local',
  ALTER COLUMN season SET DEFAULT '';

-- Refrescar la caché de schema de PostgREST
NOTIFY pgrst, 'reload schema';
