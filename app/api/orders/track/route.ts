import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json({ error: 'Parámetro de búsqueda requerido' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Buscar por número de orden o número de guía
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .or(`order_number.eq.${q},tracking_number.eq.${q}`)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  // No retornar info sensible como user_id
  const { user_id, payment_id, ...safeOrder } = order
  return NextResponse.json(safeOrder)
}
