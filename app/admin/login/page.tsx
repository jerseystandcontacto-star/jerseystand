'use client'

import { useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ShieldAlert, Loader2 } from 'lucide-react'
import { loginAdmin } from './actions'

export default function AdminLoginPage() {
  const searchParams = useSearchParams()
  const [showPwd, setShowPwd] = useState(false)
  const [state, formAction, isPending] = useActionState(loginAdmin, null)

  const errorMsg =
    searchParams.get('error') === 'no_permission'
      ? 'No tienes permisos de administrador.'
      : state?.error ?? ''

  return (
    <div className="min-h-screen bg-[#111410] flex items-center justify-center px-4">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #c9a227 0, #c9a227 1px, transparent 0, transparent 50%)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display text-white text-4xl tracking-wide">
            JERSEY<span className="text-[#c9a227]">STAND</span>
          </span>
          <p className="text-white/40 text-sm mt-1">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-white font-bold text-lg mb-6">Iniciar sesión</h1>

          {errorMsg && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
              <ShieldAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm">{errorMsg}</p>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="admin@jerseystand.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#c9a227] transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-11 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#c9a227] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#c9a227] hover:bg-[#e8bc35] disabled:opacity-60 text-[#111410] font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Entrar al panel'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          <a href="/" className="hover:text-white/40 transition-colors">
            ← Volver a la tienda
          </a>
        </p>
      </div>
    </div>
  )
}
