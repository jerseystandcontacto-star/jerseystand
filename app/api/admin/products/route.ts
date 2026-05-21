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
  if (!admin) {
    console.error('[POST /api/admin/products] No autorizado')
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { variants, ...productData } = body

  if (!productData.name) {
    return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
  }

  const slug = slugify(productData.name)
  const supabase = createAdminClient()

  // Campos explícitos para evitar enviar columnas que no existen en la BD
  const insertData: Record<string, unknown> = {
    name:          productData.name,
    slug,
    description:   productData.description   || null,
    category:      productData.category       || 'liga-mx',
    team:          productData.team            || '',
    price:         Number(productData.price)  || 0,
    compare_price: productData.compare_price  ? Number(productData.compare_price) : null,
    images:        productData.images         || [],
    tags:          productData.tags           || [],
    active:        productData.active         ?? true,
    featured:      productData.featured       ?? false,
    // Campos nuevos (requieren haber corrido la migración SQL)
    marca:         productData.marca          || null,
    anio:          productData.anio           || null,
    liga:          productData.liga           || null,
    genero:        productData.genero         || null,
    tipo_producto:        productData.tipo_producto       || 'Jersey',
    pais:                 productData.pais                || null,
    equipacion:           productData.equipacion          || null,
    version:              productData.version             || null,
    tipografia:           productData.tipografia          || null,
    hecho_en:             productData.hecho_en            || null,
    codigo_autenticidad:  productData.codigo_autenticidad || null,
    condicion:            productData.condicion           || null,
  }

  console.log('[POST /api/admin/products] insertando:', insertData.name, '| slug:', slug)

  const { data: product, error } = await supabase
    .from('products')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('[POST /api/admin/products] error BD:', error.code, error.message, error.details)
    return NextResponse.json(
      { error: `Error al crear producto: ${error.message}` },
      { status: 500 }
    )
  }

  // Insertar variantes
  if (variants?.length) {
    const variantsData = variants.map((v: any) => ({
      product_id: product.id,
      size:       v.size  || 'M',
      stock:      Number(v.stock) || 0,
    }))

    console.log('[POST /api/admin/products] insertando variantes:', JSON.stringify(variantsData))

    const { error: varError } = await supabase
      .from('product_variants')
      .insert(variantsData)

    if (varError) {
      console.error('[POST /api/admin/products] error variantes:', varError.code, varError.message, varError.details)
      return NextResponse.json(
        { ...product, _warning: `Producto creado pero error en variantes: ${varError.message}` },
        { status: 201 }
      )
    }
  }

  console.log('[POST /api/admin/products] creado ok, id:', product.id)
  return NextResponse.json(product, { status: 201 })
}
