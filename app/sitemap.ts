import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://jerseystand.com'

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/productos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/contacto`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/rastrear`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Páginas de categorías
  const categories = ['liga-mx', 'seleccion-mexicana', 'europa', 'retro-vintage', 'gear']
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${base}/productos?categoria=${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Páginas de productos
  try {
    const supabase = createAdminClient()
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('active', true)

    const productPages: MetadataRoute.Sitemap = (products || []).map((p: { slug: string; updated_at: string }) => ({
      url: `${base}/productos/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...categoryPages, ...productPages]
  } catch {
    return [...staticPages, ...categoryPages]
  }
}
