export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
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

async function getRecentProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(8)
    if (error) console.error('[home] getRecentProducts:', error.message)
    return (data as Product[]) || []
  } catch (e) {
    console.error('[home] getRecentProducts exception:', e)
    return []
  }
}

async function getOfertasProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('active', true)
      .not('compare_price', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) console.error('[home] getOfertasProducts:', error.message)
    const products = (data as Product[]) || []
    // Filtrar solo los que realmente tienen descuento y ordenar por mayor %
    return products
      .filter((p) => p.compare_price && p.compare_price > p.price)
      .sort((a, b) => {
        const da = (a.compare_price! - a.price) / a.compare_price!
        const db = (b.compare_price! - b.price) / b.compare_price!
        return db - da
      })
      .slice(0, 8)
  } catch (e) {
    console.error('[home] getOfertasProducts exception:', e)
    return []
  }
}

export default async function HomePage() {
  const [recent, ofertas] = await Promise.all([getRecentProducts(), getOfertasProducts()])

  const hasAny = recent.length > 0 || ofertas.length > 0

  return (
    <>
      <div style={{background:'red', color:'white', fontSize:'40px', padding:'20px', zIndex:9999, position:'fixed', top:0, left:0}}>
        TEST DEPLOY OK
      </div>
      <Hero />
      <CategorySection />

      {/* Ofertas */}
      {ofertas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-5xl text-[#111410]">
                🔥 <span className="text-red-500">OFERTAS</span>
              </h2>
              <p className="text-gray-500 mt-1">Los mejores descuentos del stand</p>
            </div>
            <Link
              href="/productos?orden=oferta"
              className="text-red-500 font-semibold hover:underline text-sm hidden sm:block"
            >
              Ver todas las ofertas →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {ofertas.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <AuthBadges />

      {/* Nuevos ingresos */}
      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-5xl text-[#111410]">
                NUEVOS <span className="text-[#1a5c2e]">INGRESOS</span>
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
            {recent.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/productos" className="text-[#1a5c2e] font-semibold hover:underline">
              Ver todos los productos →
            </Link>
          </div>
        </section>
      )}

      {/* Sin productos */}
      {!hasAny && (
        <section className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="bg-[#f4f4f4] rounded-2xl p-12">
            <p className="text-5xl mb-4">👕</p>
            <p className="font-display text-4xl text-[#111410] mb-4">PRÓXIMAMENTE</p>
            <p className="text-gray-500 max-w-md mx-auto">
              Estamos preparando el catálogo. Suscríbete al newsletter para ser el primero en saber cuando lancemos.
            </p>
          </div>
        </section>
      )}

      <Newsletter />
    </>
  )
}
