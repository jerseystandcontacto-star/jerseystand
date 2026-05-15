'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { SHIPPING_OPTIONS } from '@/types'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore()
  const subtotal = getSubtotal()
  const shippingCost = subtotal >= 1500 ? 0 : 149

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-6" />
        <h1 className="font-display text-4xl text-gray-400 mb-3">CARRITO VACÍO</h1>
        <p className="text-gray-500 mb-8">Aún no has agregado nada. ¡Encuentra tu jersey perfecto!</p>
        <Link href="/productos">
          <Button variant="primary" size="lg" className="font-display tracking-wider">
            VER PRODUCTOS
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-5xl text-[#111410] mb-8">
        MI CARRITO ({items.length})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.variant.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 flex gap-4"
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={item.product.images[0] || '/placeholder-jersey.jpg'}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{item.product.team}</p>
                  <h3 className="font-product font-semibold text-[#111410] text-base sm:text-lg leading-tight">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Talla: <strong>{item.variant.size}</strong> · Tipo: <strong>{item.variant.type}</strong> ·{' '}
                    Temporada: <strong>{item.variant.season}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                      disabled={item.quantity >= item.variant.stock}
                      className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-[#1a5c2e]">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.variant.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="font-semibold text-lg text-[#111410] mb-5">Resumen</h2>

            <div className="flex flex-col gap-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({items.length} productos)</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Envío estimado</span>
                <span className="font-semibold">
                  {shippingCost === 0 ? (
                    <span className="text-[#1a5c2e]">¡Gratis! 🎉</span>
                  ) : (
                    <span>Desde {formatPrice(shippingCost)}</span>
                  )}
                </span>
              </div>
            </div>

            {subtotal < 1500 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">
                  Agrega {formatPrice(1500 - subtotal)} más para obtener envío gratis
                </p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1a5c2e] rounded-full transition-all"
                    style={{ width: `${(subtotal / 1500) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-4 mb-5">
              <span>Total estimado</span>
              <span className="font-display text-2xl text-[#1a5c2e]">
                {formatPrice(subtotal + shippingCost)}
              </span>
            </div>

            <Link href="/checkout">
              <Button variant="secondary" size="lg" className="w-full font-display text-lg tracking-wider">
                PROCEDER AL CHECKOUT
              </Button>
            </Link>

            <Link href="/productos">
              <Button variant="ghost" size="sm" className="w-full text-gray-500 mt-3">
                Seguir comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
