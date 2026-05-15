import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { Hero } from '@/components/home/Hero'
import { CategorySection } from '@/components/home/CategorySection'
import { AuthBadges } from '@/components/home/AuthBadges'
import { Newsletter } from '@/components/home/Newsletter'
import { ProductCard } from '@/components/products/ProductCard'
import type { Product } from '@/types'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Jersey Stand | Gear de Fútbol Auténtico en México',
  description:
    'Jerseys y gear deportivo 100% auténtico. Liga MX, Selección Mexicana, Europa y colecciones Retro. Envío a todo México.',
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('active', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(8)
    return (data as Product[]) || []
  } catch {
    return []
  }
}

async function getRetroProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('active', true)
      .eq('category', 'retro-vintage')
      .order('created_at', { ascending: false })
      .limit(4)
    return (data as Product[]) || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featured, retro] = await Promise.all([getFeaturedProducts(), getRetroProducts()])

  return (
    <>
      <Hero />

      <CategorySection />

      {/* Productos destacados */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-5xl text-[#111410]">
                LO MÁS <span className="text-[#1a5c2e]">NUEVO</span>
              </h2>
              <p className="text-gray-500 mt-1">Los últimos jerseys que llegaron al stand</p>
            </div>
            <Link
              href="/productos"
              className="text-[#1a5c2e] font-semibold hover:underline text-sm hidden sm:block"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/productos" className="btn-outline">
              Ver todos los productos
            </Link>
          </div>
        </section>
      )}

      <AuthBadges />

      {/* Retro & Vintage */}
      {retro.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-5xl text-[#111410]">
                RETRO &amp; <span className="text-[#c9a227]">VINTAGE</span>
              </h2>
              <p className="text-gray-500 mt-1">Clásicos que nunca pasan de moda</p>
            </div>
            <Link
              href="/productos?categoria=retro-vintage"
              className="text-[#c9a227] font-semibold hover:underline text-sm hidden sm:block"
            >
              Ver colección →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {retro.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Sección vacía / onboarding si no hay productos */}
      {featured.length === 0 && retro.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="bg-[#f4f4f4] rounded-2xl p-12">
            <p className="font-display text-4xl text-[#111410] mb-4">PRÓXIMAMENTE</p>
            <p className="text-gray-500 max-w-md mx-auto">
              Estamos preparando el catálogo. Suscríbete al newsletter para ser el primero
              en saber cuando lancemos.
            </p>
          </div>
        </section>
      )}

      <Newsletter />
    </>
  )
}
