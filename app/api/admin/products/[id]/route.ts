import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: admin } = await supabase.from('admin_users').select('email').eq('email', user.email!).single()
  return admin ? user : null
}

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
    await supabase.from('product_variants').insert(
      variants.map((v: any) => ({ ...v, product_id: id, id: v.id || undefined }))
    )
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
