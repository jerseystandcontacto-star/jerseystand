'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Package, LogOut, User, MapPin, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { UserProfile, Order, OrderStatus } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const MEXICAN_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
]

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pendiente:  { label: 'Pendiente de pago', className: 'bg-yellow-100 text-yellow-700' },
  pagado:     { label: 'Pagado',            className: 'bg-green-100 text-green-700' },
  preparando: { label: 'Preparando',        className: 'bg-blue-100 text-blue-700' },
  enviado:    { label: 'Enviado',           className: 'bg-blue-100 text-blue-700' },
  entregado:  { label: 'Entregado',         className: 'bg-emerald-100 text-emerald-700' },
  cancelado:  { label: 'Cancelado',         className: 'bg-red-100 text-red-700' },
  prueba:     { label: 'Prueba',            className: 'bg-gray-100 text-gray-500' },
}

// ─── Root client component (recibe datos del Server Component padre) ───────────

interface AccountContentProps {
  initialUser: { id: string; email: string } | null
  initialProfile: UserProfile | null
  initialOrders: Order[]
}

export function AccountContent({ initialUser, initialProfile, initialOrders }: AccountContentProps) {
  const [activeTab, setActiveTab] = useState<'datos' | 'pedidos'>('datos')

  // Leer tab de la URL sin necesitar Suspense
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'pedidos') setActiveTab('pedidos')
  }, [])

  if (!initialUser) {
    return <AuthForms />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#111410] pt-8 pb-0">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#c9a227]/20 flex items-center justify-center">
                <User className="w-6 h-6 text-[#c9a227]" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">
                  {initialProfile?.full_name || 'Mi cuenta'}
                </p>
                <p className="text-white/50 text-sm">{initialUser.email}</p>
              </div>
            </div>
            <LogoutButton />
          </div>

          {/* Tabs */}
          <div className="flex gap-0">
            {([
              { key: 'datos',   label: 'Mis datos',  icon: User },
              { key: 'pedidos', label: 'Mis pedidos', icon: Package },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-[#c9a227] text-[#c9a227]'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'datos' ? (
          <ProfileForm profile={initialProfile} userId={initialUser.id} userEmail={initialUser.email} />
        ) : (
          <OrdersList orders={initialOrders} />
        )}
      </div>
    </div>
  )
}

// ─── Logout button (necesita createClient, por eso es un componente aparte) ──

function LogoutButton() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    // Recarga completa para que el servidor vea las cookies limpias
    window.location.href = '/'
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors disabled:opacity-50"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">{loading ? 'Saliendo...' : 'Cerrar sesión'}</span>
    </button>
  )
}

// ─── Profile Form ─────────────────────────────────────────────────────────────

const profileSchema = z.object({
  full_name:          z.string().min(2, 'Nombre requerido'),
  phone:              z.string().optional(),
  address_street:     z.string().optional(),
  address_number:     z.string().optional(),
  address_colonia:    z.string().optional(),
  address_city:       z.string().optional(),
  address_state:      z.string().optional(),
  address_zip:        z.string().optional(),
  address_references: z.string().optional(),
})
type ProfileFormData = z.infer<typeof profileSchema>

function ProfileForm({
  profile,
  userId,
  userEmail,
}: {
  profile: UserProfile | null
  userId: string
  userEmail: string
}) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name:          profile?.full_name          ?? '',
      phone:              profile?.phone              ?? '',
      address_street:     profile?.address_street     ?? '',
      address_number:     profile?.address_number     ?? '',
      address_colonia:    profile?.address_colonia    ?? '',
      address_city:       profile?.address_city       ?? '',
      address_state:      profile?.address_state      ?? '',
      address_zip:        profile?.address_zip        ?? '',
      address_references: profile?.address_references ?? '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch('/api/cuenta/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) { setSaveError(result.error || 'Error al guardar. Intenta de nuevo.'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setSaveError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Información personal */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-[#111410] text-base mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-[#1a5c2e]" />
          Información personal
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre completo"
            {...register('full_name')}
            error={errors.full_name?.message}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              value={userEmail}
              readOnly
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-500 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">El email no se puede cambiar</p>
          </div>
          <Input
            label="Teléfono"
            type="tel"
            placeholder="55 0000 0000"
            {...register('phone')}
          />
        </div>
      </div>

      {/* Dirección */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-[#111410] text-base mb-5 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#1a5c2e]" />
          Dirección guardada
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input label="Calle" placeholder="Av. Insurgentes" {...register('address_street')} />
          </div>
          <Input label="Número" placeholder="123" {...register('address_number')} />
          <Input label="Colonia" placeholder="Del Valle" {...register('address_colonia')} />
          <Input label="Ciudad" placeholder="Ciudad de México" {...register('address_city')} />
          <Select
            label="Estado"
            {...register('address_state')}
            options={[
              { value: '', label: 'Selecciona...' },
              ...MEXICAN_STATES.map((s) => ({ value: s, label: s })),
            ]}
          />
          <Input label="Código Postal" placeholder="06100" maxLength={5} {...register('address_zip')} />
          <div className="sm:col-span-3">
            <Input
              label="Referencias"
              placeholder="Entre calles, color de puerta, etc."
              {...register('address_references')}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" loading={saving} className="gap-2">
          <Save className="w-4 h-4" />
          Guardar cambios
        </Button>
        {saved && (
          <p className="text-[#1a5c2e] font-semibold text-sm">
            ✅ Datos actualizados correctamente
          </p>
        )}
        {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
      </div>
    </form>
  )
}

// ─── Orders List ──────────────────────────────────────────────────────────────

function OrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-500 font-medium mb-1">Aún no tienes pedidos</p>
        <p className="text-gray-400 text-sm mb-6">¡Empieza a comprar!</p>
        <Link href="/productos">
          <Button variant="primary">Ver tienda</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => {
        const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pendiente
        return (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-bold text-[#111410]">#{order.order_number}</p>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {format(new Date(order.created_at), "d 'de' MMMM yyyy", { locale: es })}
              </p>
              {order.status === 'enviado' && order.tracking_number && (
                <p className="text-xs text-blue-600 font-mono mt-1">
                  Guía: {order.tracking_number}
                </p>
              )}
            </div>
            <p className="font-display text-2xl text-[#1a5c2e] shrink-0">
              ${order.total.toFixed(2)} MXN
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Auth Forms ───────────────────────────────────────────────────────────────

function AuthForms() {
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Recarga completa: el servidor verá las cookies nuevas y renderizará el perfil
      window.location.href = '/cuenta'
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    fetch('/api/auth/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    }).catch(() => {})

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setError(signInError.message); setLoading(false); return }

    setSuccessMsg('¡Bienvenido a Jersey Stand!')
    // Recarga completa después del mensaje de bienvenida
    setTimeout(() => { window.location.href = '/cuenta' }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-[#111410] mb-2">
            {mode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
          </h1>
          <p className="text-gray-500">
            {mode === 'login' ? 'Accede a tu cuenta de Jersey Stand' : 'Únete a Jersey Stand'}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          {successMsg ? (
            <div className="text-center py-8">
              <p className="text-[#1a5c2e] font-semibold text-lg">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-4">
              {mode === 'register' && (
                <Input
                  label="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="font-display text-lg tracking-wider"
              >
                {mode === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-[#1a5c2e] font-semibold hover:underline"
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
