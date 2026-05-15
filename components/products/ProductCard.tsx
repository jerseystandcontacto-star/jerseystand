import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { formatPrice, getStockLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const minStock = product.variants
    ? Math.min(...product.variants.map((v) => v.stock))
    : 999
  const stockLabel = getStockLabel(minStock)
  const hasDiscount = product.compare_price && product.compare_price > product.price
  const discount = hasDiscount
    ? Math.round((1 - product.price / product.compare_price!) * 100)
    : 0

  return (
    <Link href={`/productos/${product.slug}`} className="group product-card block">
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.images[0] || '/placeholder-jersey.jpg'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {product.featured && !hasDiscount && (
            <span className="bg-[#c9a227] text-[#111410] text-xs font-bold px-2 py-1 rounded">
              NUEVO
            </span>
          )}
        </div>

        {/* Stock bajo */}
        {stockLabel && minStock > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <span className="bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full block text-center">
              {stockLabel}
            </span>
          </div>
        )}

        {/* Agotado */}
        {minStock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-[#111410] font-bold text-sm px-4 py-2 rounded-lg">
              AGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
          {product.team}
        </p>
        <h3 className="font-product font-semibold text-[#111410] text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#1a5c2e] transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-[#1a5c2e] text-base sm:text-lg">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-gray-400 text-sm line-through">
              {formatPrice(product.compare_price!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
