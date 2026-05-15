import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SUPABASE_URL = () => process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const ANON_KEY    = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const SERVICE_KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL(), ANON_KEY(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignorado en Server Components
        }
      },
    },
  })
}

// Service-role client — bypasses RLS, only used server-side
export function createAdminClient() {
  return createSupabaseClient(SUPABASE_URL(), SERVICE_KEY(), {
    auth: { persistSession: false },
  })
}

// Shared admin gate for all API routes
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminDb = createAdminClient()
  const { data: admin } = await adminDb
    .from('admin_users')
    .select('email')
    .eq('email', (user.email ?? '').toLowerCase())
    .single()

  return admin ? user : null
}
