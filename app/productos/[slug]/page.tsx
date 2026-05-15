'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, Shield, Truck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageLoading } from '@/components/ui/Loading'
import { formatPrice, getStockLabel } from '@/lib/utils'
import type { Product, ProductVariant, ProductSize, ProductType } from '@/types'
import { SIZES, PRODUCT_TYPES } from '@/types'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [selectedType, setSelectedType] = useState<ProductType | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCartStore()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('slug', slug)
        .eq('active', true)
        .single()
      setProduct(data as Product)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <PageLoading />
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="font-display text-4xl text-gray-400">PRODUCTO NO ENCONTRADO</p>
      </div>
    )
  }

  // Filtrar variantes disponibles
  const availableVariants = product.variants || []

  // Tipos disponibles
  const availableTypes = [...new Set(availableVariants.map((v) => v.type))] as ProductType[]

  // Tallas disponibles para el tipo seleccionado
  const availableSizes = selectedType
    ? availableVariants.filter((v) => v.type === selectedType).map((v) => v.size)
    : availableVariants.map((v) => v.size)

  // Variante seleccionada
  const selectedVariant: ProductVariant | undefined = availableVariants.find(
    (v) => v.size === selectedSize && v.type === selectedType
  )

  const stockLabel = selectedVariant ? getStockLabel(selectedVariant.stock) : null
  const inStock = !selectedVariant || selectedVariant.stock > 0

  const handleAddToCart = () => {
    if (!selectedVariant || !inStock) return
    addItem(product, selectedVariant)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Galería */}
        <div className="flex flex-col gap-4">
          {/* Imagen principal */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={product.images[selectedImage] || '/placeholder-jersey.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />

            {product.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white shadow"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setSelectedImage((i) => (i + 1) % product.images.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white shadow"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    i === selectedImage ? 'border-[#1a5c2e]' : 'border-gray-200'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info del producto */}
        <div className="flex flex-col gap-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Inicio</span>
            <span>/</span>
            <span>Productos</span>
            <span>/</span>
            <span className="text-[#111410]">{product.team}</span>
          </div>

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">{product.team}</Badge>
              {product.featured && <Badge variant="gold">NUEVO</Badge>}
            </div>
            <h1 className="font-product font-bold text-2xl sm:text-3xl text-[#111410] leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Precio */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-display text-4xl text-[#1a5c2e]">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <span className="text-gray-400 text-xl line-through">
                  {formatPrice(product.compare_price)}
                </span>
                <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                  -{Math.round((1 - product.price / product.compare_price) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Selector de tipo */}
          <div>
            <p className="font-semibold text-sm text-[#111410] mb-2">
              Tipo{selectedType && <span className="text-[#1a5c2e] font-normal ml-2">{selectedType}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TYPES.filter((t) => availableTypes.includes(t.value)).map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedType(type.value)
                    setSelectedSize(null)
                  }}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                    selectedType === type.value
                      ? 'border-[#1a5c2e] bg-[#1a5c2e] text-white'
                      : 'border-gray-200 hover:border-[#1a5c2e]'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de talla */}
          <div>
            <p className="font-semibold text-sm text-[#111410] mb-2">
              Talla{selectedSize && <span className="text-[#1a5c2e] font-normal ml-2">{selectedSize}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const variant = availableVariants.find(
                  (v) => v.size === size && (!selectedType || v.type === selectedType)
                )
                const hasStock = variant && variant.stock > 0
                const isAvailable = availableSizes.includes(size)

                return (
                  <button
                    key={size}
                    onClick={() => isAvailable && hasStock && setSelectedSize(size)}
                    disabled={!isAvailable || !hasStock}
                    className={`w-12 h-12 rounded-lg border-2 text-sm font-bold transition-all relative ${
                      selectedSize === size
                        ? 'border-[#1a5c2e] bg-[#1a5c2e] text-white'
                        : isAvailable && hasStock
                        ? 'border-gray-200 hover:border-[#1a5c2e]'
                        : 'border-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {size}
                    {!hasStock && isAvailable && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="block w-full h-px bg-gray-300 rotate-45 absolute" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {stockLabel && selectedVariant && selectedVariant.stock > 0 && (
              <p className="text-orange-500 font-semibold text-sm mt-2">⚠️ {stockLabel}</p>
            )}
          </div>

          {/* Botón agregar al carrito */}
          <Button
            variant={addedToCart ? 'secondary' : 'primary'}
            size="lg"
            onClick={handleAddToCart}
            disabled={!selectedSize || !selectedType || !inStock}
            className="font-display text-lg tracking-wider"
          >
            <ShoppingCart className="w-5 h-5" />
            {!selectedType
              ? 'SELECCIONA UN TIPO'
              : !selectedSize
              ? 'SELECCIONA UNA TALLA'
              : !inStock
              ? 'AGOTADO'
              : addedToCart
              ? '¡AGREGADO AL CARRITO!'
              : 'AGREGAR AL CARRITO'}
          </Button>

          {/* Descripción */}
          {product.description && (
            <div>
              <h2 className="font-semibold text-[#111410] mb-2">Descripción</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
            </div>
          )}

          {/* Garantías */}
          <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-5 h-5 text-[#1a5c2e] shrink-0" />
              <span className="text-gray-600">
                <strong className="text-[#111410]">Producto auténtico</strong> — Garantizado 100%
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Truck className="w-5 h-5 text-[#1a5c2e] shrink-0" />
              <span className="text-gray-600">
                <strong className="text-[#111410]">Envío gratis</strong> en pedidos mayores a $1,500 MXN
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RefreshCw className="w-5 h-5 text-[#1a5c2e] shrink-0" />
              <span className="text-gray-600">
                <strong className="text-[#111410]">Cambios y devoluciones</strong> sin complicaciones
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
