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
    // EcartPay puede enviar timestamp/webhookId en el body o como headers
    const timestamp = body.timestamp
      ?? body.webhookId   // a veces viene anidado diferente
      ?? req.headers.get('x-pay-timestamp')
      ?? ''
    const webhookId = body.webhookId
      ?? req.headers.get('x-pay-webhook-id')
      ?? ''

    const valid = verifyEcartPaySignature(timestamp, webhookId, body.data, secret, signature)
    if (!valid) {
      console.error('[webhook] Firma EcartPay inválida', { signature, timestamp, webhookId })
      // Devolvemos 200 de todas formas para que EcartPay no reintente indefinidamente
      return ok()
    }
  } else if (secret && !signature) {
    // Webhook sin firma cuando se espera → ignorar
    console.warn('[webhook] Recibido sin x-pay-signature')
  }

  // ── Procesar evento ──────────────────────────────────────────────────────
  const event = body.event  || ''
  const data  = body.data   || {}

  // ID de la orden en EcartPay (puede venir en varios campos según el evento)
  const ecartpayOrderId =
    data.order_id ?? data.id ?? body.order_id ?? ''

  console.log('[webhook] Evento:', event, '| EcartPay order:', ecartpayOrderId, '| status:', data.status)

  if (!ecartpayOrderId) {
    console.warn('[webhook] Sin ecartpay_order_id — ignorando')
    return ok()
  }

  // Determinar nuevo status en nuestra BD
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

  if (!isPaid && !isFailed) {
    // Evento que no nos interesa (e.g. billing_information.updated)
    return ok()
  }

  const newStatus = isPaid ? 'pagado' : 'cancelado'

  try {
    const supabase = createAdminClient()
    const { error, data: updated } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('payment_id', ecartpayOrderId)
      .select('order_number')
      .single()

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
