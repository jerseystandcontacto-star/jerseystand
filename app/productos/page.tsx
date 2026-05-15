export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ProductGridSkeleton } from '@/components/ui/Loading'
import type { Product } from '@/types'
import { CATEGORIES } from '@/types'

export const metadata: Metadata = {
  title: 'Catálogo de Jerseys | Jersey Stand',
  description: 'Jerseys auténticos de Liga MX, Selección Mexicana, Europa y colecciones Retro. Envío a todo México.',
}

interface PageProps {
  searchParams: Promise<{
    categoria?: string
    liga?: string
    genero?: string
    marca?: string
    equipo?: string
    precioMin?: string
    precioMax?: string
    orden?: string
    buscar?: string
  }>
}

async function getProducts(params: Awaited<PageProps['searchParams']>): Promise<Product[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('active', true)

    // Filtros
    if (params.categoria) query = query.eq('category',  params.categoria)
    if (params.liga)      query = query.eq('liga',      params.liga)
    if (params.genero)    query = query.eq('genero',    params.genero)
    if (params.marca)     query = query.eq('marca',     params.marca)
    if (params.equipo)    query = query.ilike('team',   `%${params.equipo}%`)
    if (params.buscar)    query = query.ilike('name',   `%${params.buscar}%`)
    if (params.precioMin) query = query.gte('price',    Number(params.precioMin))
    if (params.precioMax) query = query.lte('price',    Number(params.precioMax))

    // Orden
    if (params.orden === 'precio_asc')
      query = query.order('price', { ascending: true })
    else if (params.orden === 'precio_desc')
      query = query.order('price', { ascending: false })
    else if (params.orden === 'oferta')
      query = query.not('compare_price', 'is', null).order('created_at', { ascending: false })
    else
      query = query.order('created_at', { ascending: false })

    const { data, error } = await query.limit(48)

    if (error) console.error('[catalogo] Supabase error:', error.code, error.message)
    return (data as Product[]) || []
  } catch (e) {
    console.error('[catalogo] exception:', e)
    return []
  }
}

export default async function ProductosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const products = await getProducts(params)

  // Si orden=oferta, ordenar en JS por mayor % de descuento
  const sorted = params.orden === 'oferta'
    ? [...products].sort((a, b) => {
        const da = a.compare_price ? (a.compare_price - a.price) / a.compare_price : 0
        const db = b.compare_price ? (b.compare_price - b.price) / b.compare_price : 0
        return db - da
      })
    : products

  const categoryLabel = params.categoria
    ? CATEGORIES.find((c) => c.value === params.categoria)?.label
    : null

  const hasFilters = !!(params.liga || params.genero || params.marca || params.categoria || params.buscar || params.precioMin || params.precioMax)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-5xl text-[#111410]">
          {categoryLabel ? categoryLabel.toUpperCase() : 'CATÁLOGO'}
        </h1>
        <p className="text-gray-500 mt-1">
          {sorted.length} producto{sorted.length !== 1 ? 's' : ''} encontrado{sorted.length !== 1 ? 's' : ''}
          {hasFilters && ' con esos filtros'}
        </p>
      </div>

      {/* Buscador */}
      <form method="get" action="/productos" className="mb-6">
        <div className="relative max-w-md">
          <input
            type="search"
            name="buscar"
            defaultValue={params.buscar}
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

      <div className="flex gap-8">
        {/* Sidebar filtros */}
        <aside className="hidden lg:block w-56 shrink-0">
          <Suspense fallback={<div className="h-96 rounded-xl bg-gray-100 animate-pulse" />}>
            <ProductFilters />
          </Suspense>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {sorted.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-6xl mb-4">🔍</p>
              <p className="font-display text-3xl text-gray-400 mb-2">SIN RESULTADOS</p>
              <p className="text-gray-500 mb-6">No encontramos productos con esos filtros.</p>
              <a href="/productos" className="text-[#1a5c2e] font-semibold hover:underline">
                Ver todos los productos
              </a>
            </div>
          ) : (
            <Suspense fallback={<ProductGridSkeleton />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {sorted.map((product) => (
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
