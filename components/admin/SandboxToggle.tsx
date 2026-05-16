'use client'

import { useState } from 'react'
import { FlaskConical } from 'lucide-react'

export function SandboxToggle({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const next = !enabled
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'modo_prueba', value: String(next) }),
      })
      setEnabled(next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all ${
        enabled
          ? 'border-yellow-400 bg-yellow-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <FlaskConical className={`w-5 h-5 shrink-0 ${enabled ? 'text-yellow-600' : 'text-gray-400'}`} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${enabled ? 'text-yellow-700' : 'text-gray-700'}`}>
          Modo Prueba
        </p>
        <p className="text-xs text-gray-400 leading-tight">
          {enabled
            ? 'Activo — los pagos son simulados, sin cargos reales'
            : 'Inactivo — los pagos son reales (EcartPay)'}
        </p>
      </div>

      {/* Toggle switch */}
      <button
        onClick={toggle}
        disabled={loading}
        aria-label="Activar o desactivar modo prueba"
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 disabled:opacity-60 ${
          enabled ? 'bg-yellow-400' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
            enabled ? 'left-6' : 'left-0.5'
          }`}
        />
      </button>

      <span className={`text-xs font-bold w-6 shrink-0 ${enabled ? 'text-yellow-600' : 'text-gray-400'}`}>
        {enabled ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}
