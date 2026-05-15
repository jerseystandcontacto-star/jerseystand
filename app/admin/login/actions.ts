'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAdmin(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos.' }
  }

  const supabase = await createClient()

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    console.error('[admin/login] signInWithPassword error:', authError.message, authError.status)
    return { error: `Supabase: ${authError.message}` }
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', email)
    .single()

  if (adminError) {
    console.error('[admin/login] admin_users query error:', adminError.message)
  }

  if (!adminUser) {
    await supabase.auth.signOut()
    return { error: 'No tienes permisos de administrador.' }
  }

  redirect('/admin')
}
