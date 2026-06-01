'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Search, Package, CheckCircle, Truck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate, formatPrice } from '@/lib/utils'
import { fbqTrack } from '@/lib/fbq'
import { OrderStatusBadge } from '@/components/ui/Badge'
import type { Order } from '@/types'
import { ORDER_STATUS_LABELS } from '@/types'

function TrackingContent() {
  const searchParams = useSearchParams()
  const ordenParam   = searchParams.get('orden') ?? ''
  const [query, setQuery]   = useState(ordenParam)
  const [order, setOrder]   = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [searched, setSearched] = useState(false)

  const doSearch = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res  = await fetch(`/api/orders/track?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      if (res.ok) {
        setOrder(data)
      } else {
        setOrder(null)
        setError(data.error || 'Pedido no encontrado')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(query)
  }

  // Auto-buscar cuando viene el redirect de EcartPay (?orden=...)
  useEffect(() => {
    if (ordenParam) doSearch(ordenParam)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Disparar Purchase una sola vez al encontrar la orden del redirect
  useEffect(() => {
    if (!order || !ordenParam || order.status === 'cancelado') return
    if (order.order_number !== ordenParam) return

    const storageKey = `fbq_purchase_${order.order_number}`
    if (sessionStorage.getItem(storageKey)) return

    const contentIds = (order.items ?? [])
      .map((i) => i.product_id)
      .filter((id): id is string => Boolean(id))

    fbqTrack('Purchase', {
      value:        order.total,
      currency:     'MXN',
      content_ids:  contentIds.length > 0 ? contentIds : [order.order_number],
      content_type: 'product',
    })

    sessionStorage.setItem(storageKey, '1')
  }, [order]) // eslint-disable-line react-hooks/exhaustive-deps

  const steps = [
    { key: 'pendiente', label: 'Pedido recibido', icon: Clock },
    { key: 'pagado', label: 'Pago confirmado', icon: CheckCircle },
    { key: 'preparando', label: 'Preparando pedido', icon: Package },
    { key: 'enviado', label: 'En camino', icon: Truck },
    { key: 'entregado', label: 'Entregado', icon: CheckCircle },
  ]

  const statusOrder = ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado']
  const currentIndex = order ? statusOrder.indexOf(order.status) : -1

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="font-display text-6xl text-[#111410] mb-3">
          RASTREAR <span className="text-[#1a5c2e]">PEDIDO</span>
        </h1>
        <p className="text-gray-500">
          Ingresa tu número de orden o número de guía para ver el estado de tu pedido
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="JS-20240101-0001 o número de guía"
          className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1a5c2e] text-base"
        />
        <Button type="submit" variant="primary" loading={loading} size="lg">
          <Search className="w-5 h-5" />
          Buscar
        </Button>
      </form>

      {searched && !loading && !order && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-500">{error || 'Pedido no encontrado'}</p>
          <p className="text-sm text-gray-400 mt-2">
            Verifica el número de orden en tu email de confirmación
          </p>
        </div>
      )}

      {order && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-[#111410] p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm">Número de orden</p>
                <p className="font-display text-2xl text-[#c9a227]">{order.order_number}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-white/50 text-sm mt-2">
              Realizado el {formatDate(order.created_at)}
            </p>
          </div>

          {/* Timeline */}
          {order.status !== 'cancelado' && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                {steps.map((step, i) => {
                  const Icon = step.icon
                  const isCompleted = i <= currentIndex
                  const isCurrent = i === currentIndex

                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all ${
                          isCompleted
                            ? 'bg-[#1a5c2e] text-white'
                            : 'bg-gray-100 text-gray-300'
                        } ${isCurrent ? 'ring-4 ring-[#1a5c2e]/20' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className={`text-center text-[10px] leading-tight max-w-[60px] ${isCompleted ? 'text-[#1a5c2e] font-semibold' : 'text-gray-400'}`}>
                        {step.label}
                      </p>

                      {i < steps.length - 1 && (
                        <div className="absolute hidden sm:flex items-center" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Guía de rastreo */}
          {order.tracking_number && (
            <div className="px-6 py-4 bg-[#1a5c2e]/5 border-b border-gray-100">
              <p className="text-sm text-gray-500">Número de guía</p>
              <p className="font-bold text-[#1a5c2e] text-lg tracking-wide">{order.tracking_number}</p>
              <p className="text-xs text-gray-400 mt-1">Usa este número para rastrear en el sitio de la paquetería</p>
            </div>
          )}

          {/* Dirección */}
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="font-semibold text-sm text-[#111410] mb-2">Dirección de entrega</p>
            <p className="text-sm text-gray-600">
              {order.shipping_address.full_name}<br />
              {order.shipping_address.street} {order.shipping_address.number},
              Col. {order.shipping_address.colonia}<br />
              {order.shipping_address.city}, {order.shipping_address.state}{' '}
              CP {order.shipping_address.zip}
            </p>
          </div>

          {/* Total */}
          <div className="px-6 py-4 flex justify-between items-center">
            <span className="text-gray-500">Total pagado</span>
            <span className="font-display text-2xl text-[#1a5c2e]">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RastrearPage() {
  return (
    <Suspense fallback={<div className="text-center py-24">Cargando...</div>}>
      <TrackingContent />
    </Suspense>
  )
}
