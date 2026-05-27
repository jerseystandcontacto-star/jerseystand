import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Vercel envía: Authorization: Bearer <CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('stock_reservations')
    .update({ status: 'released' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString())
    .select('id')

  if (error) {
    console.error('[cron] release-expired-reservations:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const released = data?.length ?? 0
  console.log(`[cron] ${released} reserva(s) expirada(s) liberada(s)`)
  return NextResponse.json({ released })
}
