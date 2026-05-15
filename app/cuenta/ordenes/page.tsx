'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { formatDate, formatPrice } from '@/lib/utils'
import type { Order } from '@/types'

export default function OrdenesPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/cuenta'); return }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOrders((data as Order[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-center py-24">Cargando pedidos...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-5xl text-[#111410] mb-8">MIS PEDIDOS</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 flex flex-col gap-2">
          <p className="text-sm text-gray-400 font-semibold uppercase tracking-wide px-3 mb-1">Mi cuenta</p>
          <Link href="/cuenta" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold text-sm">
            <User className="w-4 h-4" />
            Perfil
          </Link>
          <Link href="/cuenta/ordenes" className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#1a5c2e] text-white font-semibold text-sm">
            <Package className="w-4 h-4" />
            Mis pedidos
          </Link>
        </aside>

        <div className="md:col-span-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="font-semibold text-gray-500">No tienes pedidos aún</p>
              <p className="text-sm text-gray-400 mt-1 mb-6">¡Encuentra tu jersey favorito!</p>
              <Link href="/productos" className="btn-primary inline-flex">
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-display text-xl text-[#111410]">{order.order_number}</p>
                      <p className="text-sm text-gray-400">{formatDate(order.created_at)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Envío: <span className="capitalize font-medium">{order.shipping_type}</span>
                      {order.tracking_number && (
                        <span className="ml-3">
                          Guía: <strong className="text-[#111410]">{order.tracking_number}</strong>
                        </span>
                      )}
                    </div>
                    <span className="font-display text-xl text-[#1a5c2e]">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-3">
                    <Link
                      href={`/rastrear?orden=${order.order_number}`}
                      className="text-sm text-[#1a5c2e] font-semibold hover:underline"
                    >
                      Rastrear pedido →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
