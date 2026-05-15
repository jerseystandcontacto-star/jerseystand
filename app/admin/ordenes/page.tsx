'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Truck } from 'lucide-react'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatPrice } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import { ORDER_STATUS_LABELS } from '@/types'

const STATUS_OPTIONS: { value: OrderStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'preparando', label: 'Preparando' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingInput, setTrackingInput] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders')
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  const updateStatus = async (orderId: string, status: OrderStatus, tracking?: string) => {
    setUpdatingId(orderId)
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, tracking_number: tracking }),
    })
    await fetchOrders()
    setUpdatingId(null)
    setSelectedOrder(null)
  }

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === 'todos' || o.status === filterStatus
    const matchSearch =
      !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl text-[#111410]">ÓRDENES</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar orden, cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5c2e]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === opt.value
                  ? 'bg-[#111410] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando órdenes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No hay órdenes</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Orden</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-sm text-[#111410]">{order.order_number}</p>
                    {order.tracking_number && (
                      <p className="text-xs text-gray-400">Guía: {order.tracking_number}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#111410]">{order.customer_name}</p>
                    <p className="text-xs text-gray-400">{order.customer_email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4 font-bold text-sm text-[#1a5c2e]">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { setSelectedOrder(order); setTrackingInput(order.tracking_number || '') }}
                      className="text-sm text-[#1a5c2e] font-semibold hover:underline"
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de gestión */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <h2 className="font-display text-2xl text-[#111410] mb-4">
              GESTIONAR ORDEN {selectedOrder.order_number}
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm"><strong>Cliente:</strong> {selectedOrder.customer_name}</p>
              <p className="text-sm"><strong>Total:</strong> {formatPrice(selectedOrder.total)}</p>
              <p className="text-sm"><strong>Estado actual:</strong> {ORDER_STATUS_LABELS[selectedOrder.status]}</p>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-sm mb-2">Cambiar estado</p>
              <div className="grid grid-cols-2 gap-2">
                {(['pagado', 'preparando', 'enviado', 'entregado', 'cancelado'] as OrderStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selectedOrder.id, s)}
                    disabled={updatingId === selectedOrder.id}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold border-2 transition-all ${
                      selectedOrder.status === s
                        ? 'border-[#1a5c2e] bg-[#1a5c2e] text-white'
                        : 'border-gray-200 hover:border-[#1a5c2e]'
                    }`}
                  >
                    {ORDER_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Número de guía
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Ej: 1234567890"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5c2e]"
                />
                <Button
                  variant="primary"
                  size="sm"
                  loading={updatingId === selectedOrder.id}
                  onClick={() => updateStatus(selectedOrder.id, 'enviado', trackingInput)}
                >
                  Guardar y marcar enviado
                </Button>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
