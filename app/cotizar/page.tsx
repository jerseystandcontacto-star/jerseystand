'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Shirt, Users, Palette, Calendar, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  QUOTE_PRODUCT_TYPES,
  QUOTE_QUANTITY_RANGES,
  QUOTE_BUDGET_RANGES,
  SIZES,
} from '@/types'

// ── Schema de validación ──────────────────────────────────────────────────────
const schema = z.object({
  customer_name:  z.string().min(2, 'Nombre requerido'),
  email:          z.string().email('Email inválido'),
  phone:          z.string().min(10, 'Teléfono requerido'),
  city:           z.string().min(2, 'Ciudad requerida'),
  product_type:   z.string().min(1, 'Selecciona un tipo de producto'),
  quantity_range: z.string().min(1, 'Selecciona una cantidad'),
  team_name:      z.string().optional(),
  colors:         z.string().optional(),
  has_logo:       z.boolean(),
  player_names:   z.string().optional(),
  numbers:        z.string().optional(),
  deadline:       z.string().optional(),
  budget_range:   z.string().optional(),
  notes:          z.string().optional(),
})

type FormData = z.infer<typeof schema>

// ── Pasos del formulario ──────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Producto',   icon: Shirt },
  { id: 2, label: 'Detalles',   icon: Palette },
  { id: 3, label: 'Tallas',     icon: Users },
  { id: 4, label: 'Contacto',   icon: Calendar },
]

export default function CotizarPage() {
  const [step, setStep]             = useState(1)
  const [status, setStatus]         = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg]     = useState('')
  const [sizesBreakdown, setSizes]  = useState<Record<string, number>>({
    XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0,
  })

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { has_logo: false, budget_range: 'sin-definir' },
  })

  const productType   = watch('product_type')
  const quantityRange = watch('quantity_range')

  // Validar campos del paso actual antes de avanzar
  const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
    1: ['product_type', 'quantity_range'],
    2: ['team_name', 'colors', 'has_logo'],
    3: [],
    4: ['customer_name', 'email', 'phone', 'city'],
  }

  const nextStep = async () => {
    const valid = await trigger(STEP_FIELDS[step])
    if (valid) setStep((s) => Math.min(s + 1, 4))
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, sizes_breakdown: sizesBreakdown }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const body = await res.json()
        setErrorMsg(body.error || 'Error al enviar la cotización')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
      setStatus('error')
    }
  }

  // ── Éxito ─────────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="bg-[#1a5c2e]/10 border border-[#1a5c2e]/20 rounded-3xl p-12">
          <CheckCircle className="w-16 h-16 text-[#1a5c2e] mx-auto mb-5" />
          <h1 className="font-display text-4xl text-[#111410] mb-3">
            ¡COTIZACIÓN ENVIADA!
          </h1>
          <p className="text-gray-600 mb-2">
            Revisaremos tu solicitud y te contactaremos en <strong>menos de 24 horas hábiles</strong>{' '}
            al email y teléfono que nos dejaste.
          </p>
          <p className="text-sm text-gray-400 mt-6">
            ¿Tienes dudas urgentes?{' '}
            <a href="/contacto" className="text-[#1a5c2e] underline">
              Escríbenos aquí
            </a>
          </p>
        </div>
      </div>
    )
  }

  // ── Formulario ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="bg-[#c9a227] text-[#111410] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
          Pedidos personalizados
        </span>
        <h1 className="font-display text-6xl text-[#111410] mt-4 mb-3">
          COTIZA TU <span className="text-[#1a5c2e]">PLAYERA</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Jerseys y playeras con tu nombre, número y logo. Ideal para equipos,
          torneos y eventos deportivos.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const active    = step === s.id
          const completed = step > s.id
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                active    ? 'bg-[#111410] text-white' :
                completed ? 'bg-[#1a5c2e] text-white' :
                            'bg-gray-100 text-gray-400'
              }`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-px ${completed ? 'bg-[#1a5c2e]' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Tarjeta del paso */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">

          {/* ── PASO 1: Tipo y cantidad ───────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h2 className="font-semibold text-xl text-[#111410]">¿Qué necesitas?</h2>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Tipo de producto <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUOTE_PRODUCT_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        productType === type.value
                          ? 'border-[#1a5c2e] bg-[#1a5c2e]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={type.value}
                        {...register('product_type')}
                        className="sr-only"
                      />
                      <span className="text-2xl">{type.emoji}</span>
                      <span className="font-semibold text-sm text-[#111410]">{type.label}</span>
                    </label>
                  ))}
                </div>
                {errors.product_type && (
                  <p className="text-red-500 text-sm mt-2">{errors.product_type.message}</p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  ¿Cuántas piezas necesitas? <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUOTE_QUANTITY_RANGES.map((q) => (
                    <label key={q.value} className="cursor-pointer">
                      <input
                        type="radio"
                        value={q.value}
                        {...register('quantity_range')}
                        className="sr-only"
                      />
                      <span className={`block px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        quantityRange === q.value
                          ? 'border-[#1a5c2e] bg-[#1a5c2e] text-white'
                          : 'border-gray-200 hover:border-[#1a5c2e]'
                      }`}>
                        {q.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.quantity_range && (
                  <p className="text-red-500 text-sm mt-2">{errors.quantity_range.message}</p>
                )}
              </div>
            </div>
          )}

          {/* ── PASO 2: Detalles de personalización ──────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-semibold text-xl text-[#111410]">Personalización</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre del equipo / club"
                  {...register('team_name')}
                  placeholder="Ej: Tigres FC, Club Deportivo Alfa…"
                />
                <Input
                  label="Colores preferidos"
                  {...register('colors')}
                  placeholder="Ej: rojo y negro, azul rey…"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  ¿Llevarán logo del equipo?
                </p>
                <div className="flex gap-3">
                  {[{ label: 'Sí, tenemos logo', val: true }, { label: 'No / Aún no', val: false }].map(({ label, val }) => (
                    <label
                      key={String(val)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold ${
                        watch('has_logo') === val
                          ? 'border-[#1a5c2e] bg-[#1a5c2e]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('has_logo')}
                        value={String(val)}
                        onChange={() => {}}
                        checked={watch('has_logo') === val}
                        className="sr-only"
                        onClick={() => {
                          /* handled via register */
                        }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Nombres (uno por línea)
                  </label>
                  <textarea
                    {...register('player_names')}
                    rows={4}
                    placeholder={"García\nMartínez\nLópez\n..."}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5c2e] resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Números (uno por línea)
                  </label>
                  <textarea
                    {...register('numbers')}
                    rows={4}
                    placeholder={"10\n7\n1\n..."}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5c2e] resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Notas adicionales
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Cualquier detalle extra: diseño específico, tela, parches, etc."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5c2e] resize-none"
                />
              </div>
            </div>
          )}

          {/* ── PASO 3: Tallas ────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-semibold text-xl text-[#111410]">Desglose de tallas</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Indica cuántas piezas necesitas por talla. Puedes dejarlo en 0 si aún no lo sabes.
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {SIZES.map((size) => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <span className="font-display text-2xl text-[#111410]">{size}</span>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={sizesBreakdown[size] ?? 0}
                      onChange={(e) =>
                        setSizes((prev) => ({
                          ...prev,
                          [size]: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className="w-full text-center px-2 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1a5c2e] text-sm font-bold"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between bg-[#f4f4f4] rounded-xl px-5 py-3">
                <span className="text-sm font-semibold text-gray-600">Total de piezas</span>
                <span className="font-display text-2xl text-[#1a5c2e]">
                  {Object.values(sizesBreakdown).reduce((a, b) => a + b, 0)}
                </span>
              </div>

              {/* Presupuesto y fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Presupuesto aproximado
                  </label>
                  <select
                    {...register('budget_range')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5c2e]"
                  >
                    {QUOTE_BUDGET_RANGES.map((b) => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Fecha límite deseada (opcional)"
                  type="date"
                  {...register('deadline')}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}

          {/* ── PASO 4: Datos de contacto ─────────────────────────────────── */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-semibold text-xl text-[#111410]">Tus datos de contacto</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Te enviaremos la cotización por email en menos de 24 horas hábiles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre completo"
                  {...register('customer_name')}
                  error={errors.customer_name?.message}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  required
                />
                <Input
                  label="Teléfono / WhatsApp"
                  type="tel"
                  {...register('phone')}
                  error={errors.phone?.message}
                  placeholder="55 0000 0000"
                  required
                />
                <Input
                  label="Ciudad"
                  {...register('city')}
                  error={errors.city?.message}
                  placeholder="Ej: CDMX, Guadalajara…"
                  required
                />
              </div>

              {/* Resumen del pedido */}
              <div className="bg-[#f4f4f4] rounded-xl p-5 text-sm flex flex-col gap-1.5 text-gray-600">
                <p className="font-semibold text-[#111410] mb-1">Resumen de tu solicitud</p>
                {productType && (
                  <p>Producto: <strong>{QUOTE_PRODUCT_TYPES.find(t => t.value === productType)?.label}</strong></p>
                )}
                {quantityRange && (
                  <p>Cantidad: <strong>{QUOTE_QUANTITY_RANGES.find(q => q.value === quantityRange)?.label}</strong></p>
                )}
                <p>
                  Total de tallas:{' '}
                  <strong>{Object.values(sizesBreakdown).reduce((a, b) => a + b, 0)} piezas</strong>
                </p>
              </div>

              {status === 'error' && (
                <p className="text-red-500 text-sm">{errorMsg}</p>
              )}
            </div>
          )}
        </div>

        {/* Navegación entre pasos */}
        <div className="flex items-center justify-between mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            className={`gap-2 ${step === 1 ? 'invisible' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          {step < 4 ? (
            <Button type="button" variant="primary" onClick={nextStep} className="gap-2 font-display text-lg tracking-wider">
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              loading={status === 'loading'}
              className="font-display text-lg tracking-wider"
            >
              ENVIAR COTIZACIÓN ✓
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
