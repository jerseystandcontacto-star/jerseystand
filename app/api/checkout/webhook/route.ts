import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyEcartPaySignature } from '@/lib/ecartpay'

// EcartPay siempre espera 200 — nunca devolver error HTTP
const ok = () => NextResponse.json({ received: true })

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return ok()
  }

  // ── Verificar firma ──────────────────────────────────────────────────────
  const secret    = process.env.ECARTPAY_WEBHOOK_SECRET
  const signature = req.headers.get('x-pay-signature') || ''

  if (secret && signature) {
    const timestamp = body.timestamp
      ?? body.webhookId
      ?? req.headers.get('x-pay-timestamp')
      ?? ''
    const webhookId = body.webhookId
      ?? req.headers.get('x-pay-webhook-id')
      ?? ''

    const valid = verifyEcartPaySignature(timestamp, webhookId, body.data, secret, signature)
    if (!valid) {
      console.error('[webhook] Firma EcartPay inválida', { signature, timestamp, webhookId })
      return ok()
    }
  } else if (secret && !signature) {
    console.warn('[webhook] Recibido sin x-pay-signature')
  }

  // ── Procesar evento ──────────────────────────────────────────────────────
  const event = body.event || ''
  const data  = body.data  || {}

  const ecartpayOrderId =
    data.order_id ?? data.id ?? body.order_id ?? ''

  console.log('[webhook] Evento:', event, '| EcartPay order:', ecartpayOrderId, '| status:', data.status)

  if (!ecartpayOrderId) {
    console.warn('[webhook] Sin ecartpay_order_id — ignorando')
    return ok()
  }

  const isPaid =
    event === 'transactions.paid' ||
    event === 'direct_debit.payment_success' ||
    event === 'subscription.payment_success' ||
    data.status === 'paid'

  const isFailed =
    event === 'direct_debit.payment_failed' ||
    event === 'subscription.payment_failed' ||
    data.status === 'failed' ||
    data.status === 'cancelled'

  if (!isPaid && !isFailed) return ok()

  const newStatus = isPaid ? 'pagado' : 'cancelado'

  try {
    const supabase = createAdminClient()

    // order_number puede venir como query param ?order=JS-XXXX
    const orderNumber = new URL(req.url).searchParams.get('order')

    let error: any
    let updated: any

    if (orderNumber) {
      // Identificar la orden por nuestro order_number y guardar el ID de EcartPay
      ;({ error, data: updated } = await supabase
        .from('orders')
        .update({ status: newStatus, payment_id: ecartpayOrderId })
        .eq('order_number', orderNumber)
        .select('order_number')
        .single())
    } else {
      // Fallback: buscar por payment_id (órdenes creadas antes del SDK)
      ;({ error, data: updated } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('payment_id', ecartpayOrderId)
        .select('order_number')
        .single())
    }

    if (error) {
      console.error('[webhook] Error actualizando orden:', error.message)
    } else {
      console.log(`[webhook] Orden ${updated?.order_number} → ${newStatus} (EcartPay ${ecartpayOrderId})`)
    }
  } catch (err: any) {
    console.error('[webhook] Excepción:', err.message)
  }

  return ok()
}
