import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, requireAdmin } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

interface ImportItem {
  name:                string
  team:                string
  liga:                string
  anio:                string
  marca:               string
  genero:              string
  tipo_producto:       string
  price:               number
  compare_price:       number | null
  featured:            boolean
  description:         string
  category:            string
  sizes:               string[]
  stock_per_size:      number
  equipacion?:         string
  version?:            string
  tipografia?:         string
  hecho_en?:           string
  codigo_autenticidad?: string
  condicion?:          string
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { products } = (await req.json()) as { products: ImportItem[] }

  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: 'Sin productos' }, { status: 400 })
  }

  const supabase = createAdminClient()
  let success = 0
  let skipped = 0
  const errors: string[] = []

  for (const item of products) {
    try {
      const slug = slugify(item.name)

      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (existing) {
        skipped++
        continue
      }

      const { data: product, error: productErr } = await supabase
        .from('products')
        .insert({
          name:          item.name,
          slug,
          team:          item.team          || '',
          liga:          item.liga          || null,
          anio:          item.anio          || null,
          marca:         item.marca         || null,
          genero:        item.genero        || null,
          tipo_producto: item.tipo_producto || 'Jersey',
          price:         item.price         || 0,
          compare_price: item.compare_price || null,
          featured:             item.featured             ?? false,
          description:          item.description          || null,
          category:             item.category             || 'gear',
          images:               [],
          tags:                 [],
          active:               true,
          equipacion:           item.equipacion           || null,
          version:              item.version              || null,
          tipografia:           item.tipografia           || null,
          hecho_en:             item.hecho_en             || null,
          codigo_autenticidad:  item.codigo_autenticidad  || null,
          condicion:            item.condicion            || null,
        })
        .select('id')
        .single()

      if (productErr) {
        errors.push(`${item.name}: ${productErr.message}`)
        continue
      }

      if (item.sizes.length > 0) {
        const { error: varErr } = await supabase
          .from('product_variants')
          .insert(
            item.sizes.map((size) => ({
              product_id: product.id,
              size,
              stock: item.stock_per_size,
            }))
          )

        if (varErr) {
          errors.push(`${item.name} (variantes): ${varErr.message}`)
        }
      }

      success++
    } catch (err: any) {
      errors.push(`${item.name}: ${err.message}`)
    }
  }

  return NextResponse.json({ success, skipped, errors })
}
