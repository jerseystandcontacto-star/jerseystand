import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
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

    // Reservar stock atómicamente (previene overselling en compras simultáneas)
    for (const item of items as CartItem[]) {
      const { data: reserveResult, error: rpcErr } = await supabase.rpc('reserve_stock', {
        p_variant_id: item.variant.id,
        p_quantity:   item.quantity,
        p_order_id:   order.id,
      })

      if (rpcErr || !reserveResult?.success) {
        console.error('[checkout] reserve_stock falló:', rpcErr?.message ?? reserveResult?.error)
        // Cancelar la orden y liberar las reservas creadas en iteraciones anteriores
        await supabase.from('orders').update({ status: 'cancelado' }).eq('id', order.id)
        await supabase.rpc('release_order_reservations', { p_order_id: order.id })

        const label = `${item.product.name} (Talla ${item.variant.size})`
        return NextResponse.json(
          { error: `Lo sentimos, ${label} se agotó justo ahora. Actualiza tu carrito.` },
          { status: 400 }
        )
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

    if (sandbox) {
      console.log(`[checkout] Orden de PRUEBA creada: ${order_number}`)
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
