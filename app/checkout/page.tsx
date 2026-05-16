'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { Tag, Truck, CheckCircle } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { formatPrice, calculateShipping } from '@/lib/utils'
import type { ShippingType } from '@/types'
import { SHIPPING_OPTIONS } from '@/types'

const checkoutSchema = z.object({
  full_name: z.string().min(3, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono requerido'),
  street: z.string().min(3, 'Calle requerida'),
  number: z.string().min(1, 'Número requerido'),
  colonia: z.string().min(2, 'Colonia requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Estado requerido'),
  zip: z.string().length(5, 'Código postal debe tener 5 dígitos'),
  references: z.string().optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

const STATE_CODES: Record<string, string> = {
  'Aguascalientes': 'AGU', 'Baja California': 'BCN', 'Baja California Sur': 'BCS',
  'Campeche': 'CAM', 'Chiapas': 'CHP', 'Chihuahua': 'CHH', 'Ciudad de México': 'CMX',
  'Coahuila': 'COA', 'Colima': 'COL', 'Durango': 'DUR', 'Estado de México': 'MEX',
  'Guanajuato': 'GUA', 'Guerrero': 'GRO', 'Hidalgo': 'HID', 'Jalisco': 'JAL',
  'Michoacán': 'MIC', 'Morelos': 'MOR', 'Nayarit': 'NAY', 'Nuevo León': 'NLE',
  'Oaxaca': 'OAX', 'Puebla': 'PUE', 'Querétaro': 'QUE', 'Quintana Roo': 'ROO',
  'San Luis Potosí': 'SLP', 'Sinaloa': 'SIN', 'Sonora': 'SON', 'Tabasco': 'TAB',
  'Tamaulipas': 'TAM', 'Tlaxcala': 'TLA', 'Veracruz': 'VER', 'Yucatán': 'YUC',
  'Zacatecas': 'ZAC',
}
const toStateCode = (state: string) =>
  STATE_CODES[state] ?? state.substring(0, 3).toUpperCase()

const MEXICAN_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCartStore()
  const [shippingType, setShippingType] = useState<ShippingType>('estandar')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponApplied, setCouponApplied] = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)
  const [sandboxMode, setSandboxMode] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((s) => setSandboxMode(s.modo_prueba === 'true'))
      .catch(() => {})
  }, [])

  const subtotal = getSubtotal()
  const shippingCost = subtotal >= 1500 ? 0 : (shippingType === 'express' ? 349 : 149)
  const total = subtotal + shippingCost - couponDiscount

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema) })

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
      const data = await res.json()
      if (res.ok) {
        setCouponDiscount(data.discount)
        setCouponApplied(couponCode)
        setCouponError('')
      } else {
        setCouponError(data.error || 'Cupón inválido')
      }
    } catch {
      setCouponError('Error al validar el cupón')
    } finally {
      setCouponLoading(false)
    }
  }

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) return
    setLoading(true)

    try {
      // Paso 1: crear orden en Supabase
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shipping_address: data,
          shipping_type: subtotal >= 1500 ? 'gratis' : shippingType,
          shipping_cost: shippingCost,
          subtotal,
          discount: couponDiscount,
          total,
          coupon_code: couponApplied,
          sandbox: sandboxMode,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      clearCart()

      if (sandboxMode) {
        router.push(`/rastrear?orden=${result.order_number}`)
        return
      }

      // Paso 2: lanzar EcartPay SDK
      const nameParts  = data.full_name.trim().split(/\s+/)
      const first_name = nameParts[0]
      const last_name  = nameParts.slice(1).join(' ') || nameParts[0]
      const baseUrl    = process.env.NEXT_PUBLIC_SITE_URL || 'https://jerseystand.com'

      const sdkItems = [
        ...items.map((item) => ({
          name:     `${item.product.name} Talla ${item.variant.size}`,
          price:    item.product.price,
          quantity: item.quantity,
        })),
        ...(shippingCost > 0
          ? [{ name: 'Envío', price: shippingCost, quantity: 1 }]
          : []),
      ]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (window as any).Pay.Checkout.create({
        publicID: process.env.NEXT_PUBLIC_ECARTPAY_PUBLIC_KEY,
        order: {
          email:      data.email,
          first_name,
          last_name,
          phone:      data.phone,
          currency:   'MXN',
          items:      sdkItems,
          shipping_address: {
            first_name,
            last_name,
            address1:    `${data.street} ${data.number}, ${data.colonia}`,
            country:     { code: 'MX', name: 'Mexico' },
            state:       { code: toStateCode(data.state), name: data.state },
            city:        data.city,
            postal_code: data.zip,
          },
          notify_url: `${baseUrl}/api/checkout/webhook?order=${result.order_number}`,
        },
      })

      router.push(`/rastrear?orden=${result.order_number}`)
    } catch (err: any) {
      alert('Error al procesar el pedido: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="font-display text-4xl text-gray-400 mb-4">CARRITO VACÍO</p>
        <Button variant="primary" onClick={() => router.push('/productos')}>
          Ver productos
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-5xl text-[#111410] mb-6">CHECKOUT</h1>

      {sandboxMode && (
        <div className="mb-6 flex items-center gap-3 bg-yellow-50 border-2 border-yellow-400 rounded-xl px-5 py-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-yellow-800 text-sm">MODO PRUEBA ACTIVO</p>
            <p className="text-yellow-700 text-xs">
              Los pagos no son reales — se creará una orden de prueba sin cargos a ninguna tarjeta.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Datos personales */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-semibold text-lg text-[#111410] mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1a5c2e] text-white text-sm rounded-full flex items-center justify-center font-bold">1</span>
                Datos personales
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nombre completo" {...register('full_name')} error={errors.full_name?.message} required />
                <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required />
                <Input label="Teléfono" type="tel" {...register('phone')} error={errors.phone?.message} required />
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-semibold text-lg text-[#111410] mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1a5c2e] text-white text-sm rounded-full flex items-center justify-center font-bold">2</span>
                Dirección de envío
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Calle" {...register('street')} error={errors.street?.message} required />
                </div>
                <Input label="Número" {...register('number')} error={errors.number?.message} required />
                <Input label="Colonia" {...register('colonia')} error={errors.colonia?.message} required />
                <Input label="Ciudad" {...register('city')} error={errors.city?.message} required />
                <Select
                  label="Estado"
                  {...register('state')}
                  error={errors.state?.message}
                  required
                  options={[
                    { value: '', label: 'Selecciona...' },
                    ...MEXICAN_STATES.map((s) => ({ value: s, label: s })),
                  ]}
                />
                <Input label="Código Postal" {...register('zip')} maxLength={5} error={errors.zip?.message} required />
                <div className="sm:col-span-3">
                  <Input label="Referencias" {...register('references')} placeholder="Entre calles, color de casa, etc." />
                </div>
              </div>
            </div>

            {/* Tipo de envío */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-semibold text-lg text-[#111410] mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#1a5c2e] text-white text-sm rounded-full flex items-center justify-center font-bold">3</span>
                Tipo de envío
              </h2>

              {subtotal >= 1500 ? (
                <div className="flex items-center gap-3 p-4 bg-[#1a5c2e]/10 border-2 border-[#1a5c2e] rounded-xl">
                  <CheckCircle className="w-5 h-5 text-[#1a5c2e]" />
                  <div>
                    <p className="font-semibold text-[#1a5c2e]">¡Envío gratis!</p>
                    <p className="text-sm text-gray-500">Por comprar más de $1,500 MXN</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {SHIPPING_OPTIONS.filter((o) => o.type !== 'gratis').map((option) => (
                    <label
                      key={option.type}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        shippingType === option.type
                          ? 'border-[#1a5c2e] bg-[#1a5c2e]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={option.type}
                        checked={shippingType === option.type}
                        onChange={() => setShippingType(option.type)}
                        className="sr-only"
                      />
                      <Truck className={`w-5 h-5 ${shippingType === option.type ? 'text-[#1a5c2e]' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                      <span className="font-bold text-[#1a5c2e]">{formatPrice(option.price)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Cupón */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-semibold text-lg text-[#111410] mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#c9a227]" />
                Código de descuento
              </h2>
              {couponApplied ? (
                <div className="flex items-center gap-3 p-3 bg-[#1a5c2e]/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-[#1a5c2e]" />
                  <p className="text-[#1a5c2e] font-semibold text-sm">
                    Cupón <strong>{couponApplied}</strong> aplicado — Ahorraste {formatPrice(couponDiscount)}
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="JERSEYSTAND10"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1a5c2e] uppercase text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyCoupon}
                    loading={couponLoading}
                  >
                    Aplicar
                  </Button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-lg text-[#111410] mb-5">Resumen del pedido</h2>

              {/* Items */}
              <div className="flex flex-col gap-3 mb-5">
                {items.map((item) => (
                  <div key={item.variant.id} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image
                        src={item.product.images[0] || '/placeholder-jersey.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 bg-[#1a5c2e] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111410] truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{item.variant.size} · {item.variant.type}</p>
                      <p className="text-sm font-bold text-[#1a5c2e]">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? <span className="text-[#1a5c2e]">¡Gratis!</span> : formatPrice(shippingCost)}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Descuento</span>
                    <span className="font-semibold text-[#1a5c2e]">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-display text-2xl text-[#1a5c2e]">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                variant={sandboxMode ? 'outline' : 'secondary'}
                size="lg"
                loading={loading}
                className={`w-full mt-5 font-display text-lg tracking-wider ${
                  sandboxMode
                    ? 'border-yellow-400 text-yellow-700 hover:bg-yellow-50'
                    : ''
                }`}
              >
                {sandboxMode ? '🧪 SIMULAR PAGO' : 'PAGAR AHORA 🔒'}
              </Button>

              <p className="text-center text-xs text-gray-400 mt-3">
                {sandboxMode
                  ? 'Modo prueba — no se realizará ningún cargo real.'
                  : 'Pago seguro con cifrado SSL. Procesado por EcartPay.'}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
