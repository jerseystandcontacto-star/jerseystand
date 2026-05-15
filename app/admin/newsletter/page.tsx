'use client'

import { useState, useEffect } from 'react'
import { Download, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { NewsletterSubscriber } from '@/types'

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then((r) => r.json())
      .then((data) => { setSubscribers(data); setLoading(false) })
  }, [])

  const exportCSV = () => {
    const active = subscribers.filter((s) => s.active)
    const csv = ['Email,Fecha'].concat(
      active.map((s) => `${s.email},${s.created_at}`)
    ).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeCount = subscribers.filter((s) => s.active).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl text-[#111410]">NEWSLETTER</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} suscriptor{activeCount !== 1 ? 'es' : ''} activo{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-[#1a5c2e]/10 rounded-xl p-3">
            <Mail className="w-6 h-6 text-[#1a5c2e]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a5c2e]">{activeCount}</p>
            <p className="text-sm text-gray-500">Suscriptores activos</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-gray-100 rounded-xl p-3">
            <Mail className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">{subscribers.length - activeCount}</p>
            <p className="text-sm text-gray-500">Desuscritos</p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando...</div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No hay suscriptores aún</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-[#111410]">{sub.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(sub.created_at)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={sub.active ? 'success' : 'default'}>
                      {sub.active ? 'Activo' : 'Inactivo'}
                    </Badge>
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
