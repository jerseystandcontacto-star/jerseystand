'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Coupon } from '@/types'

export default function AdminCuponesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_purchase: '',
    max_uses: '',
    expires_at: '',
  })

  useEffect(() => { fetchCoupons() }, [])

  const fetchCoupons = async () => {
    const res = await fetch('/api/admin/coupons')
    const data = await res.json()
    setCoupons(data)
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        value: parseFloat(form.value),
        min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
      }),
    })
    setShowForm(false)
    setForm({ code: '', type: 'percentage', value: '', min_purchase: '', max_uses: '', expires_at: '' })
    fetchCoupons()
  }

  const toggleActive = async (coupon: Coupon) => {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !coupon.active }),
    })
    fetchCoupons()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl text-[#111410]">CUPONES</h1>
        <Button variant="primary" onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo cupón
        </Button>
      </div>

      {/* Modal nuevo cupón */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl text-[#111410]">NUEVO CUPÓN</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <Input
                label="Código"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="JERSEYSTAND10"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Tipo"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  options={[
                    { value: 'percentage', label: 'Porcentaje (%)' },
                    { value: 'fixed', label: 'Monto fijo ($)' },
                  ]}
                />
                <Input
                  label={form.type === 'percentage' ? 'Descuento (%)' : 'Descuento ($)'}
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  min="1"
                  max={form.type === 'percentage' ? '100' : undefined}
                  required
                />
              </div>
              <Input
                label="Compra mínima (MXN)"
                type="number"
                value={form.min_purchase}
                onChange={(e) => setForm((f) => ({ ...f, min_purchase: e.target.value }))}
                placeholder="0"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Usos máximos"
                  type="number"
                  value={form.max_uses}
                  onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                  placeholder="Sin límite"
                />
                <Input
                  label="Expira el"
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1">Crear cupón</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No hay cupones</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descuento</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usos</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expira</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-[#111410] tracking-wider">{coupon.code}</td>
                  <td className="px-6 py-4 text-sm">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value} MXN`}
                    {coupon.min_purchase > 0 && (
                      <span className="text-gray-400 text-xs block">Mín. ${coupon.min_purchase}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {coupon.used_count} / {coupon.max_uses || '∞'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {coupon.expires_at ? formatDate(coupon.expires_at) : 'Sin expiración'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={coupon.active ? 'success' : 'default'}>
                      {coupon.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(coupon)}
                      className="text-sm text-[#1a5c2e] font-semibold hover:underline"
                    >
                      {coupon.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
