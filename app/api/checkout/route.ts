import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
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
      sandbox = false,
    } = body

    if (!items?.length) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    const supabase      = createAdminClient()
    const serverClient  = await createClient()

    // Usuario autenticado (opcional)
    const { data: { user } } = await serverClient.auth.getUser()

    // Coupon ID
    let coupon_id: string | null = null
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', coupon_code.toUpperCase())
        .single()
      coupon_id = coupon?.id || null
    }

    // Verificar stock
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

    // Crear orden en Supabase
    const order_number = generateOrderNumber()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        user_id:        user?.id || null,
        customer_email: shipping_address.email,
        customer_name:  shipping_address.full_name,
        customer_phone: shipping_address.phone,
        status:         sandbox ? 'prueba' : 'pendiente',
        subtotal,
        shipping_cost,
        discount,
        total,
        shipping_type: subtotal >= 1500 ? 'gratis' : shipping_type,
        shipping_address: {
          full_name:  shipping_address.full_name,
          phone:      shipping_address.phone,
          street:     shipping_address.street,
          number:     shipping_address.number,
          colonia:    shipping_address.colonia,
          city:       shipping_address.city,
          state:      shipping_address.state,
          zip:        shipping_address.zip,
          references: shipping_address.references,
        },
        coupon_id,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Items de la orden
    const orderItems = (items as CartItem[]).map((item) => ({
      order_id:      order.id,
      product_id:    item.product.id,
      variant_id:    item.variant.id,
      product_name:  item.product.name,
      product_image: item.product.images[0] || null,
      size:          item.variant.size,
      type:          item.variant.type,
      season:        item.variant.season,
      quantity:      item.quantity,
      price:         item.product.price,
    }))

    await supabase.from('order_items').insert(orderItems)

    // Reducir stock (valor fresco de BD)
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
        if (stockErr) console.error('[checkout] stock error:', stockErr.message)
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

    if (!sandbox) {
      // Emails de confirmación (no bloquea la respuesta)
      const orderWithItems = { ...order, items: orderItems }
      Promise.all([
        sendOrderConfirmation(orderWithItems as any).catch(console.error),
        sendAdminOrderNotification(orderWithItems as any).catch(console.error),
      ])
    } else {
      console.log(`[checkout] Orden de PRUEBA: ${order_number}`)
    }

    return NextResponse.json({ order_id: order.id, order_number })
  } catch (err: any) {
    console.error('[checkout]', err)
    return NextResponse.json(
      { error: err.message || 'Error al procesar el pedido' },
      { status: 500 }
    )
  }
}
