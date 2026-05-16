import crypto from 'crypto'

const ECARTPAY_BASE = 'https://ecartpay.com/api'
const PUBLIC_KEY    = process.env.NEXT_PUBLIC_ECARTPAY_PUBLIC_KEY!
const PRIVATE_KEY   = process.env.ECARTPAY_PRIVATE_KEY!

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function getEcartPayToken(): Promise<string> {
  const credentials = Buffer.from(`${PUBLIC_KEY}:${PRIVATE_KEY}`).toString('base64')

  const res = await fetch(`${ECARTPAY_BASE}/authorizations/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString())
    throw new Error(`EcartPay auth error ${res.status}: ${text}`)
  }

  const data = await res.json()
  if (!data.token) throw new Error('EcartPay no devolvió token')
  return data.token
}

// ── Create order ──────────────────────────────────────────────────────────────

export interface EcartPayItem {
  name:     string
  quantity: number
  price:    number
}

export interface EcartPayOrderParams {
  order_number:    string
  customer_email:  string
  customer_name:   string
  customer_phone:  string
  items:           EcartPayItem[]
  notify_url:      string
  redirect_url:    string
}

export interface EcartPayOrderResult {
  id:       string
  number:   string
  status:   string
  pay_link: string
}

export async function createEcartPayOrder(
  params: EcartPayOrderParams
): Promise<EcartPayOrderResult> {
  const token = await getEcartPayToken()

  const nameParts = params.customer_name.trim().split(/\s+/)
  const first_name = nameParts[0]
  const last_name  = nameParts.slice(1).join(' ') || nameParts[0]

  const body = {
    currency:     'MXN',
    email:        params.customer_email,
    first_name,
    last_name,
    phone:        params.customer_phone,
    items:        params.items,
    notify_url:   params.notify_url,
    redirect_url: params.redirect_url,
    metadata:     { order_number: params.order_number },
  }

  const res = await fetch(`${ECARTPAY_BASE}/orders`, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString())
    throw new Error(`EcartPay create order ${res.status}: ${text}`)
  }

  const data = await res.json()
  if (!data.pay_link) throw new Error('EcartPay no devolvió pay_link')
  return data as EcartPayOrderResult
}

// ── Webhook signature ─────────────────────────────────────────────────────────

export function verifyEcartPaySignature(
  timestamp:  string,
  webhookId:  string,
  data:       unknown,
  secret:     string,
  received:   string   // header x-pay-signature
): boolean {
  const base    = `${timestamp}.${webhookId}.${JSON.stringify(data)}`
  const expected = `SHA256=${crypto.createHmac('sha256', secret).update(base).digest('hex')}`
  return expected === received
}
