import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, requireAdmin } from '@/lib/supabase/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { variants, ...raw } = body
  const supabase = createAdminClient()

  // Solo columnas conocidas — evita enviar campos que no existen en la BD
  const updateData: Record<string, unknown> = {
    name:          raw.name,
    slug:          raw.slug,
    description:   raw.description   ?? null,
    category:      raw.category      ?? 'liga-mx',
    team:          raw.team          ?? '',
    price:         Number(raw.price) || 0,
    compare_price: raw.compare_price  ? Number(raw.compare_price) : null,
    images:        raw.images        ?? [],
    tags:          raw.tags          ?? [],
    active:        raw.active        ?? true,
    featured:      raw.featured      ?? false,
    marca:         raw.marca         ?? null,
    anio:          raw.anio          ?? null,
    liga:          raw.liga          ?? null,
    genero:        raw.genero        ?? null,
    temporada:     raw.temporada     ?? null,
    tipo_producto: raw.tipo_producto ?? 'Jersey',
  }

  console.log('[PUT /api/admin/products] actualizando id:', id)

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('[PUT /api/admin/products] error BD:', error.code, error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Actualizar variantes: borrar las viejas e insertar las nuevas
  if (variants?.length) {
    await supabase.from('product_variants').delete().eq('product_id', id)

    const { error: varError } = await supabase.from('product_variants').insert(
      variants.map((v: any) => ({
        product_id: id,
        size:       v.size  || 'M',
        stock:      Number(v.stock) || 0,
      }))
    )

    if (varError) {
      console.error('[PUT /api/admin/products] error variantes:', varError.code, varError.message)
    }
  }

  return NextResponse.json({ message: 'Producto actualizado' })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const supabase = createAdminClient()

  await supabase.from('products').update(body).eq('id', id)
  return NextResponse.json({ message: 'Actualizado' })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  await supabase.from('product_variants').delete().eq('product_id', id)
  await supabase.from('products').delete().eq('id', id)

  return NextResponse.json({ message: 'Producto eliminado' })
}
