'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { RefreshCw, ShoppingBag, X, ChevronDown, MessageSquare, ExternalLink, Star } from 'lucide-react'
import {
  JerseyCompra,
  JerseyCompraStatus,
  JERSEY_COMPRA_STATUS_LABELS,
  JERSEY_COMPRA_STATUS_COLORS,
  JERSEY_CONDITIONS,
} from '@/types'

const FILTER_OPTIONS = [
  { value: 'todos',         label: 'Todos' },
  { value: 'pendiente',     label: 'Pendientes' },
  { value: 'revisado',      label: 'Revisados' },
  { value: 'oferta_enviada',label: 'Oferta enviada' },
  { value: 'comprado',      label: 'Comprados' },
  { value: 'rechazado',     label: 'Rechazados' },
]

function conditionLabel(v: string) {
  return JERSEY_CONDITIONS.find((c) => c.value === v)?.label ?? v
}

function conditionStars(v: string) {
  return JERSEY_CONDITIONS.find((c) => c.value === v)?.stars ?? 0
}

export default function AdminComprasPage() {
  const [items, setItems]       = useState<JerseyCompra[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('todos')
  const [selected, setSelected] = useState<JerseyCompra | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)
  const [editStatus, setEditStatus] = useState<JerseyCompraStatus>('pendiente')
  const [editNotes, setEditNotes]   = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const res  = await fetch(`/api/admin/compras?status=${filter}`)
    const json = await res.json()
    setItems(json.data ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchItems() }, [fetchItems])

  function openDetail(item: JerseyCompra) {
    setSelected(item)
    setEditStatus(item.status)
    setEditNotes(item.admin_notes ?? '')
  }

  async function saveChanges() {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/admin/compras/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: editStatus, admin_notes: editNotes || null }),
    })
    setSaving(false)
    setSelected(null)
    fetchItems()
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-[#111410]">COMPRAS DE CLIENTES</h1>
          <p className="text-gray-500 text-sm mt-1">Jerseys que los clientes quieren vendernos</p>
        </div>
        <button
          onClick={fetchItems}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a5c2e] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === f.value
                ? 'bg-[#111410] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#111410]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No hay solicitudes de compra aún</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#f4f4f4] text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Foto</th>
                <th className="px-5 py-3 text-left">Cliente</th>
                <th className="px-5 py-3 text-left">Jersey</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left">Precio pedido</th>
                <th className="px-5 py-3 text-left">Gestión</th>
                <th className="px-5 py-3 text-left">Fecha</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {/* Foto portada */}
                  <td className="px-5 py-4">
                    {item.photos[0] ? (
                      <div
                        className="relative w-14 h-14 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => setLightbox(item.photos[0])}
                      >
                        <Image src={item.photos[0]} alt="Jersey" fill className="object-cover" />
                        {item.photos.length > 1 && (
                          <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] font-bold px-1 rounded">
                            +{item.photos.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-sm text-[#111410]">{item.customer_name}</p>
                    <p className="text-xs text-gray-400">{item.email}</p>
                    <a
                      href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1a5c2e] hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {item.whatsapp}
                    </a>
                  </td>

                  <td className="px-5 py-4 text-sm">
                    <p className="font-semibold text-[#111410]">{item.team}</p>
                    <p className="text-gray-400 text-xs">T: {item.size} · {item.season}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: conditionStars(item.condition) }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#c9a227] text-[#c9a227]" />
                      ))}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${JERSEY_COMPRA_STATUS_COLORS[item.status]}`}>
                      {JERSEY_COMPRA_STATUS_LABELS[item.status]}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-bold text-[#1a5c2e] text-sm">
                    ${item.asking_price.toLocaleString('es-MX')} MXN
                  </td>

                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${JERSEY_COMPRA_STATUS_COLORS[item.status]}`}>
                      {JERSEY_COMPRA_STATUS_LABELS[item.status]}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-500">{fmt(item.created_at)}</td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => openDetail(item)}
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

      {/* ── Panel de detalle ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display text-xl text-[#111410]">DETALLE DE SOLICITUD</h2>
              <button onClick={() => setSelected(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-700" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Fotos */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Fotos ({selected.photos.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selected.photos.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightbox(url)}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 hover:ring-2 hover:ring-[#1a5c2e] transition-all"
                    >
                      <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Cliente */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Cliente</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Nombre:</span> <strong>{selected.customer_name}</strong></p>
                  <p><span className="text-gray-500">Email:</span> {selected.email}</p>
                  <p>
                    <span className="text-gray-500">WhatsApp:</span>{' '}
                    <a
                      href={`https://wa.me/${selected.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1a5c2e] font-semibold hover:underline"
                    >
                      {selected.whatsapp}
                    </a>
                  </p>
                </div>
              </section>

              {/* Jersey */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Jersey</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Equipo:</span> <strong>{selected.team}</strong></p>
                  <p><span className="text-gray-500">Talla:</span> {selected.size}</p>
                  <p><span className="text-gray-500">Temporada:</span> {selected.season}</p>
                  <p>
                    <span className="text-gray-500">Estado:</span>{' '}
                    {conditionLabel(selected.condition)}{' '}
                    <span className="inline-flex gap-0.5 ml-1">
                      {Array.from({ length: conditionStars(selected.condition) }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#c9a227] text-[#c9a227]" />
                      ))}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Precio pedido:</span>{' '}
                    <strong className="text-[#1a5c2e]">${selected.asking_price.toLocaleString('es-MX')} MXN</strong>
                  </p>
                </div>
              </section>

              {selected.description && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Descripción del cliente</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selected.description}</p>
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
                      onChange={(e) => setEditStatus(e.target.value as JerseyCompraStatus)}
                      className="w-full appearance-none border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2e]"
                    >
                      {(Object.keys(JERSEY_COMPRA_STATUS_LABELS) as JerseyCompraStatus[]).map((s) => (
                        <option key={s} value={s}>{JERSEY_COMPRA_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
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
                    placeholder="Ej: Oferta enviada $450 MXN. Cliente respondió el martes..."
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a5c2e] resize-none"
                  />
                </div>
              </section>
            </div>

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

      {/* ── Lightbox de fotos ── */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-2xl max-h-[90vh] w-full h-full">
            <Image src={lightbox} alt="Foto del jersey" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
