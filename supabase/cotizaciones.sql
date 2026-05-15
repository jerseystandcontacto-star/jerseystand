-- ============================================
-- JERSEY STAND - Tabla de Cotizaciones
-- Ejecuta esto en el SQL Editor de Supabase
-- (adicional al schema.sql principal)
-- ============================================

create table public.quote_requests (
  id uuid default uuid_generate_v4() primary key,

  -- Datos del cliente
  customer_name  text not null,
  email          text not null,
  phone          text not null,
  city           text not null,

  -- Detalles del pedido
  product_type   text not null check (product_type in (
    'jersey-oficial', 'playera-personalizada', 'sudadera', 'kit-completo', 'otro'
  )),
  quantity_range text not null check (quantity_range in (
    '1-10', '11-25', '26-50', '51-100', '100+'
  )),
  team_name      text,
  colors         text,
  has_logo       boolean not null default false,
  player_names   text,
  numbers        text,

  -- Tallas solicitadas (JSON: { XS: 0, S: 2, M: 5, ... })
  sizes_breakdown jsonb,

  -- Logística
  deadline       date,
  budget_range   text check (budget_range in (
    'menos-5000', '5000-15000', '15000-30000', '30000-mas', 'sin-definir'
  )),

  -- Archivos de referencia (URLs de Supabase Storage)
  reference_images text[] default '{}',

  -- Notas del cliente
  notes text,

  -- Gestión admin
  status text not null default 'nuevo' check (status in (
    'nuevo', 'en_revision', 'cotizado', 'aceptado', 'rechazado'
  )),
  quoted_price   numeric(10,2),
  admin_notes    text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_quotes_status   on public.quote_requests(status);
create index idx_quotes_email    on public.quote_requests(email);
create index idx_quotes_created  on public.quote_requests(created_at desc);

-- RLS
alter table public.quote_requests enable row level security;

-- Cualquiera puede crear una cotización
create policy "Crear cotización pública" on public.quote_requests
  for insert with check (true);

-- Solo admin puede leer y gestionar
create policy "Admin gestiona cotizaciones" on public.quote_requests
  for all using (
    exists (
      select 1 from public.admin_users
      where email = auth.jwt() ->> 'email'
    )
  );
