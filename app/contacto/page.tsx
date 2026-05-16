'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, CheckCircle, MessageSquare } from 'lucide-react'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(3, 'Asunto requerido'),
  message: z.string().min(10, 'Mensaje muy corto (mínimo 10 caracteres)'),
})

type FormData = z.infer<typeof schema>

export default function ContactoPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setStatus('success')
        reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-6xl text-[#111410] mb-3">
          CONT<span className="text-[#1a5c2e]">ÁCTANOS</span>
        </h1>
        <p className="text-gray-500 text-lg">
          ¿Tienes preguntas sobre un pedido o producto? Estamos aquí para ayudarte.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Formulario */}
        <div>
          {status === 'success' ? (
            <div className="text-center py-16">
              <CheckCircle className="w-16 h-16 text-[#1a5c2e] mx-auto mb-4" />
              <h2 className="font-display text-3xl text-[#111410] mb-3">¡MENSAJE ENVIADO!</h2>
              <p className="text-gray-500 mb-6">
                Te responderemos en menos de 24 horas hábiles.
              </p>
              <Button variant="outline" onClick={() => setStatus('idle')}>
                Enviar otro mensaje
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input label="Nombre" {...register('name')} error={errors.name?.message} required />
              <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required />
              <Input label="Asunto" {...register('subject')} error={errors.subject?.message} required
                placeholder="Ej: Pregunta sobre mi pedido #JS-..." />
              <Textarea
                label="Mensaje"
                {...register('message')}
                error={errors.message?.message}
                required
                rows={5}
                placeholder="Cuéntanos en qué te podemos ayudar..."
              />
              {status === 'error' && (
                <p className="text-red-500 text-sm">Error al enviar. Intenta de nuevo.</p>
              )}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={status === 'loading'}
                className="font-display text-lg tracking-wider"
              >
                ENVIAR MENSAJE
              </Button>
            </form>
          )}
        </div>

        {/* Info de contacto */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#111410] text-white rounded-2xl p-8">
            <h2 className="font-display text-3xl text-[#c9a227] mb-6">¿CÓMO PODEMOS AYUDARTE?</h2>

            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-[#c9a227] shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Pedidos y envíos</p>
                  <p className="text-white/60 text-sm">Estado de tu orden, tiempos de entrega, cambio de dirección</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#c9a227] shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Email</p>
                  <a href="mailto:hola@jerseystand.com" className="text-[#c9a227] text-sm hover:underline">
                    hola@jerseystand.com
                  </a>
                  <p className="text-white/40 text-xs">Respuesta en 24 horas hábiles</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <InstagramIcon className="w-5 h-5 text-[#c9a227] shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Instagram</p>
                  <a
                    href="https://www.instagram.com/jerseystandcontacto/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c9a227] text-sm hover:underline"
                  >
                    @jerseystand
                  </a>
                  <p className="text-white/40 text-xs">DM disponibles para consultas rápidas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1a5c2e]/10 border border-[#1a5c2e]/20 rounded-2xl p-6">
            <h3 className="font-semibold text-[#111410] mb-2">¿Problemas con tu pedido?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Para un servicio más rápido, ten a la mano tu número de orden (ej: JS-20240101-0001).
              Lo encuentras en el email de confirmación.
            </p>
            <a
              href="/rastrear"
              className="text-[#1a5c2e] font-semibold text-sm hover:underline"
            >
              → Rastrear mi pedido
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
