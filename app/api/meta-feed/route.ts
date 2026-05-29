import { createAdminClient } from '@/lib/supabase/server'
import type { Product, ProductVariant } from '@/types'

const SITE = 'https://jerseystand.shop'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function hasStock(variants: ProductVariant[] | undefined): boolean {
  return (variants ?? []).some((v) => v.stock > 0)
}

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }

  const products = (data ?? []) as (Product & { variants: ProductVariant[] })[]

  const items = products
    .map((p) => {
      const imageUrl = p.images?.[0] ?? ''
      const description = p.description?.trim() || p.name
      const inStock = hasStock(p.variants)
      const price = p.price.toFixed(2)

      return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:availability>${inStock ? 'in stock' : 'out of stock'}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${price} MXN</g:price>
      <g:link>${SITE}/productos/${escapeXml(p.slug)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:brand>Jersey Stand</g:brand>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Jersey Stand</title>
    <link>${SITE}</link>
    <description>Catálogo de jerseys y gear deportivo de Jersey Stand</description>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
    },
  })
}
