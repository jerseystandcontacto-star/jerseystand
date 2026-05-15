import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { formatPrice, getStockLabel } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const variants = product.variants || []
  const stocks = variants.map((v) => v.stock)
  const totalStock = stocks.reduce((s, n) => s + n, 0)
  const minStock = stocks.length ? Math.min(...stocks) : 999
  const stockLabel = getStockLabel(totalStock)

  const hasDiscount = product.compare_price && product.compare_price > product.price
  const discount = hasDiscount
    ? Math.round((1 - product.price / product.compare_price!) * 100)
    : 0

  const availableSizes = variants
    .filter((v) => v.stock > 0)
    .map((v) => v.size)
    .filter((s, i, arr) => arr.indexOf(s) === i)

  const hasImage = product.images && product.images.length > 0 && product.images[0]

  return (
    <Link href={`/productos/${product.slug}`} className="group product-card block">
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-xl">
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl mb-2">👕</span>
            <span className="text-xs text-gray-400 font-medium">Sin foto</span>
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
              -{discount}%
            </span>
          )}
          {product.featured && !hasDiscount && (
            <span className="bg-[#c9a227] text-[#111410] text-xs font-bold px-2 py-1 rounded-md shadow">
              NUEVO
            </span>
          )}
        </div>

        {/* Stock bajo */}
        {stockLabel && totalStock > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <span className="bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full block text-center">
              {stockLabel}
            </span>
          </div>
        )}

        {/* Agotado */}
        {totalStock === 0 && variants.length > 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
            <span className="bg-white text-[#111410] font-bold text-sm px-4 py-2 rounded-lg">
              AGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 pb-1 px-0.5">
        {/* Equipo + liga + año */}
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5 truncate">
          {[product.team, product.liga, product.anio].filter(Boolean).join(' · ')}
        </p>

        <h3 className="font-semibold text-[#111410] text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-[#1a5c2e] transition-colors">
          {product.name}
        </h3>

        {/* Precio */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="font-bold text-[#1a5c2e] text-base sm:text-lg">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-gray-400 text-sm line-through">
              {formatPrice(product.compare_price!)}
            </span>
          )}
        </div>

        {/* Tallas disponibles */}
        {availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {availableSizes.map((size) => (
              <span
                key={size}
                className="text-[10px] font-semibold border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded"
              >
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
