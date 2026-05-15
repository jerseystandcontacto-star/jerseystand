'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, ShieldCheck, Zap, DollarSign, Star } from 'lucide-react'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { JERSEY_CONDITIONS } from '@/types'

// ── Validación ────────────────────────────────────────────────────────────────
const schema = z.object({
  customer_name: z.string().min(2, 'Ingresa tu nombre completo'),
  email:         z.string().email('Email inválido'),
  whatsapp:      z.string().min(10, 'Ingresa tu número de WhatsApp'),
  team:          z.string().min(2, 'Ingresa el equipo del jersey'),
  size:          z.string().min(1, 'Selecciona una talla'),
  season:        z.string().min(2, 'Ingresa la temporada o año'),
  condition:     z.string().min(1, 'Selecciona el estado del jersey'),
  asking_price:  z.string().min(1, 'Ingresa un precio').refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'El precio debe ser mayor a 0'),
  description:   z.string().optional(),
})

type FormData = z.infer<typeof schema>

const PROCESS_STEPS = [
  { icon: ShieldCheck, title: 'Llena el formulario',    desc: 'Cuéntanos sobre tu jersey y súbele mínimo 2 fotos.',      color: 'text-[#c9a227]' },
  { icon: Zap,         title: 'Lo revisamos',            desc: 'Nuestro equipo evalúa tu jersey en menos de 24 horas.',    color: 'text-[#22763a]' },
  { icon: DollarSign,  title: 'Recibe tu oferta',        desc: 'Te contactamos por WhatsApp con el precio que te damos.',  color: 'text-[#c9a227]' },
]

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export default function VenderJerseyPage() {
  const [photos, setPhotos]     = useState<string[]>([])
  const [photosErr, setPhotosErr] = useState('')
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg]     = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { size: '', condition: '' },
  })

  const selectedCondition = watch('condition')

  const onSubmit = async (data: FormData) => {
    if (photos.length < 2) {
      setPhotosErr('Sube al menos 2 fotos del jersey')
      return
    }
    setPhotosErr('')
    setStatus('loading')
    try {
      const res = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, photos }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const body = await res.json()
        setErrMsg(body.error || 'Ocurrió un error. Intenta de nuevo.')
        setStatus('error')
      }
    } catch {
      setErrMsg('Error de conexión. Intenta de nuevo.')
      setStatus('error')
    }
  }

  // ── Éxito ──────────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#111410] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="w-24 h-24 bg-[#1a5c2e] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="font-display text-5xl text-white mb-3">
            ¡RECIBIMOS TU JERSEY!
          </h1>
          <p className="text-[#c9a227] text-xl font-semibold mb-4">
            Te contactamos en menos de 24 horas.
          </p>
          <p className="text-white/60 mb-8">
            Revisaremos las fotos y te enviaremos una oferta por WhatsApp y email.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[#c9a227] text-[#111410] font-bold px-8 py-3 rounded-xl hover:bg-[#e8bc35] transition-colors"
          >
            Volver a la tienda
          </a>
        </div>
      </div>
    )
  }

  // ── Formulario ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#111410] min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #c9a227 0, #c9a227 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block bg-[#c9a227] text-[#111410] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
            Compra y venta de jerseys
          </span>
          <h1 className="font-display text-white leading-none mb-4" style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}>
            ¿TIENES UN JERSEY
            <br />
            <span className="text-[#c9a227]">QUE YA NO USAS?</span>
          </h1>
          <p className="text-white/70 text-xl max-w-xl mx-auto mb-12">
            Nosotros te lo compramos. Proceso rápido, pago justo, sin complicaciones.
          </p>

          {/* Pasos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                    i % 2 === 0 ? 'bg-[#c9a227] text-[#111410]' : 'bg-[#1a5c2e] text-white'
                  }`}>
                    {i + 1}
                  </div>
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <p className="text-white font-bold mb-1">{step.title}</p>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Formulario ── */}
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
            <h2 className="font-display text-3xl text-white mb-1">CUÉNTANOS SOBRE TU JERSEY</h2>
            <p className="text-white/40 text-sm mb-8">Todos los campos marcados con * son obligatorios</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

              {/* Contacto */}
              <fieldset>
                <legend className="text-[#c9a227] text-xs font-black uppercase tracking-widest mb-4">
                  Tu información
                </legend>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-white/70 text-sm font-semibold mb-1.5">Nombre completo *</label>
                    <input
                      {...register('customer_name')}
                      placeholder="Ej: Carlos Hernández"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a227] transition-colors"
                    />
                    {errors.customer_name && <p className="text-red-400 text-xs mt-1">{errors.customer_name.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-semibold mb-1.5">Email *</label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="tu@email.com"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a227] transition-colors"
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-semibold mb-1.5">WhatsApp *</label>
                      <input
                        {...register('whatsapp')}
                        placeholder="55 1234 5678"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a227] transition-colors"
                      />
                      {errors.whatsapp && <p className="text-red-400 text-xs mt-1">{errors.whatsapp.message}</p>}
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Datos del jersey */}
              <fieldset>
                <legend className="text-[#c9a227] text-xs font-black uppercase tracking-widest mb-4">
                  Datos del jersey
                </legend>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-semibold mb-1.5">Equipo *</label>
                      <input
                        {...register('team')}
                        placeholder="Ej: América, Barcelona..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a227] transition-colors"
                      />
                      {errors.team && <p className="text-red-400 text-xs mt-1">{errors.team.message}</p>}
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-semibold mb-1.5">Temporada / Año *</label>
                      <input
                        {...register('season')}
                        placeholder="Ej: 2023/24, 2019..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a227] transition-colors"
                      />
                      {errors.season && <p className="text-red-400 text-xs mt-1">{errors.season.message}</p>}
                    </div>
                  </div>

                  {/* Talla */}
                  <div>
                    <label className="block text-white/70 text-sm font-semibold mb-2">Talla *</label>
                    <div className="flex gap-2">
                      {SIZES.map((s) => (
                        <label key={s} className="flex-1">
                          <input type="radio" value={s} {...register('size')} className="sr-only" />
                          <div className={`text-center py-2.5 rounded-xl border-2 cursor-pointer font-bold text-sm transition-all ${
                            watch('size') === s
                              ? 'bg-[#c9a227] border-[#c9a227] text-[#111410]'
                              : 'border-white/20 text-white/60 hover:border-white/40'
                          }`}>
                            {s}
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.size && <p className="text-red-400 text-xs mt-1">{errors.size.message}</p>}
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-white/70 text-sm font-semibold mb-2">Estado del jersey *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {JERSEY_CONDITIONS.map((c) => (
                        <label key={c.value}>
                          <input type="radio" value={c.value} {...register('condition')} className="sr-only" />
                          <div className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedCondition === c.value
                              ? 'bg-[#1a5c2e]/40 border-[#22763a]'
                              : 'border-white/10 hover:border-white/30'
                          }`}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-white font-semibold text-sm">{c.label}</span>
                              <span className="flex gap-0.5">
                                {Array.from({ length: c.stars }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-[#c9a227] text-[#c9a227]" />
                                ))}
                              </span>
                            </div>
                            <p className="text-white/40 text-xs">{c.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.condition && <p className="text-red-400 text-xs mt-1">{errors.condition.message}</p>}
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="block text-white/70 text-sm font-semibold mb-1.5">¿Cuánto pides por él? (MXN) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">$</span>
                      <input
                        {...register('asking_price')}
                        type="number"
                        min="1"
                        placeholder="0.00"
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a227] transition-colors"
                      />
                    </div>
                    {errors.asking_price && <p className="text-red-400 text-xs mt-1">{errors.asking_price.message}</p>}
                  </div>
                </div>
              </fieldset>

              {/* Fotos */}
              <fieldset>
                <legend className="text-[#c9a227] text-xs font-black uppercase tracking-widest mb-1">
                  Fotos del jersey *
                </legend>
                <p className="text-white/40 text-xs mb-4">
                  Mínimo 2 fotos · Máximo 6 · Incluye frente, espalda y detalles importantes
                </p>
                <div className="[&_div]:border-white/20 [&_p]:text-white/50 [&_p_span]:text-[#c9a227]">
                  <ImageUploader
                    images={photos}
                    onChange={(imgs) => { setPhotos(imgs); if (imgs.length >= 2) setPhotosErr('') }}
                    maxImages={6}
                    uploadUrl="/api/compras/fotos"
                  />
                </div>
                {photosErr && <p className="text-red-400 text-xs mt-2">{photosErr}</p>}
              </fieldset>

              {/* Descripción */}
              <fieldset>
                <legend className="text-[#c9a227] text-xs font-black uppercase tracking-widest mb-4">
                  Descripción adicional (opcional)
                </legend>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="¿Tiene nombre, número, parches especiales? ¿Por qué lo vendes? Cualquier detalle ayuda..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a227] transition-colors resize-none"
                />
              </fieldset>

              {status === 'error' && (
                <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl py-3">{errMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#c9a227] hover:bg-[#e8bc35] disabled:opacity-60 text-[#111410] font-black text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
              >
                {status === 'loading' ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#111410]/30 border-t-[#111410] rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'ENVIAR SOLICITUD'
                )}
              </button>

              <p className="text-white/30 text-xs text-center">
                Al enviar aceptas que revisemos tu jersey y te contactemos con una oferta.
                Sin compromisos — puedes rechazar la oferta.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
