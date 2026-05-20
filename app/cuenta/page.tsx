// Server Component — la sesión se verifica aquí, en el servidor,
// leyendo las cookies directamente. Sin useEffect, sin race conditions.
import { createClient } from '@/lib/supabase/server'
import { AccountContent } from './_components'
import type { UserProfile, Order } from '@/types'

export default async function CuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Sin sesión: el cliente renderiza el formulario de login
    return <AccountContent initialUser={null} initialProfile={null} initialOrders={[]} />
  }

  // Con sesión: obtener perfil y órdenes en paralelo
  const [{ data: profileData }, { data: ordersData }] = await Promise.all([
    supabase.from('users_profiles').select('*').eq('id', user.id).single(),
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <AccountContent
      initialUser={{ id: user.id, email: user.email ?? '' }}
      initialProfile={profileData as UserProfile | null}
      initialOrders={(ordersData as Order[]) ?? []}
    />
  )
}
