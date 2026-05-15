import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, requireAdmin } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { variants, ...productData } = body

  const slug = slugify(productData.name)
  const supabase = createAdminClient()

  const { data: product, error } = await supabase
    .from('products')
    .insert({ ...productData, slug })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Insertar variantes
  if (variants?.length) {
    const variantsWithProduct = variants.map((v: any) => ({
      ...v,
      product_id: product.id,
    }))
    await supabase.from('product_variants').insert(variantsWithProduct)
  }

  return NextResponse.json(product, { status: 201 })
}
