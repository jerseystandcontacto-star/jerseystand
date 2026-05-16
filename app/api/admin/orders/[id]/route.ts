import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, requireAdmin } from '@/lib/supabase/server'
import { sendShippingNotification } from '@/lib/resend'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const supabase = createAdminClient()

  const updateData: any = {}
  if (body.status) updateData.status = body.status
  if (body.tracking_number !== undefined) updateData.tracking_number = body.tracking_number || null

  const { data: order, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Si se marca como enviado con guía, enviar email
  if (body.status === 'enviado' && body.tracking_number && order) {
    try {
      await sendShippingNotification(order as any, body.tracking_number)
    } catch (err) {
      console.error('Error enviando email de envío:', err)
    }
  }

  return NextResponse.json({ message: 'Orden actualizada' })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
