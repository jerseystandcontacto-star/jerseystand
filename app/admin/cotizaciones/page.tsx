'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, RefreshCw, ChevronDown, X, DollarSign, MessageSquare } from 'lucide-react'
import {
  QuoteRequest,
  QuoteStatus,
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_COLORS,
  QUOTE_PRODUCT_TYPES,
  QUOTE_QUANTITY_RANGES,
  QUOTE_BUDGET_RANGES,
} from '@/types'

const ALL_STATUSES: { value: string; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'nuevo', label: 'Nuevos' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'cotizado', label: 'Cotizados' },
  { value: 'aceptado', label: 'Aceptados' },
  { value: 'rechazado', label: 'Rechazados' },
]

function labelFor(list: { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value
}

export default function AdminCotizacionesPage() {
  const [quotes, setQuotes]     = useState<QuoteRequest[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('todos')
  const [selected, setSelected] = useState<QuoteRequest | null>(null)
  const [saving, setSaving]     = useState(false)

  // Editable fields in the detail panel
  const [editStatus, setEditStatus]   = useState<QuoteStatus>('nuevo')
  const [editPrice, setEditPrice]     = useState('')
  const [editNotes, setEditNotes]     = useState('')

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/cotizaciones?status=${filter}`)
    const json = await res.json()
    setQuotes(json.data ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchQuotes() }, [fetchQuotes])

  function openDetail(q: QuoteRequest) {
    setSelected(q)
    setEditStatus(q.status)
    setEditPrice(q.quoted_price != null ? String(q.quoted_price) : '')
    setEditNotes(q.admin_notes ?? '')
  }

  async function saveChanges() {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/admin/cotizaciones/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: editStatus,
        quoted_price: editPrice ? parseFloat(editPrice) : null,
        admin_notes: editNotes || null,
      }),
    })
    setSaving(false)
    setSelected(null)
    fetchQuotes()
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-[#111410]">COTIZACIONES</h1>
          <p className="text-gray-500 text-sm mt-1">Solicitudes de cotización personalizadas</p>
        </div>
        <button
          onClick={fetchQuotes}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1a5c2e] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-6">
        {ALL_STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === s.value
                ? 'bg-[#111410] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#111410]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando...</div>
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay cotizaciones {filter !== 'todos' ? `con estado "${labelFor(ALL_STATUSES, filter)}"` : ''}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#f4f4f4] text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Cliente</th>
                <th className="px-5 py-3 text-left">Producto</th>
                <th className="px-5 py-3 text-left">Cantidad</th>
                <th className="px-5 py-3 text-left">Presupuesto</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left">Fecha</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-sm text-[#111410]">{q.customer_name}</p>
                    <p className="text-xs text-gray-400">{q.email}</p>
                    <p className="text-xs text-gray-400">{q.city}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {labelFor(QUOTE_PRODUCT_TYPES, q.product_type)}
                    {q.team_name && (
                      <p className="text-xs text-gray-400">{q.team_name}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {labelFor(QUOTE_QUANTITY_RANGES, q.quantity_range)}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {q.budget_range ? labelFor(QUOTE_BUDGET_RANGES, q.budget_range) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${QUOTE_STATUS_COLORS[q.status]}`}>
                      {QUOTE_STATUS_LABELS[q.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{fmt(q.created_at)}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => openDetail(q)}
                      className="text-xs font-semibold text-[#1a5c2e] hover:underline"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Panel de detalle */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display text-xl text-[#111410]">DETALLE DE COTIZACIÓN</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Cliente */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Cliente</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Nombre:</span> <strong>{selected.customer_name}</strong></p>
                  <p><span className="text-gray-500">Email:</span> {selected.email}</p>
                  <p><span className="text-gray-500">Teléfono:</span> {selected.phone}</p>
                  <p><span className="text-gray-500">Ciudad:</span> {selected.city}</p>
                </div>
              </section>

              {/* Pedido */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Detalles del pedido</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Tipo:</span> {labelFor(QUOTE_PRODUCT_TYPES, selected.product_type)}</p>
                  <p><span className="text-gray-500">Cantidad:</span> {labelFor(QUOTE_QUANTITY_RANGES, selected.quantity_range)}</p>
                  {selected.team_name && <p><span className="text-gray-500">Equipo/Nombre:</span> {selected.team_name}</p>}
                  {selected.colors && <p><span className="text-gray-500">Colores:</span> {selected.colors}</p>}
                  <p><span className="text-gray-500">¿Logo?:</span> {selected.has_logo ? 'Sí' : 'No'}</p>
                  {selected.player_names && <p><span className="text-gray-500">Jugadores:</span> {selected.player_names}</p>}
                  {selected.numbers && <p><span className="text-gray-500">Números:</span> {selected.numbers}</p>}
                  {selected.deadline && <p><span className="text-gray-500">Fecha límite:</span> {selected.deadline}</p>}
                  {selected.budget_range && (
                    <p><span className="text-gray-500">Presupuesto:</span> {labelFor(QUOTE_BUDGET_RANGES, selected.budget_range)}</p>
                  )}
                </div>
              </section>

              {/* Tallas */}
              {selected.sizes_breakdown && Object.values(selected.sizes_breakdown).some((v) => v > 0) && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Desglose de tallas</h3>
                  <div className="flex gap-3 flex-wrap">
                    {Object.entries(selected.sizes_breakdown)
                      .filter(([, qty]) => qty > 0)
                      .map(([size, qty]) => (
                        <div key={size} className="bg-gray-100 rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-gray-500">{size}</p>
                          <p className="font-bold text-[#111410]">{qty}</p>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* Notas del cliente */}
              {selected.notes && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notas del cliente</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selected.notes}</p>
                </section>
              )}

              {/* Gestión admin */}
              <section className="border-t pt-6 space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Gestión</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                  <div className="relative">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as QuoteStatus)}
                      className="w-full appearance-none border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2e]"
                    >
                      {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((s) => (
                        <option key={s} value={s}>{QUOTE_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Precio cotizado (MXN)
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="Ej: 8500"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2e]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <MessageSquare className="inline w-4 h-4 mr-1" />
                    Notas internas
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    placeholder="Notas para el equipo..."
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2e] resize-none"
                  />
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#1a5c2e] text-white rounded-lg text-sm font-semibold hover:bg-[#22763a] transition-colors disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
