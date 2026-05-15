'use client'

import { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Algo salió mal. Intenta de nuevo.')
      }
    } catch {
      setStatus('error')
      setMessage('Error de conexión. Intenta de nuevo.')
    }
  }

  if (status === 'success') {
    return (
      <section className="bg-[#1a5c2e] py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <CheckCircle className="w-16 h-16 text-[#c9a227] mx-auto mb-4" />
          <h2 className="font-display text-4xl text-white mb-3">¡YA ERES DEL EQUIPO!</h2>
          <p className="text-white/80">
            Revisa tu email para confirmar tu suscripción. Pronto recibirás las mejores ofertas.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#1a5c2e] py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Mail className="w-8 h-8 text-[#c9a227]" />
          <span className="bg-[#c9a227] text-[#111410] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Newsletter
          </span>
        </div>

        <h2 className="font-display text-5xl sm:text-6xl text-white mb-4">
          ÚNETE AL <span className="text-[#c9a227]">EQUIPO</span>
        </h2>

        <p className="text-white/80 text-lg mb-8">
          Sé el primero en conocer nuevos lanzamientos, ediciones limitadas y descuentos
          exclusivos. Sin spam, solo fútbol.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="flex-1 px-5 py-4 rounded-xl text-[#111410] text-base focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
          />
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            loading={status === 'loading'}
            className="sm:shrink-0 font-display text-lg tracking-wider"
          >
            SUSCRIBIRME
          </Button>
        </form>

        {status === 'error' && (
          <p className="text-red-300 text-sm mt-3">{message}</p>
        )}

        <p className="text-white/40 text-xs mt-4">
          Sin spam. Cancela cuando quieras. 🏆
        </p>
      </div>
    </section>
  )
}
