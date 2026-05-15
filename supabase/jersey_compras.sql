-- ============================================
-- JERSEY STAND - Tabla "Te compramos tu jersey"
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================

create table public.jersey_compras (
  id              uuid default uuid_generate_v4() primary key,

  -- Cliente
  customer_name   text not null,
  email           text not null,
  whatsapp        text not null,

  -- Jersey
  team            text not null,
  size            text not null check (size in ('S', 'M', 'L', 'XL', 'XXL')),
  season          text not null,
  condition       text not null check (condition in ('nuevo', 'como_nuevo', 'buen_estado', 'regular')),
  asking_price    numeric(10,2) not null,
  photos          text[] not null default '{}',
  description     text,

  -- Gestión admin
  status          text not null default 'pendiente' check (status in (
    'pendiente', 'revisado', 'oferta_enviada', 'comprado', 'rechazado'
  )),
  admin_notes     text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_jersey_compras_status  on public.jersey_compras(status);
create index idx_jersey_compras_email   on public.jersey_compras(email);
create index idx_jersey_compras_created on public.jersey_compras(created_at desc);

-- RLS
alter table public.jersey_compras enable row level security;

-- Cualquiera puede crear una solicitud
create policy "Crear solicitud pública" on public.jersey_compras
  for insert with check (true);

-- Solo admin puede leer y gestionar
create policy "Admin gestiona compras" on public.jersey_compras
  for all using (
    exists (
      select 1 from public.admin_users
      where email = auth.jwt() ->> 'email'
    )
  );
