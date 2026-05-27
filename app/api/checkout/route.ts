import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/utils'
import type { CartItem } from '@/types'

const STATE_CODES: Record<string, string> = {
  'Aguascalientes': 'AGU', 'Baja California': 'BCN', 'Baja California Sur': 'BCS',
  'Campeche': 'CAM', 'Chiapas': 'CHP', 'Chihuahua': 'CHH', 'Ciudad de México': 'CMX',
  'Coahuila': 'COA', 'Colima': 'COL', 'Durango': 'DUR', 'Estado de México': 'MEX',
  'Guanajuato': 'GUA', 'Guerrero': 'GRO', 'Hidalgo': 'HID', 'Jalisco': 'JAL',
  'Michoacán': 'MIC', 'Morelos': 'MOR', 'Nayarit': 'NAY', 'Nuevo León': 'NLE',
  'Oaxaca': 'OAX', 'Puebla': 'PUE', 'Querétaro': 'QUE', 'Quintana Roo': 'ROO',
  'San Luis Potosí': 'SLP', 'Sinaloa': 'SIN', 'Sonora': 'SON', 'Tabasco': 'TAB',
  'Tamaulipas': 'TAM', 'Tlaxcala': 'TLA', 'Veracruz': 'VER', 'Yucatán': 'YUC',
  'Zacatecas': 'ZAC',
}

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
      return NextResponse.json({ order_id: order.id, order_number })
    }

    // Llamada REST a EcartPay para obtener el link de pago
    const nameParts  = (shipping_address.full_name as string).trim().split(/\s+/)
    const first_name = nameParts[0]
    const last_name  = nameParts.slice(1).join(' ') || nameParts[0]
    const baseUrl    = process.env.NEXT_PUBLIC_SITE_URL || 'https://jerseystand.com'
    const stateCode  = STATE_CODES[shipping_address.state as string] ?? (shipping_address.state as string).substring(0, 3).toUpperCase()

    const ecartItems = [
      ...(items as CartItem[]).map((item) => ({
        name:     `${item.product.name} Talla ${item.variant.size}`,
        price:    item.product.price,
        quantity: item.quantity,
      })),
      ...(shipping_cost > 0 ? [{ name: 'Envío', price: shipping_cost, quantity: 1 }] : []),
    ]

    const ecartRes = await fetch('https://pay.ecart.com/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ECARTPAY_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        email:      shipping_address.email,
        first_name,
        last_name,
        phone:      shipping_address.phone,
        currency:   'MXN',
        items:      ecartItems,
        shipping_address: {
          first_name,
          last_name,
          address1:    `${shipping_address.street} ${shipping_address.number}, ${shipping_address.colonia}`,
          country:     { code: 'MX', name: 'Mexico' },
          state:       { code: stateCode, name: shipping_address.state },
          city:        shipping_address.city,
          postal_code: shipping_address.zip,
        },
        notify_url:  `${baseUrl}/api/checkout/webhook?order=${order_number}`,
        success_url: `${baseUrl}/rastrear?orden=${order_number}`,
        cancel_url:  `${baseUrl}/checkout`,
      }),
    })

    if (!ecartRes.ok) {
      const errBody = await ecartRes.text()
      console.error('[checkout] EcartPay error:', ecartRes.status, errBody)
      await supabase.from('orders').update({ status: 'cancelado' }).eq('id', order.id)
      await supabase.rpc('release_order_reservations', { p_order_id: order.id })
      return NextResponse.json({ error: 'Error al crear el pago. Intenta de nuevo.' }, { status: 502 })
    }

    const ecartData = await ecartRes.json()
    const checkout_url: string | undefined = ecartData.order?.pay_link ?? ecartData.pay_link

    if (!checkout_url) {
      console.error('[checkout] EcartPay no retornó pay_link:', JSON.stringify(ecartData))
      await supabase.from('orders').update({ status: 'cancelado' }).eq('id', order.id)
      await supabase.rpc('release_order_reservations', { p_order_id: order.id })
      return NextResponse.json({ error: 'Error al obtener el link de pago.' }, { status: 502 })
    }

    return NextResponse.json({ order_id: order.id, order_number, checkout_url })
  } catch (err: any) {
    console.error('[checkout]', err)
    return NextResponse.json(
      { error: err.message || 'Error al procesar el pedido' },
      { status: 500 }
    )
  }
}
