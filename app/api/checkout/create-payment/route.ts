import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createEcartPayOrder } from '@/lib/ecartpay'

export async function POST(req: NextRequest) {
  try {
    const { order_id } = await req.json()

    if (!order_id) {
      return NextResponse.json({ error: 'order_id requerido' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Cargar orden + items desde Supabase
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', order_id)
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    if (order.status === 'prueba') {
      return NextResponse.json({ error: 'Orden en modo prueba — no requiere pago' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jerseystand.com'

    const ecartOrder = await createEcartPayOrder({
      order_number:   order.order_number,
      customer_email: order.customer_email,
      customer_name:  order.customer_name,
      customer_phone: order.customer_phone || '',
      items: (order.items || []).map((item: any) => ({
        name:       `${item.product_name} Talla ${item.size}`,
        quantity:   item.quantity,
        price:      item.price,
        discount:   0,
        tax:        0,
        is_service: false,
      })),
      notify_url:  `${baseUrl}/api/checkout/webhook`,
      redirect_url: `${baseUrl}/rastrear?orden=${order.order_number}`,
    })

    // Guardar ID de EcartPay en la orden
    await supabase
      .from('orders')
      .update({ payment_id: ecartOrder.id })
      .eq('id', order_id)

    return NextResponse.json({
      pay_link:          ecartOrder.pay_link,
      ecartpay_order_id: ecartOrder.id,
    })
  } catch (err: any) {
    console.error('[create-payment]', err.message)
    return NextResponse.json(
      { error: err.message || 'Error al crear el pago en EcartPay' },
      { status: 500 }
    )
  }
}
