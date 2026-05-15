import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/resend'
import { generateOrderNumber } from '@/lib/utils'
import type { CartItem } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      items,
      shipping_address,
      shipping_type,
      shipping_cost,
      subtotal,
      discount,
      total,
      coupon_code,
    } = body

    if (!items?.length) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const serverClient = await createClient()

    // Obtener usuario autenticado (si existe)
    const { data: { user } } = await serverClient.auth.getUser()

    // Obtener coupon_id si hay código
    let coupon_id: string | null = null
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', coupon_code.toUpperCase())
        .single()
      coupon_id = coupon?.id || null
    }

    // Verificar stock de variantes
    for (const item of items as CartItem[]) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('id', item.variant.id)
        .single()

      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${item.product.name} (${item.variant.size})` },
          { status: 400 }
        )
      }
    }

    // Generar número de orden
    const order_number = generateOrderNumber()

    // Crear la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        user_id: user?.id || null,
        customer_email: shipping_address.email,
        customer_name: shipping_address.full_name,
        customer_phone: shipping_address.phone,
        status: 'pendiente',
        subtotal,
        shipping_cost,
        discount,
        total,
        shipping_type: subtotal >= 1500 ? 'gratis' : shipping_type,
        shipping_address: {
          full_name: shipping_address.full_name,
          phone: shipping_address.phone,
          street: shipping_address.street,
          number: shipping_address.number,
          colonia: shipping_address.colonia,
          city: shipping_address.city,
          state: shipping_address.state,
          zip: shipping_address.zip,
          references: shipping_address.references,
        },
        coupon_id,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Crear items de la orden
    const orderItems = (items as CartItem[]).map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      variant_id: item.variant.id,
      product_name: item.product.name,
      product_image: item.product.images[0] || null,
      size: item.variant.size,
      type: item.variant.type,
      season: item.variant.season,
      quantity: item.quantity,
      price: item.product.price,
    }))

    await supabase.from('order_items').insert(orderItems)

    // Reducir stock con valor fresco de BD (evita vender en negativo)
    for (const item of items as CartItem[]) {
      const { data: fresh } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('id', item.variant.id)
        .single()

      if (fresh) {
        const newStock = Math.max(0, fresh.stock - item.quantity)
        const { error: stockErr } = await supabase
          .from('product_variants')
          .update({ stock: newStock })
          .eq('id', item.variant.id)
        if (stockErr) console.error('[checkout] error actualizando stock:', stockErr.message)
      }
    }

    // Incrementar uso de cupón
    if (coupon_id) {
      const { data: couponRow } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('id', coupon_id)
        .single()
      if (couponRow) {
        await supabase
          .from('coupons')
          .update({ used_count: couponRow.used_count + 1 })
          .eq('id', coupon_id)
      }
    }

    // Generar link de pago EcartPay
    let payment_url: string | null = null
    const ecartpayKey = process.env.ECARTPAY_API_KEY
    if (ecartpayKey) {
      try {
        const ecartRes = await fetch('https://api.ecartpay.com/v1/payment_links', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ecartpayKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(total * 100),
            currency: 'MXN',
            description: `Orden Jersey Stand ${order_number}`,
            metadata: { order_id: order.id, order_number },
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/rastrear?orden=${order_number}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
          }),
        })

        if (ecartRes.ok) {
          const ecartData = await ecartRes.json()
          payment_url = ecartData.url || ecartData.payment_url || null

          // Guardar payment_id
          if (ecartData.id) {
            await supabase.from('orders').update({ payment_id: ecartData.id }).eq('id', order.id)
          }
        }
      } catch (err) {
        console.error('Error EcartPay:', err)
      }
    }

    // Enviar emails (sin bloquear la respuesta)
    const orderWithItems = { ...order, items: orderItems }
    Promise.all([
      sendOrderConfirmation(orderWithItems as any).catch(console.error),
      sendAdminOrderNotification(orderWithItems as any).catch(console.error),
    ])

    return NextResponse.json({
      order_id: order.id,
      order_number,
      payment_url,
    })
  } catch (err: any) {
    console.error('Error checkout:', err)
    return NextResponse.json(
      { error: err.message || 'Error al procesar el pedido' },
      { status: 500 }
    )
  }
}
