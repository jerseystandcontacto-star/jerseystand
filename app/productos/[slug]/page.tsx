'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, Shield, Truck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Loading'
import { formatPrice } from '@/lib/utils'
import type { Product, ProductVariant, ProductSize } from '@/types'
import { SIZES } from '@/types'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct]           = useState<Product | null>(null)
  const [loading, setLoading]           = useState(true)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart]   = useState(false)
  // stock efectivo: stock_real - reservas_activas_pendientes
  const [effectiveStock, setEffectiveStock] = useState<Record<string, number>>({})
  const { addItem } = useCartStore()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('slug', slug)
        .eq('active', true)
        .single()
      if (error) console.error('[producto] fetch error:', error.message)
      setProduct(data as Product)

      // Calcular stock real = stock_bd - reservas_activas_pendientes
      const variantIds: string[] = (data as Product)?.variants?.map((v) => v.id) ?? []
      if (variantIds.length > 0) {
        const { data: stockRows, error: stockErr } = await supabase.rpc('get_effective_stocks', {
          p_variant_ids: variantIds,
        })
        if (stockErr) {
          console.error('[producto] get_effective_stocks error:', stockErr.message)
        } else {
          const map: Record<string, number> = {}
          for (const row of stockRows ?? []) map[row.variant_id] = row.available_stock
          setEffectiveStock(map)
        }
      }

      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <PageLoading />
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="font-display text-4xl text-gray-400">PRODUCTO NO ENCONTRADO</p>
      </div>
    )
  }

  const variants      = product.variants || []
  const hasDiscount   = Boolean(product.compare_price && product.compare_price > product.price)
  const discountPct   = hasDiscount
    ? Math.round((1 - product.price / product.compare_price!) * 100)
    : 0

  // Helper: stock efectivo de una variante (con fallback al valor de BD)
  const getStock = (v: ProductVariant) =>
    effectiveStock[v.id] !== undefined ? effectiveStock[v.id] : v.stock

  // Tallas que tienen al menos una variante
  const availableSizes = SIZES.filter((s) => variants.some((v) => v.size === s))

  // Stock de la talla seleccionada (primera variante que coincida)
  const selectedVariant: ProductVariant | undefined = selectedSize
    ? variants.find((v) => v.size === selectedSize)
    : undefined

  const canAdd = Boolean(selectedVariant && getStock(selectedVariant) > 0)

  const handleAddToCart = () => {
    if (!selectedVariant || !canAdd) return
    addItem(product, selectedVariant)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const prevImg = () => setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length)
  const nextImg = () => setSelectedImage((i) => (i + 1) % product.images.length)

  const hasImages = product.images.length > 0

  const details: { label: string; value: string | null | undefined }[] = [
    { label: 'Equipo',                  value: product.team },
    { label: 'Marca',                   value: product.marca },
    { label: 'País',                    value: product.pais },
    { label: 'Año',                     value: product.anio },
    { label: 'Equipación',              value: product.equipacion },
    { label: 'Tipografía',              value: product.tipografia },
    { label: 'Género',                  value: product.genero },
    { label: 'Hecho en',                value: product.hecho_en },
    { label: 'Código de autenticidad',  value: product.codigo_autenticidad },
    { label: 'Condición',               value: product.condicion },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ── Galería ── */}
        <div className="flex flex-col gap-3">
          {/* Imagen principal */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            {hasImages ? (
              <>
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a5c2e]">
                <span className="text-8xl">👕</span>
                <span className="text-white/60 text-sm mt-3">Sin fotografía</span>
              </div>
            )}

            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-md shadow">
                OFERTA -{discountPct}%
              </span>
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
                    i === selectedImage ? 'border-[#1a5c2e]' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="flex flex-col gap-5">

          {/* 1. Nombre */}
          <h1 className="font-display text-3xl sm:text-4xl text-[#111410] leading-tight">
            {product.name}
          </h1>

          {/* Detalles del producto */}
          <div className="flex flex-col gap-1.5">
            {details.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <span className="w-32 text-gray-400 shrink-0">{label}</span>
                <span className="font-semibold text-[#111410]">{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* 8–9. Precios */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-display text-4xl text-[#1a5c2e] leading-none">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-gray-400 text-xl line-through leading-none">
                {formatPrice(product.compare_price!)}
              </span>
            )}
          </div>

          {/* 10. Selector de talla con stock real */}
          <div>
            <p className="font-semibold text-sm text-[#111410] mb-2">
              Talla
              {selectedSize && (
                <span className="text-[#1a5c2e] font-normal ml-2">{selectedSize}</span>
              )}
            </p>

            {availableSizes.length === 0 ? (
              <p className="text-sm text-gray-400">Sin tallas disponibles</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const variant = variants.find((v) => v.size === size)
                  const stock   = variant ? getStock(variant) : 0
                  const active  = selectedSize === size

                  return (
                    <div key={size} className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => stock > 0 && setSelectedSize(size)}
                        disabled={stock === 0}
                        className={`relative w-14 h-14 rounded-xl border-2 text-sm font-bold transition-all ${
                          active
                            ? 'border-[#1a5c2e] bg-[#1a5c2e] text-white'
                            : stock > 0
                            ? 'border-gray-200 hover:border-[#1a5c2e] text-[#111410]'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {size}
                        {stock === 0 && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="block w-full h-px bg-gray-300 rotate-45 absolute" />
                          </span>
                        )}
                      </button>
                      {stock > 0 && stock <= 3 && (
                        <span className="text-[10px] text-orange-500 font-semibold leading-none">
                          Últimas {stock} {stock === 1 ? 'pieza' : 'piezas'}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Botón carrito */}
          <Button
            variant={addedToCart ? 'secondary' : 'primary'}
            size="lg"
            onClick={handleAddToCart}
            disabled={!selectedSize || !canAdd}
            className="font-display text-lg tracking-wider bg-[#c9a227] hover:bg-[#e8bc35] border-[#c9a227] text-[#111410]"
          >
            <ShoppingCart className="w-5 h-5" />
            {!selectedSize
              ? 'SELECCIONA UNA TALLA'
              : !canAdd
              ? 'AGOTADO'
              : addedToCart
              ? '¡AGREGADO AL CARRITO!'
              : 'AGREGAR AL CARRITO'}
          </Button>

          {/* Descripción */}
          {product.description && (
            <div>
              <h2 className="font-semibold text-[#111410] mb-2">Descripción</h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Garantías */}
          <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 mt-auto">
            {[
              { Icon: Shield,    text: '<strong>Producto auténtico</strong> — Garantizado 100%' },
              { Icon: Truck,     text: '<strong>Envío gratis</strong> en pedidos mayores a $1,500 MXN' },
              { Icon: RefreshCw, text: '<strong>Cambios y devoluciones</strong> sin complicaciones' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm">
                <Icon className="w-5 h-5 text-[#1a5c2e] shrink-0" />
                <span
                  className="text-gray-600"
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
