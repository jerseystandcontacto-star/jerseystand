import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, requireAdmin } from '@/lib/supabase/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { variants, ...productData } = body
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('products')
    .update({ ...productData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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
