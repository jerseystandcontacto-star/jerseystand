'use client'

import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { SHIPPING_OPTIONS } from '@/types'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore()
  const subtotal = getSubtotal()
  const freeShippingThreshold = 1500
  const remaining = freeShippingThreshold - subtotal

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#1a5c2e]" />
            <h2 className="font-display text-xl text-[#111410]">
              MI CARRITO
            </h2>
            {items.length > 0 && (
              <span className="bg-[#1a5c2e] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra envío gratis */}
        {remaining > 0 && items.length > 0 && (
          <div className="px-5 py-3 bg-[#f4f4f4] border-b border-gray-100">
            <p className="text-sm text-gray-600">
              Agrega{' '}
              <strong className="text-[#1a5c2e]">{formatPrice(remaining)}</strong> más
              para obtener <strong>envío gratis</strong> 🚚
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a5c2e] rounded-full transition-all"
                style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {remaining <= 0 && items.length > 0 && (
          <div className="px-5 py-3 bg-[#1a5c2e]/10 border-b border-[#1a5c2e]/20">
            <p className="text-sm text-[#1a5c2e] font-semibold">
              🎉 ¡Tienes envío gratis!
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
              <ShoppingBag className="w-16 h-16 text-gray-200" />
              <div>
                <p className="font-semibold text-gray-500">Tu carrito está vacío</p>
                <p className="text-sm text-gray-400 mt-1">
                  Agrega jerseys y gear para empezar
                </p>
              </div>
              <Button variant="primary" onClick={closeCart} size="sm">
                <Link href="/productos">Ver productos</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variant.id}
                className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
              >
                {/* Imagen */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={item.product.images[0] || '/placeholder-jersey.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-product font-semibold text-sm text-[#111410] truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.variant.size} · {item.variant.type} · {item.variant.season}
                  </p>
                  <p className="text-sm font-bold text-[#1a5c2e] mt-1">
                    {formatPrice(item.product.price)}
                  </p>

                  {/* Cantidad */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-100 transition-colors rounded-l-lg"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                        disabled={item.quantity >= item.variant.stock}
                        className="p-1.5 hover:bg-gray-100 transition-colors rounded-r-lg disabled:opacity-30"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.variant.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Eliminar item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con totales */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Envío calculado en el checkout</span>
              <span>{subtotal >= 1500 ? '¡Gratis! 🎉' : 'Desde $149'}</span>
            </div>

            <Link href="/checkout" onClick={closeCart}>
              <Button variant="primary" size="lg" className="w-full">
                Ir al checkout →
              </Button>
            </Link>

            <Link href="/carrito" onClick={closeCart}>
              <Button variant="ghost" size="sm" className="w-full text-gray-500">
                Ver carrito completo
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
