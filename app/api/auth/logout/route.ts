import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const referer = new URL(request.headers.get('referer') || origin)
  // Si viene del panel admin, volver al login de admin; si no, a la home
  const dest = referer.pathname.startsWith('/admin') ? '/admin/login' : '/'
  return NextResponse.redirect(new URL(dest, origin))
}
