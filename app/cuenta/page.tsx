'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Package, LogOut, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import type { UserProfile } from '@/types'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nombre requerido'),
  phone: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function CuentaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [tab, setTab] = useState<'perfil' | 'login'>('login')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data as UserProfile)
        reset({ full_name: data?.full_name || '', phone: data?.phone || '' })
        setTab('perfil')
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const onSave = async (data: ProfileForm) => {
    if (!profile) return
    setSaving(true)
    await supabase.from('user_profiles').update(data).eq('id', profile.id)
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  if (loading) return <div className="text-center py-24">Cargando...</div>

  // Vista de login/registro
  if (tab === 'login' || !profile) {
    return <AuthForms onSuccess={() => { window.location.reload() }} />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-5xl text-[#111410]">MI CUENTA</h1>
        <Button variant="ghost" onClick={handleLogout} className="text-gray-500 gap-2">
          <LogOut className="w-4 h-4" />
          Salir
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-1 flex flex-col gap-2">
          <p className="text-sm text-gray-400 font-semibold uppercase tracking-wide px-3 mb-1">
            Mi cuenta
          </p>
          <Link
            href="/cuenta"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#1a5c2e] text-white font-semibold text-sm"
          >
            <User className="w-4 h-4" />
            Perfil
          </Link>
          <Link
            href="/cuenta/ordenes"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold text-sm"
          >
            <Package className="w-4 h-4" />
            Mis pedidos
          </Link>
        </aside>

        {/* Contenido */}
        <div className="md:col-span-3">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-semibold text-lg text-[#111410] mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1a5c2e]" />
              Datos personales
            </h2>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Email de tu cuenta</p>
              <p className="font-semibold text-[#111410]">{profile.email}</p>
            </div>

            <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
              <Input
                label="Nombre completo"
                {...register('full_name')}
                error={errors.full_name?.message}
                required
              />
              <Input
                label="Teléfono"
                type="tel"
                {...register('phone')}
                placeholder="55 0000 0000"
              />
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                className="self-start gap-2"
              >
                {saveSuccess ? (
                  <>✓ Guardado</>
                ) : (
                  <><Save className="w-4 h-4" /> Guardar cambios</>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthForms({ onSuccess }: { onSuccess: () => void }) {
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
    if (error) setError(error.message)
    else onSuccess()
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) setError(error.message)
    else setSuccessMsg('¡Cuenta creada! Revisa tu email para confirmar.')
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-display text-5xl text-[#111410] mb-2">
          {mode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
        </h1>
        <p className="text-gray-500">
          {mode === 'login' ? 'Accede a tu cuenta de Jersey Stand' : 'Únete a Jersey Stand'}
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-8">
        {successMsg ? (
          <div className="text-center py-8">
            <p className="text-[#1a5c2e] font-semibold">{successMsg}</p>
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
            <Button type="submit" variant="primary" size="lg" loading={loading} className="font-display text-lg tracking-wider">
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
  )
}
