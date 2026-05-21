import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyEcartPaySignature } from '@/lib/ecartpay'
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/resend'

// EcartPay siempre espera 200 después de procesar — solo 401 para firma inválida
const ok = () => NextResponse.json({ received: true })

export async function POST(req: NextRequest) {
  // ── Leer body raw (para verificación de firma) ───────────────────────────
  let rawBody: string
  let body: any
  try {
    rawBody = await req.text()
    body    = JSON.parse(rawBody)
  } catch {
    console.warn('[webhook] Body inválido')
    return ok()
  }

  console.log('[webhook] Recibido | event:', body?.event, '| data.status:', body?.data?.status)

  // ── Verificar firma HMAC ─────────────────────────────────────────────────
  const secret    = process.env.ECARTPAY_WEBHOOK_SECRET
  const signature = req.headers.get('x-pay-signature') || req.headers.get('x-ecartpay-signature') || ''

  if (secret) {
    if (!signature) {
      console.warn('[webhook] Sin cabecera de firma — rechazando')
      return NextResponse.json({ error: 'Sin firma' }, { status: 401 })
    }

    const timestamp = body.timestamp ?? body.webhookId ?? req.headers.get('x-pay-timestamp') ?? ''
    const webhookId = body.webhookId ?? req.headers.get('x-pay-webhook-id') ?? ''

    // Intento 1: formato EcartPay timestamp.webhookId.data
    const valid1 = verifyEcartPaySignature(timestamp, webhookId, body.data, secret, signature)
    // Intento 2: HMAC del raw body directo (fallback)
    const { createHmac } = await import('crypto')
    const rawHmac = `SHA256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
    const valid2  = rawHmac === signature

    if (!valid1 && !valid2) {
      console.error('[webhook] Firma inválida', { signature, timestamp, webhookId })
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
    }

    console.log('[webhook] Firma verificada OK (método:', valid1 ? 'compuesto' : 'raw-body', ')')
  } else {
    console.warn('[webhook] ECARTPAY_WEBHOOK_SECRET no configurado — omitiendo verificación')
  }

  // ── Procesar evento ──────────────────────────────────────────────────────
  const event = body.event || ''
  const data  = body.data  || {}

  // data.id es el ID de transacción, data.order_id es el order de EcartPay
  const transactionId   = data.id       ?? ''
  const ecartpayOrderId = data.order_id ?? data.id ?? body.order_id ?? ''

  console.log('[webhook] event:', event, '| transaction:', transactionId, '| order:', ecartpayOrderId, '| status:', data.status)

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

  if (!isPaid && !isFailed) {
    console.log('[webhook] Evento ignorado (no es paid/failed):', event)
    return ok()
  }

  const newStatus = isPaid ? 'pagado' : 'cancelado'

  try {
    const supabase = createAdminClient()

    // order_number puede venir como query param ?order=JS-XXXX
    const orderNumber = new URL(req.url).searchParams.get('order')

    let orderRow: any = null

    if (orderNumber) {
      const { data: updated, error } = await supabase
        .from('orders')
        .update({
          status:     newStatus,
          payment_id: transactionId || ecartpayOrderId,
        })
        .eq('order_number', orderNumber)
        .select('*')
        .single()

      if (error) {
        console.error('[webhook] Error actualizando por order_number:', error.message)
      } else {
        orderRow = updated
        console.log(`[webhook] Orden ${orderNumber} → ${newStatus} (tx: ${transactionId})`)
      }
    } else {
      // Fallback: buscar por payment_id
      const { data: updated, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('payment_id', ecartpayOrderId)
        .select('*')
        .single()

      if (error) {
        console.error('[webhook] Error actualizando por payment_id:', error.message)
      } else {
        orderRow = updated
        console.log(`[webhook] Orden ${updated?.order_number} → ${newStatus} (fallback payment_id)`)
      }
    }

    // ── Emails de confirmación (solo cuando se paga) ─────────────────────
    if (isPaid && orderRow) {
      // Obtener items de la orden
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderRow.id)

      const orderWithItems = { ...orderRow, items: items ?? [] }

      console.log('[webhook] Enviando emails | cliente:', orderRow.customer_email, '| orden:', orderRow.order_number)

      await Promise.all([
        sendOrderConfirmation(orderWithItems as any),
        sendAdminOrderNotification(orderWithItems as any),
      ])
    }
  } catch (err: any) {
    console.error('[webhook] Excepción:', err.message)
  }

  return ok()
}
