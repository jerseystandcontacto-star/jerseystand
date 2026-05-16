import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')

    if (error) {
      // Si la tabla no existe aún devolvemos valores por defecto
      return NextResponse.json({ modo_prueba: 'false' })
    }

    const settings = Object.fromEntries((data || []).map((r) => [r.key, r.value]))
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ modo_prueba: 'false' })
  }
}
