-- ============================================
-- MIGRACIÓN 002: Sistema de Reserva de Stock
-- Ejecuta en el SQL Editor de Supabase
-- ============================================

-- ── 1. Tabla de reservas ────────────────────────────────────────────────────
create table public.stock_reservations (
  id         uuid        default uuid_generate_v4() primary key,
  order_id   uuid        references public.orders(id) on delete cascade not null,
  variant_id uuid        references public.product_variants(id) on delete cascade not null,
  quantity   integer     not null check (quantity > 0),
  status     text        not null default 'pending'
               check (status in ('pending', 'confirmed', 'released')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes')
);

-- Índices para las consultas más frecuentes
create index idx_reservations_order   on public.stock_reservations(order_id);
create index idx_reservations_variant on public.stock_reservations(variant_id);
-- Índice parcial: solo reservas activas (las únicas que importan para calcular stock)
create index idx_reservations_active
  on public.stock_reservations(variant_id, expires_at)
  where status = 'pending';

-- ── 2. RLS ──────────────────────────────────────────────────────────────────
alter table public.stock_reservations enable row level security;

create policy "Admin gestiona reservas" on public.stock_reservations
  for all using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── 3. Función: reservar stock atómicamente ──────────────────────────────────
-- Usa FOR UPDATE para serializar accesos concurrentes a la misma variante.
-- Retorna jsonb con { success, error?, available_after? }
create or replace function reserve_stock(
  p_variant_id uuid,
  p_quantity   integer,
  p_order_id   uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_stock     integer;
  v_reserved  integer;
  v_available integer;
begin
  -- Lock de fila: bloquea hasta que la transacción anterior termine
  select stock into v_stock
  from public.product_variants
  where id = p_variant_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Variante no encontrada');
  end if;

  -- Reservas activas: pendientes y no expiradas
  select coalesce(sum(quantity), 0) into v_reserved
  from public.stock_reservations
  where variant_id = p_variant_id
    and status     = 'pending'
    and expires_at > now();

  v_available := v_stock - v_reserved;

  if v_available < p_quantity then
    return jsonb_build_object(
      'success',   false,
      'error',     'Stock insuficiente',
      'available', v_available
    );
  end if;

  insert into public.stock_reservations (order_id, variant_id, quantity, status)
  values (p_order_id, p_variant_id, p_quantity, 'pending');

  return jsonb_build_object('success', true, 'available_after', v_available - p_quantity);
end;
$$;

-- ── 4. Función: confirmar reservas + descontar stock real ────────────────────
-- Llamada desde el webhook cuando el pago es exitoso.
create or replace function confirm_order_reservations(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  r record;
begin
  for r in
    select id, variant_id, quantity
    from public.stock_reservations
    where order_id = p_order_id and status = 'pending'
    for update
  loop
    update public.stock_reservations
       set status = 'confirmed'
     where id = r.id;

    update public.product_variants
       set stock = greatest(0, stock - r.quantity)
     where id = r.variant_id;
  end loop;
end;
$$;

-- ── 5. Función: liberar reservas (pago fallido / cancelado) ──────────────────
-- No toca el stock; simplemente marca las reservas como 'released'.
create or replace function release_order_reservations(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.stock_reservations
     set status = 'released'
   where order_id = p_order_id
     and status   = 'pending';
end;
$$;

-- ── 6. Función: stock efectivo para la página de producto ────────────────────
-- Devuelve stock_real - reservas_activas para un array de variant_ids.
-- security definer → puede leer stock_reservations sin política pública.
create or replace function get_effective_stocks(p_variant_ids uuid[])
returns table(variant_id uuid, available_stock integer)
language sql
security definer
stable
as $$
  select
    pv.id as variant_id,
    greatest(
      0,
      pv.stock - coalesce(
        (
          select sum(sr.quantity)
          from public.stock_reservations sr
          where sr.variant_id = pv.id
            and sr.status     = 'pending'
            and sr.expires_at > now()
        ),
        0
      )
    )::integer as available_stock
  from public.product_variants pv
  where pv.id = any(p_variant_ids);
$$;
