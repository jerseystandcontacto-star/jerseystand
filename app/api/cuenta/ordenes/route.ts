import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[api/cuenta/ordenes]', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(orders ?? [])
  } catch (err: any) {
    console.error('[api/cuenta/ordenes]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
