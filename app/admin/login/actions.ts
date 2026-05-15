'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAdmin(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos.' }
  }

  // 1. Autenticar con Supabase Auth (cliente de sesión, maneja cookies)
  const supabase = await createClient()
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

  if (authError) {
    console.error('[admin/login] auth error:', authError.status, authError.message)
    return { error: `Error de autenticación: ${authError.message}` }
  }

  // 2. Verificar admin_users con service role (evita RLS circular)
  const adminDb = createAdminClient()
  const { data: adminUser, error: adminError } = await adminDb
    .from('admin_users')
    .select('email')
    .eq('email', email)
    .single()

  console.log('[admin/login] checking admin for:', email, '| found:', !!adminUser, '| db error:', adminError?.message ?? 'none')

  if (!adminUser) {
    await supabase.auth.signOut()
    return { error: 'No tienes permisos de administrador.' }
  }

  redirect('/admin')
}
