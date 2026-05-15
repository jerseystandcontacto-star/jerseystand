import { NextResponse } from 'next/server'
import { createAdminClient, requireAdmin } from '@/lib/supabase/server'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })
  return NextResponse.json(data || [])
}
