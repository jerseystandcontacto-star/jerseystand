import type { Metadata } from 'next'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ProductGridSkeleton } from '@/components/ui/Loading'
import type { Product, ProductFilters as Filters } from '@/types'
import { CATEGORIES } from '@/types'

export const metadata: Metadata = {
  title: 'Catálogo de Jerseys y Gear Deportivo',
  description:
    'Explora nuestra colección completa de jerseys auténticos: Liga MX, Selección Mexicana, Europa, Retro y Gear deportivo.',
}

interface PageProps {
  searchParams: Promise<{
    categoria?: string
    talla?: string
    tipo?: string
    equipo?: string
    precioMin?: string
    precioMax?: string
    orden?: string
    buscar?: string
    page?: string
  }>
}

async function getProducts(params: Awaited<PageProps['searchParams']>): Promise<Product[]> {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('active', true)

  if (params.categoria) query = query.eq('category', params.categoria)
  if (params.equipo) query = query.ilike('team', `%${params.equipo}%`)
  if (params.buscar) query = query.ilike('name', `%${params.buscar}%`)
  if (params.precioMin) query = query.gte('price', Number(params.precioMin))
  if (params.precioMax) query = query.lte('price', Number(params.precioMax))

  if (params.orden === 'precio_asc') query = query.order('price', { ascending: true })
  else if (params.orden === 'precio_desc') query = query.order('price', { ascending: false })
  else if (params.orden === 'destacados') query = query.order('featured', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data } = await query.limit(48)
  return (data as Product[]) || []
}

export default async function ProductosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const products = await getProducts(params)

  const categoryLabel = params.categoria
    ? CATEGORIES.find((c) => c.value === params.categoria)?.label
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-5xl text-[#111410]">
          {categoryLabel ? categoryLabel.toUpperCase() : 'CATÁLOGO'}
        </h1>
        <p className="text-gray-500 mt-1">
          {products.length} producto{products.length !== 1 ? 's' : ''} encontrado
          {products.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Buscador */}
      <SearchBar defaultValue={params.buscar} />

      <div className="flex gap-8 mt-6">
        {/* Sidebar filtros */}
        <aside className="hidden lg:block w-56 shrink-0">
          <Suspense fallback={<div className="skeleton h-96 rounded-xl" />}>
            <ProductFilters />
          </Suspense>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-6xl mb-4">🔍</p>
              <p className="font-display text-3xl text-gray-400 mb-2">SIN RESULTADOS</p>
              <p className="text-gray-500">
                No encontramos productos con esos filtros. Intenta con otros.
              </p>
            </div>
          ) : (
            <Suspense fallback={<ProductGridSkeleton />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}

function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <form method="get" action="/productos">
      <div className="relative max-w-md">
        <input
          type="search"
          name="buscar"
          defaultValue={defaultValue}
          placeholder="Buscar jerseys, equipos..."
          className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1a5c2e] text-base"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a5c2e]"
        >
          🔍
        </button>
      </div>
    </form>
  )
}
