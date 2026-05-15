'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

function isNew(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore()

  const hasDiscount   = Boolean(product.compare_price && product.compare_price > product.price)
  const discountPct   = hasDiscount
    ? Math.round((1 - product.price / product.compare_price!) * 100)
    : 0
  const isNewProduct  = isNew(product.created_at)
  const hasImage      = Boolean(product.images?.[0])
  const firstAvailable = product.variants?.find((v) => v.stock > 0)
  const outOfStock    = (product.variants?.length ?? 0) > 0 && !firstAvailable

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (firstAvailable) addItem(product, firstAvailable)
  }

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a5c2e]">
            <span className="text-5xl">👕</span>
            <span className="text-xs text-white/60 font-medium mt-2">Sin foto</span>
          </div>
        )}

        {/* Badges superiores */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow">
              -{discountPct}%
            </span>
          )}
          {isNewProduct && !hasDiscount && (
            <span className="bg-[#c9a227] text-[#111410] text-[11px] font-bold px-2 py-1 rounded-md shadow">
              NUEVO
            </span>
          )}
        </div>

        {/* Botón agregar — visible solo en hover */}
        {!outOfStock && firstAvailable && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-1.5 bg-[#c9a227] hover:bg-[#e8bc35] text-[#111410] text-xs font-bold py-2.5 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              AGREGAR
            </button>
          </div>
        )}

        {/* Agotado overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
            <span className="bg-white text-[#111410] font-bold text-sm px-4 py-2 rounded-lg">
              AGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 px-0.5 pb-1">
        <h3 className="font-semibold text-[#111410] text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-[#1a5c2e] transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="font-bold text-[#1a5c2e] text-base sm:text-lg leading-none">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-gray-400 text-sm line-through leading-none">
                {formatPrice(product.compare_price!)}
              </span>
              <span className="text-[11px] font-bold text-red-500">-{discountPct}%</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
