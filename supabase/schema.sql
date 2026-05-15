-- ============================================
-- JERSEY STAND - Schema de Base de Datos
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLA: user_profiles
-- ============================================
create table public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  default_address jsonb,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger para crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- TABLA: products
-- ============================================
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  category text not null check (category in ('liga-mx', 'seleccion-mexicana', 'europa', 'retro-vintage', 'gear')),
  team text not null,
  price numeric(10,2) not null check (price >= 0),
  compare_price numeric(10,2),
  images text[] not null default '{}',
  tags text[] default '{}',
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para búsquedas frecuentes
create index idx_products_category on public.products(category);
create index idx_products_team on public.products(team);
create index idx_products_active on public.products(active);
create index idx_products_slug on public.products(slug);

-- ============================================
-- TABLA: product_variants
-- ============================================
create table public.product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  size text not null check (size in ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  type text not null check (type in ('local', 'visitante', 'tercero', 'portero')),
  season text not null,
  stock integer not null default 0 check (stock >= 0),
  sku text unique,
  created_at timestamptz not null default now()
);

create index idx_variants_product on public.product_variants(product_id);

-- ============================================
-- TABLA: coupons
-- ============================================
create table public.coupons (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric(10,2) not null check (value > 0),
  min_purchase numeric(10,2) default 0,
  max_uses integer,
  used_count integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================
-- TABLA: orders
-- ============================================
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  status text not null default 'pendiente' check (status in ('pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado')),
  subtotal numeric(10,2) not null,
  shipping_cost numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  shipping_type text not null check (shipping_type in ('estandar', 'express', 'gratis')),
  shipping_address jsonb not null,
  tracking_number text,
  coupon_id uuid references public.coupons(id) on delete set null,
  payment_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_number on public.orders(order_number);

-- ============================================
-- TABLA: order_items
-- ============================================
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  product_image text,
  size text not null,
  type text not null,
  season text not null,
  quantity integer not null check (quantity > 0),
  price numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create index idx_order_items_order on public.order_items(order_id);

-- ============================================
-- TABLA: newsletter_subscribers
-- ============================================
create table public.newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
alter table public.user_profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Políticas para user_profiles
create policy "Usuarios ven su propio perfil" on public.user_profiles
  for select using (auth.uid() = id);

create policy "Usuarios actualizan su propio perfil" on public.user_profiles
  for update using (auth.uid() = id);

-- Políticas para products (lectura pública)
create policy "Productos visibles públicamente" on public.products
  for select using (active = true);

create policy "Admin gestiona productos" on public.products
  for all using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Políticas para product_variants (lectura pública)
create policy "Variantes visibles públicamente" on public.product_variants
  for select using (
    exists (
      select 1 from public.products
      where id = product_id and active = true
    )
  );

create policy "Admin gestiona variantes" on public.product_variants
  for all using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Políticas para orders
create policy "Usuarios ven sus propias órdenes" on public.orders
  for select using (auth.uid() = user_id);

create policy "Usuarios crean órdenes" on public.orders
  for insert with check (true);

create policy "Admin gestiona órdenes" on public.orders
  for all using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Políticas para order_items
create policy "Usuarios ven sus propios items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );

create policy "Insertar items de orden" on public.order_items
  for insert with check (true);

create policy "Admin gestiona items" on public.order_items
  for all using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Políticas para coupons
create policy "Cupones activos visibles" on public.coupons
  for select using (active = true);

create policy "Admin gestiona cupones" on public.coupons
  for all using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Políticas para newsletter
create policy "Insertar suscriptor" on public.newsletter_subscribers
  for insert with check (true);

create policy "Admin gestiona newsletter" on public.newsletter_subscribers
  for all using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- FUNCIÓN: generar número de orden
-- ============================================
create or replace function generate_order_number()
returns text as $$
declare
  new_number text;
  counter integer;
begin
  counter := (select count(*) from public.orders) + 1;
  new_number := 'JS-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(counter::text, 4, '0');
  return new_number;
end;
$$ language plpgsql;

-- ============================================
-- DATOS DE EJEMPLO (opcional)
-- ============================================
-- Descomenta para agregar productos de prueba

/*
insert into public.products (name, slug, description, category, team, price, images, active, featured)
values
  (
    'Jersey América Local 2024/25',
    'jersey-america-local-2024-25',
    'Jersey oficial del Club América temporada 2024/25. Tela de alta calidad, bordado auténtico.',
    'liga-mx',
    'Club América',
    899.00,
    array['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
    true,
    true
  ),
  (
    'Jersey Chivas Local 2024/25',
    'jersey-chivas-local-2024-25',
    'Jersey oficial de las Chivas de Guadalajara temporada 2024/25.',
    'liga-mx',
    'Chivas',
    899.00,
    array['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
    true,
    true
  );
*/
